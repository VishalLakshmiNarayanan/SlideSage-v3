import { type NextRequest, NextResponse } from "next/server"
import { Teachpack } from "@/lib/schema"

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_MAX = 10
const RATE_LIMIT_WINDOW = 60 * 60 * 1000 // 1 hour

function getRateLimitKey(request: NextRequest): string {
  return request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
}

function checkRateLimit(key: string): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(key)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return true
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return false
  }

  record.count++
  return true
}

const SYSTEM_PROMPT = `You are **Slidesage**, an AI that turns dense notes into multiple teaching formats including a single 30-60 second explainer video.

## Objectives

* Produce **4 different teaching formats**:
  1. **Analogy** - A relatable comparison that explains the concept using everyday examples
  2. **Diagram Steps** - 3-6 step-by-step breakdown of the process or concept
  3. **One-Liner** - A memorable, concise summary that captures the essence
  4. **Script** - A single continuous explainer video with background images

## Format Requirements

### Analogy
* Use everyday objects, situations, or processes people understand
* Make clear connections between the analogy and the actual concept
* Keep it engaging and memorable (50-200 words)

### Diagram Steps
* Break down the concept into 3-6 logical steps
* Each step should be a complete sentence explaining one part
* Steps should flow logically from one to the next
* Focus on the "how" or "what happens"

### One-Liner
* Capture the core insight in one memorable sentence
* Should be quotable and easy to remember
* Can use metaphor or direct explanation (10-50 words)

### Script (30-60 second single explainer video)
* **Student** — asks curious beginner questions
* **Sage** — explains clearly, using everyday language and simple analogies
* 3–5 scenes that flow as ONE continuous explanation (not separate scenes)
* Total duration ≈ 30–60 seconds
* Each scene has a background image fetched from Pexels API
* Each scene: speaker, dialogue (2-3 sentences), visualHint, visualSearchQuery (2-4 words for Pexels), durationSec (6-12)
* Total spoken words: 100–150 words
* TTS-ready text (no markdown, no emojis)
* visualSearchQuery must be simple, descriptive terms like "classroom teaching", "light bulb idea", "students learning"

## Output format (strict JSON, no extra text)

\`\`\`json
{
  "topic": "string",
  "analogy": "string",
  "diagramSteps": ["string", "string", "string"],
  "oneLiner": "string",
  "script": {
    "title": "string",
    "scenes": [
      {
        "speaker": "Student" | "Sage",
        "dialogue": "string",
        "visualHint": "string",
        "visualSearchQuery": "string",
        "durationSec": 6-12
      }
    ],
    "closing": "string",
    "ttsVoiceHints": { "student": "curious friendly voice", "sage": "warm teaching voice" }
  }
}
\`\`\`

## Style guide

* **Student tone:** curious, friendly, concrete questions
* **Sage tone:** simple, vivid, analogy-first explanations
* Prefer everyday examples over abstract concepts
* Use contrasts and simple numbers when helpful
* Keep all content beginner-friendly and engaging
* Make visualSearchQuery terms that will find good educational/explanatory images on Pexels`

function createUserPrompt(text: string, topicHint?: string): string {
  return `Topic: ${topicHint || ""}

Source notes (may be long, noisy, or partial):
${text}

Make a 30-second explainer as specified in the system prompt.
Focus on what beginners actually need to understand in one watch.`
}

async function callGroqAPI(messages: Array<{ role: string; content: string }>, retryCount = 0): Promise<any> {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Groq API error: ${response.status} ${errorText}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content

  if (!content) {
    throw new Error("No content received from Groq API")
  }

  try {
    const parsed = JSON.parse(content)
    const validated = Teachpack.parse(parsed)
    return validated
  } catch (parseError) {
    if (retryCount < 1) {
      // Retry once with corrective message
      const retryMessages = [
        ...messages,
        {
          role: "assistant",
          content: content,
        },
        {
          role: "user",
          content: "Return valid JSON for GroqTeachpack schema only. Your prior output failed schema validation.",
        },
      ]
      return callGroqAPI(retryMessages, retryCount + 1)
    }
    throw new Error(`Failed to parse or validate JSON: ${parseError}`)
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitKey = getRateLimitKey(request)
    if (!checkRateLimit(rateLimitKey)) {
      return NextResponse.json(
        { error: "rate_limit", message: "Too many requests. Please try again later." },
        { status: 429 },
      )
    }

    // Parse request body
    const body = await request.json()
    const { text, topicHint } = body

    // Validate input
    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "invalid_input", message: "Text is required and must be a string" },
        { status: 400 },
      )
    }

    if (text.length > 10000) {
      return NextResponse.json(
        { error: "text_too_long", message: "Text must be less than 10,000 characters" },
        { status: 400 },
      )
    }

    if (text.trim().length < 10) {
      return NextResponse.json(
        { error: "text_too_short", message: "Text must be at least 10 characters" },
        { status: 400 },
      )
    }

    // Check for API key
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: "server_error", message: "API key not configured" }, { status: 500 })
    }

    // Prepare messages
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: createUserPrompt(text, topicHint) },
    ]

    // Call Groq API
    const teachpack = await callGroqAPI(messages)

    return NextResponse.json(teachpack)
  } catch (error) {
    console.error("API Error:", error)

    if (error instanceof Error) {
      if (error.message.includes("rate_limit")) {
        return NextResponse.json(
          { error: "rate_limit", message: "API rate limit exceeded. Please try again later." },
          { status: 429 },
        )
      }

      if (error.message.includes("API key")) {
        return NextResponse.json({ error: "auth_error", message: "Invalid API key" }, { status: 401 })
      }
    }

    return NextResponse.json(
      { error: "server_error", message: "Failed to generate teachpack. Please try again." },
      { status: 500 },
    )
  }
}

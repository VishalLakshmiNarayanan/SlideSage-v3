import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { content, previousQuestions = [], questionNumber = 1, maxQuestions = 7 } = await request.json()

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 })
    }

    let systemPrompt = `You are an educational quiz generator. Create a multiple choice question based on the provided content. The question should test understanding of key concepts.

IMPORTANT REQUIREMENTS:
- Generate DIFFERENT types of questions (conceptual, application, analysis, comparison)
- Use VARIED question formats (What, How, Why, When, Which, Compare, etc.)
- Focus on DIFFERENT aspects of the content each time
- Make questions progressively more challenging

Return ONLY a JSON object with this exact structure:
{
  "question": "Clear, specific question about the content",
  "options": ["Option A", "Option B", "Option C"],
  "correctAnswer": 0,
  "explanation": "Brief explanation of why this answer is correct"
}`

    if (previousQuestions.length > 0) {
      systemPrompt += `\n\nPREVIOUSLY ASKED QUESTIONS (DO NOT REPEAT OR CREATE SIMILAR):\n${previousQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n")}`
    }

    const questionTypes = [
      "Focus on basic definitions and core concepts",
      "Test practical application and real-world usage",
      "Explore relationships and comparisons between concepts",
      "Analyze advantages, disadvantages, or trade-offs",
      "Examine specific examples or case studies",
      "Test understanding of processes or procedures",
      "Challenge with scenario-based problem solving",
    ]

    if (questionNumber <= questionTypes.length) {
      systemPrompt += `\n\nFOR THIS QUESTION (#${questionNumber}): ${questionTypes[questionNumber - 1]}`
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: `Generate quiz question #${questionNumber} based on this content: ${content}`,
          },
        ],
        temperature: 0.7,
        response_format: { type: "json_object" },
      }),
    })

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`)
    }

    const data = await response.json()
    const quiz = JSON.parse(data.choices[0].message.content)

    return NextResponse.json(quiz)
  } catch (error) {
    console.error("Quiz generation error:", error)
    return NextResponse.json({ error: "Failed to generate quiz" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"

export async function POST(request: NextRequest) {
  try {
    const { challenge, response, concepts } = await request.json()

    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      messages: [
        {
          role: "system",
          content: `You are an AI tutor evaluating student responses to learning challenges. 
          
          Evaluate the response based on:
          1. Accuracy and understanding (40%)
          2. Clarity of explanation (30%)
          3. Creativity and insight (20%)
          4. Relevance to the concept (10%)
          
          Return ONLY a valid JSON object with:
          - score: number (0-100)
          - feedback: string (constructive feedback, 1-2 sentences)
          
          Be encouraging but honest. Scores should range from 20-100, with most good responses getting 60-85.
          
          Do not wrap the JSON in markdown code blocks. Return only the JSON object.`,
        },
        {
          role: "user",
          content: `Challenge Type: ${challenge.type}
          Challenge: ${challenge.title} - ${challenge.description}
          Concept: ${challenge.concepts.join(", ")}
          Student Response: ${response}
          
          Student's learned concepts: ${concepts.map((c: any) => c.name).join(", ")}
          
          Please evaluate this response.`,
        },
      ],
    })

    let jsonText = text.trim()

    // Remove markdown code block formatting if present
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/^```json\s*/, "").replace(/\s*```$/, "")
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/^```\s*/, "").replace(/\s*```$/, "")
    }

    const evaluation = JSON.parse(jsonText)

    if (typeof evaluation.score !== "number" || typeof evaluation.feedback !== "string") {
      throw new Error("Invalid evaluation format")
    }

    return NextResponse.json(evaluation)
  } catch (error) {
    console.error("Challenge evaluation error:", error)
    return NextResponse.json(
      { score: 50, feedback: "Unable to evaluate response at this time. Keep practicing!" },
      { status: 500 },
    )
  }
}

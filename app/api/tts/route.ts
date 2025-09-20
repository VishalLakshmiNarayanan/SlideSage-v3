import { type NextRequest, NextResponse } from "next/server"
import { synthesizeTTS, getVoiceForSpeaker } from "@/lib/openai"

export async function POST(request: NextRequest) {
  try {
    const { text, speaker } = await request.json()

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 })
    }

    const voice = getVoiceForSpeaker(speaker || "sage")
    const audioBuffer = await synthesizeTTS(text, voice)

    // Convert ArrayBuffer to base64 for JSON response
    const base64Audio = Buffer.from(audioBuffer).toString("base64")

    return NextResponse.json({
      audio: base64Audio,
      voice: voice,
    })
  } catch (error) {
    console.error("TTS error:", error)
    return NextResponse.json({ error: "Failed to generate speech" }, { status: 500 })
  }
}

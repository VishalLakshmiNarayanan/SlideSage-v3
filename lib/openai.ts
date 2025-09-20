import OpenAI from "openai"

export const openai = (() => {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    console.warn("[v0] OpenAI API key not found. File processing with AI will be disabled.")
    return null
  }
  return new OpenAI({ apiKey })
})()

export async function synthesizeTTS(
  text: string,
  voice: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer" = "alloy",
): Promise<ArrayBuffer> {
  if (!openai) {
    throw new Error("OpenAI API key is not set. Cannot synthesize TTS.")
  }

  const response = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "tts-1",
      input: text,
      voice: voice,
      response_format: "mp3",
      speed: 1.0,
    }),
  })

  if (!response.ok) {
    throw new Error(`OpenAI TTS API error: ${response.status} - ${await response.text()}`)
  }

  return await response.arrayBuffer()
}

export function getVoiceForSpeaker(speaker: string): "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer" {
  switch (speaker.toLowerCase()) {
    case "student":
      return "nova" // Younger, curious voice
    case "sage":
      return "alloy" // Warm, teaching voice
    default:
      return "alloy"
  }
}

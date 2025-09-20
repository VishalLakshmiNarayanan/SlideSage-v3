import type { GroqTeachpack } from "./schema"

export async function generateTeachpack(text: string, topicHint?: string): Promise<GroqTeachpack> {
  const response = await fetch("/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text, topicHint }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to generate teachpack")
  }

  return response.json()
}

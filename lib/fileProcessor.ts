// lib/fileProcessor.ts
import { openai } from "./openai"

// Public API: metadata-only validation (no body reads)
export function validateFileUpload(input: {
  name: string
  type: string
  size: number
}): { valid: boolean; error?: string } {
  const { name, type, size } = input
  const maxSize = 10 * 1024 * 1024 // 10MB
  const allowed = new Set([
    "text/plain",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/jpeg",
    "image/png",
    "image/webp",
  ])
  if (size > maxSize) return { valid: false, error: "File size must be less than 10MB" }

  const lower = name.toLowerCase()
  const ok =
    allowed.has(type) ||
    lower.endsWith(".txt") ||
    lower.endsWith(".pdf") ||
    lower.endsWith(".doc") ||
    lower.endsWith(".docx") ||
    lower.endsWith(".jpg") ||
    lower.endsWith(".jpeg") ||
    lower.endsWith(".png") ||
    lower.endsWith(".webp")

  return ok
    ? { valid: true }
    : { valid: false, error: "Supported formats: TXT, PDF, DOC/DOCX, JPG/PNG/WebP" }
}

// New server-safe extractor: pass the already-read Buffer
export async function extractTextFromFile(args: {
  filename: string
  mime: string
  size: number
  buffer: Buffer
}): Promise<string> {
  const { filename, mime, buffer } = args
  const lower = filename.toLowerCase()

  try {
    // 1) Plain text
    if (mime === "text/plain" || lower.endsWith(".txt")) {
      return buffer.toString("utf8")
    }

    // 2) PDF → use pdf-parse (Node)
    if (mime === "application/pdf" || lower.endsWith(".pdf")) {
      const pdfParse = (await import("pdf-parse")).default as (b: Buffer) => Promise<{ text: string }>
      const { text } = await pdfParse(buffer)
      const cleaned = (text || "").trim()
      if (cleaned.length < 10) throw new Error("Empty or image-only PDF")
      return cleaned
    }

    // 3) DOCX/DOC
    if (
      mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      lower.endsWith(".docx")
    ) {
      const mammoth = await import("mammoth")
      const { value } = await mammoth.extractRawText({ buffer })
      const cleaned = (value || "").trim()
      if (cleaned.length < 10) throw new Error("Empty DOCX")
      return cleaned
    }

    if (mime === "application/msword" || lower.endsWith(".doc")) {
      // Simple DOC fallback: try mammoth (it sometimes works), else ask user to convert to DOCX
      try {
        const mammoth = await import("mammoth")
        const { value } = await mammoth.extractRawText({ buffer })
        const cleaned = (value || "").trim()
        if (cleaned.length >= 10) return cleaned
      } catch {}
      throw new Error("Please convert .doc to .docx and retry")
    }

    // 4) Images → OCR via OpenAI Vision (base64 as image_url)
    if (mime.startsWith("image/") || lower.match(/\.(jpg|jpeg|png|webp)$/)) {
      return await ocrImageWithOpenAI(buffer, mime)
    }

    // 5) Fallback: try UTF-8 text
    const txt = buffer.toString("utf8").trim()
    if (txt.length >= 10) return txt

    throw new Error(`Unsupported or unreadable format for ${filename}`)
  } catch (err) {
    console.error("File processing error:", err)
    throw new Error(
      `Failed to process file: ${err instanceof Error ? err.message : "Unknown error"}`
    )
  }
}

/** Image OCR with OpenAI Vision (kept from your approach, but only for images) */
async function ocrImageWithOpenAI(buffer: Buffer, mime: string): Promise<string> {
  if (!openai) {
    throw new Error("OpenAI API key not configured. Set OPENAI_API_KEY in your environment.")
  }

  const base64 = buffer.toString("base64")

  // Your project is already using chat.completions; keep that path for now.
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    temperature: 0.1,
    max_tokens: 4000,
    messages: [
      {
        role: "system",
        content:
          "You are an OCR expert. Read all visible text from the image. Preserve headings, lists, and logical order. Output plain text only.",
      },
      {
        role: "user",
        content: [
          { type: "text", text: "Extract all readable text from this image:" },
          {
            type: "image_url",
            image_url: { url: `data:${mime};base64,${base64}`, detail: "high" },
          },
        ],
      },
    ],
  })

  const out = response.choices[0]?.message?.content?.trim() || ""
  if (out.length < 10) throw new Error("Vision OCR returned too little text")
  return out
}

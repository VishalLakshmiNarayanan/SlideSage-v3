import { openai } from "./openai"

export async function extractTextFromFile(file: File): Promise<string> {
  const fileType = file.type
  const fileName = file.name.toLowerCase()

  try {
    if (fileType === "text/plain" || fileName.endsWith(".txt")) {
      return await file.text()
    }

    if (fileType === "application/pdf" || fileName.endsWith(".pdf")) {
      return await extractTextWithAI(file, "PDF")
    }

    if (fileType.includes("word") || fileName.endsWith(".docx") || fileName.endsWith(".doc")) {
      return await extractTextWithAI(file, "Word document")
    }

    // Try to read as text for other file types
    const text = await file.text()
    if (text.trim().length > 0) {
      return text
    }

    // If text extraction fails, use AI as fallback
    return await extractTextWithAI(file, "document")
  } catch (error) {
    console.error("File processing error:", error)
    throw new Error(`Failed to process file: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

async function extractTextWithAI(file: File, fileType: string): Promise<string> {
  try {
    if (!openai) {
      throw new Error("OpenAI API key not configured. Please add OPENAI_API_KEY to your environment variables.")
    }

    // Convert file to base64 for AI processing
    const arrayBuffer = await file.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString("base64")

    if (arrayBuffer.byteLength > 20 * 1024 * 1024) {
      // 20MB limit for AI processing
      throw new Error("File too large for AI processing. Please use a smaller file or extract text manually.")
    }

    console.log(`[v0] Processing ${fileType} with AI, size: ${arrayBuffer.byteLength} bytes`)

    // Use OpenAI to extract and structure the content
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a document text extraction expert. Extract all readable text content from the uploaded ${fileType} file. 
          
          Focus on:
          - Main content, headings, and body text
          - Preserve structure and formatting where possible
          - Include important details like bullet points, lists, and key concepts
          - Ignore headers, footers, and page numbers unless they contain important content
          
          Return only the extracted text content, cleanly formatted and ready for further processing.`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Please extract all text content from this ${fileType} file:`,
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${file.type};base64,${base64}`,
                detail: "high",
              },
            },
          ],
        },
      ],
      max_tokens: 4000,
      temperature: 0.1,
    })

    const extractedText = response.choices[0]?.message?.content

    if (!extractedText || extractedText.trim().length < 10) {
      throw new Error(`Could not extract meaningful content from ${fileType}`)
    }

    console.log(`[v0] AI extraction successful: ${extractedText.length} characters`)
    return extractedText.trim()
  } catch (error) {
    console.error(`[v0] AI extraction error for ${fileType}:`, error)

    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        throw new Error("OpenAI API key not configured. Please add your API key to process this file type.")
      }
      if (error.message.includes("rate_limit")) {
        throw new Error("Rate limit exceeded. Please wait a moment and try again.")
      }
      if (error.message.includes("insufficient_quota")) {
        throw new Error("OpenAI quota exceeded. Please check your OpenAI account.")
      }
    }

    // Fallback: try basic text extraction for PDFs
    if (fileType === "PDF") {
      try {
        return await fallbackPDFExtraction(file)
      } catch (fallbackError) {
        console.error("[v0] Fallback PDF extraction failed:", fallbackError)
      }
    }

    throw new Error(`Failed to extract text from ${fileType}. Please try copying and pasting the text content instead.`)
  }
}

async function fallbackPDFExtraction(file: File): Promise<string> {
  // Simple fallback that tries to read PDF as text
  try {
    const text = await file.text()
    if (text.includes("%PDF")) {
      // This is a PDF file, but we can't extract it properly
      throw new Error("PDF requires AI processing")
    }
    return text
  } catch (error) {
    throw new Error("PDF processing failed")
  }
}

export function validateFileUpload(file: File): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024 // 10MB
  const allowedTypes = [
    "text/plain",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/jpeg",
    "image/png",
    "image/webp",
  ]

  if (file.size > maxSize) {
    return { valid: false, error: "File size must be less than 10MB" }
  }

  const fileName = file.name.toLowerCase()
  const isAllowedType =
    allowedTypes.includes(file.type) ||
    fileName.endsWith(".txt") ||
    fileName.endsWith(".pdf") ||
    fileName.endsWith(".doc") ||
    fileName.endsWith(".docx") ||
    fileName.endsWith(".jpg") ||
    fileName.endsWith(".jpeg") ||
    fileName.endsWith(".png") ||
    fileName.endsWith(".webp")

  if (!isAllowedType) {
    return { valid: false, error: "Supported formats: text files, PDFs, Word documents, and images (JPG, PNG, WebP)" }
  }

  return { valid: true }
}

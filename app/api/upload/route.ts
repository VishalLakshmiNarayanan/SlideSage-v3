// app/api/upload/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // avoid static optimization
// export const maxDuration = 60; // (optional) if parsing can be slow

import { type NextRequest, NextResponse } from "next/server";
import { extractTextFromFile, validateFileUpload } from "@/lib/fileProcessor";

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] File upload request received");

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      console.log("[v0] No file provided in request");
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    console.log("[v0] Processing file:", file.name, "Type:", file.type, "Size:", file.size);

    // Validate (no body reads here)
    const validation = validateFileUpload({ name: file.name, type: file.type, size: file.size });
    if (!validation.valid) {
      console.log("[v0] File validation failed:", validation.error);
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    console.log("[v0] File validation passed, extracting text...");

    // Read once and pass a Buffer downstream
    const arrayBuf = await file.arrayBuffer();
    const buf = Buffer.from(arrayBuf);

    const extractedText = await extractTextFromFile({
      filename: file.name,
      mime: file.type,
      size: file.size,
      buffer: buf,
    });

    if (!extractedText || extractedText.trim().length < 10) {
      console.log("[v0] Extracted text too short:", extractedText?.length || 0, "characters");
      return NextResponse.json({ error: "File appears to be empty or too short" }, { status: 400 });
    }

    console.log("[v0] Text extraction successful:", extractedText.length, "characters");

    return NextResponse.json({
      text: extractedText,
      filename: file.name,
      size: file.size,
    });
  } catch (error) {
    console.error("[v0] File upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process file" },
      { status: 500 },
    );
  }
}

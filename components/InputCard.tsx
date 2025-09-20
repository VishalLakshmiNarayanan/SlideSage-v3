"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Sparkles, BookOpen, Loader2, Upload, FileText, X } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { generateTeachpack } from "@/lib/groq"
import { useToast } from "@/components/ui/toast"

const SAMPLE_TEXT = `Eigenvectors are special vectors that don't change direction when a linear transformation is applied to them. When you multiply a matrix A by an eigenvector v, you get back a scalar multiple of the same vector: Av = λv, where λ is the eigenvalue. This property makes eigenvectors fundamental to understanding how linear transformations behave, as they represent the "natural directions" of the transformation. In practical applications, eigenvectors help us find principal components in data analysis, solve systems of differential equations, and understand the stability of dynamical systems.`

export function InputCard() {
  const [text, setText] = useState("")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { setInputText, setTeachpack, setLoading, isLoading } = useAppStore()
  const { showToast } = useToast()
  const router = useRouter()

  const handleFileUpload = async (file: File) => {
    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      // Clone BEFORE the first read so we can fall back safely.
      const cloned = response.clone()

      let result: any
      try {
        result = await response.json()
      } catch {
        const textResponse = await cloned.text()
        console.error("[v0] Non-JSON response:", textResponse)
        throw new Error("Server error occurred. Please check your API configuration and try again.")
      }


      if (!response.ok) {
        throw new Error(result.error || `Server error: ${response.status}`)
      }

      setText(result.text)
      setUploadedFile(file)

      showToast({
        title: "File Uploaded",
        description: `Successfully extracted text from ${file.name}`,
        variant: "success",
      })
    } catch (error) {
      console.error("[v0] File upload error:", error)

      let errorMessage = "Failed to upload file"
      if (error instanceof Error) {
        if (error.message.includes("API key")) {
          errorMessage = "OpenAI API key not configured. Please add your API key to process files."
        } else if (error.message.includes("rate_limit")) {
          errorMessage = "Rate limit exceeded. Please wait a moment and try again."
        } else if (error.message.includes("Server error")) {
          errorMessage = "Server configuration error. Please check your setup."
        } else {
          errorMessage = error.message
        }
      }

      showToast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
  }

  const clearFile = () => {
    setUploadedFile(null)
    setText("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async () => {
    if (!text.trim()) {
      showToast({
        title: "Input Required",
        description: "Please enter some lecture text or upload a file to transform.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setInputText(text)

    try {
      const teachpack = await generateTeachpack(text)
      setTeachpack(teachpack)
      showToast({
        title: "Success!",
        description: "Your lecture has been transformed into teaching formats.",
        variant: "success",
      })
      router.push("/studio")
    } catch (error) {
      console.error("Failed to generate teachpack:", error)

      let errorMessage = "Failed to generate teaching formats. Please try again."

      if (error instanceof Error) {
        if (error.message.includes("rate_limit")) {
          errorMessage = "Too many requests. Please wait a moment and try again."
        } else if (error.message.includes("text_too_long")) {
          errorMessage = "Text is too long. Please keep it under 10,000 characters."
        } else if (error.message.includes("text_too_short")) {
          errorMessage = "Text is too short. Please provide at least 10 characters."
        }
      }

      showToast({
        title: "Generation Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSample = () => {
    setText(SAMPLE_TEXT)
    setUploadedFile(null)
  }

  return (
    <Card className="glass-card glass-hover p-8">
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="w-6 h-6 text-blue-400" />
          <h2 className="text-2xl font-semibold glow-text">Upload Course Material or Paste Text</h2>
        </div>

        <div
          className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:border-white/30 transition-colors"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.pdf,.doc,.docx"
            onChange={handleFileSelect}
            className="hidden"
          />

          {uploadedFile ? (
            <div className="flex items-center justify-center gap-3">
              <FileText className="w-8 h-8 text-green-400" />
              <div className="text-left">
                <p className="text-white font-medium">{uploadedFile.name}</p>
                <p className="text-white/60 text-sm">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFile}
                className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div>
              <Upload className="w-12 h-12 text-white/40 mx-auto mb-3" />
              <p className="text-white/70 mb-2">
                {isUploading ? "Processing file..." : "Drop your course files here or"}
              </p>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="border-white/20 text-white hover:bg-white/10"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Choose File
                  </>
                )}
              </Button>
              <p className="text-white/50 text-xs mt-2">Supports: TXT, PDF, DOC, DOCX (max 10MB)</p>
            </div>
          )}
        </div>

        <div className="text-center text-white/50">
          <span>or</span>
        </div>

        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your dense lecture text here... I'll transform it into engaging teaching formats and create a short video explanation."
          className="min-h-[200px] bg-white/5 border-white/10 text-white placeholder:text-white/50 focus:border-blue-400/50 focus:ring-blue-400/20 resize-none"
          maxLength={10000}
        />

        <div className="flex items-center justify-between text-sm text-white/60">
          <span>{text.length}/10,000 characters</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSample}
            className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
          >
            Try Sample Text
          </Button>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!text.trim() || isLoading || isUploading}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium py-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Generating Teaching Formats...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Transform into Teaching Formats
            </>
          )}
        </Button>
      </div>
    </Card>
  )
}

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Sparkles, BookOpen, Loader2 } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { generateTeachpack } from "@/lib/groq"
import { useToast } from "@/components/ui/toast"

const SAMPLE_TEXT = `Eigenvectors are special vectors that don't change direction when a linear transformation is applied to them. When you multiply a matrix A by an eigenvector v, you get back a scalar multiple of the same vector: Av = λv, where λ is the eigenvalue. This property makes eigenvectors fundamental to understanding how linear transformations behave, as they represent the "natural directions" of the transformation. In practical applications, eigenvectors help us find principal components in data analysis, solve systems of differential equations, and understand the stability of dynamical systems.`

interface InputCardProps {
  onConceptLearned?: (concept: string, score: number) => void
}

export function InputCard({ onConceptLearned }: InputCardProps) {
  const [text, setText] = useState("")
  const { setInputText, setTeachpack, setLoading, isLoading } = useAppStore()
  const { showToast } = useToast()
  const router = useRouter()

  const handleSubmit = async () => {
    if (!text.trim()) {
      showToast({
        title: "Input Required",
        description: "Please enter some lecture text to transform.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setInputText(text)

    try {
      const teachpack = await generateTeachpack(text)
      setTeachpack(teachpack)
      if (onConceptLearned) {
        useAppStore.getState().setOnConceptLearned(onConceptLearned)
      }
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
  }

  return (
    <Card className="glass-card glass-hover p-8">
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="w-6 h-6 text-blue-400" />
          <h2 className="text-2xl font-semibold glow-text">Paste Your Lecture Text</h2>
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
          disabled={!text.trim() || isLoading}
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

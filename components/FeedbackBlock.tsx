"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ThumbsUp, ThumbsDown, RefreshCw, MessageCircle } from "lucide-react"

interface FeedbackBlockProps {
  content: string
  onRegenerate?: (feedback: string) => void
}

export function FeedbackBlock({ content, onRegenerate }: FeedbackBlockProps) {
  const [feedback, setFeedback] = useState<"clear" | "unclear" | null>(null)
  const [showRegenerateOptions, setShowRegenerateOptions] = useState(false)

  const handleFeedback = (type: "clear" | "unclear") => {
    setFeedback(type)
    if (type === "unclear") {
      setShowRegenerateOptions(true)
    }
  }

  const handleRegenerate = (instruction: string) => {
    console.log("[v0] FeedbackBlock: Regenerating with instruction:", instruction)
    if (onRegenerate) {
      onRegenerate(instruction)
    }
    setFeedback(null)
    setShowRegenerateOptions(false)
  }

  const regenerateOptions = [
    {
      label: "Make it simpler",
      instruction:
        "COMPLETELY REWRITE this explanation as if teaching a 5-year-old child. Use only the simplest words, shortest sentences, and most basic concepts. Avoid all technical terms. Use completely different examples from everyday life that a child would understand. Make it sound like a bedtime story explanation.",
    },
    {
      label: "Add more examples",
      instruction:
        "COMPLETELY REWRITE this explanation using entirely different examples and scenarios than before. Use real-world applications from different industries (healthcare, sports, cooking, gaming, etc.). Each example should be from a completely different domain than any previously used. Focus on practical, hands-on scenarios people encounter daily.",
    },
    {
      label: "Break it down more",
      instruction:
        "COMPLETELY RESTRUCTURE this explanation into much smaller, bite-sized pieces. Use a completely different teaching approach - perhaps a step-by-step tutorial format, or a question-and-answer style, or a problem-solving walkthrough. Make each step incredibly simple and use different analogies than before.",
    },
    {
      label: "Use different analogies",
      instruction:
        "COMPLETELY REWRITE this explanation using entirely different analogies and metaphors from a completely different domain (if it used cooking before, now use sports; if it used building, now use music; if it used nature, now use technology). The new analogies should be from a totally different field and create a fresh perspective on the concept.",
    },
  ]

  return (
    <Card className="glass-card p-4 border-t border-white/10">
      <div className="space-y-4">
        {feedback === null && (
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <MessageCircle className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-white/80">Was this explanation clear?</span>
            </div>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => handleFeedback("clear")}
                variant="outline"
                size="sm"
                className="border-green-500/30 text-green-400 hover:bg-green-500/20 hover:border-green-500/50"
              >
                <ThumbsUp className="w-4 h-4 mr-2" />
                Yes, clear!
              </Button>
              <Button
                onClick={() => handleFeedback("unclear")}
                variant="outline"
                size="sm"
                className="border-orange-500/30 text-orange-400 hover:bg-orange-500/20 hover:border-orange-500/50"
              >
                <ThumbsDown className="w-4 h-4 mr-2" />
                Could be clearer
              </Button>
            </div>
          </div>
        )}

        {feedback === "clear" && (
          <div className="text-center p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
            <div className="flex items-center justify-center gap-2 text-green-300">
              <ThumbsUp className="w-4 h-4" />
              <span className="text-sm font-medium">Great! Glad that was helpful.</span>
            </div>
          </div>
        )}

        {showRegenerateOptions && (
          <div className="space-y-3">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <RefreshCw className="w-4 h-4 text-orange-400" />
                <span className="text-sm text-white/80">How would you like me to improve it?</span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {regenerateOptions.map((option, index) => (
                <Button
                  key={index}
                  onClick={() => handleRegenerate(option.instruction)}
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-white/80 hover:bg-white/10 hover:border-white/40 text-xs"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

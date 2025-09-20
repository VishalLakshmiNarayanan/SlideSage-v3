"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { GroqTeachpack } from "@/lib/schema"
import { Copy, Check, CheckCircle, Heart, Lightbulb, List } from "lucide-react"
import { useToast } from "@/components/ui/toast"

interface TeachingBlocksProps {
  teachpack: GroqTeachpack
  activeMode: "analogy" | "diagram" | "oneliner"
}

export function TeachingBlocks({ teachpack, activeMode }: TeachingBlocksProps) {
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({})
  const { showToast } = useToast()

  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedStates((prev) => ({ ...prev, [key]: true }))
      showToast({
        title: "Copied!",
        description: "Text copied to clipboard",
        variant: "success",
      })
      setTimeout(() => {
        setCopiedStates((prev) => ({ ...prev, [key]: false }))
      }, 2000)
    } catch (error) {
      console.error("Failed to copy text:", error)
      showToast({
        title: "Copy Failed",
        description: "Failed to copy text to clipboard",
        variant: "destructive",
      })
    }
  }

  const renderAnalogy = () => (
    <div className="animate-in slide-in-from-bottom-4 duration-500">
      <Card className="glass-card p-8 hover:bg-zinc-900/50 transition-all duration-300">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-pink-500/20">
              <Heart className="w-6 h-6 text-pink-400" />
            </div>
            <h3 className="text-2xl font-bold glow-text">Analogy Explanation</h3>
          </div>
          <Button
            onClick={() => handleCopy(teachpack.analogy, "analogy")}
            variant="ghost"
            size="sm"
            className="text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200"
          >
            {copiedStates.analogy ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>
        <div className="prose prose-invert max-w-none">
          <p className="text-lg leading-relaxed text-white/90 font-medium">{teachpack.analogy}</p>
        </div>
      </Card>
    </div>
  )

  const renderDiagram = () => (
    <div className="animate-in slide-in-from-bottom-4 duration-500">
      <Card className="glass-card p-8 hover:bg-zinc-900/50 transition-all duration-300">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <List className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold glow-text">Step-by-Step Breakdown</h3>
          </div>
          <Button
            onClick={() =>
              handleCopy(teachpack.diagramSteps.map((step, i) => `${i + 1}. ${step}`).join("\n"), "diagram")
            }
            variant="ghost"
            size="sm"
            className="text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200"
          >
            {copiedStates.diagram ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>
        <div className="space-y-6">
          {teachpack.diagramSteps.map((step, index) => (
            <div
              key={index}
              className="flex items-start gap-4 group animate-in slide-in-from-left-4 duration-500"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-110 transition-transform duration-200">
                {index + 1}
              </div>
              <div className="flex-1 pt-1">
                <p className="text-white/90 leading-relaxed font-medium">{step}</p>
              </div>
              <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-2 opacity-80 group-hover:opacity-100 transition-opacity duration-200" />
            </div>
          ))}
        </div>

        {/* Progress indicator */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <div className="flex items-center justify-between text-sm text-white/60">
            <span>{teachpack.diagramSteps.length} steps total</span>
            <div className="flex gap-1">
              {teachpack.diagramSteps.map((_, index) => (
                <div
                  key={index}
                  className="w-2 h-2 rounded-full bg-blue-400"
                  style={{
                    animationDelay: `${index * 100 + 500}ms`,
                    opacity: 0,
                    animation: "fadeIn 0.3s ease-in-out forwards",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )

  const renderOneLiner = () => (
    <div className="animate-in slide-in-from-bottom-4 duration-500">
      <Card className="glass-card p-8 hover:bg-zinc-900/50 transition-all duration-300">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/20">
              <Lightbulb className="w-6 h-6 text-yellow-400" />
            </div>
            <h3 className="text-2xl font-bold glow-text">One-Liner Summary</h3>
          </div>
          <Button
            onClick={() => handleCopy(teachpack.oneLiner, "oneliner")}
            variant="ghost"
            size="sm"
            className="text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200"
          >
            {copiedStates.oneliner ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>
        <div className="text-center py-12">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl blur-xl" />
            <blockquote className="relative text-2xl md:text-3xl font-bold glow-text leading-relaxed px-8 py-6">
              "{teachpack.oneLiner}"
            </blockquote>
          </div>
        </div>
      </Card>
    </div>
  )

  return (
    <div className="space-y-6">
      {activeMode === "analogy" && renderAnalogy()}
      {activeMode === "diagram" && renderDiagram()}
      {activeMode === "oneliner" && renderOneLiner()}
    </div>
  )
}

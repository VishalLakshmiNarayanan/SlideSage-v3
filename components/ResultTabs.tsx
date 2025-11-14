"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/lib/store"
import { TeachingBlocks } from "./TeachingBlocks"
import { ExplainerVideo } from "./ExplainerVideo"
import { QuizBlock } from "./QuizBlock"
import Image from "next/image"
import { Heart, Lightbulb, List, Video, ArrowLeft, Brain } from "lucide-react"
import { useRouter } from "next/navigation"

const tabs = [
  { id: "analogy", label: "Analogy", icon: Heart },
  { id: "diagram", label: "Step-by-step", icon: List },
  { id: "oneliner", label: "One-liner", icon: Lightbulb },
  { id: "video", label: "Video", icon: Video },
  { id: "quiz", label: "Quiz", icon: Brain },
]

export function ResultTabs() {
  const [activeTab, setActiveTab] = useState("analogy")
  const { teachpack, updateScript } = useAppStore()
  const router = useRouter()

  const handleConceptLearned = (concept: string, score: number) => {
    console.log("[v0] ResultTabs: Concept learned:", concept, "Score:", score)

    const existingProgress = JSON.parse(
      localStorage.getItem("userProgress") ||
        '{"conceptsLearned":[],"streak":0,"totalPoints":0,"learningMultiplier":1.0}',
    )

    const newConcept = {
      concept,
      score,
      completedAt: new Date().toISOString(),
    }

    // Check if concept already exists, if so update it
    const existingIndex = existingProgress.conceptsLearned.findIndex((c: any) => c.concept === concept)
    if (existingIndex >= 0) {
      existingProgress.conceptsLearned[existingIndex] = newConcept
    } else {
      existingProgress.conceptsLearned.push(newConcept)
    }

    existingProgress.streak = existingProgress.conceptsLearned.length

    const points = score >= 70 ? Math.floor(score * existingProgress.learningMultiplier) : 0
    existingProgress.totalPoints += points

    existingProgress.learningMultiplier = Math.min(3.0, 1.0 + Math.floor(existingProgress.streak / 5) * 0.2)

    localStorage.setItem("userProgress", JSON.stringify(existingProgress))

    console.log("[v0] ResultTabs: Updated progress:", existingProgress)

    window.dispatchEvent(new Event("userProgressUpdated"))
  }

  if (!teachpack) {
    return (
      <Card className="glass-card p-8 text-center">
        <p className="text-white/70 mb-4">No teachpack generated yet.</p>
        <Button
          onClick={() => router.push("/")}
          variant="outline"
          className="border-white/20 text-white hover:bg-white/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with topic and logo */}
      <Card className="glass-card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Image src="/images/sage-logo.png" alt="Slide Sage Logo" width={60} height={60} className="rounded-lg" />
            <div>
              <h2 className="text-2xl font-bold glow-text mb-2">{teachpack.topic}</h2>
              <p className="text-white/70">Transformed into {tabs.length} different teaching formats</p>
            </div>
          </div>
          <Button
            onClick={() => router.push("/")}
            variant="outline"
            size="sm"
            className="border-white/20 text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            New Text
          </Button>
        </div>
      </Card>

      {/* Tab Navigation */}
      <Card className="glass-card p-2">
        <div className="flex space-x-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <Button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                variant={activeTab === tab.id ? "default" : "ghost"}
                className={`flex-1 py-3 px-4 rounded-lg transition-all duration-300 whitespace-nowrap relative overflow-hidden ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/25 border border-violet-400/50 matrix-button"
                    : "text-white/70 hover:text-white hover:bg-white/10 border border-transparent hover:border-violet-500/30"
                }`}
              >
                <Icon className={`w-4 h-4 mr-2 ${activeTab === tab.id ? "text-white drop-shadow-sm" : ""}`} />
                <span className={activeTab === tab.id ? "font-semibold text-shadow" : ""}>{tab.label}</span>
                {activeTab === tab.id && (
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-400/20 to-purple-400/20 animate-pulse pointer-events-none" />
                )}
              </Button>
            )
          })}
        </div>
      </Card>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === "video" ? (
          <ExplainerVideo script={teachpack.script} onScriptUpdate={updateScript} />
        ) : activeTab === "quiz" ? (
          <QuizBlock
            content={teachpack.script.scenes.map((scene) => scene.dialogue).join(" ")}
            topic={teachpack.topic}
            onComplete={() => router.push("/")}
            onConceptLearned={handleConceptLearned}
          />
        ) : (
          <TeachingBlocks teachpack={teachpack} activeMode={activeTab as "analogy" | "diagram" | "oneliner"} />
        )}
      </div>
    </div>
  )
}

"use client"

import { InputCard } from "@/components/InputCard"
import { ProfileCard } from "@/components/ProfileCard"
import { ConceptsLearned } from "@/components/ConceptsLearned"
import { Accelerator } from "@/components/Accelerator"
import Image from "next/image"
import { useState, useEffect } from "react"

interface UserProgress {
  conceptsLearned: Array<{
    concept: string
    score: number
    completedAt: Date
  }>
  streak: number
  totalPoints: number
  learningMultiplier: number
}

export default function Home() {
  const [userProgress, setUserProgress] = useState<UserProgress>({
    conceptsLearned: [],
    streak: 0,
    totalPoints: 0,
    learningMultiplier: 1.0,
  })

  useEffect(() => {
    const savedProgress = localStorage.getItem("userProgress")
    if (savedProgress) {
      try {
        const parsed = JSON.parse(savedProgress)
        // Convert date strings back to Date objects
        parsed.conceptsLearned = parsed.conceptsLearned.map((concept: any) => ({
          ...concept,
          completedAt: new Date(concept.completedAt),
        }))
        setUserProgress(parsed)
      } catch (error) {
        console.error("[v0] Error parsing saved progress:", error)
      }
    }
  }, [])

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "userProgress" && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue)
          parsed.conceptsLearned = parsed.conceptsLearned.map((concept: any) => ({
            ...concept,
            completedAt: new Date(concept.completedAt),
          }))
          setUserProgress(parsed)
        } catch (error) {
          console.error("[v0] Error parsing storage change:", error)
        }
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  const handleConceptLearned = (concept: string, score: number) => {
    console.log("[v0] Concept learned:", concept, "Score:", score)

    const newConcept = {
      concept,
      score,
      completedAt: new Date(),
    }

    setUserProgress((prev) => {
      const newConceptsLearned = [...prev.conceptsLearned, newConcept]
      const points = score >= 70 ? Math.floor(score * prev.learningMultiplier) : 0

      const newStreak = newConceptsLearned.length

      const newMultiplier = Math.min(3.0, 1.0 + Math.floor(newStreak / 2) * 0.1)

      const updatedProgress = {
        conceptsLearned: newConceptsLearned,
        streak: newStreak,
        totalPoints: prev.totalPoints + points,
        learningMultiplier: newMultiplier,
      }

      console.log("[v0] Updated progress:", updatedProgress)

      localStorage.setItem("userProgress", JSON.stringify(updatedProgress))

      return updatedProgress
    })
  }

  return (
    <main className="min-h-screen w-full relative">
      <div className="relative z-10 p-4">
        <div className="w-full max-w-6xl mx-auto space-y-6">
          <ProfileCard
            streak={userProgress.streak}
            totalPoints={userProgress.totalPoints}
            learningMultiplier={userProgress.learningMultiplier}
          />

          <div className="text-center">
            <div className="flex items-center justify-center gap-4 mb-4">
              <Image src="/images/sage-logo.png" alt="Slide Sage Logo" width={80} height={80} className="rounded-xl" />
              <h1 className="text-4xl md:text-6xl font-bold glow-text">Slidesage</h1>
            </div>
            <p className="text-xl text-white/70 max-w-2xl mx-auto mb-8">
              Turn complexity into clarity with engaging dialogue-based explainer videos powered by AI
            </p>
            <InputCard onConceptLearned={handleConceptLearned} />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <ConceptsLearned concepts={userProgress.conceptsLearned} />
            <Accelerator
              streak={userProgress.streak}
              multiplier={userProgress.learningMultiplier}
              totalPoints={userProgress.totalPoints}
            />
          </div>
        </div>
      </div>
    </main>
  )
}

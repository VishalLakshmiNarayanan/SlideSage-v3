"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Flame, Target, Lightbulb, Zap, Network, Award, MessageSquare } from "lucide-react"

interface LearnedConcept {
  id: string
  name: string
  score: number
  learnedAt: Date
  category?: string
}

interface EngagementData {
  streak: number
  lastActivity: Date
  momentum: number
  totalPoints: number
  challengesCompleted: number
}

interface Challenge {
  id: string
  type: "explain" | "connect" | "apply" | "create"
  title: string
  description: string
  points: number
  concepts: string[]
}

export function DynamicEngagementHub({ concepts = [] }: { concepts: LearnedConcept[] }) {
  const [engagementData, setEngagementData] = useState<EngagementData>({
    streak: 0,
    lastActivity: new Date(),
    momentum: 1,
    totalPoints: 0,
    challengesCompleted: 0,
  })

  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null)
  const [challengeResponse, setChallengeResponse] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [challengeResult, setChallengeResult] = useState<{ score: number; feedback: string } | null>(null)

  useEffect(() => {
    // Load engagement data
    const saved = localStorage.getItem("engagementData")
    if (saved) {
      const parsed = JSON.parse(saved)
      setEngagementData({
        ...parsed,
        lastActivity: new Date(parsed.lastActivity),
      })
    }

    // Update streak based on hourly activity
    updateStreak()
  }, [concepts])

  const updateStreak = () => {
    const now = new Date()
    const lastActivity = engagementData.lastActivity
    const hoursDiff = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60))

    if (hoursDiff <= 1) {
      // Within an hour, maintain streak
      return
    } else if (hoursDiff <= 24) {
      // Within a day, increment streak
      setEngagementData((prev) => {
        const updated = {
          ...prev,
          streak: prev.streak + 1,
          lastActivity: now,
          momentum: Math.min(prev.momentum + 0.1, 3.0),
        }
        localStorage.setItem("engagementData", JSON.stringify(updated))
        return updated
      })
    } else {
      // More than a day, reset streak
      setEngagementData((prev) => {
        const updated = {
          ...prev,
          streak: 0,
          momentum: 1.0,
          lastActivity: now,
        }
        localStorage.setItem("engagementData", JSON.stringify(updated))
        return updated
      })
    }
  }

  const generateChallenge = () => {
    if (concepts.length === 0) return null

    const challengeTypes = [
      {
        type: "explain" as const,
        title: "Explain Like I'm 5",
        description: "Explain this concept in simple terms that a 5-year-old could understand",
        points: 50,
      },
      {
        type: "connect" as const,
        title: "Find the Connection",
        description: "How does this concept relate to something in everyday life?",
        points: 75,
      },
      {
        type: "apply" as const,
        title: "Real-World Application",
        description: "Describe a practical situation where you would use this concept",
        points: 100,
      },
      {
        type: "create" as const,
        title: "Create an Analogy",
        description: "Create a creative analogy to help others understand this concept",
        points: 125,
      },
    ]

    const randomConcept = concepts[Math.floor(Math.random() * concepts.length)]
    const randomChallenge = challengeTypes[Math.floor(Math.random() * challengeTypes.length)]

    return {
      id: Date.now().toString(),
      ...randomChallenge,
      concepts: [randomConcept.name],
    }
  }

  const startChallenge = () => {
    const challenge = generateChallenge()
    if (challenge) {
      setActiveChallenge(challenge)
      setChallengeResponse("")
      setChallengeResult(null)
    }
  }

  const submitChallenge = async () => {
    if (!activeChallenge || !challengeResponse.trim()) return

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/evaluate-challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challenge: activeChallenge,
          response: challengeResponse,
          concepts: concepts,
        }),
      })

      const result = await response.json()
      setChallengeResult(result)

      // Update engagement data
      const pointsEarned = Math.floor(activeChallenge.points * (result.score / 100) * engagementData.momentum)
      setEngagementData((prev) => {
        const updated = {
          ...prev,
          totalPoints: prev.totalPoints + pointsEarned,
          challengesCompleted: prev.challengesCompleted + 1,
          lastActivity: new Date(),
        }
        localStorage.setItem("engagementData", JSON.stringify(updated))
        return updated
      })
    } catch (error) {
      console.error("Failed to evaluate challenge:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getKnowledgeConnections = () => {
    if (concepts.length < 2) return []

    const connections = []
    const categories = [...new Set(concepts.map((c) => c.category).filter(Boolean))]

    for (let i = 0; i < categories.length; i++) {
      for (let j = i + 1; j < categories.length; j++) {
        connections.push({
          from: categories[i],
          to: categories[j],
          strength: Math.random() * 0.8 + 0.2,
        })
      }
    }

    return connections.slice(0, 5) // Limit to 5 connections
  }

  const getPersonalizedInsights = () => {
    if (concepts.length === 0) return []

    const insights = []
    const categories = concepts.reduce(
      (acc, concept) => {
        const cat = concept.category || "General"
        acc[cat] = (acc[cat] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const strongestCategory = Object.entries(categories).sort(([, a], [, b]) => b - a)[0]
    if (strongestCategory) {
      insights.push(
        `You're building strong expertise in ${strongestCategory[0]} with ${strongestCategory[1]} concepts mastered!`,
      )
    }

    const avgScore = concepts.reduce((sum, c) => sum + c.score, 0) / concepts.length
    if (avgScore >= 85) {
      insights.push("You're consistently performing at an expert level. Consider tackling more advanced topics!")
    } else if (avgScore >= 75) {
      insights.push("Great progress! You're showing solid understanding across topics.")
    }

    const recentConcepts = concepts.filter(
      (c) => new Date().getTime() - c.learnedAt.getTime() < 7 * 24 * 60 * 60 * 1000,
    )
    if (recentConcepts.length >= 3) {
      insights.push(`You've been on fire this week, mastering ${recentConcepts.length} new concepts!`)
    }

    return insights
  }

  return (
    <div className="space-y-6">
      {/* Learning Momentum */}
      <Card className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame className="w-6 h-6 text-orange-400" />
            <h3 className="text-xl font-bold text-white">Learning Momentum</h3>
          </div>
          <Badge variant="secondary" className="bg-orange-500/20 text-orange-300">
            {engagementData.streak}h streak
          </Badge>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{concepts.length}</div>
            <div className="text-sm text-white/60">Concepts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{engagementData.totalPoints}</div>
            <div className="text-sm text-white/60">Points</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{engagementData.momentum.toFixed(1)}x</div>
            <div className="text-sm text-white/60">Multiplier</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{engagementData.challengesCompleted}</div>
            <div className="text-sm text-white/60">Challenges</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-white/60">Momentum Level</span>
            <span className="text-white">{Math.floor(engagementData.momentum * 100)}%</span>
          </div>
          <Progress value={engagementData.momentum * 33.33} className="h-2" />
        </div>
      </Card>

      {/* Knowledge Web */}
      <Card className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Network className="w-6 h-6 text-blue-400" />
          <h3 className="text-xl font-bold text-white">Knowledge Web</h3>
        </div>

        {concepts.length === 0 ? (
          <p className="text-white/60 text-center py-8">Start learning concepts to see how they connect!</p>
        ) : (
          <div className="space-y-3">
            {Object.entries(
              concepts.reduce(
                (acc, concept) => {
                  const cat = concept.category || "General"
                  if (!acc[cat]) acc[cat] = []
                  acc[cat].push(concept)
                  return acc
                },
                {} as Record<string, typeof concepts>,
              ),
            ).map(([category, categoryConcepts]) => (
              <div key={category} className="flex items-center gap-2">
                <Badge variant="outline" className="border-blue-400/50 text-blue-300">
                  {category}
                </Badge>
                <div className="flex-1 h-px bg-gradient-to-r from-blue-400/50 to-transparent"></div>
                <span className="text-sm text-white/60">{categoryConcepts.length} concepts</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Interactive Challenges */}
      <Card className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="w-6 h-6 text-green-400" />
            <h3 className="text-xl font-bold text-white">Interactive Challenges</h3>
          </div>
          {!activeChallenge && concepts.length > 0 && (
            <Button onClick={startChallenge} className="bg-green-600 hover:bg-green-500">
              <Zap className="w-4 h-4 mr-2" />
              New Challenge
            </Button>
          )}
        </div>

        {concepts.length === 0 ? (
          <p className="text-white/60 text-center py-8">Master some concepts first to unlock challenges!</p>
        ) : !activeChallenge ? (
          <p className="text-white/60 text-center py-8">Ready to test your knowledge? Start a challenge!</p>
        ) : (
          <div className="space-y-4">
            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-white">{activeChallenge.title}</h4>
                <Badge className="bg-green-500/20 text-green-300">
                  {Math.floor(activeChallenge.points * engagementData.momentum)} pts
                </Badge>
              </div>
              <p className="text-white/70 mb-2">{activeChallenge.description}</p>
              <p className="text-sm text-blue-300">Concept: {activeChallenge.concepts.join(", ")}</p>
            </div>

            <Textarea
              value={challengeResponse}
              onChange={(e) => setChallengeResponse(e.target.value)}
              placeholder="Type your response here..."
              className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
              rows={4}
            />

            <div className="flex gap-3">
              <Button
                onClick={submitChallenge}
                disabled={!challengeResponse.trim() || isSubmitting}
                className="bg-green-600 hover:bg-green-500"
              >
                {isSubmitting ? "Evaluating..." : "Submit Response"}
              </Button>
              <Button
                onClick={() => setActiveChallenge(null)}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                Skip
              </Button>
            </div>

            {challengeResult && (
              <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-5 h-5 text-blue-400" />
                  <span className="font-semibold text-blue-300">Score: {challengeResult.score}/100</span>
                </div>
                <p className="text-white/80 text-sm">{challengeResult.feedback}</p>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Personalized Insights */}
      <Card className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-6 h-6 text-yellow-400" />
          <h3 className="text-xl font-bold text-white">Learning Insights</h3>
        </div>

        {getPersonalizedInsights().length === 0 ? (
          <p className="text-white/60 text-center py-8">Keep learning to unlock personalized insights!</p>
        ) : (
          <div className="space-y-3">
            {getPersonalizedInsights().map((insight, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                <MessageSquare className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                <p className="text-white/80 text-sm">{insight}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

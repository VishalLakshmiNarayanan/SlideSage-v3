"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/lib/store"
import { TeachingBlocks } from "./TeachingBlocks"
import { ExplainerVideo } from "./ExplainerVideo"
import { Heart, Lightbulb, List, Video, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"

const tabs = [
  { id: "analogy", label: "Analogy", icon: Heart },
  { id: "diagram", label: "Step-by-step", icon: List },
  { id: "oneliner", label: "One-liner", icon: Lightbulb },
  { id: "video", label: "Video", icon: Video },
]

export function ResultTabs() {
  const [activeTab, setActiveTab] = useState("analogy")
  const { teachpack } = useAppStore()
  const router = useRouter()

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
        <div className="flex space-x-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <Button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                variant={activeTab === tab.id ? "default" : "ghost"}
                className={`flex-1 py-3 px-4 rounded-lg transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </Button>
            )
          })}
        </div>
      </Card>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === "video" ? (
          <ExplainerVideo script={teachpack.script} />
        ) : (
          <TeachingBlocks teachpack={teachpack} activeMode={activeTab as "analogy" | "diagram" | "oneliner"} />
        )}
      </div>
    </div>
  )
}

import { Card } from "@/components/ui/card"
import { Flame, Trophy, Zap } from "lucide-react"

interface ProfileCardProps {
  streak: number
  totalPoints: number
  learningMultiplier: number
}

export function ProfileCard({ streak, totalPoints, learningMultiplier }: ProfileCardProps) {
  return (
    <Card className="glass-card p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-white">U</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Learning Progress</h2>
            <p className="text-white/60">Keep up the great work!</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Streak */}
          <div className="text-center">
            <div className="flex items-center gap-1 mb-1">
              <Flame className={`w-5 h-5 ${streak > 0 ? "text-orange-400" : "text-gray-500"}`} />
              <span className="text-2xl font-bold text-white">{streak}</span>
            </div>
            <p className="text-xs text-white/60">Concept Streak</p>
          </div>

          {/* Learning Multiplier */}
          <div className="text-center">
            <div className="flex items-center gap-1 mb-1">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span className="text-2xl font-bold text-white">{learningMultiplier.toFixed(1)}x</span>
            </div>
            <p className="text-xs text-white/60">Multiplier</p>
          </div>

          {/* Total Points */}
          <div className="text-center">
            <div className="flex items-center gap-1 mb-1">
              <Trophy className="w-5 h-5 text-blue-400" />
              <span className="text-2xl font-bold text-white">{totalPoints.toLocaleString()}</span>
            </div>
            <p className="text-xs text-white/60">Total Points</p>
          </div>
        </div>
      </div>
    </Card>
  )
}

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Zap, Target, TrendingUp, Award, Flame } from "lucide-react"

interface AcceleratorProps {
  streak: number
  multiplier: number
  totalPoints: number
}

export function Accelerator({ streak, multiplier, totalPoints }: AcceleratorProps) {
  const getNextMilestone = () => {
    if (totalPoints < 70) return { target: 70, reward: "Welcome Badge" }
    if (totalPoints < 500) return { target: 500, reward: "Bronze Badge" }
    if (totalPoints < 1500) return { target: 1500, reward: "Silver Badge" }
    if (totalPoints < 3000) return { target: 3000, reward: "Gold Badge" }
    if (totalPoints < 7500) return { target: 7500, reward: "Platinum Badge" }
    return { target: 15000, reward: "Diamond Badge" }
  }

  const getStreakBonus = () => {
    if (streak >= 20) return "Master Learner"
    if (streak >= 10) return "Dedicated Student"
    if (streak >= 5) return "Consistent Learner"
    if (streak >= 2) return "Getting Started"
    return "New Learner"
  }

  const nextMilestone = getNextMilestone()
  const progress = (totalPoints / nextMilestone.target) * 100

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Zap className="w-6 h-6 text-yellow-400" />
        <h2 className="text-2xl font-bold text-white">Learning Accelerator</h2>
      </div>

      {/* Streak Card */}
      <Card className="glass-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Flame className={`w-5 h-5 ${streak > 0 ? "text-orange-400" : "text-gray-500"}`} />
            <h3 className="text-lg font-semibold text-white">Learning Streak</h3>
          </div>
          <Badge variant="secondary" className="bg-orange-500/20 text-orange-300">
            {getStreakBonus()}
          </Badge>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-white mb-1">{streak}</div>
          <p className="text-sm text-white/60">Concepts learned</p>
        </div>
      </Card>

      {/* Multiplier Card */}
      <Card className="glass-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-5 h-5 text-green-400" />
          <h3 className="text-lg font-semibold text-white">Learning Multiplier</h3>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-green-400">{multiplier.toFixed(1)}x</div>
            <p className="text-sm text-white/60">Points multiplier</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-white/60">Next level at</p>
            <p className="text-sm font-medium text-white">{Math.min(3.0, multiplier + 0.2).toFixed(1)}x</p>
          </div>
        </div>
      </Card>

      {/* Progress to Next Milestone */}
      <Card className="glass-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Next Milestone</h3>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-white/60">Progress to {nextMilestone.reward}</span>
            <span className="text-white">
              {totalPoints.toLocaleString()} / {nextMilestone.target.toLocaleString()}
            </span>
          </div>
          <Progress value={Math.min(progress, 100)} className="h-2" />
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/60">{Math.floor(progress)}% complete</span>
            <Badge variant="outline" className="text-xs border-blue-400/50 text-blue-300">
              {(nextMilestone.target - totalPoints).toLocaleString()} points to go
            </Badge>
          </div>
        </div>
      </Card>

      {/* Achievement Preview */}
      <Card className="glass-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Award className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Achievement System</h3>
        </div>
        <div className="space-y-2">
          <div
            className={`flex items-center justify-between p-2 rounded transition-all duration-300 ${
              totalPoints >= 70
                ? "bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-400/30 shadow-lg shadow-yellow-400/20"
                : "bg-white/5"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">🎉</span>
              <span className="text-sm text-white">First Concept (Welcome Badge)</span>
            </div>
            <Badge
              variant={totalPoints >= 70 ? "default" : "secondary"}
              className={`text-xs ${totalPoints >= 70 ? "bg-yellow-500/20 text-yellow-300 border-yellow-400/50" : ""}`}
            >
              {totalPoints >= 70 ? "Unlocked" : "Locked"}
            </Badge>
          </div>
          <div
            className={`flex items-center justify-between p-2 rounded transition-all duration-300 ${
              streak >= 5
                ? "bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-400/30 shadow-lg shadow-yellow-400/20"
                : "bg-white/5"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">🔥</span>
              <span className="text-sm text-white">Concept Collector (5 concepts)</span>
            </div>
            <Badge
              variant={streak >= 5 ? "default" : "secondary"}
              className={`text-xs ${streak >= 5 ? "bg-yellow-500/20 text-yellow-300 border-yellow-400/50" : ""}`}
            >
              {streak >= 5 ? "Unlocked" : "Locked"}
            </Badge>
          </div>
          <div
            className={`flex items-center justify-between p-2 rounded transition-all duration-300 ${
              totalPoints >= 500
                ? "bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-400/30 shadow-lg shadow-yellow-400/20"
                : "bg-white/5"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">💎</span>
              <span className="text-sm text-white">Point Master (500 points)</span>
            </div>
            <Badge
              variant={totalPoints >= 500 ? "default" : "secondary"}
              className={`text-xs ${totalPoints >= 500 ? "bg-yellow-500/20 text-yellow-300 border-yellow-400/50" : ""}`}
            >
              {totalPoints >= 500 ? "Unlocked" : "Locked"}
            </Badge>
          </div>
          <div
            className={`flex items-center justify-between p-2 rounded transition-all duration-300 ${
              streak >= 10
                ? "bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-400/30 shadow-lg shadow-yellow-400/20"
                : "bg-white/5"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">🏆</span>
              <span className="text-sm text-white">Knowledge Expert (10 concepts)</span>
            </div>
            <Badge
              variant={streak >= 10 ? "default" : "secondary"}
              className={`text-xs ${streak >= 10 ? "bg-yellow-500/20 text-yellow-300 border-yellow-400/50" : ""}`}
            >
              {streak >= 10 ? "Unlocked" : "Locked"}
            </Badge>
          </div>
        </div>
      </Card>
    </div>
  )
}

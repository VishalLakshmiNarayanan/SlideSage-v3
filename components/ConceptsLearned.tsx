import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Calendar, TrendingUp, Star } from "lucide-react"

interface ConceptsLearnedProps {
  concepts?: Array<{
    concept: string
    score: number
    completedAt: Date
  }>
}

export function ConceptsLearned({ concepts = [] }: ConceptsLearnedProps) {
  const safeConcepts = concepts || []

  const inferCategory = (name: string): string => {
    const lower = name.toLowerCase()
    if (lower.includes("math") || lower.includes("calculus") || lower.includes("algebra")) return "Mathematics"
    if (lower.includes("physics") || lower.includes("chemistry") || lower.includes("biology")) return "Science"
    if (lower.includes("history") || lower.includes("literature") || lower.includes("philosophy")) return "Humanities"
    if (lower.includes("programming") || lower.includes("computer") || lower.includes("algorithm")) return "Technology"
    if (lower.includes("business") || lower.includes("economics") || lower.includes("finance")) return "Business"
    return "General"
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-400"
    if (score >= 80) return "text-blue-400"
    if (score >= 70) return "text-yellow-400"
    return "text-orange-400"
  }

  const getScoreBadge = (score: number) => {
    if (score >= 90) return "Expert"
    if (score >= 80) return "Proficient"
    if (score >= 70) return "Competent"
    return "Learning"
  }

  if (safeConcepts.length === 0) {
    return (
      <Card className="glass-card p-6">
        <div className="text-center">
          <BookOpen className="w-12 h-12 text-blue-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Concepts Learned Yet</h3>
          <p className="text-white/70">Complete quizzes with 70% or higher to add concepts to your learning journey!</p>
        </div>
      </Card>
    )
  }

  const groupedConcepts = safeConcepts.reduce(
    (acc, concept) => {
      const category = inferCategory(concept.concept)
      if (!acc[category]) acc[category] = []
      acc[category].push(concept)
      return acc
    },
    {} as Record<string, typeof safeConcepts>,
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-blue-400" />
          <h2 className="text-2xl font-bold text-white">Concepts Learned</h2>
        </div>
        <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
          {safeConcepts.length} concepts mastered
        </Badge>
      </div>

      <div className="grid gap-4">
        {Object.entries(groupedConcepts).map(([category, categoryConcepts]) => (
          <Card key={category} className="glass-card p-4">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              {category}
            </h3>
            <div className="space-y-2">
              {categoryConcepts.map((concept, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-white">{concept.concept}</h4>
                      <Badge variant="outline" className={`text-xs ${getScoreColor(concept.score)} border-current`}>
                        {getScoreBadge(concept.score)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-white/60">
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {concept.score}%
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {concept.completedAt.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

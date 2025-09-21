"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, HelpCircle, Loader2, Trophy } from "lucide-react"

interface Quiz {
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

interface QuizBlockProps {
  content: string
  topic: string // Added topic prop for concept tracking
  onComplete?: () => void
  onConceptLearned?: (concept: string, score: number) => void // Added callback for concept learning
}

export function QuizBlock({ content, topic, onComplete, onConceptLearned }: QuizBlockProps) {
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [loading, setLoading] = useState(false)
  const [askedQuestions, setAskedQuestions] = useState<string[]>([])
  const [questionsAnswered, setQuestionsAnswered] = useState(0)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [reportedPass, setReportedPass] = useState(false)

  const MAX_QUESTIONS = 7 // Maximum number of questions

  useEffect(() => {
    if (!isCompleted) return
    const pct = questionsAnswered > 0 ? Math.round((correctAnswers / questionsAnswered) * 100) : 0
    if (pct >= 70 && onConceptLearned && !reportedPass) {
      onConceptLearned(topic, pct)
      setReportedPass(true)
    }
  }, [isCompleted, correctAnswers, questionsAnswered, onConceptLearned, topic, reportedPass])

  const loadQuiz = async () => {
    console.log("[v0] QuizBlock: Starting to load quiz")
    setLoading(true)
    try {
      console.log("[v0] QuizBlock: Making API call to /api/generate/quiz")
      const response = await fetch("/api/generate/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          previousQuestions: askedQuestions,
          questionNumber: questionsAnswered + 1,
          maxQuestions: MAX_QUESTIONS,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate quiz")
      }

      const quizData = await response.json()
      console.log("[v0] QuizBlock: Quiz loaded successfully:", quizData.question.substring(0, 50))
      setQuiz(quizData)
    } catch (error) {
      console.error("[v0] QuizBlock: Failed to load quiz:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult) return
    setSelectedAnswer(answerIndex)
  }

  const handleSubmit = () => {
    if (selectedAnswer === null || !quiz) return
    setShowResult(true)

    const isCorrect = selectedAnswer === quiz.correctAnswer
    if (isCorrect) {
      setCorrectAnswers((prev) => prev + 1)
    }

    setAskedQuestions((prev) => [...prev, quiz.question])
    setQuestionsAnswered((prev) => prev + 1)

    if (questionsAnswered + 1 >= MAX_QUESTIONS) {
      setTimeout(() => setIsCompleted(true), 2000)
    }
  }

  const resetQuiz = () => {
    console.log("[v0] QuizBlock: Resetting quiz and loading new question")
    setSelectedAnswer(null)
    setShowResult(false)

    loadQuiz()
  }

  const showResults = () => {
    console.log("[v0] QuizBlock: Showing final results")
    setIsCompleted(true)
  }

  if (isCompleted) {
    const percentage = Math.round((correctAnswers / questionsAnswered) * 100)
    const isPassed = percentage >= 70 // Set passing threshold to 70%

    return (
      <Card className="glass-card p-6">
        <div className="text-center">
          {isPassed ? (
            <>
              <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-green-400 mb-2">🎉 Concept Mastered!</h3>
              <p className="text-white/70 mb-4">
                Excellent! You scored {percentage}% ({correctAnswers}/{questionsAnswered} correct)
              </p>
              <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 mb-4">
                <p className="text-green-300 text-sm font-medium">
                  Congratulations! You've demonstrated excellent understanding of this concept. You've mastered the
                  material and don't need to retake the quiz.
                </p>
              </div>
              <Button onClick={onComplete} className="bg-green-600 hover:bg-green-500 text-white">
                Continue Learning
              </Button>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <HelpCircle className="w-8 h-8 text-orange-400" />
              </div>
              <h3 className="text-2xl font-bold text-orange-400 mb-2">Need More Practice</h3>
              <p className="text-white/70 mb-4">
                You scored {percentage}% ({correctAnswers}/{questionsAnswered} correct)
              </p>
              <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-4 mb-4">
                <p className="text-orange-300 text-sm font-medium">
                  Don't worry! Learning takes time. Try reviewing the material again and retake the quiz when you're
                  ready.
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setAskedQuestions([])
                    setQuestionsAnswered(0)
                    setCorrectAnswers(0)
                    setIsCompleted(false)
                    setQuiz(null)
                  }}
                  className="bg-blue-600 hover:bg-blue-500 text-white"
                >
                  Retake Quiz
                </Button>
                <Button
                  onClick={onComplete}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                >
                  Review Material
                </Button>
              </div>
            </>
          )}
        </div>
      </Card>
    )
  }

  if (!quiz && !loading) {
    return (
      <Card className="glass-card p-6">
        <div className="text-center">
          <HelpCircle className="w-12 h-12 text-blue-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Quick Knowledge Check</h3>
          <p className="text-white/70 mb-4">Test your understanding with {MAX_QUESTIONS} questions</p>
          <Button onClick={loadQuiz} className="bg-blue-600 hover:bg-blue-500 text-white">
            Start Quiz
          </Button>
        </div>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card className="glass-card p-6">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-400 mx-auto mb-4 animate-spin" />
          <p className="text-white/70">Generating quiz question...</p>
        </div>
      </Card>
    )
  }

  if (!quiz) return null

  const isCorrect = selectedAnswer === quiz.correctAnswer

  return (
    <Card className="glass-card p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Knowledge Check</h3>
          </div>
          <div className="text-sm text-white/60">
            Question {questionsAnswered + 1} of {MAX_QUESTIONS}
          </div>
        </div>

        <div className="bg-white/5 rounded-lg p-4 mb-6">
          <p className="text-white font-medium">{quiz.question}</p>
        </div>

        <div className="space-y-3">
          {quiz.options.map((option, index) => {
            let buttonClass = "w-full text-left p-4 rounded-lg border transition-all duration-200 "

            if (showResult) {
              if (index === quiz.correctAnswer) {
                buttonClass += "border-green-500 bg-green-500/20 text-green-300"
              } else if (index === selectedAnswer && selectedAnswer !== quiz.correctAnswer) {
                buttonClass += "border-red-500 bg-red-500/20 text-red-300"
              } else {
                buttonClass += "border-white/10 bg-white/5 text-white/50"
              }
            } else {
              if (selectedAnswer === index) {
                buttonClass += "border-blue-500 bg-blue-500/20 text-blue-300"
              } else {
                buttonClass += "border-white/20 bg-white/5 text-white hover:border-white/40 hover:bg-white/10"
              }
            }

            return (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={buttonClass}
                disabled={showResult}
              >
                <div className="flex items-center justify-between">
                  <span>{option}</span>
                  {showResult && index === quiz.correctAnswer && <CheckCircle className="w-5 h-5 text-green-400" />}
                  {showResult && index === selectedAnswer && selectedAnswer !== quiz.correctAnswer && (
                    <XCircle className="w-5 h-5 text-red-400" />
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {showResult && (
          <div
            className={`p-4 rounded-lg ${isCorrect ? "bg-green-500/20 border border-green-500/30" : "bg-red-500/20 border border-red-500/30"}`}
          >
            <div className="flex items-center gap-2 mb-2">
              {isCorrect ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <XCircle className="w-5 h-5 text-red-400" />
              )}
              <span className={`font-semibold ${isCorrect ? "text-green-300" : "text-red-300"}`}>
                {isCorrect ? "Correct!" : "Not quite right"}
              </span>
            </div>
            <p className="text-white/80 text-sm">{quiz.explanation}</p>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          {!showResult ? (
            <Button
              onClick={handleSubmit}
              disabled={selectedAnswer === null}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50"
            >
              Submit Answer
            </Button>
          ) : (
            <Button
              onClick={questionsAnswered >= MAX_QUESTIONS ? showResults : resetQuiz}
              variant="outline"
              className="flex-1 border-white/20 text-white hover:bg-white/10 bg-transparent"
            >
              {questionsAnswered >= MAX_QUESTIONS ? "See Results" : "Next Question"}
            </Button>
          )}
        </div>

        {questionsAnswered > 0 && (
          <div className="text-center text-sm text-white/60 pt-2">
            Score: {correctAnswers}/{questionsAnswered} correct
          </div>
        )}
      </div>
    </Card>
  )
}

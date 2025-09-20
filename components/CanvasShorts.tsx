"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Pause, Download, RotateCcw, Settings } from "lucide-react"
import type { GroqTeachpack } from "@/lib/schema"
import { VideoTimeline, wrapText, getIconForScene } from "@/lib/video/sceneEngine"
import { useToast } from "@/components/ui/toast"

interface CanvasShortsProps {
  script: GroqTeachpack["script"]
}

export function CanvasShorts({ script }: CanvasShortsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const animationRef = useRef<number | null>(null)
  const timelineRef = useRef<VideoTimeline | null>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [currentScene, setCurrentScene] = useState(0)
  const [progress, setProgress] = useState(0)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [quality, setQuality] = useState<"720p" | "1080p">("1080p")

  const { showToast } = useToast()

  // Initialize timeline
  useEffect(() => {
    const durations = script.scenes.map((scene) => scene.durationSec)
    timelineRef.current = new VideoTimeline(durations)
  }, [script])

  const totalDuration = timelineRef.current?.getTotalDuration() || 0

  const drawScene = useCallback(
    (ctx: CanvasRenderingContext2D, sceneIndex: number, sceneProgress: number) => {
      const scene = script.scenes[sceneIndex]
      if (!scene || !timelineRef.current) return

      const { width, height } = ctx.canvas

      // Clear canvas
      ctx.fillStyle = "#000000"
      ctx.fillRect(0, 0, width, height)

      // Create animated background gradient
      const time = Date.now() * 0.001
      const gradient = ctx.createRadialGradient(
        width / 2 + Math.sin(time * 0.5) * 100,
        height / 2 + Math.cos(time * 0.3) * 100,
        0,
        width / 2,
        height / 2,
        Math.max(width, height) / 2,
      )

      // Dynamic colors based on scene
      const hue = (sceneIndex * 60) % 360
      gradient.addColorStop(0, `hsla(${hue}, 70%, 50%, 0.3)`)
      gradient.addColorStop(0.5, `hsla(${(hue + 60) % 360}, 60%, 40%, 0.2)`)
      gradient.addColorStop(1, "rgba(0, 0, 0, 0.9)")

      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)

      // Calculate opacity with smooth transitions
      const opacity = timelineRef.current.getSceneOpacity(sceneProgress, scene.durationSec)
      ctx.globalAlpha = Math.max(0, Math.min(1, opacity))

      // Draw title at top with glow effect
      ctx.save()
      ctx.shadowColor = "rgba(255, 255, 255, 0.5)"
      ctx.shadowBlur = 20
      ctx.fillStyle = "#ffffff"
      ctx.font = `bold ${Math.floor(width * 0.06)}px system-ui, -apple-system, sans-serif`
      ctx.textAlign = "center"
      ctx.textBaseline = "top"
      ctx.fillText(script.title, width / 2, height * 0.1)
      ctx.restore()

      // Draw scene caption with word wrapping and animations
      ctx.save()
      const fontSize = Math.floor(width * 0.045)
      ctx.font = `bold ${fontSize}px system-ui, -apple-system, sans-serif`
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"

      // Wrap text
      const maxWidth = width * 0.8
      const lines = wrapText(ctx, scene.caption, maxWidth)
      const lineHeight = fontSize * 1.4
      const totalTextHeight = lines.length * lineHeight
      const startY = height / 2 - totalTextHeight / 2

      // Animate text appearance
      const textProgress = Math.max(0, (sceneProgress - 0.2) / 0.6)

      lines.forEach((line, index) => {
        const lineDelay = index * 0.1
        const lineOpacity = Math.max(0, Math.min(1, (textProgress - lineDelay) * 3))

        ctx.save()
        ctx.globalAlpha = opacity * lineOpacity

        // Add text glow
        ctx.shadowColor = "rgba(255, 255, 255, 0.3)"
        ctx.shadowBlur = 10
        ctx.fillStyle = "#ffffff"

        // Subtle animation offset
        const yOffset = (1 - lineOpacity) * 20
        ctx.fillText(line, width / 2, startY + index * lineHeight + yOffset)
        ctx.restore()
      })
      ctx.restore()

      // Draw animated icon
      ctx.save()
      const iconSize = Math.floor(width * 0.08)
      ctx.font = `${iconSize}px system-ui, Apple Color Emoji, sans-serif`
      ctx.textAlign = "right"
      ctx.textBaseline = "top"

      // Icon animation
      const iconProgress = Math.max(0, (sceneProgress - 0.5) / 0.3)
      const iconScale = 0.8 + 0.2 * Math.sin(iconProgress * Math.PI * 2)
      const iconOpacity = Math.min(1, iconProgress * 2)

      ctx.globalAlpha = opacity * iconOpacity
      ctx.save()
      ctx.translate(width * 0.9, height * 0.08)
      ctx.scale(iconScale, iconScale)
      ctx.fillStyle = "#ffffff"
      ctx.shadowColor = "rgba(255, 255, 255, 0.5)"
      ctx.shadowBlur = 15

      const displayIcon = getIconForScene(scene.icon)
      ctx.fillText(displayIcon, 0, 0)
      ctx.restore()
      ctx.restore()

      // Draw progress bar with animation
      ctx.save()
      const progressBarY = height * 0.92
      const progressBarWidth = width * 0.8
      const progressBarX = width * 0.1
      const progressBarHeight = 6

      // Background
      ctx.globalAlpha = 0.3
      ctx.fillStyle = "#ffffff"
      ctx.roundRect(progressBarX, progressBarY, progressBarWidth, progressBarHeight, 3)
      ctx.fill()

      // Progress
      ctx.globalAlpha = 0.8
      const overallProgress = (sceneIndex + sceneProgress / scene.durationSec) / script.scenes.length
      const currentProgressWidth = progressBarWidth * overallProgress

      // Gradient progress bar
      const progressGradient = ctx.createLinearGradient(progressBarX, 0, progressBarX + currentProgressWidth, 0)
      progressGradient.addColorStop(0, "#3b82f6")
      progressGradient.addColorStop(1, "#8b5cf6")

      ctx.fillStyle = progressGradient
      ctx.roundRect(progressBarX, progressBarY, currentProgressWidth, progressBarHeight, 3)
      ctx.fill()

      // Progress indicator dot
      ctx.beginPath()
      ctx.arc(progressBarX + currentProgressWidth, progressBarY + progressBarHeight / 2, 8, 0, Math.PI * 2)
      ctx.fillStyle = "#ffffff"
      ctx.shadowColor = "rgba(59, 130, 246, 0.8)"
      ctx.shadowBlur = 10
      ctx.fill()
      ctx.restore()

      // Scene counter
      ctx.save()
      ctx.globalAlpha = 0.7
      ctx.fillStyle = "#ffffff"
      ctx.font = `${Math.floor(width * 0.025)}px system-ui, sans-serif`
      ctx.textAlign = "center"
      ctx.textBaseline = "bottom"
      ctx.fillText(`${sceneIndex + 1} / ${script.scenes.length}`, width / 2, height * 0.88)
      ctx.restore()

      ctx.globalAlpha = 1
    },
    [script],
  )

  // Animation loop
  const animate = useCallback(() => {
    if (!isPlaying || !startTime || !timelineRef.current) return

    const elapsed = (Date.now() - startTime) / 1000
    const sceneInfo = timelineRef.current.getCurrentScene(elapsed)

    if (elapsed >= totalDuration) {
      setIsPlaying(false)
      setCurrentScene(script.scenes.length - 1)
      setProgress(script.scenes[script.scenes.length - 1].durationSec)
      return
    }

    setCurrentScene(sceneInfo.index)
    setProgress(sceneInfo.progress * script.scenes[sceneInfo.index].durationSec)

    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (canvas && ctx) {
      drawScene(ctx, sceneInfo.index, sceneInfo.progress * script.scenes[sceneInfo.index].durationSec)
    }

    animationRef.current = requestAnimationFrame(animate)
  }, [isPlaying, startTime, totalDuration, script.scenes, drawScene])

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size based on quality
    const scale = quality === "1080p" ? 1 : 0.67
    canvas.width = 1080 * scale
    canvas.height = 1920 * scale

    // Enable high DPI rendering
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr * scale
    canvas.height = rect.height * dpr * scale
    ctx.scale(dpr * scale, dpr * scale)

    drawScene(ctx, currentScene, progress)
  }, [quality, currentScene, progress, drawScene])

  // Animation effect
  useEffect(() => {
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(animate)
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPlaying, animate])

  const startAnimation = () => {
    if (isPlaying) return
    setIsPlaying(true)
    setCurrentScene(0)
    setProgress(0)
    setStartTime(Date.now())
  }

  const stopAnimation = () => {
    setIsPlaying(false)
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
  }

  const resetAnimation = () => {
    stopAnimation()
    setCurrentScene(0)
    setProgress(0)
    setStartTime(null)

    // Redraw first scene
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (canvas && ctx) {
      drawScene(ctx, 0, 0)
    }
  }

  const startRecording = async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    try {
      const stream = canvas.captureStream(30)
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp9",
        videoBitsPerSecond: quality === "1080p" ? 5000000 : 2500000,
      })

      chunksRef.current = []
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" })
        const url = URL.createObjectURL(blob)
        setDownloadUrl(url)
        setIsRecording(false)

        showToast({
          title: "Video Ready!",
          description: "Your video has been generated and is ready to download.",
          variant: "success",
        })
      }

      mediaRecorder.start()
      setIsRecording(true)
      startAnimation()

      showToast({
        title: "Recording Started",
        description: `Recording ${quality} video for ${totalDuration}s...`,
        variant: "default",
      })

      // Stop recording when animation completes
      setTimeout(
        () => {
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop()
          }
        },
        totalDuration * 1000 + 1000,
      ) // Add buffer
    } catch (error) {
      console.error("Recording failed:", error)
      showToast({
        title: "Recording Failed",
        description: "Failed to start video recording. Please try again.",
        variant: "destructive",
      })
    }
  }

  const downloadVideo = () => {
    if (!downloadUrl) return

    const a = document.createElement("a")
    a.href = downloadUrl
    a.download = `${script.title.replace(/[^a-zA-Z0-9]/g, "_")}_${quality}.webm`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    showToast({
      title: "Download Started",
      description: "Your video is being downloaded.",
      variant: "success",
    })
  }

  return (
    <div className="space-y-6">
      <Card className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold glow-text mb-2">Short Video Generator</h3>
            <p className="text-white/70">
              {totalDuration}s • {script.scenes.length} scenes • {quality}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={quality}
              onChange={(e) => setQuality(e.target.value as "720p" | "1080p")}
              disabled={isRecording || isPlaying}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white text-sm"
            >
              <option value="720p">720p</option>
              <option value="1080p">1080p</option>
            </select>
            <Settings className="w-4 h-4 text-white/60" />
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Canvas Preview */}
          <div className="space-y-4">
            <div className="relative bg-black rounded-lg overflow-hidden shadow-2xl">
              <canvas
                ref={canvasRef}
                className="w-full h-auto max-h-[600px] object-contain"
                style={{ aspectRatio: "9/16" }}
              />
              {isRecording && (
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  REC
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3 flex-wrap">
              <Button
                onClick={isPlaying ? stopAnimation : startAnimation}
                disabled={isRecording}
                className="bg-blue-600 hover:bg-blue-500 transition-colors"
              >
                {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                {isPlaying ? "Pause" : "Play"}
              </Button>

              <Button
                onClick={resetAnimation}
                disabled={isRecording}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 bg-transparent"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>

              <Button
                onClick={startRecording}
                disabled={isRecording || isPlaying}
                className="bg-red-600 hover:bg-red-500 transition-colors"
              >
                {isRecording ? "Recording..." : "Export Video"}
              </Button>

              {downloadUrl && (
                <Button onClick={downloadVideo} className="bg-green-600 hover:bg-green-500 transition-colors">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              )}
            </div>
          </div>

          {/* Scene List */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Scene Timeline</h4>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {script.scenes.map((scene, index) => (
                <Card
                  key={index}
                  className={`p-4 transition-all duration-300 ${
                    index === currentScene
                      ? "glass-card border-blue-400/50 bg-blue-400/10 scale-[1.02]"
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl flex-shrink-0">{getIconForScene(scene.icon)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-blue-400">Scene {index + 1}</span>
                        <span className="text-xs text-white/60 bg-white/10 px-2 py-1 rounded">
                          {scene.durationSec}s
                        </span>
                        {index === currentScene && isPlaying && (
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        )}
                      </div>
                      <p className="text-sm text-white/80 leading-relaxed">{scene.caption}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="text-center pt-4 border-t border-white/10">
              <p className="text-sm text-white/60">
                Total duration: <span className="font-medium">{totalDuration}s</span>
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

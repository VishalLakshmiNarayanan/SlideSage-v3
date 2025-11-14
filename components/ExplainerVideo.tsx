"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Pause, Download, RotateCcw, Volume2, VolumeX } from "lucide-react"
import type { GroqTeachpack } from "@/lib/schema"
import { fetchPexelsVideo, fetchPexelsImage } from "@/lib/pexels"
import { useToast } from "@/components/ui/toast"
import { FeedbackBlock } from "./FeedbackBlock"
import { generateTeachpack } from "@/lib/groq"

interface ExplainerVideoProps {
  script: GroqTeachpack["script"]
  onScriptUpdate?: (newScript: GroqTeachpack["script"]) => void
}

interface SceneWithMedia {
  speaker: string
  dialogue: string
  visualHint: string
  visualSearchQuery: string
  durationSec: number
  videoUrl?: string
  videoElement?: HTMLVideoElement
  imageUrl?: string
  imageElement?: HTMLImageElement
}

export function ExplainerVideo({ script, onScriptUpdate }: ExplainerVideoProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const animationRef = useRef<number | null>(null)
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null)
  const isTransitioningRef = useRef(false)
  const currentSpeechRef = useRef<string | null>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [scenesWithMedia, setScenesWithMedia] = useState<SceneWithMedia[]>([])
  const [isLoadingMedia, setIsLoadingMedia] = useState(false)
  const [showCaptions, setShowCaptions] = useState(true)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0)
  const [isSpeechComplete, setIsSpeechComplete] = useState(false)
  const [sceneStartTime, setSceneStartTime] = useState(0)
  const [backgroundVideoIndex, setBackgroundVideoIndex] = useState(0)
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 1920, height: 1080 })
  const [showQuiz, setShowQuiz] = useState(false)
  const [videoCompleted, setVideoCompleted] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)

  const { showToast } = useToast()

  const totalDuration = script.scenes.reduce((sum, scene) => sum + Math.max(scene.durationSec, 8), 0)

  useEffect(() => {
    const loadMedia = async () => {
      setIsLoadingMedia(true)
      const scenesWithMediaData: SceneWithMedia[] = []

      for (const scene of script.scenes) {
        console.log("[v0] Loading video for query:", scene.visualSearchQuery)

        const videoUrl = await fetchPexelsVideo(scene.visualSearchQuery)
        let videoElement: HTMLVideoElement | undefined
        let imageElement: HTMLImageElement | undefined
        let imageUrl: string | undefined

        if (videoUrl) {
          videoElement = document.createElement("video")
          videoElement.crossOrigin = "anonymous"
          videoElement.muted = true
          videoElement.loop = true
          videoElement.playsInline = true

          await new Promise<void>((resolve) => {
            videoElement!.onloadeddata = () => {
              console.log("[v0] Video loaded successfully:", videoUrl)
              resolve()
            }
            videoElement!.onerror = () => {
              console.log("[v0] Video failed to load, will try image fallback")
              resolve()
            }
            videoElement!.src = videoUrl
          })
        }

        if (!videoElement || videoElement.error) {
          console.log("[v0] Using image fallback for:", scene.visualSearchQuery)
          imageUrl = await fetchPexelsImage(scene.visualSearchQuery)
          const finalImageUrl = imageUrl || "/diverse-students-learning.png"

          imageElement = new Image()
          imageElement.crossOrigin = "anonymous"

          await new Promise<void>((resolve) => {
            imageElement!.onload = () => {
              console.log("[v0] Fallback image loaded successfully:", finalImageUrl)
              resolve()
            }
            imageElement!.onerror = () => {
              console.log("[v0] Image failed to load, using default")
              resolve()
            }
            imageElement!.src = finalImageUrl
          })
        }

        scenesWithMediaData.push({
          ...scene,
          videoUrl: videoUrl || undefined,
          videoElement,
          imageUrl,
          imageElement,
        })
      }

      setScenesWithMedia(scenesWithMediaData)
      setIsLoadingMedia(false)
      console.log("[v0] All media loaded")
    }

    loadMedia()
  }, [script.scenes])

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices()
      console.log(
        "[v0] Available voices:",
        voices.map((v) => `${v.name} (${v.lang})`),
      )
    }

    if ("speechSynthesis" in window) {
      loadVoices()
      window.speechSynthesis.addEventListener("voiceschanged", loadVoices)

      return () => {
        window.speechSynthesis.removeEventListener("voiceschanged", loadVoices)
      }
    }
  }, [])

  const getCurrentScene = useCallback(() => {
    if (currentSceneIndex >= scenesWithMedia.length) {
      return {
        index: scenesWithMedia.length - 1,
        scene: scenesWithMedia[scenesWithMedia.length - 1],
        progress: 1,
        sceneStartTime: 0,
      }
    }

    const scene = scenesWithMedia[currentSceneIndex]
    const elapsed = currentTime - sceneStartTime
    const progress = Math.min(elapsed / Math.max(scene.durationSec, 8), 1)

    return {
      index: currentSceneIndex,
      scene,
      progress,
      sceneStartTime,
    }
  }, [currentSceneIndex, scenesWithMedia, currentTime, sceneStartTime])

  const speakText = useCallback(
    (text: string, speaker: string, onComplete?: () => void) => {
      if (!audioEnabled || !("speechSynthesis" in window)) {
        if (onComplete) {
          const estimatedDuration = (text.split(" ").length / 2.5) * 1000
          setTimeout(onComplete, estimatedDuration)
        }
        return
      }

      if (currentSpeechRef.current === text) {
        console.log("[v0] Speech already in progress for:", text.substring(0, 50))
        return
      }

      window.speechSynthesis.cancel()
      setIsSpeechComplete(false)
      currentSpeechRef.current = text

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.volume = 0.8

      const voices = window.speechSynthesis.getVoices()

      if (speaker === "Student") {
        utterance.pitch = 1.2
        const femaleVoice =
          voices.find(
            (v) =>
              v.lang.startsWith("en") &&
              (v.name.toLowerCase().includes("female") ||
                v.name.toLowerCase().includes("woman") ||
                v.name.toLowerCase().includes("samantha") ||
                v.name.toLowerCase().includes("karen") ||
                v.name.toLowerCase().includes("susan") ||
                v.name.toLowerCase().includes("victoria") ||
                v.name.toLowerCase().includes("zira")),
          ) || voices.find((v) => v.lang.startsWith("en") && v.name.toLowerCase().includes("us"))

        if (femaleVoice) {
          utterance.voice = femaleVoice
          console.log("[v0] Using female voice for student:", femaleVoice.name)
        }
      } else {
        utterance.pitch = 0.8
        const maleVoice =
          voices.find(
            (v) =>
              v.lang.startsWith("en") &&
              (v.name.toLowerCase().includes("male") ||
                v.name.toLowerCase().includes("man") ||
                v.name.toLowerCase().includes("david") ||
                v.name.toLowerCase().includes("mark") ||
                v.name.toLowerCase().includes("daniel") ||
                v.name.toLowerCase().includes("alex")),
          ) || voices.find((v) => v.lang.startsWith("en"))

        if (maleVoice) {
          utterance.voice = maleVoice
          console.log("[v0] Using male voice for sage:", maleVoice.name)
        }
      }

      if (!utterance.voice) {
        const englishVoice = voices.find((v) => v.lang.startsWith("en")) || voices[0]
        if (englishVoice) utterance.voice = englishVoice
      }

      utterance.onend = () => {
        console.log("[v0] Speech completed for:", speaker)
        setIsSpeechComplete(true)
        currentSpeechRef.current = null
        if (onComplete) onComplete()
      }

      utterance.onerror = (event) => {
        console.log("[v0] Speech error:", event.error)
        setIsSpeechComplete(true)
        currentSpeechRef.current = null
        if (onComplete) onComplete()
      }

      speechRef.current = utterance
      window.speechSynthesis.speak(utterance)
    },
    [audioEnabled],
  )

  useEffect(() => {
    if (!isPlaying || isTransitioningRef.current) return

    if (isSpeechComplete && currentSceneIndex < scenesWithMedia.length - 1) {
      isTransitioningRef.current = true
      console.log("[v0] Moving to next scene:", currentSceneIndex + 1)

      const currentScene = scenesWithMedia[currentSceneIndex]
      if (currentScene.videoElement && !currentScene.videoElement.paused) {
        try {
          currentScene.videoElement.pause()
        } catch (error) {
          console.log("[v0] Video pause error (non-critical):", error.name)
        }
      }

      const nextSceneIndex = currentSceneIndex + 1
      setCurrentSceneIndex(nextSceneIndex)
      setSceneStartTime(currentTime)
      setIsSpeechComplete(false)
      setBackgroundVideoIndex(0)

      const nextScene = scenesWithMedia[nextSceneIndex]
      if (nextScene) {
        setTimeout(() => {
          speakText(nextScene.dialogue, nextScene.speaker, () => {
            isTransitioningRef.current = false
          })
        }, 100)
      } else {
        isTransitioningRef.current = false
      }
    } else if (currentSceneIndex >= scenesWithMedia.length - 1 && isSpeechComplete) {
      setIsPlaying(false)
      setVideoCompleted(true)
      window.speechSynthesis.cancel()
      currentSpeechRef.current = null

      scenesWithMedia.forEach((scene) => {
        if (scene.videoElement && !scene.videoElement.paused) {
          try {
            scene.videoElement.pause()
          } catch (error) {
            console.log("[v0] Video pause error during cleanup (non-critical):", error.name)
          }
        }
      })
    }
  }, [isSpeechComplete, currentSceneIndex, scenesWithMedia, isPlaying, currentTime, speakText])

  const handleFeedback = async (feedbackInstruction: string) => {
    console.log("[v0] ExplainerVideo: Handling feedback:", feedbackInstruction)
    setIsRegenerating(true)
    try {
      const originalContent = script.scenes.map((scene) => scene.dialogue).join(" ")
      console.log("[v0] ExplainerVideo: Generating new teachpack with feedback")
      const newTeachpack = await generateTeachpack(
        `Previous explanation: ${originalContent}`,
        `${feedbackInstruction} - Make sure this is completely different from the previous explanation.`,
      )

      console.log("[v0] ExplainerVideo: New teachpack generated, updating script")
      if (onScriptUpdate && newTeachpack.script) {
        onScriptUpdate(newTeachpack.script)
      }

      showToast({
        title: "Content Regenerated",
        description: "The explanation has been improved based on your feedback.",
        variant: "success",
      })
      resetVideo()
      setVideoCompleted(false)
    } catch (error) {
      console.error("[v0] ExplainerVideo: Failed to regenerate content:", error)
      showToast({
        title: "Regeneration Failed",
        description: "Failed to improve the content. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsRegenerating(false)
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      canvas.width = canvasDimensions.width
      canvas.height = canvasDimensions.height

      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = "high"
      }
    }
  }, [canvasDimensions])

  const drawFrame = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const { width, height } = ctx.canvas
      const currentSceneData = getCurrentScene()

      if (!currentSceneData.scene) return

      ctx.clearRect(0, 0, width, height)
      ctx.fillStyle = "#000000"
      ctx.fillRect(0, 0, width, height)

      const scene = currentSceneData.scene
      let mediaDrawn = false

      if (scene.videoElement && scene.videoElement.readyState >= 2) {
        const video = scene.videoElement

        if (video.paused && isPlaying) {
          video.currentTime = (backgroundVideoIndex * 5) % video.duration
          const playVideo = async () => {
            try {
              await video.play()
            } catch (error) {
              if (error.name !== "AbortError") {
                console.log("[v0] Video play error (non-critical):", error.name)
              }
            }
          }
          playVideo()
        }

        const videoAspect = video.videoWidth / video.videoHeight
        const canvasAspect = width / height

        let drawWidth, drawHeight, drawX, drawY

        if (videoAspect > canvasAspect) {
          drawHeight = height
          drawWidth = height * videoAspect
          drawX = (width - drawWidth) / 2
          drawY = 0
        } else {
          drawWidth = width
          drawHeight = width / videoAspect
          drawX = 0
          drawY = (height - drawHeight) / 2
        }

        ctx.drawImage(video, drawX, drawY, drawWidth, drawHeight)
        mediaDrawn = true

        ctx.fillStyle = "rgba(0, 0, 0, 0.4)"
        ctx.fillRect(0, 0, width, height)
      }

      if (!mediaDrawn && scene.imageElement && scene.imageElement.complete) {
        const img = scene.imageElement

        const imgAspect = img.width / img.height
        const canvasAspect = width / height

        let drawWidth, drawHeight, drawX, drawY

        if (imgAspect > canvasAspect) {
          drawHeight = height
          drawWidth = height * imgAspect
          drawX = (width - drawWidth) / 2
          drawY = 0
        } else {
          drawWidth = width
          drawHeight = width / imgAspect
          drawX = 0
          drawY = (height - drawHeight) / 2
        }

        const zoomFactor = 1 + backgroundVideoIndex * 0.05
        const zoomedWidth = drawWidth * zoomFactor
        const zoomedHeight = drawHeight * zoomFactor
        const zoomedX = drawX - (zoomedWidth - drawWidth) / 2
        const zoomedY = drawY - (zoomedHeight - drawHeight) / 2

        ctx.drawImage(img, zoomedX, zoomedY, zoomedWidth, zoomedHeight)

        ctx.fillStyle = "rgba(0, 0, 0, 0.4)"
        ctx.fillRect(0, 0, width, height)
      }

      ctx.save()
      ctx.fillStyle = "#ffffff"
      ctx.font = `bold ${Math.floor(width * 0.04)}px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
      ctx.textAlign = "center"
      ctx.textBaseline = "top"
      ctx.shadowColor = "rgba(0, 0, 0, 0.8)"
      ctx.shadowBlur = 10
      ctx.shadowOffsetX = 2
      ctx.shadowOffsetY = 2
      ctx.fillText(script.title, width / 2, height * 0.05)
      ctx.restore()

      if (showCaptions) {
        ctx.save()
        const fontSize = Math.floor(width * 0.035)
        ctx.font = `${fontSize}px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"

        const words = currentSceneData.scene.dialogue.split(" ")
        const lines: string[] = []
        let currentLine = ""
        const maxWidth = width * 0.8

        for (const word of words) {
          const testLine = currentLine + (currentLine ? " " : "") + word
          const metrics = ctx.measureText(testLine)
          if (metrics.width > maxWidth && currentLine) {
            lines.push(currentLine)
            currentLine = word
          } else {
            currentLine = testLine
          }
        }
        if (currentLine) lines.push(currentLine)

        const lineHeight = fontSize * 1.4
        const totalTextHeight = lines.length * lineHeight
        const captionY = height * 0.8
        const padding = 20

        ctx.fillStyle = "rgba(0, 0, 0, 0.85)"
        const rectX = width * 0.1 - padding
        const rectY = captionY - totalTextHeight / 2 - padding
        const rectWidth = width * 0.8 + padding * 2
        const rectHeight = totalTextHeight + padding * 2
        const cornerRadius = 8

        ctx.beginPath()
        ctx.roundRect(rectX, rectY, rectWidth, rectHeight, cornerRadius)
        ctx.fill()

        ctx.fillStyle = "#ffffff"
        ctx.shadowColor = "rgba(0, 0, 0, 0.9)"
        ctx.shadowBlur = 6
        ctx.shadowOffsetX = 1
        ctx.shadowOffsetY = 1
        lines.forEach((line, index) => {
          const y = captionY - totalTextHeight / 2 + (index + 0.5) * lineHeight
          ctx.fillText(line, width / 2, y)
        })

        ctx.save()
        ctx.font = `bold ${Math.floor(fontSize * 0.8)}px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
        ctx.fillStyle = currentSceneData.scene.speaker === "Student" ? "#60a5fa" : "#34d399"
        ctx.textAlign = "left"
        ctx.shadowColor = "rgba(0, 0, 0, 0.9)"
        ctx.shadowBlur = 4
        ctx.shadowOffsetX = 1
        ctx.shadowOffsetY = 1
        ctx.fillText(currentSceneData.scene.speaker, width * 0.1, captionY - totalTextHeight / 2 - padding - 15)
        ctx.restore()
        ctx.restore()
      }

      ctx.save()
      const progressY = height * 0.95
      const progressWidth = width * 0.8
      const progressX = width * 0.1
      const progressHeight = 4

      ctx.fillStyle = "rgba(255, 255, 255, 0.3)"
      ctx.fillRect(progressX, progressY, progressWidth, progressHeight)

      const progress = (currentSceneIndex + currentSceneData.progress) / scenesWithMedia.length
      ctx.fillStyle = "#3b82f6"
      ctx.fillRect(progressX, progressY, progressWidth * progress, progressHeight)
      ctx.restore()

      ctx.save()
      ctx.fillStyle = "#ffffff"
      ctx.font = `${Math.floor(width * 0.025)}px system-ui, sans-serif`
      ctx.textAlign = "center"
      ctx.textBaseline = "bottom"
      ctx.shadowColor = "rgba(0, 0, 0, 0.8)"
      ctx.shadowBlur = 4
      ctx.fillText(
        `Scene ${currentSceneIndex + 1}/${scenesWithMedia.length} • ${Math.floor(currentTime)}s`,
        width / 2,
        height * 0.93,
      )
      ctx.restore()
    },
    [
      script.title,
      getCurrentScene,
      showCaptions,
      currentSceneIndex,
      scenesWithMedia.length,
      currentTime,
      backgroundVideoIndex,
      isPlaying,
    ],
  )

  const animate = useCallback(() => {
    if (!isPlaying || !startTime) return

    const elapsed = (Date.now() - startTime) / 1000
    setCurrentTime(elapsed)

    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (canvas && ctx) {
      drawFrame(ctx)
    }

    animationRef.current = requestAnimationFrame(animate)
  }, [isPlaying, startTime, drawFrame])

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

  const startVideo = () => {
    if (isPlaying) return
    setIsPlaying(true)
    setStartTime(Date.now())
    setCurrentSceneIndex(0)
    setSceneStartTime(0)
    setIsSpeechComplete(false)
    setBackgroundVideoIndex(0)
    isTransitioningRef.current = false
    currentSpeechRef.current = null

    if (audioEnabled && scenesWithMedia.length > 0) {
      const firstScene = scenesWithMedia[0]
      setTimeout(() => {
        speakText(firstScene.dialogue, firstScene.speaker)
      }, 200)
    } else if (!audioEnabled) {
      const firstScene = scenesWithMedia[0]
      const estimatedDuration = (firstScene.dialogue.split(" ").length / 2.5) * 1000
      setTimeout(() => setIsSpeechComplete(true), estimatedDuration)
    }
  }

  const pauseVideo = () => {
    setIsPlaying(false)
    window.speechSynthesis.cancel()
    currentSpeechRef.current = null
    isTransitioningRef.current = false

    scenesWithMedia.forEach((scene) => {
      if (scene.videoElement && !scene.videoElement.paused) {
        try {
          scene.videoElement.pause()
        } catch (error) {
          console.log("[v0] Video pause error (non-critical):", error.name)
        }
      }
    })
  }

  const resetVideo = () => {
    setIsPlaying(false)
    setCurrentTime(0)
    setStartTime(null)
    setCurrentSceneIndex(0)
    setSceneStartTime(0)
    setIsSpeechComplete(false)
    setBackgroundVideoIndex(0)
    isTransitioningRef.current = false
    currentSpeechRef.current = null
    window.speechSynthesis.cancel()

    scenesWithMedia.forEach((scene) => {
      if (scene.videoElement) {
        try {
          scene.videoElement.pause()
          scene.videoElement.currentTime = 0
        } catch (error) {
          console.log("[v0] Video reset error (non-critical):", error.name)
        }
      }
    })

    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (canvas && ctx) {
      drawFrame(ctx)
    }
  }

  const startRecording = async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    try {
      const stream = canvas.captureStream(60)

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp9",
        videoBitsPerSecond: 8000000,
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
          description: "Your explainer video has been generated and is ready to download.",
          variant: "success",
        })
      }

      mediaRecorder.start()
      setIsRecording(true)
      resetVideo()
      startVideo()

      showToast({
        title: "Recording Started",
        description: `Recording ${totalDuration}s video (visual only - audio plays separately)`,
        variant: "default",
      })

      const checkCompletion = () => {
        if (!isPlaying && currentSceneIndex >= scenesWithMedia.length - 1) {
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop()
          }
        } else {
          setTimeout(checkCompletion, 1000)
        }
      }
      setTimeout(checkCompletion, 1000)
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
    a.download = `${script.title.replace(/[^a-zA-Z0-9]/g, "_")}_explainer.webm`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    showToast({
      title: "Download Started",
      description: "Your explainer video is being downloaded.",
      variant: "success",
    })
  }

  if (isLoadingMedia) {
    return (
      <Card className="glass-card p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-white/70">Loading background videos...</p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold glow-text mb-2">Explainer Video</h3>
            <p className="text-white/70">
              {scenesWithMedia.length} scenes • Video backgrounds • Speech-timed transitions
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowCaptions(!showCaptions)}
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/10 bg-transparent"
            >
              {showCaptions ? <Volume2 className="w-4 h-4 mr-2" /> : <VolumeX className="w-4 h-4 mr-2" />}
              {showCaptions ? "Hide" : "Show"} Captions
            </Button>
            <Button
              onClick={() => setAudioEnabled(!audioEnabled)}
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/10 bg-transparent"
            >
              {audioEnabled ? "🔊" : "🔇"} Audio
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="relative bg-black rounded-lg overflow-hidden shadow-2xl">
              <canvas
                ref={canvasRef}
                className="w-full h-auto"
                style={{ aspectRatio: "16/9" }}
                width={canvasDimensions.width}
                height={canvasDimensions.height}
              />
              {isRecording && (
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  REC
                </div>
              )}
              {isPlaying && (
                <div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-xs">
                  Video Segment {backgroundVideoIndex + 1}/3
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <Button
                onClick={isPlaying ? pauseVideo : startVideo}
                disabled={isRecording}
                className="bg-blue-600 hover:bg-blue-500 transition-colors"
              >
                {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                {isPlaying ? "Pause" : "Play"}
              </Button>

              <Button
                onClick={resetVideo}
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

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Script</h4>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {scenesWithMedia.map((scene, index) => {
                const isCurrentScene = index === currentSceneIndex

                return (
                  <Card
                    key={index}
                    className={`p-3 transition-all duration-300 ${
                      isCurrentScene
                        ? "glass-card border-blue-400/50 bg-blue-400/10 scale-[1.02]"
                        : "bg-white/5 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-medium ${
                            scene.speaker === "Student" ? "text-blue-400" : "text-green-400"
                          }`}
                        >
                          {scene.speaker}
                        </span>
                        <span className="text-xs text-white/60 bg-white/10 px-2 py-1 rounded">Scene {index + 1}</span>
                        {scene.videoElement && (
                          <span className="text-xs text-purple-400 bg-purple-400/20 px-2 py-1 rounded">📹 Video</span>
                        )}
                        {isCurrentScene && isPlaying && (
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        )}
                        {isCurrentScene && !isSpeechComplete && isPlaying && (
                          <span className="text-xs text-yellow-400">Speaking...</span>
                        )}
                      </div>
                      <p className="text-sm text-white/80 leading-relaxed">{scene.dialogue}</p>
                      <p className="text-xs text-white/50 italic">{scene.visualHint}</p>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>
      </Card>

      {videoCompleted && (
        <FeedbackBlock content={script.scenes.map((scene) => scene.dialogue).join(" ")} onRegenerate={handleFeedback} />
      )}

      {isRegenerating && (
        <Card className="glass-card p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-white/70">Regenerating content based on your feedback...</p>
          </div>
        </Card>
      )}
    </div>
  )
}

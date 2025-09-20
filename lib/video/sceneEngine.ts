// Easing functions for smooth animations
export const easing = {
  easeInOut: (t: number): number => {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
  },
  easeOut: (t: number): number => {
    return 1 - Math.pow(1 - t, 3)
  },
  easeIn: (t: number): number => {
    return t * t * t
  },
  linear: (t: number): number => {
    return t
  },
}

// Scene transition types
export interface SceneTransition {
  type: "fade" | "slide" | "scale" | "blur"
  duration: number
  easing: keyof typeof easing
}

// Timeline utilities
export class VideoTimeline {
  private scenes: Array<{ duration: number; startTime: number }>
  private totalDuration: number

  constructor(sceneDurations: number[]) {
    this.scenes = []
    let currentTime = 0

    for (const duration of sceneDurations) {
      this.scenes.push({
        duration,
        startTime: currentTime,
      })
      currentTime += duration
    }

    this.totalDuration = currentTime
  }

  getCurrentScene(time: number): { index: number; progress: number; isTransition: boolean } {
    if (time >= this.totalDuration) {
      return {
        index: this.scenes.length - 1,
        progress: 1,
        isTransition: false,
      }
    }

    for (let i = 0; i < this.scenes.length; i++) {
      const scene = this.scenes[i]
      if (time >= scene.startTime && time < scene.startTime + scene.duration) {
        const progress = (time - scene.startTime) / scene.duration
        const fadeInDuration = 0.5
        const fadeOutDuration = 0.5

        const isTransition =
          progress < fadeInDuration / scene.duration || progress > 1 - fadeOutDuration / scene.duration

        return {
          index: i,
          progress,
          isTransition,
        }
      }
    }

    return { index: 0, progress: 0, isTransition: false }
  }

  getTotalDuration(): number {
    return this.totalDuration
  }

  getSceneOpacity(sceneProgress: number, sceneDuration: number): number {
    const fadeInDuration = 0.5
    const fadeOutDuration = 0.5

    if (sceneProgress < fadeInDuration) {
      return easing.easeOut(sceneProgress / fadeInDuration)
    } else if (sceneProgress > sceneDuration - fadeOutDuration) {
      return easing.easeIn((sceneDuration - sceneProgress) / fadeOutDuration)
    }

    return 1
  }
}

// Text animation utilities
export function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  if (!text || typeof text !== "string") {
    return [""] // Return empty array with single empty string as fallback
  }

  const words = text.split(" ")
  const lines: string[] = []
  let currentLine = ""

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

  if (currentLine) {
    lines.push(currentLine)
  }

  return lines
}

// Icon mapping for common keywords
export const iconMap: Record<string, string> = {
  arrow: "→",
  check: "✓",
  star: "⭐",
  heart: "❤️",
  brain: "🧠",
  light: "💡",
  book: "📚",
  gear: "⚙️",
  rocket: "🚀",
  target: "🎯",
  key: "🔑",
  lock: "🔒",
  graph: "📊",
  chart: "📈",
  code: "💻",
  data: "📊",
  network: "🌐",
  cloud: "☁️",
  database: "🗄️",
  api: "🔌",
  security: "🔒",
  algorithm: "⚡",
  function: "𝑓",
  variable: "𝑥",
  matrix: "⬜",
  vector: "→",
  equation: "=",
  plus: "+",
  minus: "-",
  multiply: "×",
  divide: "÷",
  infinity: "∞",
  sum: "∑",
  integral: "∫",
  derivative: "∂",
  gradient: "∇",
  delta: "Δ",
  lambda: "λ",
  pi: "π",
  sigma: "σ",
  theta: "θ",
  alpha: "α",
  beta: "β",
  gamma: "γ",
}

export function getIconForScene(iconText: string): string {
  if (!iconText || typeof iconText !== "string") {
    return "📚" // Default fallback icon
  }
  const normalized = iconText.toLowerCase().trim()
  return iconMap[normalized] || iconText
}

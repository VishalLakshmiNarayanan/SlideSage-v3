import { z } from "zod"

export const Scene = z.object({
  speaker: z.enum(["Student", "Sage"]),
  dialogue: z.string().min(5).max(300),
  visualHint: z.string().min(3).max(200),
  visualSearchQuery: z.string().min(2).max(50), // For Pexels API
  durationSec: z.number().min(3).max(20), // Increased max duration from 8 to 20 seconds to allow longer explanations for single video format
})

export const Teachpack = z.object({
  topic: z.string().min(2),
  analogy: z.string().min(10).max(1000),
  diagramSteps: z.array(z.string().min(3)).min(3).max(6),
  oneLiner: z.string().min(10).max(200),
  script: z.object({
    title: z.string().min(3),
    scenes: z.array(Scene).min(3).max(5), // Reduced to 3-5 scenes for single video
    closing: z.string().min(3),
    ttsVoiceHints: z.object({
      student: z.string().min(3),
      sage: z.string().min(3),
    }),
  }),
})

export type GroqTeachpack = z.infer<typeof Teachpack>

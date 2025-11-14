import { create } from "zustand"
import type { GroqTeachpack } from "./schema"

interface AppState {
  inputText: string
  teachpack: GroqTeachpack | null
  isLoading: boolean
  onConceptLearned?: (concept: string, score: number) => void
  setInputText: (text: string) => void
  setTeachpack: (teachpack: GroqTeachpack) => void
  setLoading: (loading: boolean) => void
  updateScript: (script: GroqTeachpack["script"]) => void
  setOnConceptLearned: (callback: (concept: string, score: number) => void) => void
}

export const useAppStore = create<AppState>((set) => ({
  inputText: "",
  teachpack: null,
  isLoading: false,
  onConceptLearned: undefined,
  setInputText: (text) => set({ inputText: text }),
  setTeachpack: (teachpack) => set({ teachpack }),
  setLoading: (loading) => set({ isLoading: loading }),
  updateScript: (script) =>
    set((state) => ({
      teachpack: state.teachpack ? { ...state.teachpack, script } : null,
    })),
  setOnConceptLearned: (callback) => set({ onConceptLearned: callback }),
}))

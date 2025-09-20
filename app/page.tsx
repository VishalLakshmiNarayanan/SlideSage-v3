import { InputCard } from "@/components/InputCard"
import Image from "next/image"

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Image src="/images/sage-logo.png" alt="Slide Sage Logo" width={80} height={80} className="rounded-xl" />
            <h1 className="text-4xl md:text-6xl font-bold glow-text">Slidesage</h1>
          </div>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Turn complexity into clarity with engaging dialogue-based explainer videos powered by AI
          </p>
        </div>
        <InputCard />
      </div>
    </main>
  )
}

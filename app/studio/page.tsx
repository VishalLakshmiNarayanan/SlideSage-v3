import { ResultTabs } from "@/components/ResultTabs"

export default function Studio() {
  return (
    <main className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold glow-text mb-2">Teaching Studio</h1>
          <p className="text-white/70">Your lecture transformed into multiple learning formats</p>
        </div>
        <ResultTabs />
      </div>
    </main>
  )
}

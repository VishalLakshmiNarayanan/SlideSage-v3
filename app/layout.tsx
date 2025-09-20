import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { ToastProvider } from "@/components/ui/toast"

export const metadata: Metadata = {
  title: "Slidesage - AI Dialogue-Based Learning Videos",
  description: "Transform lecture notes into engaging dialogue videos with AI characters",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-black text-white antialiased">
        <div className="fixed inset-0 animated-bg -z-10" />
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  )
}

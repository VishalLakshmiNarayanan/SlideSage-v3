"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ToastProps {
  title?: string
  description?: string
  variant?: "default" | "destructive" | "success"
  onClose?: () => void
}

export function Toast({ title, description, variant = "default", onClose }: ToastProps) {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose?.()
    }, 5000)

    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div
      className={cn("fixed bottom-4 right-4 z-50 w-full max-w-sm rounded-lg border p-4 shadow-lg glass-card", {
        "border-red-500/50 bg-red-500/10": variant === "destructive",
        "border-green-500/50 bg-green-500/10": variant === "success",
        "border-white/20": variant === "default",
      })}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1">
          {title && <div className="font-semibold text-white mb-1">{title}</div>}
          {description && <div className="text-sm text-white/80">{description}</div>}
        </div>
        {onClose && (
          <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}

// Toast context and hook
interface ToastContextType {
  showToast: (toast: Omit<ToastProps, "onClose">) => void
}

const ToastContext = React.createContext<ToastContextType | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Array<ToastProps & { id: string }>>([])

  const showToast = React.useCallback((toast: Omit<ToastProps, "onClose">) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts((prev) => [...prev, { ...toast, id }])
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
      ))}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

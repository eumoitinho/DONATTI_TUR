"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive"
  visible?: boolean
  onClose?: () => void
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, variant = "default", visible = true, onClose, children, ...props }, ref) => {
    const [isVisible, setIsVisible] = React.useState(visible)

    React.useEffect(() => {
      setIsVisible(visible)
    }, [visible])

    React.useEffect(() => {
      if (isVisible) {
        const timer = setTimeout(() => {
          setIsVisible(false)
          onClose?.()
        }, 5000)
        return () => clearTimeout(timer)
      }
    }, [isVisible, onClose])

    if (!isVisible) return null

    return (
      <div
        ref={ref}
        className={cn(
          "fixed bottom-4 right-4 z-50 max-w-md rounded-lg border p-4 shadow-md",
          {
            "bg-white text-gray-950 dark:bg-gray-950 dark:text-gray-50": variant === "default",
            "border-red-500 bg-red-50 text-red-800 dark:bg-red-900 dark:text-red-50": variant === "destructive",
          },
          className,
        )}
        {...props}
      >
        {children}
        <button
          onClick={() => {
            setIsVisible(false)
            onClose?.()
          }}
          className="absolute right-2 top-2 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-400"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    )
  },
)
Toast.displayName = "Toast"

const ToastTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => <h5 ref={ref} className={cn("mb-1 font-medium", className)} {...props} />,
)
ToastTitle.displayName = "ToastTitle"

const ToastDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("text-sm", className)} {...props} />,
)
ToastDescription.displayName = "ToastDescription"

export { Toast, ToastTitle, ToastDescription }


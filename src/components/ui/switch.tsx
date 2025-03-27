import * as React from "react"
import { cn } from "@/lib/utils"

export interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(({ className, ...props }, ref) => {
  const id = React.useId()
  return (
    <div className="relative inline-flex h-6 w-11 items-center rounded-full">
      <input type="checkbox" id={id} ref={ref} className={cn("peer h-0 w-0 opacity-0", className)} {...props} />
      <label
        htmlFor={id}
        className="peer-focus-visible:ring-offset-white peer-focus-visible:ring-2 peer-focus-visible:ring-gray-950 peer-focus-visible:ring-offset-2 dark:peer-focus-visible:ring-gray-300 absolute left-0 right-0 top-0 bottom-0 cursor-pointer rounded-full bg-gray-200 transition-colors duration-200 peer-checked:bg-gray-900 dark:bg-gray-700 dark:peer-checked:bg-gray-400"
      >
        <span className="absolute left-[2px] top-[2px] h-5 w-5 transform rounded-full bg-white transition-transform duration-200 peer-checked:translate-x-5" />
      </label>
    </div>
  )
})
Switch.displayName = "Switch"

export { Switch }


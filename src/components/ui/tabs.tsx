"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface TabsContextValue {
  selectedTab: string
  setSelectedTab: (id: string) => void
}

const TabsContext = React.createContext<TabsContextValue | undefined>(undefined)

function useTabs() {
  const context = React.useContext(TabsContext)
  if (!context) {
    throw new Error("Tabs components must be used within a TabsProvider")
  }
  return context
}

interface TabsProps {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  className?: string
}

const Tabs = ({ value, defaultValue, onValueChange, children, className }: TabsProps) => {
  const [selectedTab, setSelectedTab] = React.useState(value || defaultValue || "")

  React.useEffect(() => {
    if (value !== undefined) {
      setSelectedTab(value)
    }
  }, [value])

  const handleTabChange = React.useCallback(
    (newValue: string) => {
      if (value === undefined) {
        setSelectedTab(newValue)
      }
      if (onValueChange) {
        onValueChange(newValue)
      }
    },
    [onValueChange, value],
  )

  return (
    <TabsContext.Provider value={{ selectedTab, setSelectedTab: handleTabChange }}>
      <div className={cn("", className)}>{children}</div>
    </TabsContext.Provider>
  )
}

interface TabsListProps {
  children: React.ReactNode
  className?: string
}

const TabsList = ({ children, className }: TabsListProps) => {
  return <div className={cn("flex border-b", className)}>{children}</div>
}

interface TabsTriggerProps {
  value: string
  children: React.ReactNode
  className?: string
}

const TabsTrigger = ({ value, children, className }: TabsTriggerProps) => {
  const { selectedTab, setSelectedTab } = useTabs()
  const isSelected = selectedTab === value

  return (
    <button
      onClick={() => setSelectedTab(value)}
      className={cn(
        "px-4 py-2 text-sm font-medium",
        isSelected
          ? "border-b-2 border-gray-900 text-gray-900 dark:border-gray-100 dark:text-gray-100"
          : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300",
        className,
      )}
      data-state={isSelected ? "active" : "inactive"}
    >
      {children}
    </button>
  )
}

interface TabsContentProps {
  value: string
  children: React.ReactNode
  className?: string
}

const TabsContent = ({ value, children, className }: TabsContentProps) => {
  const { selectedTab } = useTabs()

  if (selectedTab !== value) return null

  return <div className={cn("mt-4", className)}>{children}</div>
}

export { Tabs, TabsList, TabsTrigger, TabsContent }


"use client"

import * as React from "react"

export interface SidebarConfig {
  variant: "sidebar" | "floating" | "inset"
  collapsible: "offcanvas" | "icon" | "none"
  side: "left" | "right"
}

export interface SidebarContextValue {
  config: SidebarConfig
  updateConfig: (config: Partial<SidebarConfig>) => void
}

export const SidebarContext = React.createContext<SidebarContextValue | null>(null)

export function SidebarConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = React.useState<SidebarConfig>({
    variant: "inset",
    collapsible: "offcanvas", 
    side: "left"
  })
  const [isInitialized, setIsInitialized] = React.useState(false)

  // Load config from localStorage on mount
  React.useEffect(() => {
    if (typeof window === 'undefined' || isInitialized) return
    
    const savedConfig = localStorage.getItem('sidebar-config')
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig)
        setConfig(parsed)
      } catch (error) {
        console.error('Failed to load sidebar config:', error)
      }
    }
    
    setIsInitialized(true)
  }, [isInitialized])

  // Save config to localStorage whenever it changes
  React.useEffect(() => {
    if (!isInitialized) return
    localStorage.setItem('sidebar-config', JSON.stringify(config))
  }, [config, isInitialized])

  const updateConfig = React.useCallback((newConfig: Partial<SidebarConfig>) => {
    setConfig(prev => {
      const updated = { ...prev, ...newConfig }
      return updated
    })
  }, [])

  return (
    <SidebarContext.Provider value={{ config, updateConfig }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebarConfig() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebarConfig must be used within a SidebarConfigProvider")
  }
  return context
}

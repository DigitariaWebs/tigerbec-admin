"use client"

import * as React from "react"
import { PanelLeftIcon, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useSidebar } from "@/components/ui/sidebar"
import { useTheme } from "@/hooks/use-theme"
import { useCircularTransition } from "@/hooks/use-circular-transition"
import { useThemeManager } from "@/hooks/use-theme-manager"
import { useSidebarConfig } from "@/contexts/sidebar-context"
import { tweakcnThemes } from "@/config/theme-data"
import type { ImportedTheme } from "@/types/theme-customizer"

export function SiteHeader() {
  const [searchOpen, setSearchOpen] = React.useState(false)
  const { toggleSidebar } = useSidebar()
  const { config: sidebarConfig, updateConfig: updateSidebarConfig } = useSidebarConfig()
  const { theme, setTheme } = useTheme()
  const { toggleTheme } = useCircularTransition()
  const { applyImportedTheme, applyTheme: applyColorTheme, applyTweakcnTheme } = useThemeManager()

  // Detect dark mode
  const [isDarkMode, setIsDarkMode] = React.useState(false)

  React.useEffect(() => {
    const updateMode = () => {
      if (theme === "dark") {
        setIsDarkMode(true)
      } else if (theme === "light") {
        setIsDarkMode(false)
      } else {
        setIsDarkMode(typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches)
      }
    }

    updateMode()

    const mediaQuery = typeof window !== "undefined" ? window.matchMedia("(prefers-color-scheme: dark)") : null
    if (mediaQuery) {
      mediaQuery.addEventListener("change", updateMode)
    }

    return () => {
      if (mediaQuery) {
        mediaQuery.removeEventListener("change", updateMode)
      }
    }
  }, [theme])

  // Re-apply saved custom theme colors when theme mode changes
  React.useEffect(() => {
    if (typeof window === 'undefined') return

    const savedSettings = localStorage.getItem('appearance-settings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        const currentMode = theme === "dark" ? true : theme === "light" ? false : window.matchMedia("(prefers-color-scheme: dark)").matches
        
        // Re-apply the saved theme with the current mode
        if (parsed.importedTheme) {
          applyImportedTheme(parsed.importedTheme, currentMode)
        } else if (parsed.selectedTheme) {
          applyColorTheme(parsed.selectedTheme, currentMode)
        } else if (parsed.selectedTweakcnTheme) {
          const selectedPreset = tweakcnThemes.find(t => t.value === parsed.selectedTweakcnTheme)?.preset
          if (selectedPreset) {
            applyTweakcnTheme(selectedPreset, currentMode)
          }
        }
      } catch (error) {
        console.error('Failed to re-apply theme:', error)
      }
    }
  }, [theme, applyImportedTheme, applyColorTheme, applyTweakcnTheme])

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setSearchOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])
// Set collapsible mode to offcanvas if it's not already
    if (sidebarConfig.collapsible !== "offcanvas") {
      updateSidebarConfig({ collapsible: "offcanvas" })
    }
    
  const handleToggleSidebar = () => {
    toggleSidebar()
  }

  const handleToggleTheme = (event: React.MouseEvent<HTMLButtonElement>) => {
    toggleTheme(event)
  }

  return (
    <>
      <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
        <div className="flex w-full items-center gap-1 px-4 py-3 lg:gap-2 lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="cursor-pointer size-7"
            onClick={handleToggleSidebar}
          >
            <PanelLeftIcon className="h-4 w-4" />
            <span className="sr-only">Toggle Sidebar</span>
          </Button>
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
          />
          <div className="flex-1 max-w-sm">
             
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleTheme}
              className="cursor-pointer relative overflow-hidden"
            >
              {isDarkMode ? (
                <Sun className="h-[1.2rem] w-[1.2rem] transition-transform duration-300 rotate-0 scale-100" />
              ) : (
                <Moon className="h-[1.2rem] w-[1.2rem] transition-transform duration-300 rotate-0 scale-100" />
              )}
              <span className="sr-only">
                Switch to {isDarkMode ? "light" : "dark"} mode
              </span>
            </Button>
          </div>
        </div>
      </header>
       
    </>
  )
}

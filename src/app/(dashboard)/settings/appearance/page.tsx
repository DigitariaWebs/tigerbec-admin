"use client"

import React from 'react'
import { Layout, Palette, RotateCcw, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useThemeManager } from '@/hooks/use-theme-manager'
import { useSidebarConfig } from '@/contexts/sidebar-context'
import { tweakcnThemes } from '@/config/theme-data'
import { ThemeTab } from '@/components/theme-customizer/theme-tab'
import { LayoutTab } from '@/components/theme-customizer/layout-tab'
import { ImportModal } from '@/components/theme-customizer/import-modal'
import type { ImportedTheme } from '@/types/theme-customizer'

export default function AppearanceSettings() {
  const { applyImportedTheme, isDarkMode, resetTheme, applyRadius, setBrandColorsValues, applyTheme, applyTweakcnTheme } = useThemeManager()
  const { config: sidebarConfig, updateConfig: updateSidebarConfig } = useSidebarConfig()

  const [activeTab, setActiveTab] = React.useState("theme")
  const [selectedTheme, setSelectedTheme] = React.useState("")
  const [selectedTweakcnTheme, setSelectedTweakcnTheme] = React.useState("")
  const [selectedRadius, setSelectedRadius] = React.useState("0.5rem")
  const [importModalOpen, setImportModalOpen] = React.useState(false)
  const [importedTheme, setImportedTheme] = React.useState<ImportedTheme | null>(null)
  const [isInitialized, setIsInitialized] = React.useState(false)

  // Load settings from localStorage on mount
  React.useEffect(() => {
    if (typeof window === 'undefined' || isInitialized) return

    const savedSettings = localStorage.getItem('appearance-settings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        
        // Restore state
        if (parsed.selectedTheme) setSelectedTheme(parsed.selectedTheme)
        if (parsed.selectedTweakcnTheme) setSelectedTweakcnTheme(parsed.selectedTweakcnTheme)
        if (parsed.selectedRadius) setSelectedRadius(parsed.selectedRadius)
        if (parsed.importedTheme) setImportedTheme(parsed.importedTheme)
        if (parsed.sidebarConfig) updateSidebarConfig(parsed.sidebarConfig)
        
        // Apply the saved settings
        if (parsed.importedTheme) {
          applyImportedTheme(parsed.importedTheme, isDarkMode)
        } else if (parsed.selectedTheme) {
          applyTheme(parsed.selectedTheme, isDarkMode)
        } else if (parsed.selectedTweakcnTheme) {
          const selectedPreset = tweakcnThemes.find(t => t.value === parsed.selectedTweakcnTheme)?.preset
          if (selectedPreset) {
            applyTweakcnTheme(selectedPreset, isDarkMode)
          }
        }
        
        if (parsed.selectedRadius) {
          applyRadius(parsed.selectedRadius)
        }
      } catch (error) {
        console.error('Failed to load appearance settings:', error)
      }
    }
    
    setIsInitialized(true)
  }, []) // Run only once on mount

  // Save settings to localStorage whenever they change
  React.useEffect(() => {
    if (!isInitialized) return

    const settings = {
      selectedTheme,
      selectedTweakcnTheme,
      selectedRadius,
      importedTheme,
      sidebarConfig,
    }
    
    localStorage.setItem('appearance-settings', JSON.stringify(settings))
  }, [selectedTheme, selectedTweakcnTheme, selectedRadius, importedTheme, sidebarConfig, isInitialized])

  const handleReset = () => {
    // Complete reset to application defaults

    // 1. Reset all state variables to initial values
    setSelectedTheme("default")
    setSelectedTweakcnTheme("")
    setSelectedRadius("0.5rem")
    setImportedTheme(null) // Clear imported theme
    setBrandColorsValues({}) // Clear brand colors state

    // 2. Completely remove all custom CSS variables
    resetTheme()

    // 3. Reset the radius to default
    applyRadius("0.5rem")

    // 4. Reset sidebar to defaults
    updateSidebarConfig({ variant: "inset", collapsible: "offcanvas", side: "left" })
    
    // 5. Clear localStorage
    localStorage.removeItem('appearance-settings')
  }

  const handleImport = (themeData: ImportedTheme) => {
    setImportedTheme(themeData)
    // Clear other selections to indicate custom import is active
    setSelectedTheme("")
    setSelectedTweakcnTheme("")

    // Apply the imported theme
    applyImportedTheme(themeData, isDarkMode)
  }

  const handleImportClick = () => {
    setImportModalOpen(true)
  }

  // Re-apply themes when theme mode changes (only after initialization)
  React.useEffect(() => {
    if (!isInitialized) return

    if (importedTheme) {
      applyImportedTheme(importedTheme, isDarkMode)
    } else if (selectedTheme) {
      applyTheme(selectedTheme, isDarkMode)
    } else if (selectedTweakcnTheme) {
      const selectedPreset = tweakcnThemes.find(t => t.value === selectedTweakcnTheme)?.preset
      if (selectedPreset) {
        applyTweakcnTheme(selectedPreset, isDarkMode)
      }
    }
  }, [isDarkMode, importedTheme, selectedTheme, selectedTweakcnTheme, isInitialized, applyImportedTheme, applyTheme, applyTweakcnTheme])

  return (
    <>
      <div className="space-y-6 px-4 lg:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Appearance</h1>
            <p className="text-muted-foreground">
              Customize the theme and layout of your dashboard.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleReset} className="cursor-pointer">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Default
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="theme" className="cursor-pointer">
              <Palette className="h-4 w-4 mr-2" /> Theme
            </TabsTrigger>
            <TabsTrigger value="layout" className="cursor-pointer">
              <Layout className="h-4 w-4 mr-2" /> Layout
            </TabsTrigger>
          </TabsList>

          <TabsContent value="theme" className="space-y-6 mt-6">
            <ThemeTab
              selectedTheme={selectedTheme}
              setSelectedTheme={setSelectedTheme}
              selectedTweakcnTheme={selectedTweakcnTheme}
              setSelectedTweakcnTheme={setSelectedTweakcnTheme}
              selectedRadius={selectedRadius}
              setSelectedRadius={setSelectedRadius}
              setImportedTheme={setImportedTheme}
              onImportClick={handleImportClick}
            />
          </TabsContent>

          <TabsContent value="layout" className="space-y-6 mt-6">
            <LayoutTab />
          </TabsContent>
        </Tabs>
      </div>

      <ImportModal
        open={importModalOpen}
        onOpenChange={setImportModalOpen}
        onImport={handleImport}
      />
    </>
  )
}

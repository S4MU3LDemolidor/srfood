"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, RefreshCw, Eye, EyeOff } from 'lucide-react'

export function DebugStorage() {
  const [storageData, setStorageData] = useState<any>({})
  const [isVisible, setIsVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<string>("")

  const loadStorageData = () => {
    if (typeof window === "undefined") return

    console.log("🔍 DEBUG: Loading storage data...")
    
    try {
      const clients = localStorage.getItem("clients")
      const recipes = localStorage.getItem("recipes")
      const ingredients = localStorage.getItem("ingredients")
      const steps = localStorage.getItem("steps")

      console.log("📊 DEBUG: Raw storage data:")
      console.log("  - clients:", clients ? `${clients.length} chars` : "null")
      console.log("  - recipes:", recipes ? `${recipes.length} chars` : "null")
      console.log("  - ingredients:", ingredients ? `${ingredients.length} chars` : "null")
      console.log("  - steps:", steps ? `${steps.length} chars` : "null")

      const parsedData = {
        clients: clients ? JSON.parse(clients) : [],
        recipes: recipes ? JSON.parse(recipes) : [],
        ingredients: ingredients ? JSON.parse(ingredients) : [],
        steps: steps ? JSON.parse(steps) : [],
        raw: {
          clients: clients,
          recipes: recipes,
          ingredients: ingredients,
          steps: steps,
        }
      }

      console.log("📊 DEBUG: Parsed data:")
      console.log("  - clients:", parsedData.clients.length)
      console.log("  - recipes:", parsedData.recipes.length)
      console.log("  - ingredients:", parsedData.ingredients.length)
      console.log("  - steps:", parsedData.steps.length)

      setStorageData(parsedData)
      setLastUpdate(new Date().toLocaleTimeString())
    } catch (error) {
      console.error("❌ DEBUG: Error loading storage data:", error)
      setStorageData({ error: error.message })
    }
  }

  const clearAllStorage = () => {
    if (typeof window === "undefined") return
    
    setLoading(true)
    try {
      console.log("🗑️ DEBUG: Clearing all storage...")
      
      localStorage.removeItem("clients")
      localStorage.removeItem("recipes")
      localStorage.removeItem("ingredients")
      localStorage.removeItem("steps")
      
      console.log("📡 DEBUG: Dispatching clear events...")
      
      // Dispatch events to notify other components
      window.dispatchEvent(new CustomEvent("dataChanged", { detail: { action: 'clear' } }))
      window.dispatchEvent(new StorageEvent("storage", { key: null }))
      
      loadStorageData()
      alert("Storage cleared successfully!")
    } catch (error) {
      console.error("❌ DEBUG: Error clearing storage:", error)
      alert("Error clearing storage: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  const forceRefresh = () => {
    console.log("🔄 DEBUG: Force refreshing page...")
    window.location.reload()
  }

  useEffect(() => {
    console.log("🚀 DEBUG: Component mounted, loading initial data...")
    loadStorageData()
    
    const handleStorageChange = (event: any) => {
      console.log("🔄 DEBUG: Storage change detected:", event.type, event.detail || event.key)
      loadStorageData()
    }

    const handleDataChanged = (event: any) => {
      console.log("📡 DEBUG: Data changed event received:", event.detail)
      loadStorageData()
    }

    // Listen for storage events
    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("dataChanged", handleDataChanged)

    // Also listen for focus events to refresh data
    const handleFocus = () => {
      console.log("👁️ DEBUG: Window focused, refreshing data...")
      loadStorageData()
    }
    
    window.addEventListener("focus", handleFocus)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("dataChanged", handleDataChanged)
      window.removeEventListener("focus", handleFocus)
    }
  }, [])

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => {
            console.log("👁️ DEBUG: Opening debug panel...")
            setIsVisible(true)
            loadStorageData()
          }}
          variant="outline"
          size="sm"
          className="bg-white shadow-lg"
        >
          <Eye className="w-4 h-4 mr-2" />
          Debug
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-96 overflow-auto">
      <Card className="shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Debug Storage</CardTitle>
            <div className="flex gap-1">
              <Button
                onClick={() => {
                  console.log("🔄 DEBUG: Manual refresh clicked...")
                  loadStorageData()
                }}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
              >
                <RefreshCw className="w-3 h-3" />
              </Button>
              <Button
                onClick={() => setIsVisible(false)}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
              >
                <EyeOff className="w-3 h-3" />
              </Button>
            </div>
          </div>
          {lastUpdate && (
            <p className="text-xs text-gray-500">Last update: {lastUpdate}</p>
          )}
        </CardHeader>
        <CardContent className="text-xs space-y-2">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <strong>Clients:</strong> {storageData.clients?.length || 0}
            </div>
            <div>
              <strong>Recipes:</strong> {storageData.recipes?.length || 0}
            </div>
            <div>
              <strong>Ingredients:</strong> {storageData.ingredients?.length || 0}
            </div>
            <div>
              <strong>Steps:</strong> {storageData.steps?.length || 0}
            </div>
          </div>

          {storageData.error && (
            <div className="text-red-600 text-xs">
              <strong>Error:</strong> {storageData.error}
            </div>
          )}

          <div className="space-y-1">
            <strong>Recent Clients:</strong>
            {storageData.clients?.length > 0 ? (
              storageData.clients.slice(-3).map((client: any) => (
                <div key={client.id} className="text-xs text-gray-600 truncate">
                  • {client.name} ({client.id.slice(-4)})
                </div>
              ))
            ) : (
              <div className="text-xs text-gray-400">No clients found</div>
            )}
          </div>

          <div className="space-y-1">
            <strong>Recent Recipes:</strong>
            {storageData.recipes?.length > 0 ? (
              storageData.recipes.slice(-3).map((recipe: any) => (
                <div key={recipe.id} className="text-xs text-gray-600 truncate">
                  • {recipe.nome_receita} ({recipe.id.slice(-4)})
                </div>
              ))
            ) : (
              <div className="text-xs text-gray-400">No recipes found</div>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              onClick={clearAllStorage}
              disabled={loading}
              variant="destructive"
              size="sm"
              className="flex-1 h-7 text-xs"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              {loading ? "Clearing..." : "Clear All"}
            </Button>
            <Button
              onClick={forceRefresh}
              variant="outline"
              size="sm"
              className="flex-1 h-7 text-xs"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Refresh Page
            </Button>
          </div>

          <details className="text-xs">
            <summary className="cursor-pointer text-gray-600">Raw Data</summary>
            <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-32">
              {JSON.stringify(storageData.raw, null, 2)}
            </pre>
          </details>
        </CardContent>
      </Card>
    </div>
  )
}

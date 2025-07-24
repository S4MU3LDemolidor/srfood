"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getRecipesWithClients } from "@/lib/data-manager"
import { Plus, AlertCircle, RefreshCw } from 'lucide-react'
import { SearchBar } from "@/components/search-bar"
import type { Recipe } from "@/lib/types"

export default function HomePage() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadRecipes = async () => {
    console.log("🔍 HOME PAGE: Starting to load recipes...")
    setLoading(true)
    setError(null)
    
    try {
      // Add a small delay to ensure DOM is ready
      await new Promise(resolve => setTimeout(resolve, 100))
      
      console.log("🔍 HOME PAGE: Calling getRecipesWithClients...")
      const recipesData = getRecipesWithClients()
      console.log("✅ HOME PAGE: Recipes loaded:", recipesData.length)
      console.log("📋 HOME PAGE: Recipe names:", recipesData.map((r) => r.nome_receita))
      
      setRecipes(recipesData)
    } catch (error) {
      console.error("❌ HOME PAGE: Error loading recipes:", error)
      setError(error instanceof Error ? error.message : "Erro desconhecido")
      setRecipes([])
    } finally {
      console.log("✅ HOME PAGE: Loading complete, setting loading to false")
      setLoading(false)
    }
  }

  useEffect(() => {
    console.log("🚀 HOME PAGE: Component mounted, loading recipes...")
    loadRecipes()
  }, [])

  // Listen for route changes and page focus
  useEffect(() => {
    const handleFocus = () => {
      console.log("👁️ HOME PAGE: Window focused, reloading data...")
      loadRecipes()
    }

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log("📱 HOME PAGE: Page visible, reloading data...")
        loadRecipes()
      }
    }

    const handleDataChanged = () => {
      console.log("📡 HOME PAGE: Data changed event received, reloading...")
      loadRecipes()
    }

    // Listen for various events
    window.addEventListener("focus", handleFocus)
    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("dataChanged", handleDataChanged)
    window.addEventListener("storage", handleDataChanged)

    return () => {
      window.removeEventListener("focus", handleFocus)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("dataChanged", handleDataChanged)
      window.removeEventListener("storage", handleDataChanged)
    }
  }, [])

  // Force loading to false after 5 seconds as a safety net
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.log("⚠️ HOME PAGE: Loading timeout reached, forcing loading to false")
        setLoading(false)
        setError("Timeout ao carregar dados")
      }
    }, 5000)

    return () => clearTimeout(timeout)
  }, [loading])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm mb-4">Carregando receitas...</p>
          <Button 
            onClick={() => {
              console.log("🔄 HOME PAGE: Force reload button clicked")
              setLoading(false)
              loadRecipes()
            }}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar Novamente
          </Button>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Erro ao carregar dados</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="flex gap-4 justify-center">
            <Button onClick={loadRecipes} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar Novamente
            </Button>
            <Button onClick={() => window.location.reload()}>
              Recarregar Página
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 sm:py-0 sm:h-16 gap-4 sm:gap-0">
            <div className="flex items-center">
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Ficha Técnica de Receitas</h1>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <Link href="/clients" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto bg-transparent">
                  Gerenciar Clientes
                </Button>
              </Link>
              <Link href="/recipes/new" className="w-full sm:w-auto">
                <Button className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Receita
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Search Bar */}
        <SearchBar recipes={recipes} />
      </div>
    </div>
  )
}

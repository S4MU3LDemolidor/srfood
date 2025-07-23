"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getRecipesWithClients } from "@/lib/data-manager"
import { Plus } from "lucide-react"
import { SearchBar } from "@/components/search-bar"
import type { Recipe } from "@/lib/types"

export default function HomePage() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadRecipes() {
      try {
        console.log("🔍 HOME PAGE: Loading recipes...")
        const recipesData = await getRecipesWithClients()
        console.log("✅ HOME PAGE: Recipes loaded:", recipesData.length)
        setRecipes(recipesData)
      } catch (error) {
        console.error("❌ HOME PAGE: Error loading recipes:", error)
        setRecipes([])
      } finally {
        setLoading(false)
      }
    }

    loadRecipes()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
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

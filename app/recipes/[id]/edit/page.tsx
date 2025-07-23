"use client"

import { useState, useEffect } from "react"
import { RecipeForm } from "@/components/recipe-form"
import { getRecipeWithDetails, getClients } from "@/lib/data-manager"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import type { Recipe, Client } from "@/lib/types"

export default function EditRecipePage({ params }: { params: { id: string } }) {
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        console.log("🔍 EDIT RECIPE PAGE: Loading data for recipe:", params.id)

        const [recipeData, clientsData] = await Promise.all([getRecipeWithDetails(params.id), getClients()])

        console.log("✅ EDIT RECIPE PAGE: Recipe loaded:", recipeData?.nome_receita)
        console.log("✅ EDIT RECIPE PAGE: Clients loaded:", clientsData.length)

        if (!recipeData) {
          setError("Receita não encontrada")
          return
        }

        setRecipe(recipeData)
        setClients(clientsData)
      } catch (error) {
        console.error("❌ EDIT RECIPE PAGE: Error loading data:", error)
        setError("Erro ao carregar dados")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{error || "Receita não encontrada"}</h1>
          <Link href="/">
            <Button>Voltar ao início</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Editar Receita</h1>
          <RecipeForm recipe={recipe} clients={clients} />
        </div>
      </div>
    </div>
  )
}

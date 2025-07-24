"use client"

import { useState, useEffect } from "react"
import { RecipeForm } from "@/components/recipe-form"
import { getClients } from "@/lib/data-manager"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, AlertCircle } from "lucide-react"
import type { Client } from "@/lib/types"

export default function NewRecipePage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log("🎯 NEW RECIPE PAGE: Component mounted successfully!")
    console.log("🎯 NEW RECIPE PAGE: This is the correct /recipes/new route")

    try {
      console.log("🔍 NEW RECIPE PAGE: Loading clients...")
      const clientsData = getClients()
      console.log("✅ NEW RECIPE PAGE: Clients loaded:", clientsData.length)
      setClients(clientsData)
    } catch (error) {
      console.error("❌ NEW RECIPE PAGE: Error loading clients:", error)
      setError("Erro ao carregar clientes")
    } finally {
      setLoading(false)
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando formulário...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Erro ao carregar página</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link href="/">
            <Button>Voltar ao início</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Nova Receita</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <RecipeForm clients={clients} />
        </div>
      </div>
    </div>
  )
}

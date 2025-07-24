"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getRecipesWithClients, getClients } from "@/lib/data-manager"
import { Plus, ChefHat, Users, BarChart3, FileText } from "lucide-react"
import { MetricCard } from "@/components/charts/metric-card"
import type { Recipe, Client } from "@/lib/types"

export default function HomePage() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  const loadData = () => {
    try {
      const recipesData = getRecipesWithClients()
      const clientsData = getClients()
      setRecipes(recipesData)
      setClients(clientsData)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    // Initial load
    loadData()

    // Listen for data changes
    const handleDataChanged = () => {
      loadData()
    }

    const handleStorageChange = () => {
      loadData()
    }

    window.addEventListener("dataChanged", handleDataChanged)
    window.addEventListener("storage", handleStorageChange)

    return () => {
      window.removeEventListener("dataChanged", handleDataChanged)
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [mounted])

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground text-sm">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  const recentRecipes = recipes.slice(-3).reverse()

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col space-y-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 sm:py-0 sm:h-16">
            <div className="flex items-center">
              <h1 className="text-lg sm:text-xl font-semibold text-card-foreground">Dashboard - Sr. Food Safety</h1>
            </div>
            <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-950/20 dark:to-blue-950/20 p-6 rounded-lg border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Bem-vindo ao Sr. Food Safety</h2>
              <p className="text-muted-foreground">Sistema completo de gerenciamento de fichas técnicas de receitas</p>
            </div>
          </div>
        </div>

        {/* Overview Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <MetricCard
            title="Total de Receitas"
            value={recipes.length}
            subtitle="Receitas cadastradas"
            icon={ChefHat}
            color="emerald"
          />
          <MetricCard
            title="Clientes Ativos"
            value={clients.length}
            subtitle="Clientes cadastrados"
            icon={Users}
            color="blue"
          />
          <MetricCard
            title="Receitas Normais"
            value={recipes.filter((r) => r.tipo_ficha === "Normal").length}
            subtitle="Fichas principais"
            icon={FileText}
            color="purple"
          />
          <MetricCard
            title="Subfichas"
            value={recipes.filter((r) => r.tipo_ficha === "Subficha").length}
            subtitle="Receitas auxiliares"
            icon={BarChart3}
            color="orange"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/recipes" className="group">
            <div className="bg-card p-6 rounded-lg border border-border hover:border-emerald-300 dark:hover:border-emerald-600 hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-lg group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/50">
                  <ChefHat className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-card-foreground">Receitas</h3>
              </div>
              <p className="text-sm text-muted-foreground">Visualizar e gerenciar todas as receitas</p>
            </div>
          </Link>

          <Link href="/clients" className="group">
            <div className="bg-card p-6 rounded-lg border border-border hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-card-foreground">Clientes</h3>
              </div>
              <p className="text-sm text-muted-foreground">Gerenciar informações dos clientes</p>
            </div>
          </Link>

          <Link href="/statistics" className="group">
            <div className="bg-card p-6 rounded-lg border border-border hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded-lg group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-card-foreground">Estatísticas</h3>
              </div>
              <p className="text-sm text-muted-foreground">Análises e relatórios detalhados</p>
            </div>
          </Link>

          <Link href="/reports" className="group">
            <div className="bg-card p-6 rounded-lg border border-border hover:border-orange-300 dark:hover:border-orange-600 hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 rounded-lg group-hover:bg-orange-200 dark:group-hover:bg-orange-900/50">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-card-foreground">Relatórios</h3>
              </div>
              <p className="text-sm text-muted-foreground">Gerar relatórios em PDF</p>
            </div>
          </Link>
        </div>

        {/* Recent Recipes */}
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-card-foreground">Receitas Recentes</h3>
            <Link href="/recipes">
              <Button variant="outline" size="sm">
                Ver Todas
              </Button>
            </Link>
          </div>

          {recentRecipes.length > 0 ? (
            <div className="space-y-4">
              {recentRecipes.map((recipe) => (
                <Link key={recipe.id} href={`/recipes/${recipe.id}`}>
                  <div className="flex items-center gap-4 p-4 border border-border rounded-lg hover:border-emerald-300 dark:hover:border-emerald-600 hover:bg-accent transition-colors">
                    <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                      <ChefHat className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-card-foreground">{recipe.nome_receita}</h4>
                      <p className="text-sm text-muted-foreground">
                        {recipe.client?.name || "Sem cliente"} • {recipe.tipo_ficha}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(recipe.created_at).toLocaleDateString("pt-BR")}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ChefHat className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">Nenhuma receita cadastrada ainda</p>
              <Link href="/recipes/new">
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeira Receita
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

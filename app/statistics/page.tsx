"use client"

import { useState, useEffect } from "react"
import { BarChart } from "@/components/charts/bar-chart"
import { PieChart } from "@/components/charts/pie-chart"
import { MetricCard } from "@/components/charts/metric-card"
import { generateStatistics } from "@/lib/statistics"
import type { StatisticsData } from "@/lib/statistics"
import { ChefHat, Users, Package, List, Clock, Scale, TrendingUp, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function StatisticsPage() {
  const [statistics, setStatistics] = useState<StatisticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<string>("")

  const loadStatistics = () => {
    console.log("📊 STATISTICS PAGE: Loading statistics...")
    setLoading(true)

    try {
      const stats = generateStatistics()
      setStatistics(stats)
      setLastUpdated(new Date().toLocaleTimeString("pt-BR"))
      console.log("✅ STATISTICS PAGE: Statistics loaded successfully")
    } catch (error) {
      console.error("❌ STATISTICS PAGE: Error loading statistics:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStatistics()
  }, [])

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando estatísticas...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!statistics) {
    return (
      <div className="p-4 sm:p-6">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Erro ao carregar estatísticas</p>
          <Button onClick={loadStatistics}>Tentar Novamente</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header - Mobile Responsive */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Estatísticas e Relatórios</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Análise completa dos dados do sistema
            {lastUpdated && (
              <span className="text-sm text-gray-500 block sm:inline sm:ml-2">• Atualizado às {lastUpdated}</span>
            )}
          </p>
        </div>
        <Button onClick={loadStatistics} variant="outline" size="sm" className="w-full sm:w-auto bg-transparent">
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Overview Metrics - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <MetricCard
          title="Total de Receitas"
          value={statistics.totalRecipes}
          subtitle="Receitas cadastradas"
          icon={ChefHat}
          color="emerald"
        />
        <MetricCard
          title="Clientes Ativos"
          value={statistics.totalClients}
          subtitle="Clientes com receitas"
          icon={Users}
          color="blue"
        />
        <MetricCard
          title="Ingredientes"
          value={statistics.totalIngredients}
          subtitle="Total de ingredientes"
          icon={Package}
          color="purple"
        />
        <MetricCard
          title="Passos de Preparo"
          value={statistics.totalSteps}
          subtitle="Total de passos"
          icon={List}
          color="orange"
        />
      </div>

      {/* Recipe Statistics - Responsive Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <BarChart data={statistics.recipesPerClient} title="Receitas por Cliente" height={300} />
        <PieChart data={statistics.recipeTypes} title="Distribuição por Tipo de Ficha" />
      </div>

      {/* Monthly Trends */}
      <div className="grid grid-cols-1 gap-6">
        <BarChart data={statistics.recipesPerMonth} title="Receitas Criadas por Mês" height={250} />
      </div>

      {/* Ingredients Analysis - Responsive Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <BarChart data={statistics.topIngredients} title="Top 10 Ingredientes Mais Usados" height={400} />
        <BarChart data={statistics.ingredientsPerRecipe} title="Ingredientes por Receita (Top 10)" height={400} />
      </div>

      {/* Preparation Metrics - Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-emerald-100 text-emerald-700 rounded-lg">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Tempo de Preparo</h3>
              <p className="text-sm text-gray-600">Análise dos tempos de preparo</p>
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{statistics.averagePreparationTime}</div>
          <p className="text-sm text-gray-500">Receitas com tempo de preparo definido</p>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 text-blue-700 rounded-lg">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Peso por Porção</h3>
              <p className="text-sm text-gray-600">Controle de porcionamento</p>
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{statistics.averagePortionWeight}</div>
          <p className="text-sm text-gray-500">Receitas com peso por porção definido</p>
        </div>
      </div>

      {/* Insights - Mobile Responsive */}
      <div className="bg-gradient-to-r from-emerald-50 to-blue-50 p-4 sm:p-6 rounded-lg border border-emerald-200">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="w-6 h-6 text-emerald-600" />
          <h3 className="text-lg font-semibold text-gray-900">Insights do Sistema</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 text-sm">
          <div className="bg-white p-4 rounded-lg">
            <p className="font-medium text-gray-900 mb-1">Cliente Mais Ativo</p>
            <p className="text-gray-600">
              {statistics.recipesPerClient[0]?.name || "Nenhum cliente"}
              {statistics.recipesPerClient[0] && ` (${statistics.recipesPerClient[0].value} receitas)`}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <p className="font-medium text-gray-900 mb-1">Ingrediente Mais Usado</p>
            <p className="text-gray-600">
              {statistics.topIngredients[0]?.name || "Nenhum ingrediente"}
              {statistics.topIngredients[0] && ` (${statistics.topIngredients[0].value}x)`}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg md:col-span-2 xl:col-span-1">
            <p className="font-medium text-gray-900 mb-1">Receita Mais Complexa</p>
            <p className="text-gray-600">
              {statistics.ingredientsPerRecipe[0]?.name || "Nenhuma receita"}
              {statistics.ingredientsPerRecipe[0] && ` (${statistics.ingredientsPerRecipe[0].value} ingredientes)`}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

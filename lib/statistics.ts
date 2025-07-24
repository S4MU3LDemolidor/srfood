import { getRecipesWithClients, getIngredients, getSteps, getClients } from "./data-manager"

export interface StatisticsData {
  recipesPerClient: Array<{ name: string; value: number }>
  recipeTypes: Array<{ name: string; value: number; color: string }>
  recipesPerMonth: Array<{ name: string; value: number }>
  topIngredients: Array<{ name: string; value: number }>
  ingredientsPerRecipe: Array<{ name: string; value: number }>
  averagePreparationTime: string
  averagePortionWeight: string
  totalRecipes: number
  totalClients: number
  totalIngredients: number
  totalSteps: number
}

export function generateStatistics(): StatisticsData {
  const recipes = getRecipesWithClients()
  const ingredients = getIngredients()
  const steps = getSteps()
  const clients = getClients()

  // Recipes per client
  const clientRecipeCount = recipes.reduce(
    (acc, recipe) => {
      const clientName = recipe.client?.name || "Sem Cliente"
      acc[clientName] = (acc[clientName] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const recipesPerClient = Object.entries(clientRecipeCount)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  // Recipe types
  const typeCount = recipes.reduce(
    (acc, recipe) => {
      acc[recipe.tipo_ficha] = (acc[recipe.tipo_ficha] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const recipeTypes = [
    { name: "Normal", value: typeCount.Normal || 0, color: "#10b981" },
    { name: "Subficha", value: typeCount.Subficha || 0, color: "#3b82f6" },
  ]

  // Recipes per month
  const monthlyCount = recipes.reduce(
    (acc, recipe) => {
      const date = new Date(recipe.created_at)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      const monthName = date.toLocaleDateString("pt-BR", { year: "numeric", month: "short" })
      acc[monthKey] = { name: monthName, value: (acc[monthKey]?.value || 0) + 1 }
      return acc
    },
    {} as Record<string, { name: string; value: number }>,
  )

  const recipesPerMonth = Object.values(monthlyCount)
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(-6) // Last 6 months

  // Top ingredients
  const ingredientCount = ingredients.reduce(
    (acc, ingredient) => {
      if (ingredient.ingrediente && !ingredient.subficha_id) {
        acc[ingredient.ingrediente] = (acc[ingredient.ingrediente] || 0) + 1
      }
      return acc
    },
    {} as Record<string, number>,
  )

  const topIngredients = Object.entries(ingredientCount)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10)

  // Ingredients per recipe
  const recipeIngredientCount = recipes
    .map((recipe) => {
      const recipeIngredients = ingredients.filter((ing) => ing.ficha_id === recipe.id)
      return {
        name: recipe.nome_receita.length > 20 ? recipe.nome_receita.substring(0, 20) + "..." : recipe.nome_receita,
        value: recipeIngredients.length,
      }
    })
    .sort((a, b) => b.value - a.value)
    .slice(0, 10)

  // Average preparation time (simplified calculation)
  const recipesWithTime = recipes.filter((r) => r.tempo_preparo)
  const avgPrepTime = recipesWithTime.length > 0 ? `${recipesWithTime.length} receitas com tempo definido` : "N/A"

  // Average portion weight (simplified calculation)
  const recipesWithWeight = recipes.filter((r) => r.peso_porcao)
  const avgPortionWeight =
    recipesWithWeight.length > 0 ? `${recipesWithWeight.length} receitas com peso definido` : "N/A"

  const statistics: StatisticsData = {
    recipesPerClient,
    recipeTypes,
    recipesPerMonth,
    topIngredients,
    ingredientsPerRecipe: recipeIngredientCount,
    averagePreparationTime: avgPrepTime,
    averagePortionWeight: avgPortionWeight,
    totalRecipes: recipes.length,
    totalClients: clients.length,
    totalIngredients: ingredients.length,
    totalSteps: steps.length,
  }

  return statistics
}

export function getRecipeStatistics(recipes: any[]) {
  return {
    normal: recipes.filter((r) => r.tipo_ficha === "Normal").length,
    especial: recipes.filter((r) => r.tipo_ficha === "Subficha").length,
  }
}

export function getClientStatistics(clients: any[]) {
  return {
    totalClients: clients.length,
    activeClients: clients.filter((client) => client.recipes && client.recipes.length > 0).length,
    clientsWithMultipleRecipes: clients.filter((client) => client.recipes && client.recipes.length > 1).length,
  }
}

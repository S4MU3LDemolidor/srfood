"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Recipe, Ingredient } from "@/lib/types"
import { ArrowLeft, Plus, Trash2, GripVertical, AlertCircle } from "lucide-react"

export default function IngredientsPage({ params }: { params: { id: string } }) {
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [newIngredient, setNewIngredient] = useState({
    ingrediente: "",
    quantidade: "",
    medida_caseira: "",
    subficha_id: "none",
  })

  useEffect(() => {
    fetchData()
  }, [params.id])

  const fetchData = async () => {
    try {
      setError(null)

      // Fetch recipe details
      const recipeResponse = await fetch(`/api/recipes/${params.id}`)
      if (!recipeResponse.ok) {
        throw new Error(`Recipe not found: ${recipeResponse.status}`)
      }
      const recipeData = await recipeResponse.json()
      setRecipe(recipeData)

      // Fetch ingredients
      const ingredientsResponse = await fetch(`/api/ingredients/${params.id}`)
      if (!ingredientsResponse.ok) {
        throw new Error(`Failed to fetch ingredients: ${ingredientsResponse.status}`)
      }
      const ingredientsData = await ingredientsResponse.json()
      setIngredients(Array.isArray(ingredientsData) ? ingredientsData : [])

      // Fetch all recipes for subficha selection
      const recipesResponse = await fetch("/api/recipes")
      if (recipesResponse.ok) {
        const recipesData = await recipesResponse.json()
        const subfichas = Array.isArray(recipesData)
          ? recipesData.filter((r: Recipe) => r.id !== params.id && r.tipo_ficha === "Subficha")
          : []
        setRecipes(subfichas)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      setError(error instanceof Error ? error.message : "Erro ao carregar dados")
    } finally {
      setLoading(false)
    }
  }

  const addIngredient = async () => {
    if (!newIngredient.ingrediente && newIngredient.subficha_id === "none") return

    setSaving(true)
    try {
      const ingredientData = {
        ingrediente: newIngredient.ingrediente,
        quantidade: newIngredient.quantidade,
        medida_caseira: newIngredient.medida_caseira,
        subficha_id: newIngredient.subficha_id === "none" ? null : newIngredient.subficha_id,
        ordem: ingredients.length + 1,
      }

      const response = await fetch(`/api/ingredients/${params.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ingredientData),
      })

      if (!response.ok) {
        throw new Error(`Failed to add ingredient: ${response.status}`)
      }

      const ingredient = await response.json()
      setIngredients([...ingredients, ingredient])
      setNewIngredient({
        ingrediente: "",
        quantidade: "",
        medida_caseira: "",
        subficha_id: "none",
      })
    } catch (error) {
      console.error("Error adding ingredient:", error)
      alert("Erro ao adicionar ingrediente. Tente novamente.")
    } finally {
      setSaving(false)
    }
  }

  const deleteIngredient = async (id: string) => {
    try {
      const response = await fetch(`/api/ingredients/item/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(`Failed to delete ingredient: ${response.status}`)
      }

      setIngredients(ingredients.filter((ing) => ing.id !== id))
    } catch (error) {
      console.error("Error deleting ingredient:", error)
      alert("Erro ao remover ingrediente. Tente novamente.")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Erro ao carregar dados</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="flex gap-4 justify-center">
            <Button onClick={fetchData} variant="outline">
              Tentar Novamente
            </Button>
            <Link href="/">
              <Button>Voltar ao Início</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Receita não encontrada</h1>
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
            <Link href={`/recipes/${params.id}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Ingredientes - {recipe.nome_receita}</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Add New Ingredient */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Adicionar Ingrediente</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="ingrediente">Ingrediente</Label>
              <Input
                id="ingrediente"
                value={newIngredient.ingrediente}
                onChange={(e) => setNewIngredient({ ...newIngredient, ingrediente: e.target.value })}
                placeholder="Ex: Farinha de trigo"
                disabled={newIngredient.subficha_id !== "none"}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantidade">Quantidade</Label>
              <Input
                id="quantidade"
                value={newIngredient.quantidade}
                onChange={(e) => setNewIngredient({ ...newIngredient, quantidade: e.target.value })}
                placeholder="Ex: 300g"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="medida_caseira">Medida Caseira</Label>
              <Input
                id="medida_caseira"
                value={newIngredient.medida_caseira}
                onChange={(e) => setNewIngredient({ ...newIngredient, medida_caseira: e.target.value })}
                placeholder="Ex: 2 xícaras"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subficha">Ou Subficha</Label>
              <Select
                value={newIngredient.subficha_id}
                onValueChange={(value) =>
                  setNewIngredient({
                    ...newIngredient,
                    subficha_id: value,
                    ingrediente: value === "none" ? newIngredient.ingrediente : "",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar subficha" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma</SelectItem>
                  {recipes.map((recipe) => (
                    <SelectItem key={recipe.id} value={recipe.id}>
                      {recipe.nome_receita}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={addIngredient}
            disabled={saving || (!newIngredient.ingrediente && newIngredient.subficha_id === "none")}
          >
            <Plus className="w-4 h-4 mr-2" />
            {saving ? "Adicionando..." : "Adicionar Ingrediente"}
          </Button>
        </div>

        {/* Ingredients List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Lista de Ingredientes</h2>

          {ingredients.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Nenhum ingrediente adicionado</p>
          ) : (
            <div className="space-y-2">
              {ingredients.map((ingredient, index) => (
                <div
                  key={ingredient.id}
                  className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-2 text-gray-400">
                    <GripVertical className="w-4 h-4" />
                    <span className="text-sm font-medium">{index + 1}</span>
                  </div>

                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
                    <div>
                      <p className="font-medium text-gray-900">
                        {ingredient.subficha_id ? (
                          <span className="text-blue-600">
                            {recipes.find((r) => r.id === ingredient.subficha_id)?.nome_receita || "Subficha"}{" "}
                            (Subficha)
                          </span>
                        ) : (
                          ingredient.ingrediente
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">{ingredient.quantidade}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">{ingredient.medida_caseira}</p>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteIngredient(ingredient.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

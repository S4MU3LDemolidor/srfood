"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { getRecipeWithDetails, deleteRecipe } from "@/lib/data-manager"
import { ArrowLeft, Edit, Clock, Users, Scale, Utensils, AlertCircle, Trash2, MoreVertical } from "lucide-react"
import { PDFDownloadButton } from "./pdf-download-button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Recipe } from "@/lib/types"

export default function RecipeDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    async function loadRecipe() {
      try {
        console.log("🔍 RECIPE DETAIL PAGE: Received ID:", params.id)
        console.log("🔍 RECIPE DETAIL PAGE: ID type:", typeof params.id)

        // Check if this is actually the "new" route being caught by the dynamic route
        if (params.id === "new") {
          console.log("❌ ROUTING ERROR: 'new' route caught by dynamic [id] route!")
          setError("Erro de roteamento - redirecionando...")
          // Redirect to the correct new recipe page
          window.location.href = "/recipes/new"
          return
        }

        console.log("🔍 RECIPE DETAIL PAGE: Loading recipe:", params.id)
        const recipeData = await getRecipeWithDetails(params.id)

        console.log("✅ RECIPE DETAIL PAGE: Recipe loaded:", recipeData?.nome_receita)

        if (!recipeData) {
          setError("Receita não encontrada")
          return
        }

        setRecipe(recipeData)
      } catch (error) {
        console.error("❌ RECIPE DETAIL PAGE: Error loading recipe:", error)
        setError("Erro ao carregar receita")
      } finally {
        setLoading(false)
      }
    }

    loadRecipe()
  }, [params.id])

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      console.log("🗑️ RECIPE DETAIL: Deleting recipe:", params.id)

      const success = deleteRecipe(params.id)

      if (success) {
        console.log("✅ RECIPE DETAIL: Recipe deleted successfully")

        // Dispatch events to notify other components
        window.dispatchEvent(
          new CustomEvent("dataChanged", {
            detail: { type: "recipe", action: "delete", id: params.id },
          }),
        )
        window.dispatchEvent(new StorageEvent("storage", { key: "recipes" }))

        // Navigate back to recipes list
        router.push("/recipes")
      } else {
        throw new Error("Failed to delete recipe")
      }
    } catch (error) {
      console.error("❌ RECIPE DETAIL: Error deleting recipe:", error)
      alert("Erro ao excluir receita. Tente novamente.")
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-2">{error || "Receita não encontrada"}</h1>
          <p className="text-muted-foreground mb-4">ID recebido: {params.id}</p>
          <div className="flex gap-4 justify-center">
            <Link href="/">
              <Button>Voltar ao início</Button>
            </Link>
            <Link href="/recipes/new">
              <Button variant="outline">Nova Receita</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-card border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 sm:py-0 sm:h-16 gap-4 sm:gap-0">
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <Link href="/">
                  <Button variant="ghost" size="sm" className="flex-shrink-0">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar
                  </Button>
                </Link>
                <h1 className="text-lg sm:text-xl font-semibold text-foreground truncate">{recipe.nome_receita}</h1>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                <PDFDownloadButton recipe={recipe} />
                <Link href={`/recipes/${recipe.id}/edit`} className="w-full sm:w-auto">
                  <Button variant="outline" size="sm" className="w-full sm:w-auto bg-transparent">
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                </Link>

                {/* More Actions Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full sm:w-auto bg-transparent">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="flex items-center text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                      onClick={() => setShowDeleteDialog(true)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Excluir Receita
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Recipe Image and Basic Info */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
                <div className="aspect-square relative bg-muted">
                  {recipe.foto_produto_url ? (
                    <Image
                      src={recipe.foto_produto_url || "/placeholder.svg"}
                      alt={recipe.nome_receita}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <Scale className="w-16 h-16" />
                    </div>
                  )}
                </div>

                <div className="p-4 sm:p-6">
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span
                      className={`px-3 py-1 text-sm rounded-full ${
                        recipe.tipo_ficha === "Normal"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                      }`}
                    >
                      {recipe.tipo_ficha}
                    </span>
                    {recipe.client && <span className="text-sm text-muted-foreground">{recipe.client.name}</span>}
                  </div>

                  <div className="space-y-3">
                    {recipe.tempo_preparo && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4 flex-shrink-0" />
                        <span>{recipe.tempo_preparo}</span>
                      </div>
                    )}
                    {recipe.rendimento && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="w-4 h-4 flex-shrink-0" />
                        <span>{recipe.rendimento}</span>
                      </div>
                    )}
                    {recipe.peso_preparacao && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Scale className="w-4 h-4 flex-shrink-0" />
                        <span>Peso total: {recipe.peso_preparacao}</span>
                      </div>
                    )}
                    {recipe.peso_porcao && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Scale className="w-4 h-4 flex-shrink-0" />
                        <span>Por porção: {recipe.peso_porcao}</span>
                      </div>
                    )}
                    {recipe.utensilios_necessarios && (
                      <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Utensils className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{recipe.utensilios_necessarios}</span>
                      </div>
                    )}
                  </div>

                  {(recipe.realizado_por || recipe.aprovado_por) && (
                    <div className="mt-6 pt-6 border-t border-border">
                      <h3 className="font-medium text-foreground mb-3">Informações</h3>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        {recipe.realizado_por && (
                          <div>
                            <span className="font-medium">Realizado por:</span> {recipe.realizado_por}
                          </div>
                        )}
                        {recipe.aprovado_por && (
                          <div>
                            <span className="font-medium">Aprovado por:</span> {recipe.aprovado_por}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Ingredients and Steps */}
            <div className="lg:col-span-2 space-y-6 lg:space-y-8">
              {/* Ingredients */}
              <div className="bg-card rounded-lg shadow-sm border border-border p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                  <h2 className="text-lg font-semibold text-foreground">Ingredientes</h2>
                  <Link href={`/recipes/${recipe.id}/ingredients`}>
                    <Button variant="outline" size="sm" className="w-full sm:w-auto bg-transparent">
                      <Edit className="w-4 h-4 mr-2" />
                      Gerenciar
                    </Button>
                  </Link>
                </div>

                {recipe.ingredients && recipe.ingredients.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 text-sm font-medium text-muted-foreground">Ingrediente</th>
                          <th className="text-left py-2 text-sm font-medium text-muted-foreground">Quantidade</th>
                          <th className="text-left py-2 text-sm font-medium text-muted-foreground hidden sm:table-cell">
                            Medida Caseira
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {recipe.ingredients.map((ingredient, index) => (
                          <tr key={ingredient.id} className={index % 2 === 0 ? "bg-muted/50" : "bg-card"}>
                            <td className="py-3 text-sm text-foreground">
                              {ingredient.subficha ? (
                                <span className="text-blue-600 dark:text-blue-400">
                                  {ingredient.subficha.nome_receita} (Subficha)
                                </span>
                              ) : (
                                ingredient.ingrediente
                              )}
                              <div className="sm:hidden text-xs text-muted-foreground mt-1">
                                {ingredient.medida_caseira}
                              </div>
                            </td>
                            <td className="py-3 text-sm text-muted-foreground">{ingredient.quantidade}</td>
                            <td className="py-3 text-sm text-muted-foreground hidden sm:table-cell">
                              {ingredient.medida_caseira}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">Nenhum ingrediente adicionado</p>
                )}
              </div>

              {/* Steps */}
              <div className="bg-card rounded-lg shadow-sm border border-border p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                  <h2 className="text-lg font-semibold text-foreground">Modo de Preparo</h2>
                  <Link href={`/recipes/${recipe.id}/steps`}>
                    <Button variant="outline" size="sm" className="w-full sm:w-auto bg-transparent">
                      <Edit className="w-4 h-4 mr-2" />
                      Gerenciar
                    </Button>
                  </Link>
                </div>

                {recipe.steps && recipe.steps.length > 0 ? (
                  <div className="space-y-6">
                    {recipe.steps.map((step, index) => (
                      <div key={step.id} className="flex gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-foreground mb-3">{step.passo}</p>
                          {step.foto_url && (
                            <div className="relative w-full max-w-md h-48 rounded-lg overflow-hidden mb-3">
                              <Image
                                src={step.foto_url || "/placeholder.svg"}
                                alt={`Passo ${index + 1}`}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">Nenhum passo adicionado</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Receita</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a receita "{recipe.nome_receita}"?
              <br />
              <br />
              <strong>Esta ação não pode ser desfeita.</strong> Todos os ingredientes e passos associados também serão
              removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? "Excluindo..." : "Excluir Receita"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

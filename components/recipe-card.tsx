"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import type { Recipe } from "@/lib/types"
import { Clock, Users, Scale, Edit, MoreVertical, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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
import { deleteRecipe } from "@/lib/data-manager"

interface RecipeCardProps {
  recipe: Recipe
  onDelete?: () => void
}

export function RecipeCard({ recipe, onDelete }: RecipeCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      console.log("🗑️ RECIPE CARD: Deleting recipe:", recipe.id, recipe.nome_receita)

      const success = deleteRecipe(recipe.id)

      if (success) {
        console.log("✅ RECIPE CARD: Recipe deleted successfully")

        // Dispatch events to notify other components
        window.dispatchEvent(
          new CustomEvent("dataChanged", {
            detail: { type: "recipe", action: "delete", id: recipe.id },
          }),
        )
        window.dispatchEvent(new StorageEvent("storage", { key: "recipes" }))

        // Call onDelete callback if provided
        onDelete?.()

        setShowDeleteDialog(false)
      } else {
        throw new Error("Failed to delete recipe")
      }
    } catch (error) {
      console.error("❌ RECIPE CARD: Error deleting recipe:", error)
      alert("Erro ao excluir receita. Tente novamente.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <div className="bg-card border border-border hover:border-emerald-300 dark:hover:border-emerald-600 transition-colors duration-200 rounded-lg overflow-hidden group relative">
        {/* Recipe Actions Dropdown */}
        <div className="absolute top-2 right-2 z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 bg-background/80 hover:bg-background shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/recipes/${recipe.id}/edit`} className="flex items-center">
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                onClick={(e) => {
                  e.preventDefault()
                  setShowDeleteDialog(true)
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Link href={`/recipes/${recipe.id}`}>
          <div className="aspect-video relative bg-muted">
            {recipe.foto_produto_url ? (
              <Image
                src={recipe.foto_produto_url || "/placeholder.svg"}
                alt={recipe.nome_receita}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-200"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <Scale className="w-12 h-12" />
              </div>
            )}
          </div>

          <div className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  recipe.tipo_ficha === "Normal"
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                    : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                }`}
              >
                {recipe.tipo_ficha}
              </span>
              {recipe.client && <span className="text-xs text-muted-foreground">{recipe.client.name}</span>}
            </div>

            <h3 className="font-semibold text-card-foreground mb-2 line-clamp-2">{recipe.nome_receita}</h3>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {recipe.tempo_preparo && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{recipe.tempo_preparo}</span>
                </div>
              )}
              {recipe.rendimento && (
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{recipe.rendimento}</span>
                </div>
              )}
            </div>
          </div>
        </Link>
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

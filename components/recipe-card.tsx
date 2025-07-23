"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import type { Recipe } from "@/lib/types"
import { Clock, Users, Scale, Edit, Trash2, MoreVertical } from "lucide-react"
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

interface RecipeCardProps {
  recipe: Recipe
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    console.log("Delete button clicked, showing dialog")
    setShowDeleteDialog(true)
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      console.log(`Frontend: Deleting recipe with ID: ${recipe.id}`)
      console.log(`Frontend: Recipe name: ${recipe.nome_receita}`)

      const response = await fetch(`/api/recipes/${recipe.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })

      console.log(`Frontend: Delete response status: ${response.status}`)
      console.log(`Frontend: Delete response ok: ${response.ok}`)

      const responseText = await response.text()
      console.log(`Frontend: Raw response: ${responseText}`)

      let result
      try {
        result = JSON.parse(responseText)
      } catch (parseError) {
        console.error("Frontend: Failed to parse response as JSON:", parseError)
        throw new Error(`Invalid response format: ${responseText}`)
      }

      if (!response.ok) {
        console.error("Frontend: Delete failed:", result)
        throw new Error(result.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      console.log("Frontend: Delete successful:", result)

      // Close dialog first
      setShowDeleteDialog(false)

      // Force a hard refresh to ensure data is reloaded
      window.location.reload()
    } catch (error) {
      console.error("Frontend: Error deleting recipe:", error)
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"
      alert(`Erro ao excluir receita: ${errorMessage}`)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 hover:border-emerald-300 transition-colors duration-200 overflow-hidden group relative">
        {/* Recipe Actions Dropdown */}
        <div className="absolute top-2 right-2 z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 bg-white/80 hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
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
              <DropdownMenuItem onClick={handleDeleteClick} className="text-red-600 focus:text-red-600 cursor-pointer">
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Link href={`/recipes/${recipe.id}`}>
          <div className="aspect-video relative bg-gray-50">
            {recipe.foto_produto_url ? (
              <Image
                src={recipe.foto_produto_url || "/placeholder.svg"}
                alt={recipe.nome_receita}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-200"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <Scale className="w-12 h-12" />
              </div>
            )}
          </div>

          <div className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  recipe.tipo_ficha === "Normal" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
                }`}
              >
                {recipe.tipo_ficha}
              </span>
              {recipe.client && <span className="text-xs text-gray-500">{recipe.client.name}</span>}
            </div>

            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{recipe.nome_receita}</h3>

            <div className="flex items-center gap-4 text-sm text-gray-600">
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
              Tem certeza que deseja excluir "{recipe.nome_receita}"? Esta ação não pode ser desfeita. Todos os
              ingredientes e passos relacionados também serão excluídos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-red-600 hover:bg-red-700">
              {deleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

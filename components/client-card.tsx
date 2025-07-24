"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import type { Client } from "@/lib/types"
import { Edit, MoreVertical, Building, Trash2 } from "lucide-react"
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
import { deleteClient, getRecipesWithClients } from "@/lib/data-manager"

interface ClientCardProps {
  client: Client
  onDelete?: () => void
}

export function ClientCard({ client, onDelete }: ClientCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      console.log("🗑️ CLIENT CARD: Deleting client:", client.id, client.name)

      // Check if client has associated recipes
      const recipes = getRecipesWithClients()
      const clientRecipes = recipes.filter((recipe) => recipe.client_id === client.id)

      if (clientRecipes.length > 0) {
        alert(
          `Não é possível excluir o cliente "${client.name}" pois ele possui ${clientRecipes.length} receita(s) associada(s). Exclua as receitas primeiro.`,
        )
        setIsDeleting(false)
        setShowDeleteDialog(false)
        return
      }

      const success = deleteClient(client.id)

      if (success) {
        console.log("✅ CLIENT CARD: Client deleted successfully")

        // Dispatch events to notify other components
        window.dispatchEvent(
          new CustomEvent("dataChanged", {
            detail: { type: "client", action: "delete", id: client.id },
          }),
        )
        window.dispatchEvent(new StorageEvent("storage", { key: "clients" }))

        // Call onDelete callback if provided
        onDelete?.()

        setShowDeleteDialog(false)
      } else {
        throw new Error("Failed to delete client")
      }
    } catch (error) {
      console.error("❌ CLIENT CARD: Error deleting client:", error)
      alert("Erro ao excluir cliente. Tente novamente.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <div className="bg-card border border-border hover:border-emerald-300 dark:hover:border-emerald-600 transition-colors duration-200 rounded-lg overflow-hidden group relative">
        {/* Client Actions Dropdown */}
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
                <Link href={`/clients/${client.id}/edit`} className="flex items-center">
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

        <div className="p-4 sm:p-6">
          <div className="flex flex-col items-center text-center space-y-4">
            {/* Client Logo - Centered */}
            <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
              {client.logo_url ? (
                <Image
                  src={client.logo_url || "/placeholder.svg"}
                  alt={client.name}
                  width={64}
                  height={64}
                  className="rounded-lg object-cover w-full h-full"
                />
              ) : (
                <Building className="w-8 h-8 text-muted-foreground" />
              )}
            </div>

            {/* Client Info - Centered */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-card-foreground text-center mb-2">{client.name}</h3>
              <p className="text-sm text-muted-foreground text-center">
                Criado em {new Date(client.created_at).toLocaleDateString("pt-BR")}
              </p>
            </div>

            {/* Action Button */}
            <div className="w-full">
              <Link href={`/clients/${client.id}/edit`} className="w-full">
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  <Edit className="w-4 h-4 mr-2" />
                  Editar Cliente
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Cliente</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o cliente "{client.name}"?
              <br />
              <br />
              <strong>Esta ação não pode ser desfeita.</strong> Certifique-se de que não há receitas associadas a este
              cliente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? "Excluindo..." : "Excluir Cliente"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

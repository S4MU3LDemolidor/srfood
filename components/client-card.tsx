"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import type { Client } from "@/lib/types"
import { Edit, Trash2, MoreVertical, Building } from "lucide-react"
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

interface ClientCardProps {
  client: Client
}

export function ClientCard({ client }: ClientCardProps) {
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
      console.log(`Frontend: Deleting client with ID: ${client.id}`)
      console.log(`Frontend: Client name: ${client.name}`)

      const response = await fetch(`/api/clients/${client.id}`, {
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
      console.error("Frontend: Error deleting client:", error)
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"
      alert(`Erro ao excluir cliente: ${errorMessage}`)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 hover:border-emerald-300 transition-colors duration-200 overflow-hidden group relative">
        {/* Client Actions Dropdown */}
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
                <Link href={`/clients/${client.id}/edit`} className="flex items-center">
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

        <div className="p-4 sm:p-6">
          <div className="flex flex-col items-center text-center space-y-4">
            {/* Client Logo - Centered */}
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
              {client.logo_url ? (
                <Image
                  src={client.logo_url || "/placeholder.svg"}
                  alt={client.name}
                  width={64}
                  height={64}
                  className="rounded-lg object-cover w-full h-full"
                />
              ) : (
                <Building className="w-8 h-8 text-gray-400" />
              )}
            </div>

            {/* Client Info - Centered */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-center mb-2">{client.name}</h3>
              <p className="text-sm text-gray-500 text-center">
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
              Tem certeza que deseja excluir "{client.name}"? Esta ação não pode ser desfeita.
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

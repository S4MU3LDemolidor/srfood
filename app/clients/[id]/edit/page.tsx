"use client"

import { useState, useEffect } from "react"
import { ClientForm } from "@/components/client-form"
import { getClientById } from "@/lib/data-manager"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import type { Client } from "@/lib/types"

export default function EditClientPage({ params }: { params: { id: string } }) {
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      console.log("🔍 EDIT CLIENT PAGE: Loading client:", params.id)
      const clientData = getClientById(params.id)

      console.log("✅ EDIT CLIENT PAGE: Client loaded:", clientData?.name)

      if (!clientData) {
        setError("Cliente não encontrado")
        return
      }

      setClient(clientData)
    } catch (error) {
      console.error("❌ EDIT CLIENT PAGE: Error loading client:", error)
      setError("Erro ao carregar cliente")
    } finally {
      setLoading(false)
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  if (error || !client) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{error || "Cliente não encontrado"}</h1>
          <Link href="/clients">
            <Button>Voltar aos clientes</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Editar Cliente</h1>
          <ClientForm client={client} />
        </div>
      </div>
    </div>
  )
}

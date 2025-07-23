"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getClients } from "@/lib/data-manager"
import { Plus, ArrowLeft, Building } from "lucide-react"
import { ClientCard } from "@/components/client-card"
import type { Client } from "@/lib/types"

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadClients() {
      try {
        console.log("🔍 CLIENTS PAGE: Loading clients...")
        const clientsData = await getClients()
        console.log("✅ CLIENTS PAGE: Clients loaded:", clientsData.length)
        setClients(clientsData)
      } catch (error) {
        console.error("❌ CLIENTS PAGE: Error loading clients:", error)
        setClients([])
      } finally {
        setLoading(false)
      }
    }

    loadClients()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 sm:py-0 sm:h-16 gap-4 sm:gap-0">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Gerenciar Clientes</h1>
            </div>
            <Link href="/clients/new" className="w-full sm:w-auto">
              <Button className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Novo Cliente
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {clients.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <Building className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">Nenhum cliente cadastrado</p>
              <p className="text-sm px-4">Comece adicionando seu primeiro cliente</p>
            </div>
            <Link href="/clients/new">
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Cliente
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {clients.map((client) => (
              <ClientCard key={client.id} client={client} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

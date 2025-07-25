"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SearchBar } from "@/components/search-bar"
import { ClientCard } from "@/components/client-card"
import { getClients } from "@/lib/data-manager"
import { Plus, Users } from "lucide-react"
import type { Client } from "@/lib/types"

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [filteredClients, setFilteredClients] = useState<Client[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  const loadClients = () => {
    try {
      const clientsData = getClients()
      setClients(clientsData)
      setFilteredClients(clientsData)
    } catch (error) {
      console.error("Error loading clients:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    // Initial load
    loadClients()

    // Listen for data changes
    const handleDataChanged = (event: CustomEvent) => {
      if (event.detail.key === "clients") {
        loadClients()
      }
    }

    const handleStorageChange = () => {
      loadClients()
    }

    window.addEventListener("dataChanged", handleDataChanged as EventListener)
    window.addEventListener("storage", handleStorageChange)

    return () => {
      window.removeEventListener("dataChanged", handleDataChanged as EventListener)
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [mounted])

  useEffect(() => {
    if (searchTerm) {
      const filtered = clients.filter((client) => client.name.toLowerCase().includes(searchTerm.toLowerCase()))
      setFilteredClients(filtered)
    } else {
      setFilteredClients(clients)
    }
  }, [searchTerm, clients])

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Carregando clientes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col space-y-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 sm:py-0 sm:h-16">
            <div className="flex items-center">
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Clientes</h1>
              <span className="ml-2 text-sm text-gray-500">({filteredClients.length})</span>
            </div>
            <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
              <div className="w-full sm:w-64">
                <SearchBar placeholder="Buscar clientes..." value={searchTerm} onChange={setSearchTerm} />
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
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {filteredClients.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredClients.map((client) => (
              <ClientCard key={client.id} client={client} />
            ))}
          </div>
        ) : clients.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum cliente cadastrado</h3>
            <p className="text-gray-500 mb-6">Comece criando seu primeiro cliente para organizar suas receitas.</p>
            <Link href="/clients/new">
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Cliente
              </Button>
            </Link>
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum cliente encontrado</h3>
            <p className="text-gray-500 mb-6">
              Não encontramos clientes que correspondam à sua busca por "{searchTerm}".
            </p>
            <Button variant="outline" onClick={() => setSearchTerm("")} className="bg-transparent">
              Limpar Busca
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

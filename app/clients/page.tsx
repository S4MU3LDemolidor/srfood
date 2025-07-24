"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getClients } from "@/lib/data-manager"
import { Plus, ArrowLeft, Building, AlertCircle, RefreshCw } from 'lucide-react'
import { ClientCard } from "@/components/client-card"
import type { Client } from "@/lib/types"

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadClients = async () => {
    console.log("🔍 CLIENTS PAGE: Starting to load clients...")
    setLoading(true)
    setError(null)
    
    try {
      // Add a small delay to ensure DOM is ready
      await new Promise(resolve => setTimeout(resolve, 100))
      
      console.log("🔍 CLIENTS PAGE: Calling getClients...")
      const clientsData = getClients()
      console.log("✅ CLIENTS PAGE: Clients loaded:", clientsData.length)
      console.log("📋 CLIENTS PAGE: Client names:", clientsData.map((c) => c.name))
      
      setClients(clientsData)
    } catch (error) {
      console.error("❌ CLIENTS PAGE: Error loading clients:", error)
      setError(error instanceof Error ? error.message : "Erro desconhecido")
      setClients([])
    } finally {
      console.log("✅ CLIENTS PAGE: Loading complete, setting loading to false")
      setLoading(false)
    }
  }

  useEffect(() => {
    console.log("🚀 CLIENTS PAGE: Component mounted, loading clients...")
    loadClients()
  }, [])

  // Listen for route changes and page focus
  useEffect(() => {
    const handleFocus = () => {
      console.log("👁️ CLIENTS PAGE: Window focused, reloading data...")
      loadClients()
    }

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log("📱 CLIENTS PAGE: Page visible, reloading data...")
        loadClients()
      }
    }

    const handleDataChanged = (event: any) => {
      console.log("📡 CLIENTS PAGE: Data changed event received:", event.detail)
      loadClients()
    }

    const handleStorageChanged = (event: any) => {
      console.log("💾 CLIENTS PAGE: Storage changed:", event.key)
      if (event.key === 'clients' || event.key === null) {
        loadClients()
      }
    }

    // Listen for various events
    window.addEventListener("focus", handleFocus)
    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("dataChanged", handleDataChanged)
    window.addEventListener("storage", handleStorageChanged)

    return () => {
      window.removeEventListener("focus", handleFocus)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("dataChanged", handleDataChanged)
      window.removeEventListener("storage", handleStorageChanged)
    }
  }, [])

  // Force loading to false after 5 seconds as a safety net
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.log("⚠️ CLIENTS PAGE: Loading timeout reached, forcing loading to false")
        setLoading(false)
        setError("Timeout ao carregar dados")
      }
    }, 5000)

    return () => clearTimeout(timeout)
  }, [loading])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm mb-4">Carregando clientes...</p>
          <Button 
            onClick={() => {
              console.log("🔄 CLIENTS PAGE: Force reload button clicked")
              setLoading(false)
              loadClients()
            }}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar Novamente
          </Button>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Erro ao carregar dados</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="flex gap-4 justify-center">
            <Button onClick={loadClients} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar Novamente
            </Button>
            <Button onClick={() => window.location.reload()}>
              Recarregar Página
            </Button>
          </div>
        </div>
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
            <div className="flex gap-2">
              <Button 
                onClick={() => {
                  console.log("🔄 CLIENTS PAGE: Manual refresh button clicked")
                  loadClients()
                }}
                variant="outline" 
                size="sm"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar
              </Button>
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

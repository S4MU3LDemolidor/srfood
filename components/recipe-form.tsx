"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createRecipe, updateRecipe, getClients } from "@/lib/data-manager"
import type { Recipe, Client } from "@/lib/types"
import { Camera, Upload, X, ImageIcon } from 'lucide-react'

interface RecipeFormProps {
  recipe?: Recipe
  clients?: Client[]
}

const STORAGE_KEY = 'recipe-form-draft'

export function RecipeForm({ recipe, clients: propClients }: RecipeFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [clients, setClients] = useState<Client[]>(propClients || [])
  const [imagePreview, setImagePreview] = useState<string>(recipe?.foto_produto_url || "")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    nome_receita: recipe?.nome_receita || "",
    tipo_ficha: recipe?.tipo_ficha || "Normal",
    tempo_preparo: recipe?.tempo_preparo || "",
    rendimento: recipe?.rendimento || "",
    peso_preparacao: recipe?.peso_preparacao || "",
    peso_porcao: recipe?.peso_porcao || "",
    utensilios_necessarios: recipe?.utensilios_necessarios || "",
    realizado_por: recipe?.realizado_por || "",
    aprovado_por: recipe?.aprovado_por || "",
    client_id: recipe?.client_id || "",
    foto_produto_url: recipe?.foto_produto_url || "",
  })

  // Load clients if not provided
  useEffect(() => {
    if (!propClients) {
      try {
        const clientsData = getClients()
        setClients(clientsData)
        console.log("✅ RECIPE FORM: Loaded clients:", clientsData.length)
      } catch (error) {
        console.error("❌ RECIPE FORM: Error loading clients:", error)
      }
    }
  }, [propClients])

  // Load saved form data from localStorage on component mount
  useEffect(() => {
    if (typeof window !== "undefined" && !recipe) {
      try {
        const savedData = localStorage.getItem(STORAGE_KEY)
        if (savedData) {
          const parsedData = JSON.parse(savedData)
          console.log("📥 RECIPE FORM: Loading saved draft data:", parsedData)
          setFormData(parsedData)
          setImagePreview(parsedData.foto_produto_url || "")
        }
      } catch (error) {
        console.error("❌ RECIPE FORM: Error loading saved data:", error)
      }
    }
  }, [recipe])

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined" && !recipe && formData.nome_receita) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(formData))
        console.log("💾 RECIPE FORM: Auto-saved draft data:", formData.nome_receita)
      } catch (error) {
        console.error("❌ RECIPE FORM: Error saving draft data:", error)
      }
    }
  }, [formData, recipe])

  // Clear saved draft data from localStorage
  const clearSavedData = () => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(STORAGE_KEY)
        console.log("🗑️ RECIPE FORM: Cleared saved draft data")
      } catch (error) {
        console.error("❌ RECIPE FORM: Error clearing saved data:", error)
      }
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setImagePreview(result)
        setFormData({ ...formData, foto_produto_url: result })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCameraCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setImagePreview(result)
        setFormData({ ...formData, foto_produto_url: result })
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImagePreview("")
    setFormData({ ...formData, foto_produto_url: "" })
    if (fileInputRef.current) fileInputRef.current.value = ""
    if (cameraInputRef.current) cameraInputRef.current.value = ""
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    console.log("🔍 RECIPE FORM: Form submitted with data:", JSON.stringify(formData, null, 2))
    console.log("🔍 RECIPE FORM: Recipe name:", formData.nome_receita)
    console.log("🔍 RECIPE FORM: Is editing existing recipe?", !!recipe)

    try {
      if (recipe) {
        // Update existing recipe - directly use data manager
        console.log("📝 RECIPE FORM: Updating existing recipe:", recipe.id)
        const updatedRecipe = updateRecipe(recipe.id, formData)

        if (!updatedRecipe) {
          throw new Error("Failed to update recipe")
        }

        console.log("✅ RECIPE FORM: Recipe updated successfully:", updatedRecipe)
        router.push(`/recipes/${recipe.id}`)
      } else {
        // Create new recipe - directly use data manager
        console.log("🆕 RECIPE FORM: Creating new recipe")
        console.log("📤 RECIPE FORM: Using data manager directly:", JSON.stringify(formData, null, 2))

        const newRecipe = createRecipe(formData)
        console.log("✅ RECIPE FORM: Recipe created successfully:", newRecipe)
        console.log("🔍 RECIPE FORM: New recipe ID:", newRecipe.id)
        console.log("🔍 RECIPE FORM: New recipe name:", newRecipe.nome_receita)

        // Clear the saved draft data since we successfully created the recipe
        clearSavedData()

        // Dispatch events to notify other components
        console.log("📡 RECIPE FORM: Dispatching creation events...")
        window.dispatchEvent(new CustomEvent("dataChanged", { 
          detail: { type: 'recipe', action: 'create', data: newRecipe } 
        }))
        window.dispatchEvent(new StorageEvent("storage", { key: "recipes" }))

        // Small delay to ensure events are processed
        await new Promise(resolve => setTimeout(resolve, 100))

        // Navigate back to home page
        console.log("🔄 RECIPE FORM: Navigating back to home page...")
        router.push("/")
      }
    } catch (error) {
      console.error("❌ RECIPE FORM: Error saving recipe:", error)
      alert("Erro ao salvar receita. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    // Clear saved draft data when canceling
    if (!recipe) {
      clearSavedData()
    }
    router.back()
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Recipe Photo Section */}
        <div className="space-y-4">
          <Label>Foto da Receita (opcional)</Label>

          {/* Image Preview - Vertical Layout */}
          <div className="flex flex-col space-y-4">
            {imagePreview ? (
              <div className="relative w-48 h-48">
                <img
                  src={imagePreview || "/placeholder.svg"}
                  alt="Preview da receita"
                  className="w-full h-full object-cover rounded-lg border border-gray-200"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-lg z-10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="w-48 h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                  <p className="text-sm">Nenhuma foto</p>
                </div>
              </div>
            )}

            {/* Upload Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => cameraInputRef.current?.click()}
                className="flex items-center gap-2 flex-1"
              >
                <Camera className="w-4 h-4" />
                Tirar Foto
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 flex-1"
              >
                <Upload className="w-4 h-4" />
                Escolher Arquivo
              </Button>
            </div>
          </div>

          {/* Hidden File Inputs */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleCameraCapture}
            className="hidden"
          />

          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
        </div>

        {/* Recipe Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          <div className="space-y-2">
            <Label htmlFor="nome_receita">Nome da Receita *</Label>
            <Input
              id="nome_receita"
              value={formData.nome_receita}
              onChange={(e) => {
                console.log("🔍 RECIPE FORM: Recipe name changed to:", e.target.value)
                setFormData({ ...formData, nome_receita: e.target.value })
              }}
              required
              className="w-full"
              placeholder="Ex: Bolo de Chocolate Premium"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo_ficha">Tipo de Ficha</Label>
            <Select
              value={formData.tipo_ficha}
              onValueChange={(value) => setFormData({ ...formData, tipo_ficha: value as "Normal" | "Subficha" })}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Normal">Normal</SelectItem>
                <SelectItem value="Subficha">Subficha</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="client_id">Cliente</Label>
            <Select
              value={formData.client_id}
              onValueChange={(value) => setFormData({ ...formData, client_id: value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tempo_preparo">Tempo de Preparo</Label>
            <Input
              id="tempo_preparo"
              value={formData.tempo_preparo}
              onChange={(e) => setFormData({ ...formData, tempo_preparo: e.target.value })}
              placeholder="Ex: 2 horas"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rendimento">Rendimento</Label>
            <Input
              id="rendimento"
              value={formData.rendimento}
              onChange={(e) => setFormData({ ...formData, rendimento: e.target.value })}
              placeholder="Ex: 12 porções"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="peso_preparacao">Peso da Preparação</Label>
            <Input
              id="peso_preparacao"
              value={formData.peso_preparacao}
              onChange={(e) => setFormData({ ...formData, peso_preparacao: e.target.value })}
              placeholder="Ex: 1.5kg"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="peso_porcao">Peso da Porção</Label>
            <Input
              id="peso_porcao"
              value={formData.peso_porcao}
              onChange={(e) => setFormData({ ...formData, peso_porcao: e.target.value })}
              placeholder="Ex: 125g"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="realizado_por">Realizado Por</Label>
            <Input
              id="realizado_por"
              value={formData.realizado_por}
              onChange={(e) => setFormData({ ...formData, realizado_por: e.target.value })}
              className="w-full"
              placeholder="Ex: Chef Maria Silva"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="aprovado_por">Aprovado Por</Label>
            <Input
              id="aprovado_por"
              value={formData.aprovado_por}
              onChange={(e) => setFormData({ ...formData, aprovado_por: e.target.value })}
              className="w-full"
              placeholder="Ex: Supervisor João"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="utensilios_necessarios">Utensílios Necessários</Label>
          <Textarea
            id="utensilios_necessarios"
            value={formData.utensilios_necessarios}
            onChange={(e) => setFormData({ ...formData, utensilios_necessarios: e.target.value })}
            placeholder="Ex: Batedeira, formas, forno, tigelas"
            rows={3}
            className="w-full resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button type="submit" disabled={loading} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
            {loading ? "Salvando..." : recipe ? "Atualizar Receita" : "Criar Receita"}
          </Button>
          <Button type="button" variant="outline" onClick={handleCancel} className="flex-1">
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  )
}

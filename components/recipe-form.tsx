"use client"

import type React from "react"
import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Recipe, Client } from "@/lib/types"
import { Camera, Upload, X, ImageIcon } from "lucide-react"

interface RecipeFormProps {
  recipe?: Recipe
  clients: Client[]
}

export function RecipeForm({ recipe, clients }: RecipeFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
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

    console.log("🔍 FORM: Form submitted with data:", JSON.stringify(formData, null, 2))
    console.log("🔍 FORM: Recipe name:", formData.nome_receita)
    console.log("🔍 FORM: Is editing existing recipe?", !!recipe)

    try {
      if (recipe) {
        // Update existing recipe
        console.log("📝 FORM: Updating existing recipe:", recipe.id)
        const response = await fetch(`/api/recipes/${recipe.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error("❌ FORM: Update failed:", errorText)
          throw new Error("Failed to update recipe")
        }

        const updatedRecipe = await response.json()
        console.log("✅ FORM: Recipe updated successfully:", updatedRecipe)
        router.push(`/recipes/${recipe.id}`)
      } else {
        // Create new recipe
        console.log("🆕 FORM: Creating new recipe")
        console.log("📤 FORM: Sending data to API:", JSON.stringify(formData, null, 2))

        const response = await fetch("/api/recipes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error("❌ FORM: Create failed:", errorText)
          throw new Error("Failed to create recipe")
        }

        const newRecipe = await response.json()
        console.log("✅ FORM: Recipe created successfully:", newRecipe)
        console.log("🔍 FORM: New recipe ID:", newRecipe.id)
        console.log("🔍 FORM: New recipe name:", newRecipe.nome_receita)

        // Make sure we have a valid ID before redirecting
        if (!newRecipe.id) {
          console.error("❌ FORM: No ID returned from API!")
          throw new Error("Recipe created but no ID returned")
        }

        // Use router.push with the correct ID
        console.log("🔄 FORM: Redirecting to:", `/recipes/${newRecipe.id}`)
        router.push(`/recipes/${newRecipe.id}`)
      }
    } catch (error) {
      console.error("❌ FORM: Error saving recipe:", error)
      alert("Erro ao salvar receita. Tente novamente.")
    } finally {
      setLoading(false)
    }
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
                console.log("🔍 FORM: Recipe name changed to:", e.target.value)
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
          <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  )
}

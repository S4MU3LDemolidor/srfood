"use client"

import type React from "react"
import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Client } from "@/lib/types"
import { Camera, Upload, X } from "lucide-react"

interface ClientFormProps {
  client?: Client
}

export function ClientForm({ client }: ClientFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string>(client?.logo_url || "")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    name: client?.name || "",
    logo_url: client?.logo_url || "",
  })

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Convert file to base64 for preview and storage
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setImagePreview(result)
        setFormData({ ...formData, logo_url: result })
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
        setFormData({ ...formData, logo_url: result })
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImagePreview("")
    setFormData({ ...formData, logo_url: "" })
    if (fileInputRef.current) fileInputRef.current.value = ""
    if (cameraInputRef.current) cameraInputRef.current.value = ""
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    console.log("🔍 CLIENT FORM: Form submitted with data:", JSON.stringify(formData, null, 2))
    console.log("🔍 CLIENT FORM: Client name:", formData.name)
    console.log("🔍 CLIENT FORM: Is editing existing client?", !!client)

    try {
      if (client) {
        // Update existing client
        console.log("📝 CLIENT FORM: Updating existing client:", client.id)
        const response = await fetch(`/api/clients/${client.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error("❌ CLIENT FORM: Update failed:", errorText)
          throw new Error("Failed to update client")
        }

        console.log("✅ CLIENT FORM: Client updated successfully")
        router.push("/clients")
      } else {
        // Create new client
        console.log("🆕 CLIENT FORM: Creating new client")
        console.log("📤 CLIENT FORM: Sending data to API:", JSON.stringify(formData, null, 2))

        const response = await fetch("/api/clients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error("❌ CLIENT FORM: Create failed:", errorText)
          throw new Error("Failed to create client")
        }

        const newClient = await response.json()
        console.log("✅ CLIENT FORM: Client created successfully:", newClient)
        router.push("/clients")
      }
    } catch (error) {
      console.error("❌ CLIENT FORM: Error saving client:", error)
      alert("Erro ao salvar cliente. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Client Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Nome do Cliente *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => {
            console.log("🔍 CLIENT FORM: Client name changed to:", e.target.value)
            setFormData({ ...formData, name: e.target.value })
          }}
          required
          placeholder="Ex: Restaurante Sabor & Arte"
          className="w-full"
        />
      </div>

      {/* Logo Section - Vertical Layout */}
      <div className="space-y-4">
        <Label>Logo do Cliente (opcional)</Label>

        {/* Image Preview - Centered */}
        <div className="flex justify-center">
          {imagePreview ? (
            <div className="relative">
              <img
                src={imagePreview || "/placeholder.svg"}
                alt="Preview do logo"
                className="w-32 h-32 object-cover rounded-lg border border-gray-200"
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
            <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500">
                <Camera className="w-8 h-8 mx-auto mb-1" />
                <p className="text-xs">Nenhuma foto</p>
              </div>
            </div>
          )}
        </div>

        {/* Upload Buttons - Centered */}
        <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
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

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button type="submit" disabled={loading} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
          {loading ? "Salvando..." : client ? "Atualizar Cliente" : "Criar Cliente"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
          Cancelar
        </Button>
      </div>
    </form>
  )
}

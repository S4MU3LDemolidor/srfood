"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import type { Recipe, Step } from "@/lib/types"
import { ArrowLeft, Plus, Trash2, GripVertical, Camera, Upload, X, AlertCircle } from "lucide-react"

export default function StepsPage({ params }: { params: { id: string } }) {
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [steps, setSteps] = useState<Step[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const [newStep, setNewStep] = useState({
    passo: "",
    foto_url: "",
  })

  useEffect(() => {
    fetchData()
  }, [params.id])

  const fetchData = async () => {
    try {
      setError(null)

      // Fetch recipe details
      const recipeResponse = await fetch(`/api/recipes/${params.id}`)
      if (!recipeResponse.ok) {
        throw new Error(`Recipe not found: ${recipeResponse.status}`)
      }
      const recipeData = await recipeResponse.json()
      setRecipe(recipeData)

      // Fetch steps
      const stepsResponse = await fetch(`/api/steps/${params.id}`)
      if (!stepsResponse.ok) {
        throw new Error(`Failed to fetch steps: ${stepsResponse.status}`)
      }
      const stepsData = await stepsResponse.json()
      setSteps(Array.isArray(stepsData) ? stepsData : [])
    } catch (error) {
      console.error("Error fetching data:", error)
      setError(error instanceof Error ? error.message : "Erro ao carregar dados")
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setImagePreview(result)
        setNewStep({ ...newStep, foto_url: result })
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
        setNewStep({ ...newStep, foto_url: result })
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImagePreview("")
    setNewStep({ ...newStep, foto_url: "" })
    if (fileInputRef.current) fileInputRef.current.value = ""
    if (cameraInputRef.current) cameraInputRef.current.value = ""
  }

  const addStep = async () => {
    if (!newStep.passo.trim()) return

    setSaving(true)
    try {
      const response = await fetch(`/api/steps/${params.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newStep,
          ordem: steps.length + 1,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to add step: ${response.status}`)
      }

      const step = await response.json()
      setSteps([...steps, step])
      setNewStep({ passo: "", foto_url: "" })
      setImagePreview("")
    } catch (error) {
      console.error("Error adding step:", error)
      alert("Erro ao adicionar passo. Tente novamente.")
    } finally {
      setSaving(false)
    }
  }

  const deleteStep = async (id: string) => {
    try {
      const response = await fetch(`/api/steps/item/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(`Failed to delete step: ${response.status}`)
      }

      setSteps(steps.filter((step) => step.id !== id))
    } catch (error) {
      console.error("Error deleting step:", error)
      alert("Erro ao remover passo. Tente novamente.")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Erro ao carregar dados</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="flex gap-4 justify-center">
            <Button onClick={fetchData} variant="outline">
              Tentar Novamente
            </Button>
            <Link href="/">
              <Button>Voltar ao Início</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Receita não encontrada</h1>
          <Link href="/">
            <Button>Voltar ao início</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16">
            <Link href={`/recipes/${params.id}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Modo de Preparo - {recipe.nome_receita}</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Add New Step */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Adicionar Passo</h2>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="passo">Descrição do Passo *</Label>
              <Textarea
                id="passo"
                value={newStep.passo}
                onChange={(e) => setNewStep({ ...newStep, passo: e.target.value })}
                placeholder="Ex: Pré-aqueça o forno a 180°C e unte as formas com manteiga e farinha."
                rows={3}
                className="resize-none"
              />
            </div>

            {/* Photo Section */}
            <div className="space-y-4">
              <Label>Foto do Passo (opcional)</Label>

              {/* Image Preview */}
              {imagePreview ? (
                <div className="relative inline-block">
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt="Preview do passo"
                    className="w-48 h-32 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="w-48 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <Camera className="w-8 h-8 mx-auto mb-1" />
                    <p className="text-xs">Nenhuma foto</p>
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
          </div>

          <div className="mt-4">
            <Button onClick={addStep} disabled={saving || !newStep.passo.trim()}>
              <Plus className="w-4 h-4 mr-2" />
              {saving ? "Adicionando..." : "Adicionar Passo"}
            </Button>
          </div>
        </div>

        {/* Steps List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Lista de Passos</h2>

          {steps.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Nenhum passo adicionado</p>
          ) : (
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div key={step.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center gap-2 text-gray-400 flex-shrink-0">
                      <GripVertical className="w-4 h-4" />
                      <div className="w-8 h-8 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 mb-3">{step.passo}</p>
                      {step.foto_url && (
                        <div className="relative w-full max-w-md h-32 rounded-lg overflow-hidden mb-3">
                          <Image
                            src={step.foto_url || "/placeholder.svg"}
                            alt={`Passo ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteStep(step.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FileDown } from "lucide-react"
import type { Recipe } from "@/lib/types"
import { generateRecipePDF } from "@/lib/pdf-generator"

interface PDFDownloadButtonProps {
  recipe: Recipe
}

export function PDFDownloadButton({ recipe }: PDFDownloadButtonProps) {
  const [generating, setGenerating] = useState(false)

  const handleDownload = async () => {
    setGenerating(true)
    try {
      const pdfBlob = await generateRecipePDF(recipe)
      const url = URL.createObjectURL(pdfBlob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${recipe.nome_receita.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Erro ao gerar ficha. Tente novamente.")
    } finally {
      setGenerating(false)
    }
  }

  return (
    <Button onClick={handleDownload} disabled={generating} className="bg-emerald-600 hover:bg-emerald-700">
      <FileDown className="w-4 h-4 mr-2" />
      {generating ? "Gerando Ficha..." : "Gerar Ficha"}
    </Button>
  )
}

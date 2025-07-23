import jsPDF from "jspdf"
import type { Recipe } from "./types"

// Helper function to convert base64 to image and get dimensions
async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

// Helper function to resize image to fit within bounds
function calculateImageDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number,
): { width: number; height: number } {
  const aspectRatio = originalWidth / originalHeight

  let width = maxWidth
  let height = maxWidth / aspectRatio

  if (height > maxHeight) {
    height = maxHeight
    width = maxHeight * aspectRatio
  }

  return { width, height }
}

export async function generateRecipePDF(recipe: Recipe): Promise<Blob> {
  const pdf = new jsPDF()

  // Set up colors
  const primaryColor = [16, 185, 129] // emerald-500
  const textColor = [31, 41, 55] // gray-800
  const lightGray = [243, 244, 246] // gray-100

  let yPosition = 20

  // Header with Sr. Food Safety Logo
  pdf.setFillColor(...primaryColor)
  pdf.rect(0, 0, 210, 40, "F")

  pdf.setTextColor(255, 255, 255)
  pdf.setFontSize(14)
  pdf.setFont("helvetica", "bold")
  pdf.text("Sr. FOOD SAFETY", 20, 20)

  pdf.setFontSize(18)
  pdf.setFont("helvetica", "bold")
  pdf.text("FICHA TÉCNICA DE RECEITA", 20, 35)

  yPosition = 60

  // Client Section - Name and Logo
  if (recipe.client) {
    pdf.setFillColor(248, 250, 252)
    pdf.rect(20, yPosition - 5, 170, 30, "F")

    pdf.setTextColor(...textColor)
    pdf.setFontSize(12)
    pdf.setFont("helvetica", "bold")
    pdf.text("CLIENTE:", 25, yPosition + 5)

    // Client name
    pdf.setFont("helvetica", "normal")
    pdf.setFontSize(11)
    pdf.text(recipe.client.name, 25, yPosition + 15)

    // Client logo
    if (recipe.client.logo_url) {
      try {
        const img = await loadImage(recipe.client.logo_url)
        const { width, height } = calculateImageDimensions(img.width, img.height, 25, 20)
        pdf.addImage(recipe.client.logo_url, "JPEG", 150, yPosition, width, height)
      } catch (error) {
        console.log("Could not add client logo to PDF:", error)
        pdf.setFontSize(8)
        pdf.setTextColor(100, 100, 100)
        pdf.text("[LOGO DO CLIENTE]", 150, yPosition + 10)
      }
    }

    yPosition += 40
  }

  // Recipe title
  pdf.setTextColor(...textColor)
  pdf.setFontSize(16)
  pdf.setFont("helvetica", "bold")
  pdf.text(recipe.nome_receita, 20, yPosition)
  yPosition += 15

  // Recipe details
  pdf.setFontSize(10)
  pdf.setFont("helvetica", "normal")

  const details = [
    ["Tipo:", recipe.tipo_ficha],
    ["Tempo de Preparo:", recipe.tempo_preparo || "N/A"],
    ["Rendimento:", recipe.rendimento || "N/A"],
    ["Peso da Preparação:", recipe.peso_preparacao || "N/A"],
    ["Peso da Porção:", recipe.peso_porcao || "N/A"],
    ["Realizado por:", recipe.realizado_por || "N/A"],
    ["Aprovado por:", recipe.aprovado_por || "N/A"],
  ]

  details.forEach(([label, value]) => {
    pdf.setFont("helvetica", "bold")
    pdf.text(label, 20, yPosition)
    pdf.setFont("helvetica", "normal")
    pdf.text(value, 60, yPosition)
    yPosition += 8
  })

  yPosition += 10

  // Ingredients section
  if (recipe.ingredients && recipe.ingredients.length > 0) {
    pdf.setFontSize(14)
    pdf.setFont("helvetica", "bold")
    pdf.text("INGREDIENTES", 20, yPosition)
    yPosition += 10

    // Table header
    pdf.setFillColor(...lightGray)
    pdf.rect(20, yPosition - 5, 170, 8, "F")
    pdf.setFontSize(10)
    pdf.setFont("helvetica", "bold")
    pdf.text("Ingrediente", 25, yPosition)
    pdf.text("Quantidade", 100, yPosition)
    pdf.text("Medida Caseira", 140, yPosition)
    yPosition += 10

    // Table rows
    pdf.setFont("helvetica", "normal")
    recipe.ingredients.forEach((ingredient, index) => {
      if (yPosition > 270) {
        pdf.addPage()
        yPosition = 20
      }

      if (index % 2 === 0) {
        pdf.setFillColor(250, 250, 250)
        pdf.rect(20, yPosition - 5, 170, 8, "F")
      }

      const ingredientName = ingredient.subficha
        ? `${ingredient.subficha.nome_receita} (Subficha)`
        : ingredient.ingrediente

      pdf.text(ingredientName, 25, yPosition)
      pdf.text(ingredient.quantidade || "", 100, yPosition)
      pdf.text(ingredient.medida_caseira || "", 140, yPosition)
      yPosition += 8
    })
  }

  yPosition += 15

  // Steps section with photos
  if (recipe.steps && recipe.steps.length > 0) {
    if (yPosition > 250) {
      pdf.addPage()
      yPosition = 20
    }

    pdf.setFontSize(14)
    pdf.setFont("helvetica", "bold")
    pdf.text("MODO DE PREPARO", 20, yPosition)
    yPosition += 15

    pdf.setFontSize(10)
    pdf.setFont("helvetica", "normal")

    for (let index = 0; index < recipe.steps.length; index++) {
      const step = recipe.steps[index]

      // Calculate space needed for this step
      const lines = pdf.splitTextToSize(step.passo, 150)
      const textHeight = lines.length * 5
      const photoHeight = step.foto_url ? 60 : 0
      const totalStepHeight = textHeight + photoHeight + 20

      // Check if we need a new page
      if (yPosition + totalStepHeight > 280) {
        pdf.addPage()
        yPosition = 20
      }

      // Step number and text
      pdf.setFont("helvetica", "bold")
      pdf.text(`${index + 1}º Passo:`, 20, yPosition)
      pdf.setFont("helvetica", "normal")

      pdf.text(lines, 20, yPosition + 8)
      yPosition += 8 + textHeight + 5

      // Add step photo if available
      if (step.foto_url) {
        try {
          const img = await loadImage(step.foto_url)
          const { width, height } = calculateImageDimensions(img.width, img.height, 80, 60)

          // Add a border around the image
          pdf.setDrawColor(200, 200, 200)
          pdf.rect(20, yPosition, width + 2, height + 2)

          pdf.addImage(step.foto_url, "JPEG", 21, yPosition + 1, width, height)

          // Add caption
          pdf.setFontSize(8)
          pdf.setTextColor(100, 100, 100)
          pdf.text(`Passo ${index + 1}`, 20, yPosition + height + 10)

          yPosition += height + 15
        } catch (error) {
          console.log(`Could not add photo for step ${index + 1}:`, error)
          // Fallback: show placeholder
          pdf.setFillColor(240, 240, 240)
          pdf.rect(20, yPosition, 80, 50, "F")

          pdf.setFontSize(8)
          pdf.setTextColor(100, 100, 100)
          pdf.text(`[FOTO DO PASSO ${index + 1}]`, 25, yPosition + 25)

          yPosition += 60
        }
      } else {
        yPosition += 10
      }
    }
  }

  // Footer with Sr. Food Safety branding
  const pageCount = pdf.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i)
    pdf.setFontSize(8)
    pdf.setTextColor(128, 128, 128)
    pdf.text(`Página ${i} de ${pageCount}`, 170, 290)
    pdf.text("Gerado em: " + new Date().toLocaleDateString("pt-BR"), 20, 290)

    // Add Sr. Food Safety footer
    pdf.setTextColor(...primaryColor)
    pdf.text("Sr. Food Safety - Sistema de Gestão de Receitas", 20, 285)
  }

  return pdf.output("blob")
}

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

// Helper function to load the Sr. Food Safety logo
async function loadSrFoodSafetyLogo(): Promise<string> {
  try {
    const response = await fetch("/images/sr-food-safety-logo.png")
    const blob = await response.blob()
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch (error) {
    console.log("Could not load Sr. Food Safety logo:", error)
    return ""
  }
}

export async function generateRecipePDF(recipe: Recipe): Promise<Blob> {
  const pdf = new jsPDF()

  // Set up colors
  const primaryColor = [16, 185, 129] // emerald-500
  const textColor = [31, 41, 55] // gray-800
  const lightGray = [243, 244, 246] // gray-100

  let yPosition = 20

  // Simple header without logo
  pdf.setFillColor(...primaryColor)
  pdf.rect(0, 0, 210, 35, "F")

  pdf.setTextColor(255, 255, 255)
  pdf.setFontSize(20)
  pdf.setFont("helvetica", "bold")
  pdf.text("FICHA TÉCNICA DE RECEITA", 20, 25)

  yPosition = 55

  // Client Section - Name and Logo
  if (recipe.client) {
    pdf.setFillColor(248, 250, 252) // light gray background
    pdf.rect(20, yPosition - 5, 170, 35, "F")

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
        const { width, height } = calculateImageDimensions(img.width, img.height, 30, 25)
        pdf.addImage(recipe.client.logo_url, "JPEG", 150, yPosition + 2, width, height)
      } catch (error) {
        console.log("Could not add client logo to PDF:", error)
        pdf.setFontSize(8)
        pdf.setTextColor(100, 100, 100)
        pdf.text("[LOGO DO CLIENTE]", 150, yPosition + 15)
      }
    }

    yPosition += 45
  }

  // Recipe title and image section
  pdf.setTextColor(...textColor)
  pdf.setFontSize(16)
  pdf.setFont("helvetica", "bold")
  pdf.text(recipe.nome_receita, 20, yPosition)
  yPosition += 15

  // Add recipe image if available
  if (recipe.foto_produto_url) {
    try {
      const img = await loadImage(recipe.foto_produto_url)
      const { width, height } = calculateImageDimensions(img.width, img.height, 80, 60)

      // Add a subtle border around the image
      pdf.setDrawColor(200, 200, 200)
      pdf.setLineWidth(0.5)
      pdf.rect(20, yPosition, width + 2, height + 2)

      // Add the recipe image
      pdf.addImage(recipe.foto_produto_url, "JPEG", 21, yPosition + 1, width, height)

      // Add caption
      pdf.setFontSize(8)
      pdf.setTextColor(100, 100, 100)
      pdf.text("Foto da Receita", 20, yPosition + height + 8)

      yPosition += height + 15
    } catch (error) {
      console.log("Could not add recipe image to PDF:", error)
      // Fallback: show placeholder
      pdf.setFillColor(240, 240, 240)
      pdf.setDrawColor(200, 200, 200)
      pdf.rect(20, yPosition, 80, 60, "FD")

      pdf.setFontSize(8)
      pdf.setTextColor(100, 100, 100)
      pdf.text("[FOTO DA RECEITA]", 25, yPosition + 25)
      pdf.text("Imagem não disponível", 25, yPosition + 35)

      yPosition += 70
    }
  }

  // Recipe details
  pdf.setTextColor(...textColor)
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
      if (yPosition > 250) {
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
    if (yPosition > 230) {
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
      const photoHeight = step.foto_url ? 70 : 0
      const totalStepHeight = textHeight + photoHeight + 25

      // Check if we need a new page
      if (yPosition + totalStepHeight > 260) {
        pdf.addPage()
        yPosition = 20
      }

      // Step number and text
      pdf.setFont("helvetica", "bold")
      pdf.text(`${index + 1}º Passo:`, 20, yPosition)
      pdf.setFont("helvetica", "normal")

      pdf.text(lines, 20, yPosition + 8)
      yPosition += 8 + textHeight + 8

      // Add step photo if available
      if (step.foto_url) {
        try {
          const img = await loadImage(step.foto_url)
          const { width, height } = calculateImageDimensions(img.width, img.height, 90, 60)

          // Add a subtle border around the image
          pdf.setDrawColor(200, 200, 200)
          pdf.setLineWidth(0.5)
          pdf.rect(20, yPosition, width + 2, height + 2)

          // Add the image
          pdf.addImage(step.foto_url, "JPEG", 21, yPosition + 1, width, height)

          // Add caption
          pdf.setFontSize(8)
          pdf.setTextColor(100, 100, 100)
          pdf.text(`Foto do Passo ${index + 1}`, 20, yPosition + height + 8)

          yPosition += height + 15
        } catch (error) {
          console.log(`Could not add photo for step ${index + 1}:`, error)
          // Fallback: show placeholder
          pdf.setFillColor(240, 240, 240)
          pdf.setDrawColor(200, 200, 200)
          pdf.rect(20, yPosition, 90, 60, "FD")

          pdf.setFontSize(8)
          pdf.setTextColor(100, 100, 100)
          pdf.text(`[FOTO DO PASSO ${index + 1}]`, 25, yPosition + 30)
          pdf.text("Imagem não disponível", 25, yPosition + 40)

          yPosition += 70
        }
      } else {
        yPosition += 15
      }
    }
  }

  // Load the Sr. Food Safety logo for footer
  const logoBase64 = await loadSrFoodSafetyLogo()

  // Footer with Sr. Food Safety logo and branding
  const pageCount = pdf.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i)

    // Page info
    pdf.setFontSize(8)
    pdf.setTextColor(128, 128, 128)
    pdf.text(`Página ${i} de ${pageCount}`, 170, 290)
    pdf.text("Gerado em: " + new Date().toLocaleDateString("pt-BR"), 20, 290)

    // Add Sr. Food Safety logo in footer - centered and larger
    if (logoBase64) {
      try {
        const img = await loadImage(logoBase64)
        // Make the logo larger and center it
        const { width, height } = calculateImageDimensions(img.width, img.height, 60, 20)
        const centerX = (210 - width) / 2 // Center horizontally on A4 page (210mm width)

        pdf.addImage(logoBase64, "PNG", centerX, 270, width, height)

        // Add text below the centered logo
        pdf.setTextColor(...primaryColor)
        pdf.setFontSize(8)
        pdf.text("Sistema de Gestão de Receitas", centerX + width / 2 - 30, 285)
      } catch (error) {
        console.log("Could not add logo to footer:", error)
        // Fallback text
        pdf.setTextColor(...primaryColor)
        pdf.setFontSize(8)
        pdf.text("Sr. Food Safety - Sistema de Gestão de Receitas", 70, 280)
      }
    } else {
      // Fallback text
      pdf.setTextColor(...primaryColor)
      pdf.setFontSize(8)
      pdf.text("Sr. Food Safety - Sistema de Gestão de Receitas", 70, 280)
    }
  }

  return pdf.output("blob")
}

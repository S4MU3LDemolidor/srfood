import jsPDF from "jspdf"
import type { Recipe } from "./types"

// Helper function to convert base64 to image and get dimensions
async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`))
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

// Helper function to add a styled section header
function addSectionHeader(pdf: jsPDF, title: string, yPos: number): number {
  // Background for section header
  pdf.setFillColor(248, 250, 252) // gray-50
  pdf.rect(15, yPos - 8, 180, 16, "F")

  // Border
  pdf.setDrawColor(16, 185, 129) // emerald-500
  pdf.setLineWidth(0.8)
  pdf.line(15, yPos - 8, 195, yPos - 8)

  // Title text
  pdf.setTextColor(16, 185, 129) // emerald-500
  pdf.setFontSize(14)
  pdf.setFont("helvetica", "bold")
  pdf.text(title, 20, yPos)

  return yPos + 20
}

// Helper function to add a styled info box
function addInfoBox(pdf: jsPDF, title: string, content: string, x: number, y: number, width: number): void {
  // Box background
  pdf.setFillColor(255, 255, 255)
  pdf.rect(x, y, width, 20, "F")

  // Box border
  pdf.setDrawColor(229, 231, 235) // gray-200
  pdf.setLineWidth(0.5)
  pdf.rect(x, y, width, 20, "D")

  // Title
  pdf.setTextColor(75, 85, 99) // gray-600
  pdf.setFontSize(8)
  pdf.setFont("helvetica", "bold")
  pdf.text(title.toUpperCase(), x + 5, y + 8)

  // Content
  pdf.setTextColor(31, 41, 55) // gray-800
  pdf.setFontSize(10)
  pdf.setFont("helvetica", "normal")
  pdf.text(content, x + 5, y + 16)
}

// Helper function to check page space
function checkPageSpace(pdf: jsPDF, currentY: number, requiredSpace: number): number {
  // If we don't have enough space (considering footer at 280), start new page
  if (currentY + requiredSpace > 270) {
    pdf.addPage()
    return 20 // Return to top margin
  }
  return currentY
}

export async function generateRecipePDF(recipe: Recipe): Promise<Blob> {
  const pdf = new jsPDF()

  // Set up colors
  const primaryColor: [number, number, number] = [16, 185, 129] // emerald-500
  const primaryDark: [number, number, number] = [5, 150, 105] // emerald-600
  const textColor: [number, number, number] = [31, 41, 55] // gray-800
  const textLight: [number, number, number] = [75, 85, 99] // gray-600
  const lightGray: [number, number, number] = [248, 250, 252] // gray-50
  const borderGray: [number, number, number] = [229, 231, 235] // gray-200

  let yPosition = 25

  // Enhanced Header with Sr. Food Safety logo
  pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
  pdf.rect(0, 0, 210, 60, "F")

  // Add gradient effect with darker shade
  pdf.setFillColor(primaryDark[0], primaryDark[1], primaryDark[2])
  pdf.rect(0, 0, 210, 30, "F")

  // Add Sr. Food Safety logo
  try {
    const logoImg = await loadImage("/images/sr-food-safety-logo.png")
    const { width: logoWidth, height: logoHeight } = calculateImageDimensions(logoImg.width, logoImg.height, 80, 25)

    // Center the logo horizontally
    const logoX = (210 - logoWidth) / 2
    pdf.addImage("/images/sr-food-safety-logo.png", "PNG", logoX, 8, logoWidth, logoHeight)
  } catch (error) {
    // Fallback text
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(18)
    pdf.setFont("helvetica", "bold")
    const fallbackText = "Sr. FOOD SAFETY"
    const fallbackWidth = pdf.getTextWidth(fallbackText)
    const fallbackX = (210 - fallbackWidth) / 2
    pdf.text(fallbackText, fallbackX, 20)
  }

  // Enhanced title with better typography
  pdf.setTextColor(255, 255, 255)
  pdf.setFontSize(16)
  pdf.setFont("helvetica", "bold")
  const titleWidth = pdf.getTextWidth("FICHA TÉCNICA DE RECEITA")
  const titleX = (210 - titleWidth) / 2
  pdf.text("FICHA TÉCNICA DE RECEITA", titleX, 50)

  yPosition = 80

  // Client section with proper spacing
  if (recipe.client) {
    pdf.setFillColor(lightGray[0], lightGray[1], lightGray[2])
    pdf.rect(15, yPosition - 10, 180, 35, "F")
    pdf.setDrawColor(borderGray[0], borderGray[1], borderGray[2])
    pdf.setLineWidth(0.5)
    pdf.rect(15, yPosition - 10, 180, 35, "D")

    pdf.setTextColor(textColor[0], textColor[1], textColor[2])
    pdf.setFontSize(12)
    pdf.setFont("helvetica", "bold")
    pdf.text("CLIENTE:", 20, yPosition)

    // Client name
    pdf.setFont("helvetica", "normal")
    pdf.setFontSize(11)
    pdf.text(recipe.client.name, 20, yPosition + 12)

    // Client logo
    if (recipe.client.logo_url) {
      try {
        const img = await loadImage(recipe.client.logo_url)
        const { width, height } = calculateImageDimensions(img.width, img.height, 30, 25)
        pdf.addImage(recipe.client.logo_url, "JPEG", 160, yPosition - 5, width, height)
      } catch (error) {
        pdf.setFontSize(8)
        pdf.setTextColor(100, 100, 100)
        pdf.text("[LOGO DO CLIENTE]", 160, yPosition + 5)
      }
    }

    yPosition += 50
  }

  // Recipe name with enhanced styling
  pdf.setFillColor(lightGray[0], lightGray[1], lightGray[2])
  pdf.rect(15, yPosition - 10, 180, 25, "F")
  pdf.setDrawColor(borderGray[0], borderGray[1], borderGray[2])
  pdf.setLineWidth(0.5)
  pdf.rect(15, yPosition - 10, 180, 25, "D")

  pdf.setTextColor(textColor[0], textColor[1], textColor[2])
  pdf.setFontSize(18)
  pdf.setFont("helvetica", "bold")

  // Better centering calculation for recipe name
  const recipeNameWidth = pdf.getTextWidth(recipe.nome_receita)
  const recipeNameX = 15 + (180 - recipeNameWidth) / 2 // Center within the container
  pdf.text(recipe.nome_receita, recipeNameX, yPosition + 2)

  yPosition += 35

  // Recipe image section
  if (recipe.foto_produto_url) {
    try {
      const img = await loadImage(recipe.foto_produto_url)
      const { width, height } = calculateImageDimensions(img.width, img.height, 80, 60)

      // Center the image
      const imageX = (210 - width) / 2

      // Add white border
      pdf.setFillColor(255, 255, 255)
      pdf.rect(imageX - 1, yPosition - 1, width + 2, height + 2, "F")

      // Add the recipe image
      pdf.addImage(recipe.foto_produto_url, "JPEG", imageX, yPosition, width, height)

      // Add border
      pdf.setDrawColor(borderGray[0], borderGray[1], borderGray[2])
      pdf.setLineWidth(0.8)
      pdf.rect(imageX - 1, yPosition - 1, width + 2, height + 2, "D")

      yPosition += height + 15
    } catch (error) {
      yPosition += 10
    }
  }

  // Recipe details with enhanced info boxes
  yPosition = checkPageSpace(pdf, yPosition, 50)
  yPosition = addSectionHeader(pdf, "INFORMAÇÕES DA RECEITA", yPosition)

  const details = [
    ["Tipo", recipe.tipo_ficha],
    ["Tempo de Preparo", recipe.tempo_preparo || "N/A"],
    ["Rendimento", recipe.rendimento || "N/A"],
    ["Peso da Preparação", recipe.peso_preparacao || "N/A"],
    ["Peso da Porção", recipe.peso_porcao || "N/A"],
    ["Realizado por", recipe.realizado_por || "N/A"],
    ["Aprovado por", recipe.aprovado_por || "N/A"],
  ]

  // Arrange details in a grid (3 columns, multiple rows)
  const boxWidth = 55
  const boxSpacing = 5
  let currentRow = 0
  let currentCol = 0

  details.forEach(([label, value]) => {
    const x = 20 + currentCol * (boxWidth + boxSpacing)
    const y = yPosition + currentRow * 25

    addInfoBox(pdf, label, value, x, y, boxWidth)

    currentCol++
    if (currentCol >= 3) {
      currentCol = 0
      currentRow++
    }
  })

  yPosition += Math.ceil(details.length / 3) * 25 + 25

  // Utensils section if available
  if (recipe.utensilios_necessarios) {
    yPosition = checkPageSpace(pdf, yPosition, 45)
    yPosition = addSectionHeader(pdf, "UTENSÍLIOS NECESSÁRIOS", yPosition)

    pdf.setFillColor(255, 255, 255)
    pdf.rect(15, yPosition, 180, 25, "F")
    pdf.setDrawColor(borderGray[0], borderGray[1], borderGray[2])
    pdf.setLineWidth(0.5)
    pdf.rect(15, yPosition, 180, 25, "D")

    pdf.setTextColor(textColor[0], textColor[1], textColor[2])
    pdf.setFontSize(10)
    pdf.setFont("helvetica", "normal")
    const utensilLines = pdf.splitTextToSize(recipe.utensilios_necessarios, 170)
    pdf.text(utensilLines, 20, yPosition + 8)

    yPosition += 40
  }

  // Ingredients section
  if (recipe.ingredients && recipe.ingredients.length > 0) {
    yPosition = checkPageSpace(pdf, yPosition, 60)
    if (yPosition > 220) {
      pdf.addPage()
      yPosition = 20
    }

    yPosition = addSectionHeader(pdf, "INGREDIENTES", yPosition)

    // Enhanced table header
    pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
    pdf.rect(15, yPosition, 180, 10, "F")

    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(10)
    pdf.setFont("helvetica", "bold")
    pdf.text("INGREDIENTE", 20, yPosition + 7)
    pdf.text("QUANTIDADE", 105, yPosition + 7)
    pdf.text("MEDIDA CASEIRA", 145, yPosition + 7)
    yPosition += 10

    // Table rows
    pdf.setFont("helvetica", "normal")
    pdf.setFontSize(9)

    recipe.ingredients.forEach((ingredient, index) => {
      if (yPosition > 260) {
        pdf.addPage()
        yPosition = 20
      }

      // Alternating row colors
      if (index % 2 === 0) {
        pdf.setFillColor(249, 250, 251)
      } else {
        pdf.setFillColor(255, 255, 255)
      }
      pdf.rect(15, yPosition, 180, 8, "F")

      // Row border
      pdf.setDrawColor(borderGray[0], borderGray[1], borderGray[2])
      pdf.setLineWidth(0.2)
      pdf.rect(15, yPosition, 180, 8, "D")

      const ingredientName = ingredient.subficha
        ? `${ingredient.subficha.nome_receita} (Subficha)`
        : ingredient.ingrediente

      // Ingredient name with special styling for subfichas
      if (ingredient.subficha) {
        pdf.setTextColor(59, 130, 246)
        pdf.setFont("helvetica", "bold")
      } else {
        pdf.setTextColor(textColor[0], textColor[1], textColor[2])
        pdf.setFont("helvetica", "normal")
      }
      pdf.text(ingredientName, 20, yPosition + 6)

      // Quantity and measure
      pdf.setTextColor(textColor[0], textColor[1], textColor[2])
      pdf.setFont("helvetica", "normal")
      pdf.text(ingredient.quantidade || "", 105, yPosition + 6)
      pdf.text(ingredient.medida_caseira || "", 145, yPosition + 6)

      yPosition += 8
    })

    yPosition += 15
  }

  // Steps section
  if (recipe.steps && recipe.steps.length > 0) {
    yPosition = checkPageSpace(pdf, yPosition, 80)
    if (yPosition > 180) {
      pdf.addPage()
      yPosition = 20
    }

    yPosition = addSectionHeader(pdf, "MODO DE PREPARO", yPosition)

    for (let index = 0; index < recipe.steps.length; index++) {
      const step = recipe.steps[index]

      const lines = pdf.splitTextToSize(step.passo, step.foto_url ? 110 : 160)
      const textHeight = lines.length * 4
      const photoHeight = step.foto_url ? 45 : 0
      const totalStepHeight = Math.max(textHeight + 20, photoHeight + 15)

      if (yPosition + totalStepHeight > 250) {
        pdf.addPage()
        yPosition = 20
      }

      // Step container
      pdf.setFillColor(255, 255, 255)
      pdf.rect(15, yPosition, 180, totalStepHeight, "F")
      pdf.setDrawColor(borderGray[0], borderGray[1], borderGray[2])
      pdf.setLineWidth(0.3)
      pdf.rect(15, yPosition, 180, totalStepHeight, "D")

      // Step number circle
      const stepCircleX = 30
      const stepCircleY = yPosition + 12
      pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
      pdf.circle(stepCircleX, stepCircleY, 6, "F")

      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(10)
      pdf.setFont("helvetica", "bold")
      const stepNum = (index + 1).toString()
      const stepNumWidth = pdf.getTextWidth(stepNum)
      pdf.text(stepNum, stepCircleX - stepNumWidth / 2, stepCircleY + 3)

      // Step text
      pdf.setTextColor(textColor[0], textColor[1], textColor[2])
      pdf.setFontSize(9)
      pdf.setFont("helvetica", "normal")

      if (step.foto_url) {
        // Side-by-side layout: text on left, photo on right
        pdf.text(lines, 40, yPosition + 8)

        try {
          const img = await loadImage(step.foto_url)
          const { width, height } = calculateImageDimensions(img.width, img.height, 60, 40)

          // Position photo on the right side
          const imageX = 135
          const imageY = yPosition + 5

          // Add the image
          pdf.addImage(step.foto_url, "JPEG", imageX, imageY, width, height)

          // Thin border
          pdf.setDrawColor(borderGray[0], borderGray[1], borderGray[2])
          pdf.setLineWidth(0.5)
          pdf.rect(imageX, imageY, width, height, "D")
        } catch (error) {
          // Fallback placeholder
          pdf.setFillColor(248, 250, 252)
          pdf.setDrawColor(borderGray[0], borderGray[1], borderGray[2])
          pdf.rect(135, yPosition + 5, 60, 40, "FD")

          pdf.setFontSize(7)
          pdf.setTextColor(textLight[0], textLight[1], textLight[2])
          pdf.setFont("helvetica", "italic")
          const placeholderText = `[FOTO ${index + 1}]`
          const placeholderWidth = pdf.getTextWidth(placeholderText)
          pdf.text(placeholderText, 135 + (60 - placeholderWidth) / 2, yPosition + 25)
        }
      } else {
        // Full width text when no photo
        pdf.text(lines, 40, yPosition + 8)
      }

      yPosition += totalStepHeight + 8
    }

    yPosition += 10
  }

  // Enhanced Footer
  const pageCount = pdf.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i)

    // Footer background
    pdf.setFillColor(lightGray[0], lightGray[1], lightGray[2])
    pdf.rect(0, 280, 210, 17, "F")

    // Page info
    pdf.setFontSize(9)
    pdf.setTextColor(textLight[0], textLight[1], textLight[2])
    pdf.setFont("helvetica", "normal")
    pdf.text(`Página ${i} de ${pageCount}`, 175, 290)
    pdf.text("Gerado em: " + new Date().toLocaleDateString("pt-BR"), 20, 290)

    // Add Sr. Food Safety logo in footer
    try {
      const logoImg = await loadImage("/images/sr-food-safety-logo.png")
      const { width, height } = calculateImageDimensions(logoImg.width, logoImg.height, 40, 8)
      const centerX = (210 - width) / 2

      pdf.addImage("/images/sr-food-safety-logo.png", "PNG", centerX, 270, width, height)
    } catch (error) {
      // Fallback text
      pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
      pdf.setFontSize(9)
      pdf.setFont("helvetica", "bold")
      const fallbackText = "Sr. Food Safety - Sistema de Gestão de Receitas"
      const fallbackTextWidth = pdf.getTextWidth(fallbackText)
      const fallbackTextX = (210 - fallbackTextWidth) / 2
      pdf.text(fallbackText, fallbackTextX, 290)
    }
  }

  return pdf.output("blob")
}

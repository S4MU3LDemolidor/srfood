import jsPDF from "jspdf"
import { getRecipesWithClients, getClients, getIngredients } from "./data-manager"
import { generateStatistics } from "./statistics"

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

// Helper function to add header to PDF
async function addReportHeader(pdf: jsPDF, title: string, subtitle?: string): Promise<number> {
  // Header background
  pdf.setFillColor(16, 185, 129) // emerald-500
  pdf.rect(0, 0, 210, 40, "F")

  // Add Sr. Food Safety logo if available
  try {
    const logoImg = await loadImage("/images/sr-food-safety-logo.png")
    const logoWidth = 60
    const logoHeight = 20
    const logoX = (210 - logoWidth) / 2
    pdf.addImage("/images/sr-food-safety-logo.png", "PNG", logoX, 5, logoWidth, logoHeight)
  } catch (error) {
    // Fallback text
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(16)
    pdf.setFont("helvetica", "bold")
    const fallbackText = "Sr. FOOD SAFETY"
    const fallbackWidth = pdf.getTextWidth(fallbackText)
    const fallbackX = (210 - fallbackWidth) / 2
    pdf.text(fallbackText, fallbackX, 15)
  }

  // Title
  pdf.setTextColor(255, 255, 255)
  pdf.setFontSize(14)
  pdf.setFont("helvetica", "bold")
  const titleWidth = pdf.getTextWidth(title)
  const titleX = (210 - titleWidth) / 2
  pdf.text(title, titleX, 32)

  // Subtitle if provided
  if (subtitle) {
    pdf.setFontSize(10)
    pdf.setFont("helvetica", "normal")
    const subtitleWidth = pdf.getTextWidth(subtitle)
    const subtitleX = (210 - subtitleWidth) / 2
    pdf.text(subtitle, subtitleX, 38)
  }

  return 50 // Return Y position after header
}

// Helper function to add footer
function addReportFooter(pdf: jsPDF, pageNum: number, totalPages: number): void {
  const pageHeight = pdf.internal.pageSize.height

  // Footer background
  pdf.setFillColor(248, 250, 252) // gray-50
  pdf.rect(0, pageHeight - 20, 210, 20, "F")

  // Page info
  pdf.setFontSize(9)
  pdf.setTextColor(75, 85, 99) // gray-600
  pdf.setFont("helvetica", "normal")
  pdf.text(`Página ${pageNum} de ${totalPages}`, 175, pageHeight - 10)
  pdf.text("Gerado em: " + new Date().toLocaleDateString("pt-BR"), 20, pageHeight - 10)

  // Center text
  const centerText = "Sr. Food Safety - Sistema de Gestão de Receitas"
  const centerTextWidth = pdf.getTextWidth(centerText)
  const centerTextX = (210 - centerTextWidth) / 2
  pdf.text(centerText, centerTextX, pageHeight - 5)
}

// Helper function to check page space and add new page if needed
function checkPageSpace(pdf: jsPDF, currentY: number, requiredSpace: number): number {
  if (currentY + requiredSpace > 250) {
    pdf.addPage()
    return 20
  }
  return currentY
}

// 1. Recipes Summary Report
export async function generateRecipesSummaryReport(): Promise<Blob> {
  const pdf = new jsPDF()
  const recipes = getRecipesWithClients()

  let yPosition = await addReportHeader(pdf, "RELATÓRIO DE RECEITAS", `Total: ${recipes.length} receitas`)
  yPosition += 10

  // Summary section
  pdf.setFillColor(248, 250, 252)
  pdf.rect(15, yPosition, 180, 30, "F")
  pdf.setDrawColor(229, 231, 235)
  pdf.rect(15, yPosition, 180, 30, "D")

  pdf.setTextColor(31, 41, 55)
  pdf.setFontSize(12)
  pdf.setFont("helvetica", "bold")
  pdf.text("RESUMO GERAL", 20, yPosition + 10)

  pdf.setFontSize(10)
  pdf.setFont("helvetica", "normal")
  const normalRecipes = recipes.filter((r) => r.tipo_ficha === "Normal").length
  const subfichas = recipes.filter((r) => r.tipo_ficha === "Subficha").length
  const uniqueClients = new Set(recipes.map((r) => r.client_id).filter(Boolean)).size

  pdf.text(`• Receitas Normais: ${normalRecipes}`, 20, yPosition + 18)
  pdf.text(`• Subfichas: ${subfichas}`, 20, yPosition + 25)
  pdf.text(`• Clientes Únicos: ${uniqueClients}`, 100, yPosition + 18)
  pdf.text(`• Data do Relatório: ${new Date().toLocaleDateString("pt-BR")}`, 100, yPosition + 25)

  yPosition += 45

  // Recipes list
  pdf.setFontSize(12)
  pdf.setFont("helvetica", "bold")
  pdf.setTextColor(16, 185, 129)
  pdf.text("LISTA DETALHADA DE RECEITAS", 20, yPosition)
  yPosition += 15

  for (let i = 0; i < recipes.length; i++) {
    const recipe = recipes[i]

    yPosition = checkPageSpace(pdf, yPosition, 40)

    // Recipe card
    pdf.setFillColor(255, 255, 255)
    pdf.rect(15, yPosition, 180, 35, "F")
    pdf.setDrawColor(229, 231, 235)
    pdf.rect(15, yPosition, 180, 35, "D")

    // Recipe name
    pdf.setTextColor(31, 41, 55)
    pdf.setFontSize(11)
    pdf.setFont("helvetica", "bold")
    pdf.text(recipe.nome_receita, 20, yPosition + 10)

    // Recipe details
    pdf.setFontSize(9)
    pdf.setFont("helvetica", "normal")
    pdf.setTextColor(75, 85, 99)

    const details = [
      `Tipo: ${recipe.tipo_ficha}`,
      `Cliente: ${recipe.client?.name || "Sem cliente"}`,
      `Tempo: ${recipe.tempo_preparo || "N/A"}`,
      `Rendimento: ${recipe.rendimento || "N/A"}`,
    ]

    pdf.text(details[0], 20, yPosition + 18)
    pdf.text(details[1], 20, yPosition + 25)
    pdf.text(details[2], 110, yPosition + 18)
    pdf.text(details[3], 110, yPosition + 25)

    // Creation date
    pdf.text(`Criado em: ${new Date(recipe.created_at).toLocaleDateString("pt-BR")}`, 20, yPosition + 32)

    yPosition += 45
  }

  // Add footers to all pages
  const totalPages = pdf.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i)
    addReportFooter(pdf, i, totalPages)
  }

  return pdf.output("blob")
}

// 2. Clients Summary Report
export async function generateClientsSummaryReport(): Promise<Blob> {
  const pdf = new jsPDF()
  const clients = getClients()
  const recipes = getRecipesWithClients()

  let yPosition = await addReportHeader(pdf, "RELATÓRIO DE CLIENTES", `Total: ${clients.length} clientes`)
  yPosition += 10

  // Summary section
  pdf.setFillColor(248, 250, 252)
  pdf.rect(15, yPosition, 180, 25, "F")
  pdf.setDrawColor(229, 231, 235)
  pdf.rect(15, yPosition, 180, 25, "D")

  pdf.setTextColor(31, 41, 55)
  pdf.setFontSize(12)
  pdf.setFont("helvetica", "bold")
  pdf.text("RESUMO GERAL", 20, yPosition + 10)

  pdf.setFontSize(10)
  pdf.setFont("helvetica", "normal")
  const activeClients = new Set(recipes.map((r) => r.client_id).filter(Boolean)).size
  const totalRecipes = recipes.length

  pdf.text(`• Total de Clientes: ${clients.length}`, 20, yPosition + 18)
  pdf.text(`• Clientes Ativos: ${activeClients}`, 100, yPosition + 18)
  pdf.text(`• Total de Receitas: ${totalRecipes}`, 20, yPosition + 22)

  yPosition += 35

  // Clients list
  pdf.setFontSize(12)
  pdf.setFont("helvetica", "bold")
  pdf.setTextColor(16, 185, 129)
  pdf.text("DETALHES DOS CLIENTES", 20, yPosition)
  yPosition += 15

  for (let i = 0; i < clients.length; i++) {
    const client = clients[i]
    const clientRecipes = recipes.filter((r) => r.client_id === client.id)

    yPosition = checkPageSpace(pdf, yPosition, 50)

    // Client card
    pdf.setFillColor(255, 255, 255)
    pdf.rect(15, yPosition, 180, 45, "F")
    pdf.setDrawColor(229, 231, 235)
    pdf.rect(15, yPosition, 180, 45, "D")

    // Client name
    pdf.setTextColor(31, 41, 55)
    pdf.setFontSize(12)
    pdf.setFont("helvetica", "bold")
    pdf.text(client.name, 20, yPosition + 12)

    // Client details
    pdf.setFontSize(9)
    pdf.setFont("helvetica", "normal")
    pdf.setTextColor(75, 85, 99)

    pdf.text(`Receitas: ${clientRecipes.length}`, 20, yPosition + 22)
    pdf.text(`Cadastrado em: ${new Date(client.created_at).toLocaleDateString("pt-BR")}`, 20, yPosition + 30)

    // Recipe types breakdown
    const normalRecipes = clientRecipes.filter((r) => r.tipo_ficha === "Normal").length
    const subfichas = clientRecipes.filter((r) => r.tipo_ficha === "Subficha").length

    pdf.text(`Receitas Normais: ${normalRecipes}`, 110, yPosition + 22)
    pdf.text(`Subfichas: ${subfichas}`, 110, yPosition + 30)

    // Recent recipes
    if (clientRecipes.length > 0) {
      const recentRecipe = clientRecipes[clientRecipes.length - 1]
      pdf.text(`Última receita: ${recentRecipe.nome_receita}`, 20, yPosition + 38)
    }

    yPosition += 55
  }

  // Add footers to all pages
  const totalPages = pdf.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i)
    addReportFooter(pdf, i, totalPages)
  }

  return pdf.output("blob")
}

// 3. Monthly Statistics Report
export async function generateMonthlyStatsReport(): Promise<Blob> {
  const pdf = new jsPDF()
  const statistics = generateStatistics()
  const currentMonth = new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })

  let yPosition = await addReportHeader(pdf, "RELATÓRIO MENSAL", `Período: ${currentMonth}`)
  yPosition += 10

  // Key metrics
  pdf.setFillColor(248, 250, 252)
  pdf.rect(15, yPosition, 180, 60, "F")
  pdf.setDrawColor(229, 231, 235)
  pdf.rect(15, yPosition, 180, 60, "D")

  pdf.setTextColor(31, 41, 55)
  pdf.setFontSize(14)
  pdf.setFont("helvetica", "bold")
  pdf.text("MÉTRICAS PRINCIPAIS", 20, yPosition + 15)

  // Metrics in grid
  const metrics = [
    { label: "Total de Receitas", value: statistics.totalRecipes.toString() },
    { label: "Clientes Ativos", value: statistics.totalClients.toString() },
    { label: "Total de Ingredientes", value: statistics.totalIngredients.toString() },
    { label: "Passos de Preparo", value: statistics.totalSteps.toString() },
  ]

  pdf.setFontSize(10)
  pdf.setFont("helvetica", "normal")

  metrics.forEach((metric, index) => {
    const x = 25 + (index % 2) * 90
    const y = yPosition + 30 + Math.floor(index / 2) * 15

    pdf.setFont("helvetica", "bold")
    pdf.text(metric.value, x, y)
    pdf.setFont("helvetica", "normal")
    pdf.text(metric.label, x + 20, y)
  })

  yPosition += 75

  // Top performers
  yPosition = checkPageSpace(pdf, yPosition, 80)

  pdf.setFontSize(12)
  pdf.setFont("helvetica", "bold")
  pdf.setTextColor(16, 185, 129)
  pdf.text("TOP PERFORMERS", 20, yPosition)
  yPosition += 15

  // Top client
  if (statistics.recipesPerClient.length > 0) {
    const topClient = statistics.recipesPerClient[0]
    pdf.setFillColor(255, 255, 255)
    pdf.rect(15, yPosition, 180, 20, "F")
    pdf.setDrawColor(229, 231, 235)
    pdf.rect(15, yPosition, 180, 20, "D")

    pdf.setTextColor(31, 41, 55)
    pdf.setFontSize(10)
    pdf.setFont("helvetica", "bold")
    pdf.text("Cliente Mais Ativo:", 20, yPosition + 8)
    pdf.setFont("helvetica", "normal")
    pdf.text(`${topClient.name} (${topClient.value} receitas)`, 20, yPosition + 15)

    yPosition += 30
  }

  // Top ingredient
  if (statistics.topIngredients.length > 0) {
    const topIngredient = statistics.topIngredients[0]
    pdf.setFillColor(255, 255, 255)
    pdf.rect(15, yPosition, 180, 20, "F")
    pdf.setDrawColor(229, 231, 235)
    pdf.rect(15, yPosition, 180, 20, "D")

    pdf.setTextColor(31, 41, 55)
    pdf.setFontSize(10)
    pdf.setFont("helvetica", "bold")
    pdf.text("Ingrediente Mais Usado:", 20, yPosition + 8)
    pdf.setFont("helvetica", "normal")
    pdf.text(`${topIngredient.name} (usado ${topIngredient.value} vezes)`, 20, yPosition + 15)

    yPosition += 30
  }

  // Recipe types distribution
  yPosition = checkPageSpace(pdf, yPosition, 60)

  pdf.setFontSize(12)
  pdf.setFont("helvetica", "bold")
  pdf.setTextColor(16, 185, 129)
  pdf.text("DISTRIBUIÇÃO POR TIPO", 20, yPosition)
  yPosition += 15

  statistics.recipeTypes.forEach((type) => {
    const percentage = statistics.totalRecipes > 0 ? ((type.value / statistics.totalRecipes) * 100).toFixed(1) : "0"

    pdf.setFillColor(255, 255, 255)
    pdf.rect(15, yPosition, 180, 15, "F")
    pdf.setDrawColor(229, 231, 235)
    pdf.rect(15, yPosition, 180, 15, "D")

    // Progress bar
    const barWidth = (type.value / statistics.totalRecipes) * 150
    pdf.setFillColor(
      type.color === "#10b981" ? 16 : 59,
      type.color === "#10b981" ? 185 : 130,
      type.color === "#10b981" ? 129 : 246,
    )
    pdf.rect(20, yPosition + 3, barWidth, 8, "F")

    pdf.setTextColor(31, 41, 55)
    pdf.setFontSize(9)
    pdf.setFont("helvetica", "normal")
    pdf.text(`${type.name}: ${type.value} (${percentage}%)`, 25, yPosition + 8)

    yPosition += 20
  })

  // Add footers to all pages
  const totalPages = pdf.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i)
    addReportFooter(pdf, i, totalPages)
  }

  return pdf.output("blob")
}

// 4. Analytics Report
export async function generateAnalyticsReport(): Promise<Blob> {
  const pdf = new jsPDF()
  const statistics = generateStatistics()
  const recipes = getRecipesWithClients()
  const ingredients = getIngredients()

  let yPosition = await addReportHeader(pdf, "RELATÓRIO ANALÍTICO", "Análise Completa do Sistema")
  yPosition += 10

  // Executive Summary
  pdf.setFillColor(248, 250, 252)
  pdf.rect(15, yPosition, 180, 50, "F")
  pdf.setDrawColor(229, 231, 235)
  pdf.rect(15, yPosition, 180, 50, "D")

  pdf.setTextColor(31, 41, 55)
  pdf.setFontSize(12)
  pdf.setFont("helvetica", "bold")
  pdf.text("RESUMO EXECUTIVO", 20, yPosition + 12)

  pdf.setFontSize(9)
  pdf.setFont("helvetica", "normal")
  const avgIngredientsPerRecipe = recipes.length > 0 ? (ingredients.length / recipes.length).toFixed(1) : "0"

  pdf.text(
    `• Sistema contém ${statistics.totalRecipes} receitas de ${statistics.totalClients} clientes diferentes`,
    20,
    yPosition + 22,
  )
  pdf.text(`• Média de ${avgIngredientsPerRecipe} ingredientes por receita`, 20, yPosition + 30)
  pdf.text(
    `• ${statistics.recipeTypes.find((t) => t.name === "Normal")?.value || 0} receitas principais e ${statistics.recipeTypes.find((t) => t.name === "Subficha")?.value || 0} subfichas`,
    20,
    yPosition + 38,
  )
  pdf.text(
    `• Relatório gerado em ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}`,
    20,
    yPosition + 46,
  )

  yPosition += 65

  // Detailed Analytics
  yPosition = checkPageSpace(pdf, yPosition, 100)

  pdf.setFontSize(12)
  pdf.setFont("helvetica", "bold")
  pdf.setTextColor(16, 185, 129)
  pdf.text("ANÁLISE DETALHADA", 20, yPosition)
  yPosition += 15

  // Client Analysis
  pdf.setFontSize(10)
  pdf.setFont("helvetica", "bold")
  pdf.setTextColor(31, 41, 55)
  pdf.text("Análise de Clientes:", 20, yPosition)
  yPosition += 10

  pdf.setFont("helvetica", "normal")
  pdf.setFontSize(9)

  statistics.recipesPerClient.slice(0, 5).forEach((client, index) => {
    pdf.text(`${index + 1}. ${client.name}: ${client.value} receitas`, 25, yPosition)
    yPosition += 8
  })

  yPosition += 10

  // Ingredient Analysis
  yPosition = checkPageSpace(pdf, yPosition, 80)

  pdf.setFontSize(10)
  pdf.setFont("helvetica", "bold")
  pdf.setTextColor(31, 41, 55)
  pdf.text("Top 10 Ingredientes Mais Utilizados:", 20, yPosition)
  yPosition += 10

  pdf.setFont("helvetica", "normal")
  pdf.setFontSize(9)

  statistics.topIngredients.slice(0, 10).forEach((ingredient, index) => {
    pdf.text(`${index + 1}. ${ingredient.name}: usado ${ingredient.value} vezes`, 25, yPosition)
    yPosition += 8
  })

  yPosition += 15

  // Recipe Complexity Analysis
  yPosition = checkPageSpace(pdf, yPosition, 80)

  pdf.setFontSize(10)
  pdf.setFont("helvetica", "bold")
  pdf.setTextColor(31, 41, 55)
  pdf.text("Receitas Mais Complexas (por número de ingredientes):", 20, yPosition)
  yPosition += 10

  pdf.setFont("helvetica", "normal")
  pdf.setFontSize(9)

  statistics.ingredientsPerRecipe.slice(0, 10).forEach((recipe, index) => {
    pdf.text(`${index + 1}. ${recipe.name}: ${recipe.value} ingredientes`, 25, yPosition)
    yPosition += 8
  })

  yPosition += 15

  // Growth Analysis
  yPosition = checkPageSpace(pdf, yPosition, 60)

  pdf.setFontSize(10)
  pdf.setFont("helvetica", "bold")
  pdf.setTextColor(31, 41, 55)
  pdf.text("Análise de Crescimento (Últimos 6 Meses):", 20, yPosition)
  yPosition += 10

  pdf.setFont("helvetica", "normal")
  pdf.setFontSize(9)

  statistics.recipesPerMonth.forEach((month) => {
    pdf.text(`${month.name}: ${month.value} receitas criadas`, 25, yPosition)
    yPosition += 8
  })

  // Add footers to all pages
  const totalPages = pdf.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i)
    addReportFooter(pdf, i, totalPages)
  }

  return pdf.output("blob")
}

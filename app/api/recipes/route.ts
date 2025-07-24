import { NextResponse } from "next/server"
import { getRecipesWithClients, createRecipe } from "@/lib/data-manager"

export async function GET() {
  try {
    const recipes = getRecipesWithClients()
    return NextResponse.json(recipes)
  } catch (error) {
    console.error("Error fetching recipes:", error)
    return NextResponse.json({ error: "Failed to fetch recipes" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log("🔍 API: Raw request body received:", JSON.stringify(body, null, 2))
    console.log("🔍 API: Recipe name from body:", body.nome_receita)
    console.log("🔍 API: All body keys:", Object.keys(body))

    if (!body.nome_receita) {
      console.error("❌ API: No recipe name provided!")
      return NextResponse.json({ error: "Recipe name is required" }, { status: 400 })
    }

    console.log("✅ API: Creating recipe with data:", body)
    const recipe = createRecipe(body)
    console.log("✅ API: Recipe created successfully:", recipe.id, recipe.nome_receita)

    // Make sure we return the complete recipe object with ID
    const responseData = {
      id: recipe.id,
      nome_receita: recipe.nome_receita,
      tipo_ficha: recipe.tipo_ficha,
      tempo_preparo: recipe.tempo_preparo,
      rendimento: recipe.rendimento,
      peso_preparacao: recipe.peso_preparacao,
      peso_porcao: recipe.peso_porcao,
      utensilios_necessarios: recipe.utensilios_necessarios,
      realizado_por: recipe.realizado_por,
      aprovado_por: recipe.aprovado_por,
      client_id: recipe.client_id,
      foto_produto_url: recipe.foto_produto_url,
      created_at: recipe.created_at,
      updated_at: recipe.updated_at,
    }

    console.log("📤 API: Sending response:", responseData)
    return NextResponse.json(responseData)
  } catch (error) {
    console.error("❌ API: Error creating recipe:", error)
    return NextResponse.json({ error: "Failed to create recipe" }, { status: 500 })
  }
}

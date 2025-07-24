import { NextResponse } from "next/server"
import { getIngredientsByRecipeId, createIngredient } from "@/lib/data-manager"

export async function GET(request: Request, { params }: { params: { recipeId: string } }) {
  try {
    const ingredients = getIngredientsByRecipeId(params.recipeId)
    return NextResponse.json(ingredients)
  } catch (error) {
    console.error("Error fetching ingredients:", error)
    return NextResponse.json({ error: "Failed to fetch ingredients" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: { recipeId: string } }) {
  try {
    const body = await request.json()
    const ingredient = createIngredient({
      ...body,
      ficha_id: params.recipeId,
    })
    return NextResponse.json(ingredient)
  } catch (error) {
    console.error("Error creating ingredient:", error)
    return NextResponse.json({ error: "Failed to create ingredient" }, { status: 500 })
  }
}

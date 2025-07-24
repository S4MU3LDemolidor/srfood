import { NextResponse } from "next/server"
import { getStepsByRecipeId, createStep } from "@/lib/data-manager"

export async function GET(request: Request, { params }: { params: { recipeId: string } }) {
  try {
    const steps = getStepsByRecipeId(params.recipeId)
    return NextResponse.json(steps)
  } catch (error) {
    console.error("Error fetching steps:", error)
    return NextResponse.json({ error: "Failed to fetch steps" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: { recipeId: string } }) {
  try {
    const body = await request.json()
    const step = createStep({
      ...body,
      ficha_id: params.recipeId,
    })
    return NextResponse.json(step)
  } catch (error) {
    console.error("Error creating step:", error)
    return NextResponse.json({ error: "Failed to create step" }, { status: 500 })
  }
}

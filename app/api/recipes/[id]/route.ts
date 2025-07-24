import { type NextRequest, NextResponse } from "next/server"
import { deleteRecipe, getRecipeById, updateRecipe } from "@/lib/data-manager"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const recipe = getRecipeById(params.id)

    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 })
    }

    return NextResponse.json(recipe)
  } catch (error) {
    console.error("Error fetching recipe:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()
    const success = updateRecipe(params.id, data)

    if (!success) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating recipe:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("🗑️ API: DELETE recipe request for ID:", params.id)

    const success = deleteRecipe(params.id)

    if (!success) {
      console.log("❌ API: Recipe not found for deletion:", params.id)
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 })
    }

    console.log("✅ API: Recipe deleted successfully:", params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("❌ API: Error deleting recipe:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { updateIngredient, deleteIngredient } from "@/lib/data-manager"

export async function PUT(request: Request, { params }: { params: { itemId: string } }) {
  try {
    const body = await request.json()
    const ingredient = await updateIngredient(params.itemId, body)
    if (!ingredient) {
      return NextResponse.json({ error: "Ingredient not found" }, { status: 404 })
    }
    return NextResponse.json(ingredient)
  } catch (error) {
    console.error("Error updating ingredient:", error)
    return NextResponse.json({ error: "Failed to update ingredient" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { itemId: string } }) {
  try {
    const success = await deleteIngredient(params.itemId)
    if (!success) {
      return NextResponse.json({ error: "Ingredient not found" }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting ingredient:", error)
    return NextResponse.json({ error: "Failed to delete ingredient" }, { status: 500 })
  }
}

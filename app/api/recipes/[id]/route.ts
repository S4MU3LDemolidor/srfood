import { NextResponse } from "next/server"
import { getRecipeWithDetails, updateRecipe, deleteRecipe } from "@/lib/data-manager"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const recipe = getRecipeWithDetails(params.id)
    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 })
    }
    return NextResponse.json(recipe)
  } catch (error) {
    console.error("Error fetching recipe:", error)
    return NextResponse.json({ error: "Failed to fetch recipe" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const recipe = updateRecipe(params.id, body)
    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 })
    }
    return NextResponse.json(recipe)
  } catch (error) {
    console.error("Error updating recipe:", error)
    return NextResponse.json({ error: "Failed to update recipe" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  console.log(`API: DELETE request received for recipe ID: ${params.id}`)

  try {
    // Validate that we have an ID
    if (!params.id) {
      console.error("API: No recipe ID provided")
      return NextResponse.json({ error: "Recipe ID is required" }, { status: 400 })
    }

    console.log(`API: Calling deleteRecipe with ID: ${params.id}`)
    const success = deleteRecipe(params.id)

    console.log(`API: deleteRecipe returned: ${success}`)

    if (!success) {
      console.log(`API: Recipe with ID ${params.id} not found or could not be deleted`)
      return NextResponse.json({ error: "Recipe not found or could not be deleted" }, { status: 404 })
    }

    console.log(`API: Successfully deleted recipe with ID: ${params.id}`)
    return NextResponse.json({
      success: true,
      message: "Recipe deleted successfully",
      deletedId: params.id,
    })
  } catch (error) {
    console.error("API: Error in DELETE route:", error)
    return NextResponse.json(
      {
        error: "Failed to delete recipe",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

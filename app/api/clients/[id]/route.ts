import { type NextRequest, NextResponse } from "next/server"
import { deleteClient, getClientById, updateClient, getRecipesWithClients } from "@/lib/data-manager"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const client = getClientById(params.id)

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    return NextResponse.json(client)
  } catch (error) {
    console.error("Error fetching client:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()
    const success = updateClient(params.id, data)

    if (!success) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating client:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("🗑️ API: DELETE client request for ID:", params.id)

    // Check if client has associated recipes
    const recipes = getRecipesWithClients()
    const clientRecipes = recipes.filter((recipe) => recipe.client_id === params.id)

    if (clientRecipes.length > 0) {
      console.log("❌ API: Cannot delete client with associated recipes:", params.id, clientRecipes.length)
      return NextResponse.json(
        {
          error: "Cannot delete client with associated recipes",
          recipeCount: clientRecipes.length,
        },
        { status: 400 },
      )
    }

    const success = deleteClient(params.id)

    if (!success) {
      console.log("❌ API: Client not found for deletion:", params.id)
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    console.log("✅ API: Client deleted successfully:", params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("❌ API: Error deleting client:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

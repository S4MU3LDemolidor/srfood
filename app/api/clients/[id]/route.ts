import { NextResponse } from "next/server"
import { getClientById, updateClient, deleteClient } from "@/lib/data-manager"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const client = getClientById(params.id)
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }
    return NextResponse.json(client)
  } catch (error) {
    console.error("Error fetching client:", error)
    return NextResponse.json({ error: "Failed to fetch client" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const client = updateClient(params.id, body)
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }
    return NextResponse.json(client)
  } catch (error) {
    console.error("Error updating client:", error)
    return NextResponse.json({ error: "Failed to update client" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  console.log(`API: DELETE request received for client ID: ${params.id}`)

  try {
    if (!params.id) {
      console.error("API: No client ID provided")
      return NextResponse.json({ error: "Client ID is required" }, { status: 400 })
    }

    console.log(`API: Calling deleteClient with ID: ${params.id}`)
    const success = deleteClient(params.id)

    console.log(`API: deleteClient returned: ${success}`)

    if (!success) {
      console.log(`API: Client with ID ${params.id} not found or could not be deleted`)
      return NextResponse.json({ error: "Client not found or could not be deleted" }, { status: 404 })
    }

    console.log(`API: Successfully deleted client with ID: ${params.id}`)
    return NextResponse.json({
      success: true,
      message: "Client deleted successfully",
      deletedId: params.id,
    })
  } catch (error) {
    console.error("API: Error in DELETE route:", error)
    return NextResponse.json(
      {
        error: "Failed to delete client",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

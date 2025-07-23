import { NextResponse } from "next/server"
import { updateStep, deleteStep } from "@/lib/data-manager"

export async function PUT(request: Request, { params }: { params: { itemId: string } }) {
  try {
    const body = await request.json()
    const step = await updateStep(params.itemId, body)
    if (!step) {
      return NextResponse.json({ error: "Step not found" }, { status: 404 })
    }
    return NextResponse.json(step)
  } catch (error) {
    console.error("Error updating step:", error)
    return NextResponse.json({ error: "Failed to update step" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { itemId: string } }) {
  try {
    const success = await deleteStep(params.itemId)
    if (!success) {
      return NextResponse.json({ error: "Step not found" }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting step:", error)
    return NextResponse.json({ error: "Failed to delete step" }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { getClients, createClient } from "@/lib/data-manager"

export async function GET() {
  try {
    const clients = getClients()
    return NextResponse.json(clients)
  } catch (error) {
    console.error("Error fetching clients:", error)
    return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log("🔍 API: Raw client request body received:", JSON.stringify(body, null, 2))
    console.log("🔍 API: Client name from body:", body.name)
    console.log("🔍 API: All body keys:", Object.keys(body))

    if (!body.name) {
      console.error("❌ API: No client name provided!")
      return NextResponse.json({ error: "Client name is required" }, { status: 400 })
    }

    console.log("✅ API: Creating client with data:", body)
    const client = createClient(body)
    console.log("✅ API: Client created successfully:", client.id, client.name)
    return NextResponse.json(client)
  } catch (error) {
    console.error("❌ API: Error creating client:", error)
    return NextResponse.json({ error: "Failed to create client" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { seedDefaultContent } from "@/lib/seed-content"

export async function POST(request: NextRequest) {
  try {
    await seedDefaultContent()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error seeding content:", error)
    return NextResponse.json(
      { error: "Failed to seed content", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

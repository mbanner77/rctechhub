import { type NextRequest, NextResponse } from "next/server"
import { getAllPages, getPageByPath, saveContentItem } from "@/lib/content-db"
import type { PageContent } from "@/types/content-management"

// GET /api/content/pages oder /api/content/pages?path=/home
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const path = searchParams.get("path")
  const includeUnpublished = searchParams.get("includeUnpublished") === "true"

  try {
    if (path) {
      const page = await getPageByPath(path)

      if (!page) {
        return NextResponse.json({ error: "Page not found" }, { status: 404 })
      }

      if (!page.isPublished && !includeUnpublished) {
        return NextResponse.json({ error: "Page not published" }, { status: 403 })
      }

      return NextResponse.json(page)
    } else {
      const pages = await getAllPages(includeUnpublished)
      return NextResponse.json(pages)
    }
  } catch (error) {
    console.error("Error fetching pages:", error)
    return NextResponse.json({ error: "Failed to fetch pages" }, { status: 500 })
  }
}

// POST /api/content/pages
export async function POST(request: NextRequest) {
  try {
    const page = (await request.json()) as PageContent

    if (!page.type || page.type !== "page" || !page.key || !page.path) {
      return NextResponse.json({ error: "Invalid page data" }, { status: 400 })
    }

    const savedPage = await saveContentItem(page)
    return NextResponse.json(savedPage)
  } catch (error) {
    console.error("Error saving page:", error)
    return NextResponse.json({ error: "Failed to save page" }, { status: 500 })
  }
}

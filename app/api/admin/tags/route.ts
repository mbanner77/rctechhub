import { NextRequest, NextResponse } from "next/server"
import { db, ITag } from "@/lib/db"
import { v4 as uuidv4 } from "uuid"

/**
 * GET handler for retrieving all tags
 * 
 * Returns a list of all technology tags in the system
 */
export async function GET(request: NextRequest) {
  try {
    // Get all tags from the database
    const tags = await db.tags.toArray()
    
    return NextResponse.json(tags)
  } catch (error) {
    console.error("Error fetching tags:", error)
    return NextResponse.json(
      { error: "Error fetching tags" },
      { status: 500 }
    )
  }
}

/**
 * POST handler for creating or updating a tag
 * 
 * If id is provided in the body, update the existing tag
 * If no id is provided, create a new tag
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const now = new Date().toISOString()
    
    // Check if this is an update or create operation
    if (body.id) {
      // This is an update
      const tag = await db.tags.get(body.id)
      
      if (!tag) {
        return NextResponse.json(
          { error: "Tag not found" },
          { status: 404 }
        )
      }
      
      // Update the tag
      const updatedTag: ITag = {
        ...tag,
        name: body.name || tag.name,
        category: body.category,
        updatedAt: now
      }
      
      await db.tags.update(tag.id, updatedTag)
      
      // Handle name changes and update references
      if (body.name && body.name !== tag.name) {
        await updateTagReferences(tag.name, body.name)
      }
      
      return NextResponse.json(updatedTag)
    } else {
      // This is a create operation
      // Check if tag with this name already exists
      const existingTags = await db.tags.where("name").equals(body.name).toArray()
      
      if (existingTags.length > 0) {
        return NextResponse.json(
          { error: "A tag with this name already exists" },
          { status: 409 }
        )
      }
      
      // Create a new tag
      const newTag: ITag = {
        id: uuidv4(),
        name: body.name,
        category: body.category,
        count: 0,
        createdAt: now,
        updatedAt: now
      }
      
      await db.tags.add(newTag)
      
      return NextResponse.json(newTag, { status: 201 })
    }
  } catch (error) {
    console.error("Error creating/updating tag:", error)
    return NextResponse.json(
      { error: "Error creating/updating tag" },
      { status: 500 }
    )
  }
}

/**
 * DELETE handler for removing a tag
 * 
 * Removes a tag and updates all references to it
 */
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get("id")
    
    if (!id) {
      return NextResponse.json(
        { error: "Tag ID is required" },
        { status: 400 }
      )
    }
    
    // Get the tag to be deleted
    const tag = await db.tags.get(id)
    
    if (!tag) {
      return NextResponse.json(
        { error: "Tag not found" },
        { status: 404 }
      )
    }
    
    // Remove the tag
    await db.tags.delete(id)
    
    // Remove references to this tag
    await removeTagReferences(tag.name)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting tag:", error)
    return NextResponse.json(
      { error: "Error deleting tag" },
      { status: 500 }
    )
  }
}

/**
 * Updates all references to a tag when it is renamed
 */
async function updateTagReferences(oldName: string, newName: string) {
  try {
    // Update services
    const services = await db.services.toArray()
    for (const service of services) {
      if (service.technologies.includes(oldName)) {
        const updatedTechnologies = service.technologies.map(tech => 
          tech === oldName ? newName : tech
        )
        await db.services.update(service.id, { technologies: updatedTechnologies })
      }
    }

    // Update knowledge hub content
    const knowledgeHubItems = await db.knowledgeHubContent.toArray()
    for (const item of knowledgeHubItems) {
      if (item.tags && item.tags.includes(oldName)) {
        const updatedTags = item.tags.map(tag => 
          tag === oldName ? newName : tag
        )
        await db.knowledgeHubContent.update(item.id, { tags: updatedTags })
      }
    }

    // Update other entities with tag references as needed
    
    return true
  } catch (error) {
    console.error("Error updating tag references:", error)
    throw error
  }
}

/**
 * Removes all references to a tag when it is deleted
 */
async function removeTagReferences(tagName: string) {
  try {
    // Remove from services
    const services = await db.services.toArray()
    for (const service of services) {
      if (service.technologies.includes(tagName)) {
        const updatedTechnologies = service.technologies.filter(tech => tech !== tagName)
        await db.services.update(service.id, { technologies: updatedTechnologies })
      }
    }

    // Remove from knowledge hub content
    const knowledgeHubItems = await db.knowledgeHubContent.toArray()
    for (const item of knowledgeHubItems) {
      if (item.tags && item.tags.includes(tagName)) {
        const updatedTags = item.tags.filter(tag => tag !== tagName)
        await db.knowledgeHubContent.update(item.id, { tags: updatedTags })
      }
    }

    // Remove from other entities with tag references as needed
    
    return true
  } catch (error) {
    console.error("Error removing tag references:", error)
    throw error
  }
}

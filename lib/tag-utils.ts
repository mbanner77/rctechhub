// This is a centralized utility module for tag-related operations

import { db, ITag } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

/**
 * Synchronizes all tags in the database with references in other entities.
 * 
 * This function:
 * 1. Updates counts for existing tags
 * 2. Creates new tags for any references that don't have formal tag entries
 * 3. Returns statistics about the synchronization
 */
export async function synchronizeTags() {
  try {
    // Get all existing tags
    const allTags = await db.tags.toArray();
    const tagMap = new Map<string, ITag>();
    allTags.forEach(tag => tagMap.set(tag.name, tag));
    
    // Count references in all entities
    const tagCounts = new Map<string, number>();
    
    // Check services
    const services = await db.services.toArray();
    services.forEach(service => {
      service.technologies.forEach(tech => {
        tagCounts.set(tech, (tagCounts.get(tech) || 0) + 1);
      });
    });
    
    // Check knowledge hub content
    const knowledgeHubItems = await db.knowledgeHubContent.toArray();
    knowledgeHubItems.forEach(item => {
      if (item.tags) {
        item.tags.forEach(tag => {
          tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
        });
      }
    });
    
    // Add other entities that may have tag references
    
    // Update existing tags and create new ones if necessary
    const now = new Date().toISOString();
    const updatedTags = [];
    const newTags = [];
    let updatedCount = 0;
    
    // Process all referenced tags
    for (const [tagName, count] of tagCounts.entries()) {
      if (tagMap.has(tagName)) {
        // Update existing tag
        const existingTag = tagMap.get(tagName)!;
        if (existingTag.count !== count) {
          await db.tags.update(existingTag.id, { count, updatedAt: now });
          updatedCount++;
          updatedTags.push({ ...existingTag, count, updatedAt: now });
        } else {
          updatedTags.push(existingTag);
        }
      } else {
        // Create a new tag
        const newTag: ITag = {
          id: uuidv4(),
          name: tagName,
          count,
          createdAt: now,
          updatedAt: now
        };
        await db.tags.add(newTag);
        newTags.push(newTag);
        updatedTags.push(newTag);
      }
    }
    
    // Find orphaned tags (tags with no references)
    const orphanedTags = allTags.filter(tag => !tagCounts.has(tag.name));
    for (const tag of orphanedTags) {
      if (tag.count !== 0) {
        await db.tags.update(tag.id, { count: 0, updatedAt: now });
        updatedCount++;
      }
      updatedTags.push({ ...tag, count: 0, updatedAt: now });
    }
    
    // Return synchronization statistics
    return {
      updated: updatedCount,
      created: newTags.length,
      orphaned: orphanedTags.length,
      total: updatedTags.length
    };
  } catch (error) {
    console.error("Error synchronizing tags:", error);
    throw error;
  }
}

/**
 * Updates all references to a tag when it is renamed
 * 
 * @param oldName The original tag name
 * @param newName The new tag name
 */
export async function updateTagReferences(oldName: string, newName: string) {
  try {
    // Update services
    const services = await db.services.toArray();
    for (const service of services) {
      if (service.technologies.includes(oldName)) {
        const updatedTechnologies = service.technologies.map(tech => 
          tech === oldName ? newName : tech
        );
        await db.services.update(service.id, { technologies: updatedTechnologies });
      }
    }

    // Update knowledge hub content
    const knowledgeHubItems = await db.knowledgeHubContent.toArray();
    for (const item of knowledgeHubItems) {
      if (item.tags && item.tags.includes(oldName)) {
        const updatedTags = item.tags.map(tag => 
          tag === oldName ? newName : tag
        );
        await db.knowledgeHubContent.update(item.id, { tags: updatedTags });
      }
    }

    // Add other entities with tag references as needed
    
    console.log(`Successfully updated references from "${oldName}" to "${newName}"`);
    return true;
  } catch (error) {
    console.error("Error updating tag references:", error);
    throw error;
  }
}

/**
 * Removes all references to a tag when it is deleted
 * 
 * @param tagName The name of the tag to remove
 */
export async function removeTagReferences(tagName: string) {
  try {
    // Remove from services
    const services = await db.services.toArray();
    for (const service of services) {
      if (service.technologies.includes(tagName)) {
        const updatedTechnologies = service.technologies.filter(tech => tech !== tagName);
        await db.services.update(service.id, { technologies: updatedTechnologies });
      }
    }

    // Remove from knowledge hub content
    const knowledgeHubItems = await db.knowledgeHubContent.toArray();
    for (const item of knowledgeHubItems) {
      if (item.tags && item.tags.includes(tagName)) {
        const updatedTags = item.tags.filter(tag => tag !== tagName);
        await db.knowledgeHubContent.update(item.id, { tags: updatedTags });
      }
    }

    // Add other entities with tag references as needed
    
    console.log(`Successfully removed references to "${tagName}"`);
    return true;
  } catch (error) {
    console.error("Error removing tag references:", error);
    throw error;
  }
}

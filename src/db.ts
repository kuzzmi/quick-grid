// Import Dexie
import Dexie from "dexie";
import { Link, Group, GridSettings } from "./types";
import { getFaviconUrl as getFaviconUrlUtil } from "./db-utils";

// Create the database directly
const db = new Dexie("QuickGridDB");

// Define the schema
db.version(1).stores({
  links: "id, groupId, order",
  groups: "id, order",
  settings: "++id",
});

// Initialize database with default values if empty
export async function initializeDatabase() {
  try {
    const groupCount = await db.table("groups").count();
    const linkCount = await db.table("links").count();
    const settingsCount = await db.table("settings").count();

    if (groupCount === 0) {
      // Create a default group
      await db.table("groups").add({
        id: "default",
        title: "Default Group",
        order: 0,
        isCollapsed: false,
      });
    }

    if (linkCount === 0) {
      // Add some example links
      const defaultLinks = [
        {
          id: "google",
          title: "Google",
          url: "https://www.google.com",
          iconType: "favicon" as const,
          groupId: "default",
          order: 0,
        },
        {
          id: "gmail",
          title: "Gmail",
          url: "https://mail.google.com",
          iconType: "favicon" as const,
          groupId: "default",
          order: 1,
        },
        {
          id: "youtube",
          title: "YouTube",
          url: "https://www.youtube.com",
          iconType: "favicon" as const,
          groupId: "default",
          order: 2,
        },
      ];

      await db.table("links").bulkAdd(defaultLinks);
    }

    if (settingsCount === 0) {
      // Add default settings
      await db.table("settings").add({
        itemsPerRow: 5,
        itemSize: "medium",
        showTitles: true,
      });
    }
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}

// Helper function to get favicon URL
export function getFaviconUrl(url: string): string {
  return getFaviconUrlUtil(url);
}

// Type the tables for TypeScript
interface DbTables {
  links: Dexie.Table<Link, string>;
  groups: Dexie.Table<Group, string>;
  settings: Dexie.Table<GridSettings, number>;
}

// Add type information to the db instance
const typedDb = db as Dexie & DbTables;

// Export the database
export { typedDb as db };

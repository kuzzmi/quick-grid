// src/services/SyncService.ts
import { Link, Group, GridSettings } from "../types";

// Define event types for sync
export type SyncEventType =
  | "link:add"
  | "link:update"
  | "link:delete"
  | "group:add"
  | "group:update"
  | "group:delete"
  | "settings:update"
  | "links:reorder"
  | "groups:reorder";

// Define payload type for sync events
export interface SyncEventPayload {
  type: SyncEventType;
  data: any;
  timestamp: number;
  source: string;
}

/**
 * SyncService - Provides background synchronization between tabs
 * This service handles communication between different instances of the application
 * without requiring any user interface elements.
 */
export class SyncService {
  private static instance: SyncService;
  private instanceId: string;
  private listeners: Map<SyncEventType, Function[]>;
  private broadcastChannel: BroadcastChannel | null = null;

  private constructor() {
    this.instanceId = Math.random().toString(36).substring(2, 9);
    this.listeners = new Map();

    // Try to use BroadcastChannel API first (more modern)
    try {
      this.broadcastChannel = new BroadcastChannel("quickgrid_sync");
      this.broadcastChannel.onmessage = (event) => {
        this.handleSyncEvent(event.data);
      };
      // Silent operation - no logging needed for background sync
    } catch (error) {
      // Fallback to localStorage events for browsers without BroadcastChannel support
      window.addEventListener("storage", this.handleStorageEvent);
    }
  }

  public static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  // Handle sync events coming from storage events
  private handleStorageEvent = (event: StorageEvent) => {
    // Check if this is one of our sync events
    if (event.key && event.key.startsWith("quickgrid_sync")) {
      try {
        if (event.newValue) {
          const payload: SyncEventPayload = JSON.parse(event.newValue);
          this.handleSyncEvent(payload);
        }
      } catch (error) {
        // Silent failure - we don't want sync errors to affect the user experience
      }
    }
  };

  // Common handler for sync events from any source
  private handleSyncEvent(payload: SyncEventPayload) {
    // Ignore events from this instance
    if (payload.source === this.instanceId) {
      return;
    }

    // Notify all listeners for this event type
    const eventListeners = this.listeners.get(payload.type) || [];
    eventListeners.forEach((listener) => listener(payload.data));
  }

  // Subscribe to specific sync events
  public subscribe(type: SyncEventType, callback: Function): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }

    const eventListeners = this.listeners.get(type)!;
    eventListeners.push(callback);

    // Return unsubscribe function
    return () => {
      const index = eventListeners.indexOf(callback);
      if (index !== -1) {
        eventListeners.splice(index, 1);
      }
    };
  }

  // Emit a sync event to other tabs
  public emit(type: SyncEventType, data: any): void {
    // Create the payload
    const payload: SyncEventPayload = {
      type,
      data,
      timestamp: Date.now(),
      source: this.instanceId,
    };

    // Use a microtask to not block the UI when syncing
    queueMicrotask(() => {
      if (this.broadcastChannel) {
        // Use BroadcastChannel if available (more efficient)
        this.broadcastChannel.postMessage(payload);
      } else {
        // Fallback to localStorage for broader compatibility
        try {
          // Include a random component in key to ensure the event always fires
          const syncKey = `quickgrid_sync_${Date.now()}_${Math.random()}`;
          localStorage.setItem(syncKey, JSON.stringify(payload));

          // Clean up after a short delay to not pollute localStorage
          setTimeout(() => {
            try {
              localStorage.removeItem(syncKey);
            } catch (e) {
              // Silently fail if removal fails
            }
          }, 100);
        } catch (e) {
          // Silently fail if localStorage is not available or quota is exceeded
        }
      }
    });
  }

  // Clean up resources
  public dispose(): void {
    if (this.broadcastChannel) {
      this.broadcastChannel.close();
    } else {
      window.removeEventListener("storage", this.handleStorageEvent);
    }
    this.listeners.clear();
  }
}

// Helper functions for common operations
export const syncService = SyncService.getInstance();

export const emitLinkAdded = (link: Link) => {
  syncService.emit("link:add", link);
};

export const emitLinkUpdated = (link: Link) => {
  syncService.emit("link:update", link);
};

export const emitLinkDeleted = (id: string) => {
  syncService.emit("link:delete", id);
};

export const emitGroupAdded = (group: Group) => {
  syncService.emit("group:add", group);
};

export const emitGroupUpdated = (group: Group) => {
  syncService.emit("group:update", group);
};

export const emitGroupDeleted = (id: string) => {
  syncService.emit("group:delete", id);
};

export const emitSettingsUpdated = (settings: GridSettings) => {
  syncService.emit("settings:update", settings);
};

export const emitLinksReordered = (linkIds: string[], groupId: string) => {
  syncService.emit("links:reorder", { linkIds, groupId });
};

export const emitGroupsReordered = (groupIds: string[]) => {
  syncService.emit("groups:reorder", groupIds);
};

export interface Link {
  id: string;
  title: string;
  url: string;
  iconType: 'favicon' | 'custom';
  iconUrl?: string; // Deprecated: For backwards compatibility only
  iconBase64?: string; // For both custom icons and fetched favicons (stored as base64)
  groupId: string;
  order: number;
}

export interface Group {
  id: string;
  title: string;
  order: number;
  isCollapsed: boolean;
}

export interface GridSettings {
  itemsPerRow: number;  // Number of items in a row
  itemSize: 'small' | 'medium' | 'large';  // Size of each item
  showTitles: boolean;  // Whether to show titles under icons
}

export interface AppState {
  links: Link[];
  groups: Group[];
  settings: GridSettings;
  activeGroupId: string | null;
}
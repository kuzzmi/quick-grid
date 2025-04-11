export interface Link {
  id: string;
  title: string;
  url: string;
  iconType: 'favicon' | 'custom';
  iconUrl?: string; // For favicons
  iconBase64?: string; // For custom icons
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
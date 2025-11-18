# QuickGrid - Project Documentation

## Project Overview

**QuickGrid** is a Chrome browser extension that provides a customizable grid of quick links for the browser's new tab page. It's a productivity tool that allows users to organize their favorite websites into groups with a modern, drag-and-drop interface.

**Current Version**: 1.0
**Manifest Version**: Chrome Extension Manifest V3
**Lines of Code**: ~2,000+ (TypeScript/React)

---

## Table of Contents

1. [Technology Stack](#technology-stack)
2. [Project Structure](#project-structure)
3. [Features](#features)
4. [Architecture](#architecture)
5. [Data Models](#data-models)
6. [Components](#components)
7. [Services](#services)
8. [Configuration](#configuration)
9. [Build & Deployment](#build--deployment)
10. [Testing](#testing)
11. [Recent Development](#recent-development)

---

## Technology Stack

### Core Technologies
- **React 18.2.0** - Modern UI framework with hooks
- **TypeScript 5.1.6** - Static typing for JavaScript
- **Dexie 3.2.4** - IndexedDB wrapper for client-side database
- **Tailwind CSS 3.3.3** - Utility-first CSS framework

### Drag & Drop
- **@dnd-kit/core** - Modern drag-and-drop toolkit
- **@dnd-kit/sortable** - Sortable lists functionality
- **@dnd-kit/utilities** - Helper utilities for DnD

### Build Tools
- **Webpack 5.88.2** - Module bundler
- **Babel 7.22** - JavaScript transpiler
- **PostCSS 8.4** - CSS transformations
- **Autoprefixer** - CSS vendor prefixing

### Development Tools
- **Jest 29.6** - Testing framework
- **Testing Library** - React component testing
- **ts-jest** - TypeScript support for Jest
- **fake-indexeddb** - IndexedDB mocking for tests
- **Prettier 3.5** - Code formatting

### UI Components
- **react-feather 2.0.10** - Icon library
- **uuid** - Unique ID generation

---

## Project Structure

```
quick-links/
├── public/              # Static assets and extension manifest
│   ├── icons/          # Extension icons (16, 48, 128px)
│   ├── index.html      # New tab page HTML
│   ├── popup.html      # Extension popup HTML
│   └── manifest.json   # Chrome extension manifest v3
├── src/                # Source code
│   ├── components/     # React components
│   │   ├── dnd/       # Drag & drop components
│   │   └── __tests__/ # Component tests
│   ├── services/       # Business logic services
│   │   └── SyncService.ts  # Multi-tab synchronization
│   ├── newtab/        # New tab page entry point
│   ├── popup/         # Extension popup entry point
│   ├── types.ts       # TypeScript type definitions
│   ├── db.ts          # Database setup (Dexie/IndexedDB)
│   ├── db-utils.ts    # Database utility functions
│   ├── AppContext.tsx # Global state management
│   └── __tests__/     # Core functionality tests
├── __mocks__/         # Jest mock files
├── dist/              # Build output
└── [config files]     # Various configuration files
```

---

## Features

### 1. Link Management
- **Add Links**: Create new quick links with titles and URLs
- **Edit Links**: Update existing link information
- **Delete Links**: Remove unwanted links
- **Icon Options**:
  - Automatic favicon fetching via Google's favicon service
  - Custom icon upload (stored as base64)
  - Fallback handling for broken icons
- **Reordering**: Drag-and-drop to reorder links within groups
- **Cross-Group Movement**: Drag links between different groups

### 2. Group Organization
- **Create Groups**: Organize links into unlimited groups
- **Rename Groups**: Inline editing of group titles
- **Delete Groups**: Remove groups (cascades to contained links)
- **Reorder Groups**: Drag-and-drop in sidebar
- **Active Group**: Persistent active group selection (localStorage)
- **Group Sidebar**: Vertical navigation for quick switching

### 3. Customizable Grid Settings
- **Items Per Row**: Configurable from 1-12 items
- **Item Size**: Choose from small, medium, or large
- **Title Visibility**: Toggle link titles on/off
- **Persistent Settings**: All settings stored in IndexedDB

### 4. Multi-Tab Synchronization
- **Real-Time Sync**: Changes reflect across all open tabs
- **BroadcastChannel API**: Modern browser communication
- **localStorage Fallback**: Compatibility for older browsers
- **Event-Driven**: Non-blocking background synchronization
- **Sync Events**: Links, groups, settings, and reordering

### 5. Extension Features
- **New Tab Override**: Replaces default Chrome new tab
- **Browser Action Popup**: Quick stats and information
- **Persistent Storage**: IndexedDB for offline-first design
- **Chrome Extension Manifest V3**: Latest extension standards

---

## Architecture

### State Management Pattern
- **React Context API**: Global state via `AppContext`
- **Provider Pattern**: `AppProvider` wraps the application
- **Custom Hook**: `useApp()` for accessing context
- **Local Storage**: Persists last active group preference

### Database Architecture
- **Client-Side Storage**: IndexedDB via Dexie ORM
- **Schema Version 1**:
  - `links` table: id, groupId, order (indexed on order)
  - `groups` table: id, order (indexed on order)
  - `settings` table: auto-incrementing id
- **Default Data**: Creates sample group and links on first run

### Component Architecture
- **Container/Presentational Pattern**: Logic and UI separation
- **Compound Components**: Modal components with controlled state
- **Render Props Pattern**: SortableItem passes drag handlers
- **Higher-Order Components**: SortableContext wrapping

### Service Layer
- **Singleton Pattern**: `SyncService.getInstance()`
- **Observer Pattern**: Event subscription system
- **Pub/Sub Pattern**: Cross-tab event communication
- **Microtask Queue**: Non-blocking sync operations

### Code Organization
- **Feature-Based Structure**: Components grouped by feature
- **Type-First Approach**: Centralized type definitions
- **Test Co-Location**: Tests alongside components
- **Separation of Concerns**: UI, business logic, and data layers

---

## Data Models

### TypeScript Interfaces

```typescript
// Link Model
interface Link {
  id: string              // Unique identifier (UUID)
  title: string           // Display name
  url: string            // Target URL
  iconType: 'favicon' | 'custom'
  iconUrl?: string       // Favicon URL (if iconType is 'favicon')
  iconBase64?: string    // Custom icon data (if iconType is 'custom')
  groupId: string        // Associated group ID
  order: number          // Display order within group
}

// Group Model
interface Group {
  id: string             // Unique identifier (UUID)
  title: string          // Group name
  order: number          // Display order in sidebar
  isCollapsed: boolean   // Collapse state (UI only)
}

// Settings Model
interface GridSettings {
  itemsPerRow: number    // 1-12 items per row
  itemSize: 'small' | 'medium' | 'large'
  showTitles: boolean    // Toggle title display
}

// Application State
interface AppState {
  links: Link[]
  groups: Group[]
  settings: GridSettings
  activeGroupId: string | null
}
```

---

## Components

### Main Application Components

#### `/src/newtab/App.tsx` (327 lines)
Main application container for the new tab page.

**Responsibilities**:
- Drag-and-drop context setup (DndContext)
- Group and link management UI
- Modal state management
- Drag event handling for reordering
- Sidebar and grid layout orchestration

**Key Features**:
- Handles `DragOver` and `DragEnd` events
- Updates link order on drag completion
- Manages modal open/close state
- Responsive layout with sidebar

#### `/src/AppContext.tsx` (549 lines)
Global state management and business logic.

**Responsibilities**:
- CRUD operations for links and groups
- Database synchronization
- Multi-tab sync event handling
- Local storage integration for active group
- State initialization from database

**Key Methods**:
- `addLink()`, `updateLink()`, `deleteLink()`
- `addGroup()`, `updateGroup()`, `deleteGroup()`
- `updateSettings()`
- `setActiveGroupId()`
- Event listeners for sync events

### UI Components

#### `LinkGrid.tsx`
Grid layout for displaying links.
- SortableContext for horizontal sorting
- Responsive grid based on settings
- Integration with LinkItem and NewLinkItem

#### `LinkItem.tsx` (113 lines)
Individual link card component.
- Icon display (favicon or custom)
- Hover controls (edit, delete, drag handle)
- Click handling for navigation
- Size variations (small/medium/large)
- Title toggle based on settings

#### `GroupSidebar.tsx` (186 lines)
Vertical sidebar for group navigation.
- SortableContext for vertical sorting
- Inline group renaming
- Active group highlighting
- Droppable area for cross-group link moves
- Group CRUD operations

#### `NewLinkItem.tsx`
Add new link button component.
- Plus icon display
- Opens AddLinkModal
- Matches grid item styling

### Modal Components

#### `AddLinkModal.tsx` (230 lines)
Form for creating new links.
- Title and URL inputs
- Group selection dropdown
- Icon type selection (favicon/custom)
- File upload with preview
- Form validation

#### `EditLinkModal.tsx` (185 lines)
Form for editing existing links.
- Pre-populated with current data
- Icon switching capability
- Same validation as AddLinkModal

#### `AddGroupModal.tsx` (74 lines)
Simple form for creating groups.
- Title input with validation
- Auto-focuses on open

#### `SettingsModal.tsx` (140 lines)
Grid configuration UI.
- Items per row slider (1-12)
- Size radio buttons (small/medium/large)
- Title visibility toggle
- Real-time preview updates

### Drag & Drop Components

#### `/src/components/dnd/SortableItem.tsx` (77 lines)
Wrapper for sortable items using @dnd-kit.

**Features**:
- `useSortable` hook integration
- Transform and transition CSS
- Drag handle support
- Opacity change during drag
- Passes drag attributes to children

#### `/src/components/dnd/utils.ts` (23 lines)
Utility functions for drag-and-drop.
- Array item finding
- Index utilities
- Wraps @dnd-kit utility functions

---

## Services

### SyncService (`/src/services/SyncService.ts`)

Multi-tab synchronization service using the Singleton pattern.

**Purpose**: Real-time state synchronization between browser tabs

**Implementation Details**:
- **Primary Method**: BroadcastChannel API (modern browsers)
- **Fallback**: localStorage events (compatibility)
- **Instance ID**: Prevents self-update loops
- **Microtask Queue**: Non-blocking operations
- **Auto-Cleanup**: Removes localStorage sync keys

**Event Types**:
```typescript
// Link Events
'link:add'      // New link created
'link:update'   // Link modified
'link:delete'   // Link removed

// Group Events
'group:add'     // New group created
'group:update'  // Group modified
'group:delete'  // Group removed

// Settings Events
'settings:update'  // Settings changed

// Ordering Events
'links:reorder'   // Links reordered
'groups:reorder'  // Groups reordered
```

**API**:
```typescript
SyncService.getInstance()
.emit(event, data)    // Broadcast event
.on(event, callback)  // Subscribe to event
.off(event, callback) // Unsubscribe
```

---

## Configuration

### Build Configuration

#### `webpack.config.js`
- **Entry Points**: `newtab` and `popup`
- **Loaders**:
  - TypeScript: ts-loader
  - CSS: style-loader, css-loader, postcss-loader
  - Assets: webpack asset modules
- **Plugins**:
  - HtmlWebpackPlugin (index.html, popup.html)
  - CopyWebpackPlugin (manifest, icons)
- **Dev Server**: Port 9000

#### `tsconfig.json`
- **Target**: ES5 (broad compatibility)
- **JSX**: react-jsx (new transform)
- **Strict Mode**: Enabled
- **Module**: ES2015
- **Lib**: DOM, ES2015+

#### `tailwind.config.js`
- **Content**: Scans all src files
- **Theme Extensions**:
  - Custom colors (primary, secondary)
  - Extended spacing utilities
- **Plugins**: None

#### `babel.config.js`
- **Presets**: @babel/env, @babel/typescript, @babel/react
- **JSX Runtime**: Automatic

### Testing Configuration

#### `jest.config.js`
- **Preset**: ts-jest
- **Environment**: jsdom (DOM testing)
- **Module Mocking**: CSS and assets
- **Test Exclusions**: dist/, node_modules/

#### `jest.setup.js`
- **IndexedDB Mock**: fake-indexeddb
- **Chrome API Mock**: runtime, tabs, storage
- **Test Environment Setup**: Before all tests

#### `postcss.config.js`
- **Plugins**: Tailwind CSS, Autoprefixer

---

## Build & Deployment

### Development Workflow

```bash
# Install dependencies
npm install

# Start development server (port 9000)
npm start

# Run tests
npm test

# Build for production
npm run build

# Format code
npm run format
```

### Build Output (`/dist`)

After running `npm run build`, the following files are generated:

```
dist/
├── newtab.js          # New tab page bundle
├── popup.js           # Extension popup bundle
├── index.html         # New tab HTML
├── popup.html         # Popup HTML
├── manifest.json      # Extension manifest
└── icons/            # Extension icons
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

### Loading the Extension

1. Build the project: `npm run build`
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (top right)
4. Click "Load unpacked"
5. Select the `/dist` folder
6. New tabs will now show QuickGrid

### Extension Manifest

**`public/manifest.json`** (Manifest V3)

```json
{
  "manifest_version": 3,
  "name": "QuickGrid",
  "version": "1.0",
  "permissions": ["storage", "favicon"],
  "chrome_url_overrides": {
    "newtab": "index.html"
  },
  "action": {
    "default_popup": "popup.html"
  }
}
```

**Permissions**:
- `storage` - Chrome storage API access
- `favicon` - Access to favicon data

**Overrides**:
- New tab page replaced with custom grid

---

## Testing

### Test Coverage

Total test code: **368 lines**

### Test Files

#### 1. `/src/__tests__/AppContext.test.tsx` (155 lines)
Tests for global state management.

**Coverage**:
- AppProvider rendering
- CRUD operations (links, groups)
- State updates and synchronization
- Database integration
- Error handling

#### 2. `/src/__tests__/db.test.ts` (34 lines)
Tests for database utilities.

**Coverage**:
- Favicon URL generation
- File upload handling
- Invalid input handling
- Base64 encoding

#### 3. `/src/components/__tests__/LinkItem.test.tsx` (179 lines)
Tests for LinkItem component.

**Coverage**:
- Component rendering
- Icon display logic (favicon vs. custom)
- User interactions (click, hover)
- Edit and delete handlers
- Size variations
- Title visibility

### Testing Approach

- **Framework**: Jest with React Testing Library
- **Mocking**: fake-indexeddb for database, Chrome API mocks
- **Component Testing**: User interaction focus
- **Integration Testing**: AppContext with database
- **Unit Testing**: Utility functions

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

---

## Recent Development

### Git Commit History

Recent commits indicate active development:

1. **a1e3990** - "store last active group"
   - Added localStorage persistence for active group
   - Improves UX by remembering user's last selection

2. **0023369** - "sync service"
   - Implemented SyncService for multi-tab synchronization
   - BroadcastChannel and localStorage event handling

3. **2e33b06, 6804338, b3b2551** - Various updates
   - Bug fixes and refinements
   - "looks good now" indicates feature completion

4. **ffca1f1** - "rework to dnd-kit"
   - Migrated from previous drag-and-drop library to @dnd-kit
   - Improved DnD performance and reliability

5. **22a357b** - "rework structure"
   - Project restructuring for better organization
   - Architectural improvements

### Development Focus

Recent development has focused on:
- State persistence across sessions
- Real-time synchronization between tabs
- Improved drag-and-drop user experience
- Code organization and maintainability

---

## Design Decisions

### 1. Drag & Drop Library Choice
**Decision**: Use @dnd-kit instead of react-beautiful-dnd

**Rationale**:
- Better performance with large lists
- More flexible API
- Active maintenance
- Supports both horizontal and vertical sorting
- Handles cross-container drags well

### 2. Database Technology
**Decision**: IndexedDB via Dexie

**Rationale**:
- Offline-first architecture
- No backend dependency
- Large storage capacity
- Dexie simplifies IndexedDB API
- Supports complex queries and indexing

### 3. Multi-Tab Synchronization
**Decision**: BroadcastChannel with localStorage fallback

**Rationale**:
- BroadcastChannel is modern and efficient
- localStorage events for older browsers
- Instance ID prevents infinite loops
- Microtask queue prevents UI blocking
- Graceful degradation

### 4. State Management
**Decision**: React Context API

**Rationale**:
- Simpler than Redux for this scale
- No additional dependencies
- Co-located with business logic
- Sufficient for application needs
- Easy to test

### 5. Icon Handling
**Decision**: Google favicon service + base64 custom icons

**Rationale**:
- No need for icon file storage
- Google's service is reliable and fast
- Base64 keeps data in database
- Simple implementation
- Works offline (once loaded)

### 6. TypeScript Usage
**Decision**: Strict TypeScript throughout

**Rationale**:
- Catch errors at compile time
- Better IDE support
- Self-documenting code
- Refactoring confidence
- Industry best practice

### 7. Styling Approach
**Decision**: Tailwind CSS utility classes

**Rationale**:
- Rapid development
- Consistent design system
- No CSS file management
- Small bundle size (purged)
- Easy to customize

### 8. Testing Strategy
**Decision**: Focus on critical paths and components

**Rationale**:
- Core functionality (AppContext) is well-tested
- User-facing components (LinkItem) tested
- Utilities have unit tests
- Balance between coverage and development speed

---

## Code Quality

### Strengths

- **Type Safety**: Comprehensive TypeScript typing throughout
- **Code Style**: Consistent formatting with Prettier
- **Separation of Concerns**: Clear UI, logic, and data layers
- **Reusable Components**: Modular, composable architecture
- **Modern React**: Hooks, context, and functional components
- **Error Handling**: Try-catch blocks for async operations
- **Memory Management**: Proper cleanup in useEffect hooks
- **Accessibility**: Semantic HTML and keyboard navigation

### Architecture Highlights

- **Event-Driven Sync**: Decoupled multi-tab communication
- **Optimistic UI**: Immediate updates before database confirmation
- **Graceful Degradation**: Fallbacks for older browsers
- **Offline-First**: All data stored locally
- **Extension Best Practices**: Manifest V3 compliance

---

## Future Considerations

Based on the current architecture, potential enhancements could include:

1. **Import/Export**: Backup and restore functionality
2. **Search**: Filter links by title or URL
3. **Themes**: Dark mode, custom color schemes
4. **Link Preview**: Hover preview of destination
5. **Keyboard Shortcuts**: Power user features
6. **Analytics**: Usage statistics (privacy-preserving)
7. **Cloud Sync**: Optional backup to cloud storage
8. **Nested Groups**: Sub-categories within groups
9. **Link Tags**: Multiple categorization
10. **Performance**: Virtual scrolling for large datasets

---

## Summary

QuickGrid is a well-architected, production-ready Chrome extension demonstrating professional software engineering practices:

- Clean, maintainable codebase with TypeScript
- Modern React patterns and best practices
- Robust state management and data persistence
- Real-time synchronization across browser tabs
- Excellent user experience with drag-and-drop
- Comprehensive testing of critical functionality
- Extensible architecture for future enhancements

The project is approximately **2,000+ lines** of well-organized TypeScript/React code, ready for distribution or further development.

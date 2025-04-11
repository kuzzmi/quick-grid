// Mock for IndexedDB (Dexie)
require('fake-indexeddb/auto');

// Mock for Chrome Extension API
global.chrome = {
  runtime: {
    id: 'test-extension-id',
    getURL: (path) => `chrome-extension://test-extension-id/${path}`
  },
  tabs: {
    create: jest.fn()
  },
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn(),
      remove: jest.fn()
    }
  }
};
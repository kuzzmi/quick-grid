import { getFaviconUrl } from '../db';

// Mock chrome.runtime.getURL
global.chrome = {
  runtime: {
    id: 'test-extension-id'
  }
} as any;

describe('Database Utilities', () => {
  describe('getFaviconUrl', () => {
    test('returns a valid favicon URL for a valid URL input', () => {
      const testUrl = 'https://example.com';
      const result = getFaviconUrl(testUrl);
      
      // Check that the URL contains the correct format and encoded parts
      expect(result).toContain('chrome-extension://__MSG_@@extension_id__/_favicon/');
      expect(result).toContain(encodeURIComponent(testUrl));
    });
    
    test('returns an empty string for an invalid URL', () => {
      const invalidUrl = 'not-a-url';
      const result = getFaviconUrl(invalidUrl);
      
      expect(result).toBe('');
    });
    
    test('handles URLs with special characters', () => {
      const urlWithSpecialChars = 'https://example.com/search?q=test&lang=en';
      const result = getFaviconUrl(urlWithSpecialChars);
      
      expect(result).toContain(encodeURIComponent(urlWithSpecialChars));
    });
  });
});
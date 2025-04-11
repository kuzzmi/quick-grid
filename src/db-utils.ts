// Helper to detect if we're running as a Chrome extension or in browser mode
export const isExtensionMode = (): boolean => {
  return (
    typeof chrome !== "undefined" && !!chrome.runtime && !!chrome.runtime.id
  );
};

// Chrome-compatible favicon fetching function
export const getFaviconUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);

    if (isExtensionMode()) {
      // Chrome extension mode - use the chrome favicon API
      return `chrome-extension://${chrome.runtime.id}/_favicon/?pageUrl=${encodeURIComponent(url)}&size=128`;
    } else {
      // Browser mode - use Google's favicon service
      return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=128`;
    }
  } catch (error) {
    console.error("Invalid URL:", url);
    return "";
  }
};

// Helper for browser-compatible file handling
export const handleFileUpload = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      const base64String = reader.result as string;
      resolve(base64String);
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsDataURL(file);
  });
};

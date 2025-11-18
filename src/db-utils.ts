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
      // return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=128`;
    } else {
      // Browser mode - use Google's favicon service
      return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=128`;
    }
  } catch (error) {
    console.error("Invalid URL:", url);
    return "";
  }
};

// Fetch favicon and convert to base64
export const fetchFaviconAsBase64 = async (url: string): Promise<string> => {
  try {
    const urlObj = new URL(url);
    let faviconUrl: string;

    // Try extension mode first
    if (isExtensionMode()) {
      faviconUrl = `chrome-extension://${chrome.runtime.id}/_favicon/?pageUrl=${encodeURIComponent(url)}&size=128`;
    } else {
      faviconUrl = `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=128`;
    }

    // Fetch the favicon
    const response = await fetch(faviconUrl);

    // If extension mode fails, try browser mode
    if (!response.ok && isExtensionMode()) {
      faviconUrl = `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=128`;
      const fallbackResponse = await fetch(faviconUrl);

      if (!fallbackResponse.ok) {
        throw new Error('Failed to fetch favicon');
      }

      const blob = await fallbackResponse.blob();
      return await blobToBase64(blob);
    }

    if (!response.ok) {
      throw new Error('Failed to fetch favicon');
    }

    const blob = await response.blob();
    return await blobToBase64(blob);
  } catch (error) {
    console.error("Error fetching favicon:", error);
    // Return a default SVG icon as base64
    return 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxyZWN0IHg9IjMiIHk9IjMiIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iNCI+PC9jaXJjbGU+PC9zdmc+';
  }
};

// Helper to convert blob to base64
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = () => {
      reject(new Error("Failed to convert blob to base64"));
    };
    reader.readAsDataURL(blob);
  });
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

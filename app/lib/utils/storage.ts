export const storage = {
  getItem: (key: string): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(key);
    } catch {
      console.warn(`Failed to get item from localStorage: ${key}`);
      return null;
    }
  },

  setItem: (key: string, value: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, value);
    } catch {
      console.warn(`Failed to set item in localStorage: ${key}`);
    }
  },

  removeItem: (key: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch {
      console.warn(`Failed to remove item from localStorage: ${key}`);
    }
  },

  clear: (): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.clear();
    } catch {
      console.warn('Failed to clear localStorage');
    }
  },

  getJSON: <T>(key: string): T | null => {
    const item = storage.getItem(key);
    if (!item) return null;
    try {
      return JSON.parse(item);
    } catch {
      console.warn(`Failed to parse JSON from localStorage: ${key}`);
      return null;
    }
  },

  setJSON: <T>(key: string, value: T): void => {
    try {
      storage.setItem(key, JSON.stringify(value));
    } catch {
      console.warn(`Failed to stringify value for localStorage: ${key}`);
    }
  },
};

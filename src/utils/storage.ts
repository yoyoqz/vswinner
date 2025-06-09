// Safely access localStorage
export const getStorageItem = (key: string): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem(key);
};

export const setStorageItem = (key: string, value: string): void => {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.setItem(key, value);
};

export const removeStorageItem = (key: string): void => {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.removeItem(key);
};

// Commonly used functions
export const getAuthToken = (): string | null => {
  return getStorageItem('auth_token');
};

export const getAuthHeader = (): { Authorization: string } | Record<string, never> => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}; 
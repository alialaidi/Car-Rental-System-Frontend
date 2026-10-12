const REFRESH_TOKEN_KEY = 'car-rental.refresh-token';

let accessToken: string | null = null;

function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function getRefreshToken(): string | null {
  try {
    return getStorage()?.getItem(REFRESH_TOKEN_KEY) ?? null;
  } catch {
    return null;
  }
}

export function storeTokens(nextAccessToken: string, nextRefreshToken: string): void {
  accessToken = nextAccessToken;
  try {
    getStorage()?.setItem(REFRESH_TOKEN_KEY, nextRefreshToken);
  } catch {
    // Keep the active access token in memory if browser storage is unavailable.
  }
}

export function clearTokens(): void {
  accessToken = null;
  try {
    getStorage()?.removeItem(REFRESH_TOKEN_KEY);
  } catch {
    // Clearing in-memory state still logs the browser out.
  }
}

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

if (!apiBaseUrl) {
  throw new Error(
    'VITE_API_BASE_URL is not configured. Copy .env.example to .env and set the API URL.',
  );
}

export const env = Object.freeze({ apiBaseUrl: apiBaseUrl.replace(/\/+$/, '') });

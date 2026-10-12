import { describe, expect, it, vi } from 'vitest';

describe('env configuration', () => {
  it('requires an API base URL', async () => {
    vi.stubEnv('VITE_API_BASE_URL', '');
    vi.resetModules();
    await expect(import('./env')).rejects.toThrow('VITE_API_BASE_URL is not configured');
    vi.unstubAllEnvs();
  });

  it('normalizes trailing slashes in the API base URL', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.test///');
    vi.resetModules();
    const { env } = await import('./env');
    expect(env.apiBaseUrl).toBe('https://api.example.test');
    vi.unstubAllEnvs();
  });
});

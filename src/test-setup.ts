import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Keep module-level API configuration deterministic even when .env is not present in CI.
vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.test');

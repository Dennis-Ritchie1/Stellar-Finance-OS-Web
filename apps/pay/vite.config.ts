import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { msw } from 'msw/vite';

export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    tailwindcss(),
    // Serve the MSW worker script in dev only, so it never ships in production builds.
    ...(command === 'serve' ? [msw({ mode: 'worker-only' })] : []),
  ],
  // Read .env from the monorepo root so both apps share one config.
  envDir: '../..',
  server: { port: 5174, strictPort: true },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
  },
}));

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'miniflare',
    setupFiles: './src/tests/setup.ts',
    coverage: {
      exclude: ['src/tests/**', 'src/db/**'],
      include: ['src/**'],
    },
  },
});
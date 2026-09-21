import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'src/api/client.ts',
        'src/components/**',
        'src/hooks/useI18n.ts',
        'src/i18n/**',
        'src/lib/**',
        'src/stores/authStore.ts',
        'shared/version.ts',
      ],
      exclude: [
        'node_modules/',
        'dist/',
        'coverage/',
        'tests/',
        'src/**/*.test.ts',
        'src/**/*.test.tsx',
        'src/**/*.spec.ts',
        'src/**/*.spec.tsx',
      ],
      thresholds: {
        statements: 64,
        branches: 86,
        functions: 78,
        lines: 64,
        'src/api/client.ts': {
          statements: 70,
          branches: 70,
          functions: 70,
          lines: 70,
        },
        'src/components/**': {
          statements: 0,
          branches: 0,
          functions: 0,
          lines: 0,
        },
        'src/hooks/useI18n.ts': {
          statements: 70,
          branches: 70,
          functions: 70,
          lines: 70,
        },
        'src/i18n/**': {
          statements: 70,
          branches: 70,
          functions: 70,
          lines: 70,
        },
        'src/lib/**': {
          statements: 70,
          branches: 70,
          functions: 70,
          lines: 70,
        },
        'src/stores/authStore.ts': {
          statements: 70,
          branches: 70,
          functions: 70,
          lines: 70,
        },
        'shared/version.ts': {
          statements: 70,
          branches: 70,
          functions: 70,
          lines: 70,
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, './shared'),
    },
  },
})

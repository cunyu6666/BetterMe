import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// vitest config extends Vite config; uses jsdom for DOM-touching tests
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./__tests__/setup.ts'],
    include: ['__tests__/**/*.test.{ts,tsx}'],
    css: false,
  },
})

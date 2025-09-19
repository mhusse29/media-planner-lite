/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Serve from root in development and use relative paths in production so builds
  // work whether they're deployed at the domain root or a sub-path.
  base: process.env.NODE_ENV === 'production' ? './' : '/',
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts'
  }
})
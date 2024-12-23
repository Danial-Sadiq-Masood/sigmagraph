import { defineConfig } from 'vite'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [],
  base : '/sigmagraph/',
  build: {
    assetsInlineLimit: 0, // Set to 0 to disable inlining of all assets
  }
})
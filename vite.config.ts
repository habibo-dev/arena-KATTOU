import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '',
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          let filename = 'assets/[name][extname]'
          if (assetInfo.name === 'css') {
            filename = 'css/[name][extname]'
          }
          return filename
        }
      }
    }
  }
})
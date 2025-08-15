import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/

const backendHost = process.env.BACKEND_HOST || 'localhost';

export default defineConfig({
  plugins: [react(), tailwindcss(),],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
      server:{
      proxy: {
  '/api-main': {
    target: `http://${backendHost}:8000`,
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api-main/, ''),
  },
},
    },
})

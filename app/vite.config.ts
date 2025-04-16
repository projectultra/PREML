import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port:5000,
    host:'0.0.0.0',
    proxy: {
      
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:7333',
        changeOrigin: true,
      },
    },
  },
});
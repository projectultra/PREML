import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5000,
    host: '0.0.0.0',
    allowedHosts: [
      'preml-e3bfevh8abfgenc8.centralindia-01.azurewebsites.net'
    ],
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY_TARGET || 'http://backend:7333',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
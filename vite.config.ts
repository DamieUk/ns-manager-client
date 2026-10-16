import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: {
    // Serve the API on the same origin in development, as in production (Caddy routes /api/*
    // to the backend), so the session cookie works without any cross-origin setup.
    proxy: {
      '/api': 'http://localhost:5001',
    },
  },
});

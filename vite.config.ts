
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173
  },
  preview: {
    // Allows any hostname (like *.onrender.com) to bypass Vite's strict security filters
    allowedHosts: true,
    host: '0.0.0.0',
    port: Number(process.env.PORT) || 4173
  }
});

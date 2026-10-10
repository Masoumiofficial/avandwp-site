import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// allowedHosts: true lets the sandbox preview proxy (https://{port}-{sandbox}.e2b.app) reach the dev server.
export default defineConfig({
  base: './', // relative asset URLs so the built folder works under any path
  plugins: [react()],
  server: { host: '0.0.0.0', allowedHosts: true },
  preview: { host: '0.0.0.0', allowedHosts: true },
});

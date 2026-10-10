import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// STANDALONE=1 builds a file:// friendly bundle for the downloadable package:
// one classic script (IIFE), no code splitting, no modulepreload. The regular build is unchanged.
const standalone = process.env.STANDALONE === '1';

// allowedHosts: true lets the sandbox preview proxy (https://{port}-{sandbox}.e2b.app) reach the dev server.
export default defineConfig({
  base: './', // relative asset URLs so the built folder works under any path
  plugins: [react()],
  build: standalone
    ? {
        modulePreload: false,
        rollupOptions: { output: { format: 'iife', inlineDynamicImports: true } },
      }
    : {},
  server: { host: '0.0.0.0', allowedHosts: true },
  preview: { host: '0.0.0.0', allowedHosts: true },
});

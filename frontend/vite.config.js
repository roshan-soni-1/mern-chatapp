import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  build: {
    minify: 'esbuild', // fast minifier, avoids Terser crashes
  },
  plugins: [
    react(),
  ],
});
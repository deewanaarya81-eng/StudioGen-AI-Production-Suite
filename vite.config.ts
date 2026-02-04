
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Define process.env to ensure compatibility with the Gemini API calls
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || '')
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    // Ensure the output is compatible with GitHub Pages sub-paths if necessary
    // base: '/your-repo-name/' <- Change this if not using a custom domain
  }
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        // Split large dependencies so no single chunk dominates the initial load.
        manualChunks: {
          languages: ['./src/data/languages.ts'],
          vendor:    ['react', 'react-dom', '@xyflow/react'],
          editor:    ['@tiptap/react', '@tiptap/starter-kit', '@tiptap/extension-mention',
                      '@tiptap/extension-placeholder', '@tiptap/suggestion', 'tippy.js'],
        },
      },
    },
  },
});

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: './src/test/setup.ts',
    css: false,
    alias: { '\\.(svg)$': './src/test/svg-stub.ts' },
  },
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

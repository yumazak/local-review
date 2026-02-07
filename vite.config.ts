import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig(({ mode }) => ({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/extension.ts'),
      formats: ['cjs'],
      fileName: () => 'extension.js',
    },
    outDir: 'dist',
    rollupOptions: {
      external: ['vscode'],
      output: { format: 'cjs', exports: 'named' },
    },
    sourcemap: mode === 'production' ? 'hidden' : true,
    minify: mode === 'production',
    target: 'node18',
    emptyOutDir: true,
  },
}));

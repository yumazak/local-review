import { defineConfig } from '@vscode/test-cli';

export default defineConfig([
  {
    label: 'unit',
    files: 'out/**/tests/**/*.test.js',
  },
  {
    label: 'e2e',
    files: 'out/test/**/*.test.js',
    workspaceFolder: '.',
  }
]);

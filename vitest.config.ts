import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: [
      'src/features/comment-store/utils/tests/**/*.test.ts',
      'src/utils/tests/**/*.test.ts',
    ],
    globals: true,
    environment: 'node',
  },
});

import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // lib/auth.ts pulls in lib/db.ts, which throws at import time if these
    // aren't set (matches its real runtime behavior). The DB client itself
    // is created lazily and never connects during these unit tests, so
    // placeholder values are fine here.
    env: {
      DATABASE_URL: 'postgres://test:test@localhost:5432/test',
      SESSION_SECRET: 'test-only-session-secret-not-used-for-real-auth',
    },
  },
})

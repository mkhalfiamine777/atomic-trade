// Sentry Edge Configuration — Atomic Trade
// Captures errors from Next.js Middleware (Edge Runtime).

import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
  release: process.env.RAILWAY_GIT_COMMIT_SHA || 'dev',
  tracesSampleRate: 0.05,
})

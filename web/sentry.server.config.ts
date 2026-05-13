// Sentry Server Configuration — Atomic Trade
// Captures Server Action errors, API Route errors, and DB exceptions.

import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // ✅ تحكّم التفعيل بوجود DSN
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,

  // 🔗 ربط كل خطأ بـ commit
  release: process.env.RAILWAY_GIT_COMMIT_SHA || 'dev',

  // 📊 Free tier friendly
  tracesSampleRate: 0.05,

  // 🛡️ PII Filter — حماية البيانات الحسّاسة
  beforeSend(event) {
    if (event.request?.cookies) delete event.request.cookies
    if (event.request?.headers?.cookie) delete event.request.headers.cookie

    const SENSITIVE = ['password', 'phone', 'latitude', 'longitude', 'currentPassword', 'newPassword']
    if (event.request?.data && typeof event.request.data === 'object') {
      const data = event.request.data as Record<string, unknown>
      for (const key of SENSITIVE) {
        if (key in data) data[key] = '[Filtered]'
      }
    }
    return event
  },

  beforeBreadcrumb(breadcrumb) {
    // P0-2.1: Strip UUIDs from console breadcrumbs to prevent
    // userId/conversationId leak via server.ts logging
    if (breadcrumb.category === 'console' && typeof breadcrumb.message === 'string') {
      breadcrumb.message = breadcrumb.message.replace(
        /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
        '[uuid-redacted]'
      )
    }
    return breadcrumb
  },
})

// Sentry Client Configuration — Atomic Trade
// Captures React render errors, unhandled JS exceptions, and browser performance.

import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // ✅ تحكّم التفعيل بوجود DSN، ليعمل في staging أيضاً
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,

  // 🔗 ربط كل خطأ بـ commit في GitHub
  release: process.env.NEXT_PUBLIC_RAILWAY_GIT_COMMIT_SHA || 'dev',

  // 📊 Free tier = 10k transactions/شهر — ابدأ منخفضاً
  tracesSampleRate: 0.05,

  // 🎥 Session Replay — فقط عند حدوث خطأ
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0.5,

  // 🛡️ PII Filter — لا تسرّب بيانات حسّاسة
  beforeSend(event) {
    // امسح cookies تماماً
    if (event.request?.cookies) delete event.request.cookies
    if (event.request?.headers?.cookie) delete event.request.headers.cookie

    // امسح حقول حسّاسة من الـ payload
    const SENSITIVE = ['password', 'phone', 'latitude', 'longitude', 'currentPassword', 'newPassword']
    if (event.request?.data && typeof event.request.data === 'object') {
      const data = event.request.data as Record<string, unknown>
      for (const key of SENSITIVE) {
        if (key in data) data[key] = '[Filtered]'
      }
    }
    return event
  },

  // 🔇 تجاهل أخطاء شائعة غير مفيدة
  ignoreErrors: [
    'ResizeObserver loop',
    'Loading chunk',
    'Failed to fetch',
    'AbortError',
    'Network request failed',
    'Load failed',
  ],
})

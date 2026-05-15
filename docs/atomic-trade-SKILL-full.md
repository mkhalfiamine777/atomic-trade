---
name: atomic-trade
description: |
  Specialized skill for the Atomic Trade (Social Commerce on a live map) codebase.
  Use whenever the user asks you to:
  - add or modify a Server Action in src/actions/
  - touch the Prisma schema, run a migration, or change DB models
  - work on the map / Leaflet / Supercluster / Zone Grid
  - add a real-time feature using Socket.io
  - add or update a feed/listing/post/story/interaction/zone/trust feature
  - audit the project (security, performance, integration, architecture)
  - apply the Anchor Rule, Orbital Spread, or any geolocation logic
  - write Vitest tests for actions/services
  - update CLAUDE.md / AI_mkhalfiAmine.md memory
  Triggers: "atomic trade", "social commerce", "anchor rule", "orbital spread", "zone master", "matching engine", "trust score", "crowd price drop", "watch-to-earn", "feedService", "matchingService", "server action", "socket.io" in this repo.
license: Proprietary to the Atomic Trade project (mkhalfiAmine).
---

# Atomic Trade — Project Skill

> **استدعِ هذا الـ Skill** قبل لمس أي كود في مشروع Atomic Trade. يحتوي على القواعد التي **لا يجوز كسرها** والقوالب التي يجب اتّباعها.

## 0) الذاكرة الإلزامية قبل أي عمل

1. اقرأ `CLAUDE.md` في جذر المشروع.
2. اقرأ `ARCHITECTURE_AR.md` و `docs/00_DEEP_AUDIT_2026.md`.
3. افحص آخر إنجازات الجلسة في `AI_mkhalfiAmine.md` (آخر قسم `📅`).
4. حدّث `AI_mkhalfiAmine.md` في نهاية الجلسة (سجل جديد تحت "📜 سجل الإنجازات").

## 1) القاعدتان الذهبيتان — Sacred Rules

### 1.1 Cardinal Location Rule
كل نشاط (Listing/Post/Story) يجب أن يخزّن `latitude/longitude`. لا استثناءات.

### 1.2 Anchor + Orbital Spread

| نوع المستخدم | السلوك |
|---|---|
| `INDIVIDUAL` | الأنشطة تتبع آخر موقع GPS للمستخدم |
| `SHOP` / `COMPANY` | الموقع **مثبت** على إحداثيات أول تسجيل؛ كل نشاط جديد يدور على شعاع 15–35م |

**الاستخدام الإلزامي:**

```ts
import { getOrbitLocation } from '@/utils/geo'
import { db } from '@/lib/db'

// داخل أي action ينشئ Listing/Post/Story:
const user = await db.user.findUnique({
  where: { id: userId },
  select: { type: true, latitude: true, longitude: true }
})
if (!user) return { error: 'User not found' }

let finalLat = inputLat
let finalLng = inputLng
let shouldUpdateUserGPS = true

if ((user.type === 'SHOP' || user.type === 'COMPANY') && user.latitude && user.longitude) {
  const orbit = getOrbitLocation(user.latitude, user.longitude)
  finalLat = orbit.lat
  finalLng = orbit.lng
  shouldUpdateUserGPS = false   // ⚓ منع الانجراف
}
```

## 2) قالب Server Action نموذجي (محدّث بعد الجلسة 34)

```ts
'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { z } from 'zod'
import * as Sentry from '@sentry/nextjs'   // ← إلزامي منذ الجلسة 34

const schema = z.object({ /* validations */ })

export async function myAction(formData: FormData) {
  // 1) auth
  const userId = (await cookies()).get('user_id')?.value
  if (!userId) return { success: false, error: 'Unauthorized' }

  // 2) validate
  const parsed = schema.safeParse({/* raw */})
  if (!parsed.success) {
    return { success: false, error: 'بيانات غير صالحة' }
  }

  try {
    // 3) atomic write
    const result = await db.$transaction(async (tx) => { /* ... */ })

    // 4) revalidate
    revalidatePath('/dashboard')
    return { success: true, payload: result }
  } catch (error) {
    // 5) ✅ إلزامي: Sentry + console (بهذا الترتيب)
    Sentry.captureException(error, { tags: { action: 'myAction' } })
    console.error('myAction Error:', error instanceof Error ? error.message : error)
    return { success: false, error: 'فشل العملية، حاول مجدداً' }
  }
}
```

### ❌ ممنوع تماماً
- `throw` داخل action.
- استدعاء Prisma من client component.
- الثقة بـ userId من `FormData/body`.
- `any` / `as any`.
- **`console.error` بدون `Sentry.captureException` قبله** — يبتلع الخطأ ولا يصل المراقبة (الجلسة 34).
- **طباعة UUIDs/userIds/conversationIds في `console.log` أو `console.warn`** — تُسرّب عبر Sentry breadcrumbs رغم وجود scrub regex.

## 3) قالب Service

```ts
import { db } from '@/lib/db'
import { getIO } from '@/lib/socketEngine'

export async function doBusinessLogic(input) {
  // منطق ثقيل — throw مسموح هنا
  const io = getIO()
  io?.to(`user:${someId}`).emit('event_name', payload)
}
```

## 4) Prisma — قواعد التعديل

- ✅ كل model: `id @id @default(uuid())`, `createdAt @default(now())`.
- ✅ كل FK كبير: `@@index`.
- ✅ كل تكرار محتمل: `@@unique` مركّب.
- 🔴 **لا `prisma db push` في الإنتاج**. حصراً `migrate deploy`.

```bash
cd web
npx prisma migrate dev --name add_my_feature
```

## 5) Socket.io

```ts
// إرسال من السيرفر
import { getIO } from '@/lib/socketEngine'
getIO()?.to(`user:${userId}`).emit('match_found', payload)

// listener على العميل
useEffect(() => {
  if (!socket) return
  const handler = (data) => { /* ... */ }
  socket.on('event_name', handler)
  return () => socket.off('event_name', handler)
}, [socket])
```

**الغرف:**
- `user:<userId>`
- `<conversationId>`

## 6) Map / Leaflet

- ✅ Z-Index: Shop=1000, Listing/Story=900, Individual=800.
- ✅ `moveend`/`zoomend` لا `move`/`zoom`.
- ✅ `dynamic(() => import('...'), { ssr: false })` لأي مكون يحتاج Leaflet.

## 7) Security Checklist (PR) — محدّث بعد الجلسة 34

- [ ] auth عبر cookie فقط.
- [ ] Zod validation (محدّد لكل action، لا تحقق يدوي).
- [ ] `$transaction` للكتابات المركّبة.
- [ ] لا تسرب `phone/password/lat/lng` للجمهور — استخدم `select` صريح.
- [ ] `revalidatePath`.
- [ ] `verifyAdmin()` للـ admin actions.
- [ ] لا inline JS/CSS جديد.
- [ ] Vitest tests.
- [ ] **`Sentry.captureException(error, { tags: { action: '<name>' } })` في كل catch.**
- [ ] **حقول حساسة جديدة مضافة لقائمة `SENSITIVE` في PII filter.**
- [ ] **لا `console.log(<userId>)` في الكود — استخدم socket.id أو generic identifiers.**
- [ ] **إن أضفت Sentry feature/integration جديد، حدّث `vitest.setup.ts` mock.**

## 8) Performance Checklist

- [ ] `select` صريح.
- [ ] `@@index` على where/orderBy.
- [ ] `Promise.all`.
- [ ] `take` على القراءات الكبيرة.
- [ ] cursor pagination.
- [ ] لا N+1.

## 9) Anti-patterns

| ❌ | ✅ |
|---|---|
| `findMany({})` بلا select | استخدم `select` |
| تحديث reputationScore خارج tx | لفّه في `$transaction` |
| `Math.random()` داخل cache | seed مستقر |
| client يستدعي action عبر fetch | استدعاء مباشر |
| `as any` | نوع dedicated أو `unknown` |

## 10) أوامر سريعة

```bash
# تطوير
cd web && npm run dev                       # تشغيل dev server
cd web && npx vitest                        # اختبارات watch
cd web && npx vitest run                    # اختبارات one-shot
cd web && npx tsc --noEmit                  # type check
cd web && npx prisma migrate dev --name <desc>
cd web && npx prisma studio
cd web && npx prisma migrate deploy         # production (لا db push!)

# CI الكامل قبل push
cd web && npx tsc --noEmit && npx vitest run && npm run build

# Sentry حياً (بعد deploy)
# https://atomic-trade.sentry.io/issues/

# إن فشل الاختبار بسبب Sentry cold-start في first import
# تأكد أن vitest.setup.ts فيه: vi.mock('@sentry/nextjs', ...)
```

## 11) حالة الإصلاحات (Updated بعد الجلسة 34)

### ✅ مُنجَز

- **P0-1:** `db push --accept-data-loss` → `migrate deploy` ✅
- **P0-2:** Sentry observability كاملة (38 captureException + PII filter + tunnelRoute) ✅
- **P0-2.1:** Breadcrumb UUID scrub (regex في beforeBreadcrumb) ✅
- **P0-4:** Socket rate limit (30/10s per userId) ✅
- **P0-5:** فصل `isLiked` عن مفتاح cache (~99.95% توفير ذاكرة) ✅

### 🔴 P0 المتبقي

- **P0-3:** signed cookie / Socket auth — الجلسة 36 (جمعة/سبت) مع iron-session.

### 🟠 P1 الأهم

- **P1-1:** PostGIS migration + GiST indexes.
- **P1-2:** `ListingImage[]` بدل CSV string.
- **P1-3:** `withAuth + withValidation` wrappers.
- **P1-4:** `utils/anchor.ts → resolveAnchor()` helper (يحذف 3 تكرارات).
- **P1-5:** `trustService` `$transaction` wrap (TOCTOU fix).

التفاصيل: `docs/00_DEEP_AUDIT_2026.md` + `walkthrough.md` للجلسة الحالية.

## 12) لغة الواجهة

- العربية الفصحى. RTL.
- لهجة محايدة. صديقي، عملي، صادق.
- إيموجي باعتدال (🛡️ ⚡ 🗺️ 🏪 🎯 ⚓ 🪐 🔥).

---

---

## 13) Observability — Sentry Patterns (جديد بعد الجلسة 34)

### 13.1 ملفات Sentry الأساسية (لا تلمسها بدون فهم)

```
web/
├── instrumentation.ts              ← Next.js register() hook
├── sentry.client.config.ts         ← Browser SDK + PII filter + UUID scrub
├── sentry.server.config.ts         ← Node SDK + نفس الفلاتر
├── sentry.edge.config.ts           ← Edge runtime SDK
├── next.config.mjs                 ← withSentryConfig wrapper
└── src/lib/serverAction.ts         ← withSentry() wrapper (مستقبلي)
```

### 13.2 نمط `captureException` الإلزامي في الـ actions

كل catch block في `src/actions/*.ts` يجب أن يحوي:

```ts
} catch (error) {
  Sentry.captureException(error, { tags: { action: 'actionName' } })
  console.error('actionName Error:', error)
  return { success: false, error: 'رسالة عربية...' }
}
```

**38 موضع** مطبَّق حالياً في 18 ملف action. أي action جديد يجب أن يتبع نفس النمط.

### 13.3 PII Filter — `beforeSend`

```ts
beforeSend(event) {
  // امسح cookies تماماً
  if (event.request?.cookies) delete event.request.cookies
  if (event.request?.headers?.cookie) delete event.request.headers.cookie

  // امسح حقول حسّاسة
  const SENSITIVE = ['password', 'phone', 'latitude', 'longitude',
                     'currentPassword', 'newPassword']
  if (event.request?.data && typeof event.request.data === 'object') {
    for (const key of SENSITIVE) {
      if (key in event.request.data) event.request.data[key] = '[Filtered]'
    }
  }
  return event
}
```

**عند إضافة حقل حساس جديد**، أضفه لقائمة `SENSITIVE` في **كلا** الـ configs (client + server).

### 13.4 Breadcrumb UUID Scrub — `beforeBreadcrumb`

```ts
beforeBreadcrumb(breadcrumb) {
  if (breadcrumb.category === 'console' && typeof breadcrumb.message === 'string') {
    breadcrumb.message = breadcrumb.message.replace(
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
      '[uuid-redacted]'
    )
  }
  return breadcrumb
}
```

### 13.5 Sentry في Tests — Mock في `vitest.setup.ts`

```ts
import { vi } from 'vitest'

vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
  captureMessage: vi.fn(),
  init: vi.fn(),
  withScope: vi.fn((cb) => cb({ setTag: vi.fn(), setExtra: vi.fn() })),
  setUser: vi.fn(),
  setTag: vi.fn(),
  setExtra: vi.fn(),
}))
```

**بدون هذا الـ mock:** أول test يستورد `@sentry/nextjs` يحصل cold-start ~10s ويفشل بـ timeout. أي اختبار جديد يستورد action → يستورد Sentry → cold-start.

### 13.6 Railway Environment Variables

| Variable | Type | الغرض |
|---|---|---|
| `NEXT_PUBLIC_SENTRY_DSN` | Runtime + Build | client + server SDK init |
| `SENTRY_AUTH_TOKEN` | **Build Variable ⚠️** | رفع sourcemaps في `withSentryConfig` |
| `SENTRY_ORG` | Build | تنظيم Sentry (`atomic-trade`) |
| `SENTRY_PROJECT` | Build | اسم المشروع (`javascript-nextjs`) |

⚠️ `SENTRY_AUTH_TOKEN` يجب أن يكون متاحاً وقت `npm run build` وإلا sourcemaps لن تُرفع → stack traces minified.

### 13.7 Verification بعد كل Deploy

1. Build logs → `Successfully uploaded source maps` (لو `silent: false`).
2. Sentry → Releases → commit SHA جديد.
3. Sentry → Issues → أي خطأ حديث → stack trace بأسماء ملفات حقيقية.
4. PII check → cookies غير ظاهرة، حقول حسّاسة `[Filtered]`.
5. Breadcrumbs → UUIDs `[uuid-redacted]`.

---

## 14) Railway Deployment Notes

- **Build vs Runtime variables**: Railway يحقن المتغيرات لكليهما افتراضياً، لكن `SENTRY_AUTH_TOKEN` يجب التأكد منه في Build (sourcemaps).
- **`RAILWAY_GIT_COMMIT_SHA`**: مُحقَن تلقائياً، يُستخدم كـ Sentry release ID.
- **Auto-deploy on push to `main`**: لا staging. كن حذراً.
- **Rollback**: في Deployments tab → اختر deployment قديم → Redeploy.
- **Backup قبل عمليات حساسة**: Settings → Backups (PostgreSQL snapshots).

---

## مراجع داخلية

- `CLAUDE.md` (جذر) — ذاكرة موجزة + قسم 14 (Observability).
- `docs/00_DEEP_AUDIT_2026.md` — تدقيق معمق.
- `AI_mkhalfiAmine.md` — سجل تاريخي للجلسات.
- `walkthrough.md` (يُحدَّث لكل جلسة P0/P1) — تقرير هندسي مفصّل.
- `ARCHITECTURE_AR.md` — معمارية.
- `src/utils/geo.ts` — مرجع Orbital Spread.
- `src/services/*` — أنماط Services.
- `src/actions/__tests__/server-actions.test.ts` — أنماط اختبار.
- `sentry.{client,server,edge}.config.ts` + `instrumentation.ts` — أنماط Sentry.
- `vitest.setup.ts` — Sentry mock pattern.

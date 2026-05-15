# CLAUDE.md — Project Memory (Atomic Trade / Social Commerce)

> **Read me first** at the start of every Claude session in this repo. Updated **2026‑05‑13** (Session 34: Sentry + P0 hardening).
> This file is the durable cache of "who this project is" so any agent can pick up work without re‑deriving context.

---

## 1) Identity (الهوية)

- **اسم المنتج / Product:** Atomic Trade — التجارة الذرية.
- **الجوهر / Core:** منصة **تجارة اجتماعية على خريطة حية** (geo‑social marketplace) تربط الأفراد والمتاجر والشركات في نسيج واحد، حيث **كل نشاط (منتج، طلب، قصة، فيديو، تفاعل) مختوم بإحداثيات GPS**.
- **الرؤية (North Star):** "كل مستخدم، محل، وشركة مرئي وقابل للتفاعل معه على الخريطة." كل ميزة تُبنى تخدم هذا الجوهر، وكل قرار معماري يُختبر ضد قاعدتين: *قانون الموقع الأساسي* و *قانون التثبيت*.
- **المرجع التاريخي:** `AI_mkhalfiAmine.md` (576 سطر سجل جلسات)، `ARCHITECTURE_AR.md`، `docs/Master_Execution_Plan_2026.md`.
- **النشر / Live:** `https://atomic-trade-production.up.railway.app` (Railway, auto‑deploy on `main`).
- **اللهجة:** عربية فصحى تقنية + Bilingual تعليقات عند الحاجة. RTL باللغة الأم.

---

## 2) Tech Stack — at a glance

| طبقة | تقنية | ملاحظات حرجة |
|------|-------|----------------|
| Framework | Next.js **16.1.3** (App Router) | RSC حيثما أمكن. لا تطابق نمط Pages. |
| UI | React **19.2.3** + Tailwind + Framer Motion + Radix | Glassmorphism + Neon Cyberpunk |
| DB | PostgreSQL (Railway) عبر **Prisma 5** | المخطط = مصدر الحقيقة |
| Realtime | **Socket.io 4.8** مدمج في `server.ts` | لا تعمل على Vercel — Railway فقط |
| Auth | كوكي `user_id` (httpOnly, sameSite=lax, 7d) + bcryptjs | لا NextAuth |
| Upload | UploadThing v7 | endpoints: `mediaPost` / `avatarUpload` / `productImages` |
| Cache / RateLimit | Upstash Redis + `@upstash/ratelimit` | 10 req / 10s per IP على `/api/*` و auth |
| Maps | Leaflet 1.9 + React‑Leaflet 5 + Supercluster 8 + ngeohash | Geohash precision 6 للزون |
| Validation | Zod 4 | جميع المدخلات من FormData |
| Tests | Vitest 4 + Testing Library + jsdom | `__mocks__/db.ts` لمحاكاة Prisma + `@sentry/nextjs` mock في `vitest.setup.ts` |
| Observability | **@sentry/nextjs 9** | configs: client/server/edge + `instrumentation.ts` + `tunnelRoute: '/monitoring'` |
| Node | ≥ 20.9 | `engines.node` مثبت في `package.json` |

**عدد ملفات `.ts/.tsx`:** ~146 ملفاً (~14,045 سطراً) — مشروع متوسط الحجم لكن كثيف الميزات.

---

## 3) الخريطة المعمارية / Architectural Map

```
                ┌─────────────────────────────────────────────┐
   Browser ────►│ Next.js App Router (src/app)                │
                │  ├─ pages (server components by default)    │
                │  └─ client components ('use client')        │
                └────────────────┬───────────┬────────────────┘
                                 │ Server     │ Socket.io
                                 │ Actions    │ (over same server.ts)
                                 ▼            ▼
                ┌─────────────────────────────────────────────┐
                │ src/actions/* (use server)                  │  ← thin orchestrators
                │   auth · market · social · stories · feed   │
                │   interactions · trust · zones · chat       │
                │   user · follow · earnCoins · updateStreak  │
                └──┬──────────┬───────────┬───────────────────┘
                   │          │           │
                   ▼          ▼           ▼
            src/services  src/lib       src/utils
            feedService   db (Prisma)   geo (Orbital Spread)
            matchingSvc   redis         mapIcons
            trustSvc      schemas (Zod)
            conversation  socketEngine (global IO bridge)
                   │
                   ▼
              PostgreSQL  +  Upstash Redis  +  UploadThing CDN
```

**القاعدتان الذهبيتان:**

1. **The Cardinal Location Rule** — كل أيقونة مرتبطة بآخر إحداثيات معروفة. الأفراد يتحركون كل 20 ثانية (`useGeolocation` + `updateUserLocation`).
2. **The Anchor Rule + Orbital Spread** — المتاجر والشركات **ثابتة**. أي نشاط جديد ينشأ على شعاع 15–35 م حول إحداثيات المتجر (`utils/geo.ts → getOrbitLocation`). هذا منطبَّق في: `market.ts`, `social.ts`, `stories.ts`, `user.ts`.

---

## 4) Data Model (مختصر)

**النموذج الجوهري:** `User → (Listing | SocialPost | MapStory | Interaction | Follow | ZoneMaster | Conversation/Message)`.

- `User`: نوع `INDIVIDUAL | SHOP | COMPANY`، خصائص حياتية (coins, streakDays, reputationScore 0–1000 default 100, walletBalance, scheduledDeletionAt).
- `Listing`: `PRODUCT | REQUEST` + `crowdTarget/crowdDiscount/originalPrice` (آلية تخفيض الجمهور).
- `MapStory`: تنتهي بعد 24h (`expiresAt`).
- `SocialPost`: `POST | OFFER`، نوع وسائط `IMAGE | VIDEO`.
- `Interaction`: تعدد الأشكال (Polymorphic‑ish) عبر nullable FKs على `postId | listingId | targetUserId` — نوعها `LIKE | LOVE | COMMENT | RATING | WATCH_COMPLETE`. عليها قيود `@@unique` ثلاثية لمنع التكرار.
- `ZoneMaster`: مالك جغرافي عبر `geoHash` (precision 6 ≈ 1.2×0.6 km).

**فهارس مكانية:** `@@index([latitude, longitude])` على `Listing`, `MapStory`, `SocialPost`. ⚠️ ليست فهارس GIST — استعلامات الـ bounding box خطية O(N) على المدى البعيد. خطة: **PostGIS + GiST**.

**ضعف معروف:** `Listing.images` خيط `String` (CSV) بدل علاقة 1‑إلى‑n مع `Image`. تعقيد التعامل ودَيْن تقني.

---

## 5) قواعد الكتابة في هذا المشروع (Coding Conventions)

- **Server Actions Only:** كل كتابة لقاعدة البيانات تمر عبر ملف في `src/actions/`. **لا** تستدعي Prisma من مكوّن `'use client'`.
- **شكل العودة الموحّد:** `{ success: boolean, error?: string, ...payload }` — **لا** تستخدم `throw`. الـ services الداخلية ترمي، لكن الـ actions تلتقط وتحوّل.
- **Auth:** اقرأ `user_id` من `await cookies()` في كل action. لا تثق أبداً بأي `userId` يأتي من `FormData` أو `body`.
- **التحقق:** أي إدخال خارجي يمر عبر `lib/schemas.ts` (Zod). نَمّط كل schema جديد هناك.
- **TypeScript:** ممنوع `any` و `as any` — استخدم `unknown` ثم `instanceof Error`. يوجد 3 مواقع لا تزال تستخدم `operations: any[]` لمصفوفات `$transaction` — اعتبرها دَيناً تقنياً.
- **Race safety:** كل تدفّق يقرأ ثم يكتب يجب أن يكون داخل `db.$transaction` (TOCTOU). الأمثلة المعتمدة: `purchaseZone`, `interactWithListing` (Crowd Drop).
- **Revalidate:** بعد كل كتابة أساسية استدعِ `revalidatePath('/dashboard')` أو المسار المعني.
- **Cookies في Socket.io:** الخادم في `server.ts` يستخرج `user_id` من `socket.handshake.headers.cookie` ويوصل المستخدم بغرفة `user:<id>` تلقائياً. لا تكسر هذا.
- **Admin Guard:** أي action إدارية تستدعي `verifyAdmin()` من `lib/adminGuard.ts` (تتحقق من `process.env.ADMIN_PHONES`).
- **عدم تسريب بيانات:** عند `findMany` للمستخدمين، **استثنِ** `phone` و `password` و `latitude/longitude` من `select` (الفترة المسموح بها للجمهور: `id, name, username, avatarUrl, type, isVerified, reputationScore`). مثال موجود في `getListings`.
- **التصميم:** خلفية `bg-zinc-950`، ألوان نيون (أصفر=محل، سماوي=فرد، بنفسجي=شركة).
- **i18n:** الواجهة بالعربية RTL (`<html lang="ar" dir="rtl">`). كل النصوص للمستخدم النهائي بالعربية.

---

## 6) الأماكن الحرجة في الكود (Hot Files)

| File | لماذا حرج |
|------|-----------|
| `server.ts` | Next + Socket.io + CSP headers + room‑level auth |
| `prisma/schema.prisma` | مصدر الحقيقة للبيانات |
| `src/middleware.ts` | rate‑limit + auth gate |
| `src/lib/db.ts` | Prisma singleton (نمط globalThis) |
| `src/lib/schemas.ts` | كل عقود الإدخال |
| `src/lib/adminGuard.ts` | حارس الإدارة |
| `src/lib/socketEngine.ts` | جسر IO عالمي ليصل Server Actions بـ Socket |
| `src/services/matchingService.ts` | محرك المطابقة الجغرافي (5km/300m) |
| `src/services/feedService.ts` | خوارزمية التغذية الهجينة |
| `src/services/trustService.ts` | حساب السمعة |
| `src/actions/interactions.ts` | منطق Crowd Price Drop داخل `$transaction` |
| `src/actions/zones.ts` | شراء الزون (TOCTOU‑safe) |
| `src/components/map/Map.tsx` | الواجهة الرئيسية للخريطة |
| `src/components/map/SuperclusterLayer.tsx` | تجميع الدبابيس + Z‑Index |
| `src/utils/geo.ts` | Orbital Spread |
| `src/hooks/useGeolocation.ts` | استطلاع GPS كل 20s |
| `instrumentation.ts` (root) | Sentry register() hook لـ Next.js — يحمّل server/edge configs |
| `sentry.client.config.ts` | Sentry SDK للمتصفح + PII filter (beforeSend) + UUID scrub (beforeBreadcrumb) |
| `sentry.server.config.ts` | Sentry SDK للـ Node runtime + نفس الفلاتر |
| `sentry.edge.config.ts` | Sentry SDK لـ middleware/Edge runtime |
| `src/lib/serverAction.ts` | `withSentry()` wrapper (مُجهَّز للاستخدام المستقبلي مع withAuth) |
| `vitest.setup.ts` | Mock لـ `@sentry/nextjs` لمنع cold-start في الاختبارات |

---

## 7) Workflows المعتمدة

### تشغيل محلي
```bash
cd web
docker compose up -d        # Postgres
cp ../.env.example .env     # ثم املأ المتغيرات
npx prisma generate
npx prisma db push          # سحب المخطط (لاحظ القسم 11 — لا تستخدم db push في الإنتاج)
npm install
npm run dev                 # tsx server.ts
```

### اختبارات
```bash
cd web
npx vitest run          # كل الاختبارات
npx vitest --ui         # واجهة تفاعلية
```

### نشر
- Push على `main` → Railway يعيد البناء.
- ⚠️ سكربت `start` الحالي يستخدم `npx prisma db push --accept-data-loss` — راجع القسم 11 قبل أي تغيير لمخطط في الإنتاج.

---

## 8) متغيرات البيئة المطلوبة

```
# Core
DATABASE_URL=postgresql://...
ADMIN_PHONES=06xxxxxxxx,07xxxxxxxx
NEXT_PUBLIC_SOCKET_URL=https://...
NEXT_PUBLIC_APP_URL=https://...

# Uploads
UPLOADTHING_SECRET=sk_live_...
UPLOADTHING_APP_ID=...
UPLOADTHING_TOKEN=...

# Cache / RateLimit
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...

# Observability (Sentry — Session 34)
NEXT_PUBLIC_SENTRY_DSN=https://...@o....ingest.us.sentry.io/...
SENTRY_AUTH_TOKEN=sntryu_...              # ⚠️ Build-time variable in Railway
SENTRY_ORG=atomic-trade
SENTRY_PROJECT=javascript-nextjs
```

**ملاحظات حول البيئة:**
- غياب `UPSTASH_*` لا يعطّل التطبيق — يتم تخطّي rate limit بدلاً من الفشل (راجع `lib/redis.ts`).
- غياب `NEXT_PUBLIC_SENTRY_DSN` يعطّل Sentry بصمت (no-op) — `enabled: !!DSN`.
- `SENTRY_AUTH_TOKEN` يجب أن يكون **Build Variable** في Railway (ليرفع sourcemaps).
- باقي `SENTRY_*` يمكن أن تكون runtime عادية.

---

## 9) القرارات التصميمية (Decisions Log)

| القرار | المبرر | تكلفة |
|--------|--------|--------|
| خادم موحد `server.ts` | خدمة واحدة على Railway، WebSocket مدمج | لا Vercel |
| كوكي بسيط بدل NextAuth | بساطة MVP + هاتف فقط | لا OAuth، لا 2FA حالياً |
| `$transaction` لكل كتابة حسّاسة | منع TOCTOU | كود أطول قليلاً |
| Supercluster | كفاءة آلاف الدبابيس | غير ثلاثي الأبعاد |
| استطلاع GPS كل 20s | توازن دقة/بطارية | تأخير 20s في الموقع |
| Anchor Rule | منع انجراف المتاجر | معالجة منفصلة لكل نوع |
| Orbital Spread 15–35m | منع تكدّس الأيقونات | قد يُربك تموقع متجر صغير |
| Cookie auth في Socket | بساطة | يفشل لو الـ socket على دومين مختلف |
| Sentry sweep بدل withSentry wrapper | تغطية شاملة سريعة لـ 38 catch block | تكرار `Sentry.captureException` في كل catch (يُنظَّف في P1) |
| `enabled: !!DSN` بدل `NODE_ENV` في Sentry | يسمح بتفعيل Sentry في staging | لا |
| `tunnelRoute: '/monitoring'` لـ Sentry | يتجاوز ad-blockers (uBlock/Brave) | طلبات إضافية تمر بخادمنا |
| `tracesSampleRate: 0.05` | Free tier يكفي لـ ~10k transactions/شهر | تتبع ضعيف عند المشاكل |
| `beforeSend` يحذف `password, phone, lat, lng` | PII filter حقيقي | منع تتبع bugs مرتبطة بهذه القيم |
| `beforeBreadcrumb` يمسح UUIDs | منع تسريب userId عبر console.log | breadcrumbs أقل دقة |
| Sentry mock في `vitest.setup.ts` | يلغي SDK cold-start في الاختبارات | لا يختبر تكامل Sentry فعلياً |
| Socket rate limit بـ userId لا socket.id | لا يُتجاوز بالـ reconnect | unauthenticated يستخدم socket.id كـ fallback |

---

## 10) ميزات قائمة و فعّالة الآن

- ✅ تسجيل / دخول / حذف مجدول 6 أشهر / استعادة عند الدخول.
- ✅ خريطة Leaflet + Supercluster + Zone Grid (geohash 6) + متاجر/أفراد/قصص.
- ✅ Anchor + Orbital + Synced Listings/Stories للأفراد.
- ✅ منشورات اجتماعية (POST/OFFER) + ستوريز 24h + فيديو + صور.
- ✅ نظام Like/Love/Comment/Rating + Crowd Price Drop + Watch‑to‑Earn (سقف 20 فيديو/يوم) + Daily Streak.
- ✅ Smart Matching Engine (Bi‑directional + Reverse Market Alert للمتاجر).
- ✅ نظام السمعة (RATING‑based ±15 → +10، حدود 0–1000).
- ✅ Zone Master + شراء بـ 500 عملة (transactional).
- ✅ Chat (Socket.io + room‑level auth + persistence via `/api/messages`).
- ✅ لوحة إدارة (categories, users, dashboard, verification badge).
- ✅ rate limiting + CSP + HSTS + COOP + Trusted Types (report‑only).
- ✅ Onboarding overlay + GPS إجباري عند التسجيل.
- ✅ CI: GitHub Actions يشغّل TypeCheck → Tests → Build.
- ✅ **Sentry observability** (الجلسة 34): 38 captureException في 18 action + 4 error boundaries + PII filter + UUID scrub في breadcrumbs.
- ✅ **Socket rate limit** (الجلسة 34): 30 رسالة/10ث per userId + cleanup دوري.
- ✅ **Cache user-independent** (الجلسة 34): `isLiked` يُطبَّق per-user خارج كاش الـ feed.
- ✅ `migrate deploy` بدل `db push --accept-data-loss` (الجلسة 34).

---

## 11) لوحة الديون التقنية (Updated بعد الجلسة 34)

> ✅ مُنجَز  ·  🔴 P0 عاجل  ·  🟠 P1 مهم  ·  🟡 P2 تحسين

### ✅ ما أُنجز في الجلسة 34

1. ✅ **`db push --accept-data-loss` → `prisma migrate deploy`** — تأمين الـ start script.
2. ✅ **Sentry observability** — `@sentry/nextjs` + 38 captureException + PII filter + tunnelRoute + sourcemaps via Railway Build Variables.
3. ✅ **Cache user-independence** — `isLiked` يُحسَب per-user خارج `unstable_cache` → استهلاك ذاكرة ↓99.95%.
4. ✅ **Socket rate limit** — 30 رسالة/10ث per userId + cleanup دوري.
5. ✅ **`bundleSizeOptimizations` × 5 flags** — تقليل حجم الـ bundle.
6. ✅ **`geo.test.ts` fix** — مزامنة النطاق 15-35m مع الكود الفعلي → 28/28 خضراء.
7. ✅ **`.gitignore` cleanup** — السماح بتتبع `.env.example` + استبعاد ملفات tsc.
8. ✅ **`beforeBreadcrumb` UUID scrub (P0-2.1)** — منع تسريب userId عبر console breadcrumbs.

### 🔴 P0 المتبقي

9. **🔴 Socket auth ضعيف** — يعتمد على parsing بدائي للكوكي ولا يتحقق من توقيع/HMAC. **الجلسة القادمة (36):** iron-session + signed cookies + migration متدرّجة 3 مراحل.

### 🟠 P1 مهم (الأسابيع القادمة)

10. **🟠 `getMixedFeed` يعتمد على `Math.random()`** — يكسر استقرار الـ pagination. الحل: `seedrandom(userId+page)` أو cursor مستقر.
11. **🟠 لا يوجد PostGIS / فهرس GIST** — استعلامات جغرافية على bounding box تتباطأ مع 100k+ نقطة. الحل: `postgis` extension + `geometry(Point,4326)` + GiST.
12. **🟠 `Listing.images` خيط CSV** — لا فهارس، لا حد للحجم. الحل: علاقة `ListingImage[]` مع `order`.
13. **🟠 `submitTransactionRating` بدون `$transaction`** — TOCTOU على `reputationScore`. الحل: لفّ القراءة + التحديث في `$transaction`.
14. **🟠 14 موضع `any`** — 3 في `actions/* operations[]`، 11 في components/store/modals. الحل: types صريحة + Prisma types.
15. **🟠 Anchor Rule مكرّر 3 مرات** — في `market.ts`, `social.ts`, `stories.ts`. الحل: استخراج `utils/anchor.ts → resolveAnchor()`.
16. **🟠 Auth boilerplate مكرّر في 21 action** — `cookies().get('user_id')`. الحل: `withAuth(fn)` wrapper في `lib/serverAction.ts`.

### 🟡 P2 تحسين

17. **🟡 Rate limit لا يغطي Server Actions** — middleware يطابق `/api/*` فقط. الحل: حد مستقل في كل action حسّاس عبر Redis.
18. **🟡 CSP يسمح `'unsafe-inline'`** — يضعف الحماية من XSS. الحل: nonce لكل script.
19. **🟡 لا تنظيف للحسابات المُجمَّدة** بعد 6 أشهر — يعتمد على cron غير موجود.
20. **🟡 `process.env.ADMIN_PHONES` ثابت** — كل تحديث يتطلب إعادة نشر. الحل: جدول `AdminUser` أو علم `isAdmin`.
21. **🟡 لا OTP/SMS عند signup** — حسابات وهمية ممكنة.
22. **🟡 79 `console.log` متناثرة** — رغم أن Sentry يلتقط الأخطاء، نحتاج structured logging (pino) للـ info/debug.
23. **🟡 لا Socket.io Redis adapter** — يفشل عند التوسعة الأفقية.
24. **🟡 لا E2E tests (Playwright)** — اختبارات unit ممتازة لكن لا coverage على user flows كاملة.

التفاصيل الكاملة في: `docs/00_DEEP_AUDIT_2026.md` + سجل الجلسة 34 في `walkthrough.md`.

---

## 12) كيف تساعدني (تعليمات لـ Claude في الجلسات القادمة)

1. **اقرأ هذا الملف أولاً** + `ARCHITECTURE_AR.md` + آخر قسم في `AI_mkhalfiAmine.md`.
2. **لا تطلق Prisma من مكونات العميل**. أي ميزة جديدة تحتاج DB → ابن action في `src/actions/`.
3. **اعتمد قانون الـ Anchor عند أي إنشاء جديد** بإحداثيات (راجع كيف تطبَّق في `market.ts`/`social.ts`/`stories.ts` كنمط).
4. **اكتب اختبارات Vitest** لأي منطق business جديد، حذواً بـ `src/actions/__tests__/server-actions.test.ts` (Anchor, Watch cap, Zone TOCTOU).
5. **حدّث `AI_mkhalfiAmine.md`** في نهاية كل جلسة (قسم "📜 سجل الإنجازات").
6. **عند أي عمل أمني**، راجع القسم 11 وأكّد أن ما تنفّذه يتقدم بأحد البنود لا يتراجع.
7. **عند أي ميزة على الخريطة**، احرص أن تُدمج في `SuperclusterLayer.tsx` (لا تنشئ طبقات جديدة موازية) واحترم `zIndexPriority` (Shop=1000, Listing/Story=900, Individual=800).
8. **عند إضافة Server Action**، تأكد من: cookie auth + Zod validate + `$transaction` للكتابات المركّبة + `revalidatePath` + return `{ success, error? }` + **`Sentry.captureException(error, { tags: { action: '...' } })` في كل catch**.
9. **عند تعديل المخطط (Prisma)**، استخدم `prisma migrate dev` محلياً (لا `db push`)، والتزم بـ `migrate deploy` في الإنتاج.
10. **لا تكسر RTL** — كل نص للمستخدم بالعربية، الزخارف ✨ مسموحة لكن باعتدال.
11. **عند أي catch في action جديد**، استورد `import * as Sentry from '@sentry/nextjs'` وأضف `Sentry.captureException(error, { tags: { action: '<name>' } })` فوق `console.error`.
12. **عند إضافة `console.log` في `server.ts` أو actions**، تجنّب طباعة UUIDs/userId مباشرة. `beforeBreadcrumb` يمسحها لكن أفضل ألا تكون موجودة أصلاً.
13. **عند إضافة حقول جديدة لـ Prisma فيها معلومات حساسة**، أضفها لقائمة الـ PII filter في `sentry.client.config.ts` و `sentry.server.config.ts` (`SENSITIVE_FIELDS`).
14. **عند العمل في Railway**، تذكر: `SENTRY_AUTH_TOKEN` يجب أن يكون **Build Variable** ليرفع sourcemaps. باقي `SENTRY_*` runtime عادية.

---

## 13) مراجع داخلية

- `ARCHITECTURE_AR.md` / `ARCHITECTURE.md` — البنية المعمارية الأساسية.
- `AI_mkhalfiAmine.md` — السجل التاريخي للجلسات (34+ جلسة موثقة).
- `docs/00_DEEP_AUDIT_2026.md` — التحليل المعمق الكامل (Architecture · Security · Performance · Integration · Iteration).
- `docs/01_Executive_Audit_2026.docx` — التقرير التنفيذي القابل للمشاركة.
- `docs/Master_Execution_Plan_2026.md` — خارطة الطريق 4 مراحل.
- `docs/Project_Overview_AR.md` — نظرة الإدارة العامة.
- `docs/atomic-trade-SKILL-full.md` — Skill قابل للتثبيت في `~/.claude/skills/`.
- `session_reports/` — تقارير الجلسات.
- `walkthrough.md` (في جذر العمل بعد كل جلسة) — تقرير هندسي مفصّل للجلسة.

---

## 14) Observability — Sentry (جديد في الجلسة 34)

### 14.1 البنية

```
instrumentation.ts (root)
  ├── nodejs runtime → sentry.server.config.ts
  └── edge runtime → sentry.edge.config.ts

sentry.client.config.ts (browser SDK — loaded auto by withSentryConfig)
```

### 14.2 الـ Configs الأساسية

كل من client + server configs يحتويان:

```ts
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,  // لا NODE_ENV
  environment: process.env.NODE_ENV,
  release: process.env.RAILWAY_GIT_COMMIT_SHA || 'dev',
  tracesSampleRate: 0.05,                          // Free tier
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0.5,
  
  // PII filter — لا ترسل passwords/phones/locations
  beforeSend(event) {
    delete event.request?.cookies
    delete event.request?.headers?.cookie
    const SENSITIVE = ['password', 'phone', 'latitude', 'longitude', 'currentPassword', 'newPassword']
    for (const key of SENSITIVE) {
      if (event.request?.data?.[key]) event.request.data[key] = '[Filtered]'
    }
    return event
  },
  
  // UUID scrub — لا تُسرّب userIds عبر console breadcrumbs
  beforeBreadcrumb(breadcrumb) {
    if (breadcrumb.category === 'console' && typeof breadcrumb.message === 'string') {
      breadcrumb.message = breadcrumb.message.replace(
        /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
        '[uuid-redacted]'
      )
    }
    return breadcrumb
  },
  
  ignoreErrors: ['WebSocket', 'NetworkError', 'AbortError'],
})
```

### 14.3 Sentry في Server Actions — النمط الإلزامي

```ts
'use server'
import { cookies } from 'next/headers'
import * as Sentry from '@sentry/nextjs'

export async function myAction(input: FormData) {
  try {
    // ... logic
    return { success: true }
  } catch (error) {
    Sentry.captureException(error, { tags: { action: 'myAction' } })  // ← أولاً
    console.error('myAction Error:', error)                            // ← ثانياً (للـ dev)
    return { success: false, error: 'فشل العملية...' }
  }
}
```

**38 captureException** موجودة في 18 ملف action — اتبع نفس النمط.

### 14.4 Sentry في Tests — Mock إلزامي

في `vitest.setup.ts`:

```ts
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

**السبب:** بدون mock، أول test يحمّل `@sentry/nextjs` يحصل على cold-start بطيء (>5s) ويُفشل الاختبار بـ timeout.

### 14.5 withSentryConfig في `next.config.mjs`

```js
export default withSentryConfig(nextConfig, {
  silent: true,
  tunnelRoute: '/monitoring',  // ad-blocker bypass
  hideSourceMaps: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  bundleSizeOptimizations: {
    excludeDebugStatements: true,
    excludeReplayCanvas: true,
    excludeReplayShadowDom: true,
    excludeReplayIframe: true,
    excludeReplayWorker: true,
  },
})
```

### 14.6 CSP — Sentry domains

في **كل من** `server.ts` و `next.config.mjs`، أضف Sentry domains في `connect-src`:

```
connect-src 'self' wss: ws: https://*.sentry.io https://*.ingest.sentry.io ...
```

(لو استخدمت `tunnelRoute` فقد لا تحتاجها، لكن نتركها كـ defense-in-depth.)

### 14.7 Verification Protocol — كل deploy جديد

1. **Build logs** — تأكد من `Successfully uploaded source maps` (إن لم يكن silent).
2. **Sentry → Releases** — release جديد بـ commit SHA.
3. **Trigger خطأ متعمَّد** — وزره يصل في < 30s.
4. **Stack trace** — أسماء ملفات حقيقية لا minified.
5. **Cookies / sensitive fields** — `[Filtered]` لا قيم.
6. **Breadcrumbs** — UUIDs مكتومة بـ `[uuid-redacted]`.

---

> *آخر تحديث:* 13‑05‑2026 — الجلسة 34 (P0-2 Sentry + P0-4 Socket rate limit + P0-5 cache fix + P0-2.1 breadcrumb scrub).
> *الجلسة القادمة:* 36 — P0-3 signed cookies + iron-session migration.

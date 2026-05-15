# 📕 التدقيق العميق 2026 — منصة Atomic Trade
## Deep Audit 2026 — Atomic Trade Social‑Commerce Platform

> تقرير ثنائي اللغة — Bilingual report (AR primary, EN technical).
> **التاريخ:** 12 مايو 2026. **الإصدار المراجَع من الكود:** فرع `main` (Next 16.1.3 / Prisma 5 / React 19.2.3).
> **الجهد:** قراءة معمّقة لكل ملفات `prisma/`, `server.ts`, `middleware.ts`, `src/actions/*`, `src/services/*`, `src/lib/*`, `src/components/map/*`, `src/hooks/*`, `src/utils/*`, `src/api/*`, إضافة إلى الوثائق الموجودة.

---

## 📜 الفهرس / Table of Contents

| # | القسم |
|---|------|
| 1 | الملخص التنفيذي / Executive Summary |
| 2 | الدراسة المعمارية / Architecture |
| 3 | الدراسة الأمنية / Security |
| 4 | الدراسة التكاملية / Integration |
| 5 | الدراسة الهندسية والأداء / Engineering & Performance |
| 6 | دراسة قاعدة البيانات / Data Layer |
| 7 | الدراسة التكرارية والتنظيمية / Iteration & Organization |
| 8 | دراسة التغطية الاختبارية / Test Coverage |
| 9 | DevOps والـ Deployability |
| 10 | لوحة قيادة الأولويات / Priority Dashboard |
| 11 | خارطة الطريق المقترحة / Suggested Roadmap |
| 12 | ملاحق / Appendices |

---

# 1) الملخص التنفيذي — Executive Summary

## 1.1 نتيجة سريعة / Verdict

> المشروع **منضبط معمارياً، متين أمنياً في المتوسط، وغني وظيفياً بشكل لافت** لمنتج في طور MVP. القاعدتان الذهبيتان (Anchor + Orbital) واضحتان ومُختبرتان، نمط Server Actions موحَّد، وفصل الـ services عن الـ actions نظيف. مع ذلك يحمل المشروع **12 ديناً ذا أولوية** أهمّها مرتبط بـ Deployability وقاعدة البيانات و Socket auth.

| المحور | التقدير (1–5) | تعليق موجز |
|--------|---|-------------|
| المعمارية | **4.3** | Monolith ذكي، حدود سليمة، خادم موحد ⚡ |
| الأمن | **3.8** | CSP + HSTS + Rate Limit + Admin Guard ✅ — لكن Socket auth ضعيف + CSP يسمح inline + لا CSRF صريح |
| الأداء | **3.5** | Cache فيد، Supercluster، لكن غياب PostGIS و N+1 محتمل في بعض المسارات |
| التكامل | **4.0** | Server Actions ↔ Socket ↔ Redis ↔ UploadThing مترابطة بنظافة |
| الجودة (Code) | **4.1** | TS صارم، Zod، اختبارات Vitest، ولكن 3 مواضع `any` + 79 console |
| Deployability | **3.0** | `db push --accept-data-loss` في start! خطر تقني عاجل |
| التغطية الاختبارية | **2.8** | 28 اختباراً للأساسيات، لكن لا اختبارات لـ feedService / matchingService / Map / Socket |

**التقدير الإجمالي:** **3.8 / 5** — منتج "production‑capable" بشروط معالجة قائمة المخاطر العاجلة.

## 1.2 أهم 7 توصيات حاسمة (Top‑7 Decisive Actions)

1. **استبدل `db push --accept-data-loss`** في `package.json` بسكريبت آمن `prisma migrate deploy` فوراً.
2. **حصِّن مصادقة Socket.io** عبر signed cookie أو JWT‑lite يتم التحقق منه في `io.use(...)` middleware.
3. **أضف PostGIS + GiST index** للحقول الجغرافية على `Listing`, `MapStory`, `SocialPost`. وحوّل استعلامات bounding box إلى `ST_MakeEnvelope`.
4. **افصل `isLiked` عن طبقة الكاش** في `getCachedMixedFeed` — استخدم كاش بدون user، ثم اطبق `isLiked` بعد.
5. **استقر pagination الـ feed** بكاش deterministic + cursor بدل `Math.random()` داخل المسار العام.
6. **خفّض CSP**: استبدل `'unsafe-inline'` للسكريبت بـ nonce (Next 14+ يدعم ذلك).
7. **حوِّل `Listing.images` من CSV إلى علاقة `ListingImage[]`** قبل أن يصبح التحويل مكلفاً.

## 1.3 ما يعمل بشكل ممتاز

- 🟢 **The Anchor Rule + Orbital Spread**: قاعدة معمارية غير قابلة للالتباس، مطبَّقة في كل نقاط الإنشاء، ومُغطاة باختبارات تكاملية.
- 🟢 **نمط `'use server'` + `{ success, error }`**: واحد من أكثر الأنماط دفاعاً في Next.js؛ لا exceptions تصل للعميل، ولا `throw` يدمر الـ UX.
- 🟢 **`db.$transaction` في كل مكان حسّاس**: `purchaseZone`, `interactWithListing` (Crowd Drop), `awardCoinsForWatch`, `createListing/Post/Story` (مع تحديث الموقع).
- 🟢 **Admin Guard موحَّد** عبر `lib/adminGuard.ts` — لا تكرار، لا منفذ متروك.
- 🟢 **فصل `services/` عن `actions/`**: `feedService`, `matchingService`, `trustService`, `conversationService` تحوي المنطق الثقيل، والـ actions تنسّق فقط.
- 🟢 **`getOrbitLocation`** — مثلثات صحيحة، تحويل المتر إلى درجة بصياغة دقيقة (يأخذ بعين الاعتبار `cos(latitude)` لتعويض ضيق خطوط الطول قرب القطبين).
- 🟢 **CI/CD منظَّم**: TypeCheck → Tests → Build على كل push.

---

# 2) الدراسة المعمارية — Architecture Study

## 2.1 النمط العام / Pattern

**Monolith موحَّد على خادم Node واحد** عبر `server.ts` يدمج Next.js مع Socket.io. هذا قرار ذكي لمشروع بحجم MVP لأنه:

- يوفّر تكلفة استضافة (خدمة واحدة على Railway).
- يلغي مشاكل CORS بين الواجهة والـ realtime layer.
- يسمح بمشاركة `user_id` cookie بشكل طبيعي للـ socket handshake.

**التكلفة:** ربط مصير الواجهة بـ realtime — أي تعطّل Socket يعطّل عملية النشر كاملة. كذلك Vercel غير قابل للاستخدام (لا WebSocket مستمر).

## 2.2 الطبقات / Layers

```
[Browser]
   │  HTTP (Server Actions, Route Handlers)
   │  WebSocket (/api/socket)
   ▼
[server.ts]
   ├── Next.js handler  → app router → pages / actions / route handlers
   └── Socket.io       → rooms (user:<id>, conversation:<id>)

[Server Actions (src/actions/*)]
   │
   ▼
[Services (src/services/*)]    ← منطق business قابل لإعادة الاستخدام
   │
   ▼
[lib/db.ts (Prisma)]   [lib/redis.ts]   [lib/socketEngine.ts]
   │
   ▼
[PostgreSQL]     [Upstash Redis]     [UploadThing CDN]
```

**النظافة:**
- ✅ Server Components عند الإمكان (مثل `dashboard/page.tsx`, `admin/layout.tsx`, `u/[username]/page.tsx` تجلب البيانات على السيرفر).
- ✅ Client Components محصورة بـ `'use client'` حيثما لا بد منها (Map, VideoFeed, Chat).
- ⚠️ بعض الـ actions تستورد بشكل ديناميكي (`import('@/services/matchingService')` في `market.ts`) ربما لتقليل cold start. هذا حلّ ولكنه مربك إذا لم يُوثَّق.

## 2.3 نمط الـ Socket Engine الجسري / Socket Engine Bridge

ملف `src/lib/socketEngine.ts` يطبق singleton عالمي لـ `Server`:

```ts
let ioInstance: Server | null = null
export const setIO = (io) => { ioInstance = io }
export const getIO = () => ioInstance
```

ثم `server.ts` يحقن النسخة عند بدء التشغيل، و `matchingService` يستوردها لإرسال إشعارات مباشرة من Server Actions. **نمط نظيف** لمشكلة "كيف يبعث Server Action رسالة socket؟" والإجابة المعتادة (publishing عبر Redis pub/sub) ليست ضرورية في monolith.

**القيود:**
- لن يعمل عند توسعة أفقية (Horizontal scaling) — `ioInstance` محلي للعملية. الحل المستقبلي: Redis adapter لـ Socket.io.
- لا تذكير بالحالة (state) — لو سقطت العملية، لا rooms تُستعاد.

## 2.4 نمط الأمنيات (Resilience)

- **حالة Redis مفقودة:** `lib/redis.ts` يخفق بصمت → `rate limit` يُخطّى. خيار **fail‑open** آمن للوصولية لكن خطير للحماية. ⚠️ ضع علم monitoring.
- **حالة DB مفقودة:** كل action في try/catch يرجع `error: 'Database error'`. **سلوك جيد** لكن لا يميز بين "متصل ومرفوض" و "غير متصل أصلاً" — قد يصعّب التشخيص.
- **حالة UploadThing مفقودة:** لا fallback — رفع الميديا يفشل، والـ action يتحقق من وجود URL ويرفض.

## 2.5 المخاطر المعمارية (Architectural Risks)

| المخاطرة | الاحتمال | الأثر | الترشيح |
|-----------|----|------|--------|
| توسعة أفقية مستقبلية | متوسط | عالٍ | استخدم Socket.io Redis adapter قبل الإطلاق الواسع |
| اعتماد على cookie في socket handshake عبر دومين مختلف | منخفض | متوسط | إن بقي subdomain واحد فلا مشكلة |
| حلقة استيراد بين actions و services | منخفض | متوسط | احفظ القاعدة: actions تستورد services فقط، لا العكس |
| سقوط Railway | منخفض | شديد | DR plan + سياسة DB backup أوتوماتيكية |

---

# 3) الدراسة الأمنية — Security Study

## 3.1 المصادقة / Authentication

- **آلية:** كوكي `user_id` (UUID خام)، `httpOnly`, `sameSite=lax`, `secure` في الإنتاج، انتهاء 7 أيام.
- **التجزئة:** `bcrypt(rounds=10)` في `signup` (المضاد لـ rainbow tables — جيد). و `12` في `updateProfile.password`. **خَلط** — وحّد عند 12.
- **الإعادة:** نقصان توقيع الكوكي. `user_id` خام يمكن نسخه إن سُرّب الجهاز/المتصفح. الحل: استخدم **iron‑session** أو **jose** لتوقيع/تشفير الجلسة، أو الاكتفاء بـ rotating tokens.

### ⚠️ نقاط الانتباه

1. **لا توقيع/HMAC على كوكي الجلسة** → سرقة الكوكي = سرقة الجلسة تماماً (لا يوجد device fingerprint).
2. **`maxAge=7d` ثابت** → لا rotation. لا "remember me / not me".
3. **لا 2FA** → بطبيعة MVP، لكنه ضروري للأدمن قبل الإطلاق التجاري.

## 3.2 Server Actions Security

- ✅ كل action تقرأ `cookies()` و تتحقق من وجود `user_id` قبل الـ DB.
- ✅ Zod في `lib/schemas.ts` تتحقق من المدخلات الأساسية (`loginSchema`, `signupSchema`, `createListingSchema`).
- ⚠️ بعض الـ actions **لا تستخدم Zod** (مثل `interactions.ts`, `social.ts`, `stories.ts`) — تتحقق يدوياً بشروط `if`. ينبغي توحيد بإنشاء `interactSchema`, `createPostSchema`, `createStorySchema`.
- ⚠️ `social.ts → createPost` لا يحدّ طول `caption`. أضف حدّ 2000 حرف.
- ⚠️ `interactions.ts → addComment` يقصّ على 500 حرف يدوياً — جيد، لكنه يُكرّر منطق Zod.

## 3.3 Authorization (IDOR / Access Control)

- ✅ `messages/route.ts` يتحقق أن `userId` هو participant1 أو participant2 قبل إرجاع رسائل أو نشرها.
- ✅ `socket.on('join_room')` يتحقق من نفس الشيء، **fail‑secure** عند خطأ DB.
- ✅ `submitReview` يتحقق من وجود conversation سابقة بين الطرفين على نفس Listing — هذا ضد reviews وهمية.
- ✅ `purchaseZone` ذرية.
- ✅ `verifyAdmin()` تتحقق من `ADMIN_PHONES` env var.
- ⚠️ `POST /api/messages` يقبل `senderId` من body ويقارنه بـ `sessionUserId`. الأفضل: تجاهل body تماماً واستخدم session. (المنطقياً الفحص آمن لكن البصمة سيئة).
- ⚠️ `toggleUserVerification` و `resetReputation` لا يطلبان confirmation/CSRF.

## 3.4 Socket.io Security

- ✅ التحقق من participant قبل join.
- ✅ التحقق من `socket.rooms.has(conversationId)` قبل البث.
- 🔴 **استخراج cookie ضعيف**: `cookiesAttr?.split(';').find(c => c.trim().startsWith('user_id='))?.split('=')[1]` — يفترض `user_id` راخ بدون توقيع، وعرضة لمشاكل URL‑encoding.
- 🔴 لا CORS صارم في الإنتاج (`origin: '*'` في dev، ويبقى `NEXT_PUBLIC_APP_URL` في الإنتاج — جيد، لكن أضف allow‑list).
- 🟡 لا حد سرعة لرسائل Socket (يمكن لمستخدم بثّ آلاف الرسائل/ثانية على conversation).

## 3.5 CSRF

- Next.js Server Actions تحمي ضد CSRF تلقائياً عبر فحص `Origin` على POSTs الداخلية، لكن:
- ⚠️ `POST /api/messages` و `POST /api/uploadthing` Route Handlers لا تتحقق من `Origin` بشكل صريح. أضف middleware يطابق `request.headers.get('origin')` مع `NEXT_PUBLIC_APP_URL`.

## 3.6 XSS / Injection

- ✅ React يهرب النصوص افتراضياً → لا XSS مباشر في `comment.content`.
- ✅ `isValidAvatarUrl` يحدّ النطاقات المسموحة لصور الأفاتار (whitelist domains).
- ⚠️ `dangerouslySetInnerHTML` غير مستخدم — جيد.
- ⚠️ CSP يسمح `'unsafe-inline'` للسكريبت ولأنماط الستايل. ينبغي:
  - استخدم **nonce** للسكريبت (Next 14+ يدعمه عبر `headers()` + middleware).
  - أو على الأقل، فعّل `Content-Security-Policy-Report-Only` بقيود أصرم لمعرفة ما يكسر.
- ✅ Prisma يهرب SQL تلقائياً → لا SQL Injection ممكن.

## 3.7 رفع الملفات / File Upload

- ✅ UploadThing يفرض حدود الحجم (`16MB` image, `128MB` video, `4MB` avatar).
- ✅ middleware يتحقق من cookie.
- ⚠️ لا فحص محتوى (antivirus, NSFW classification) — للـ MVP مقبول، للإنتاج التجاري ضروري.
- ⚠️ `onUploadComplete` يطبع `console.log(file.ufsUrl)` — سحب الـ debug logs قبل الإطلاق.

## 3.8 إدارة الأسرار / Secrets

- ✅ `.env.example` كامل ومُوثَّق.
- ⚠️ لا تدوير (rotation) للـ secrets موثَّق. خطة: **GitHub Secrets** + Railway plugins لإدارة دوران سنوي.

## 3.9 أمن الإدارة (Admin)

- ✅ `adminGuard.ts` يتحقق من `ADMIN_PHONES`.
- ✅ `app/admin/layout.tsx` redirect إن لم يكن المستخدم admin.
- ⚠️ لا audit log لأفعال الإدارة (toggle verification, reset reputation, delete category).
- ⚠️ بدائيات الـ admin بسيطة — لا قفل، لا تسجيل خروج عند تغير IP. مقبول الآن.

## 3.10 ملخص أمني / Security Summary Table

| البند | الحالة | الإجراء |
|------|------|--------|
| Password hashing | ✅ bcrypt (وحّد على 12) | حسِّن |
| Session cookie signing | ❌ | أضف iron-session/jose |
| 2FA | ❌ | للمشرفين أولاً |
| Server Action validation | ⚠️ جزئي | عمّم Zod على كل action |
| CSRF | ⚠️ | تحقق `Origin` في Route Handlers |
| XSS / CSP | ⚠️ inline allowed | nonce + tighter |
| Rate limiting | ✅ /api/* | عمّم على Server Actions |
| Socket auth | ⚠️ كوكي خام | signed token + io.use middleware |
| File upload security | ⚠️ بلا فحص محتوى | NSFW + size guard |
| Admin audit log | ❌ | جدول `AdminLog` |
| IDOR (messages, listings) | ✅ | احتفظ بالنمط |
| Data minimization (no phone leak) | ✅ | استمر |

---

# 4) الدراسة التكاملية — Integration Study

## 4.1 الخريطة التكاملية / Integration Map

```
                ┌──────────────┐
                │  Browser     │
                └──┬────────┬──┘
                   │ HTTP   │ WS
                   ▼        ▼
       ┌────────────────────────────┐
       │  server.ts (Next + Socket) │
       └──┬────────────┬────────────┘
          │            │
          │ getIO()    │ readCookie
          ▼            ▼
    ┌──────────┐  ┌──────────────┐
    │ Actions  │  │  Rooms       │
    │ Services │  │ user:<id>    │
    └──┬───────┘  │ conv:<uuid>  │
       │          └──────────────┘
       ▼
    ┌─────────┐    ┌──────────────┐    ┌────────────┐    ┌──────────────┐
    │ Prisma  │ ←→ │ PostgreSQL   │    │ Upstash    │    │ UploadThing  │
    │ (db)    │    │ (Railway)    │    │ Redis      │    │ (CDN)        │
    └─────────┘    └──────────────┘    └────────────┘    └──────────────┘
```

## 4.2 نقاط الاتصال الحاسمة / Critical Touchpoints

### A. Server Action → Socket
- **مكان:** `services/matchingService.ts` يستورد `getIO()` ويرسل `match_found` إلى `user:<id>`.
- **تقييم:** نمط آمن داخل العملية الواحدة، فاشل عند التوسعة الأفقية.
- **توصية:** أضف Redis adapter (`@socket.io/redis-adapter`).

### B. Server Action → Database
- جميع الـ actions تستخدم `db` المُصدَّر من `lib/db.ts` (singleton).
- ✅ `globalThis.prisma` يمنع إنشاء clients متعدّدة في dev mode.
- ⚠️ لا connection pooling إعدادات صريحة. عند الإنتاج: استخدم `connection_limit` parameter في `DATABASE_URL` (مثل `?connection_limit=10`).

### C. Browser → Server Action
- Next.js form actions تستخدم `useActionState` (مثلاً في `AuthForm`).
- ✅ نمط نظيف للـ optimistic UI.
- ⚠️ بعض الـ actions تأخذ معطيات منفصلة (e.g. `interactWithUser(targetUserId, type)`)، خارج FormData. هذا يكسر تماثل الاستخدام.

### D. Socket → Browser (Notifications)
- العميل في `useChat` و `useNotificationStore` يلتقط `match_found`, `receive_message`, `typing`.
- ✅ تنبّه الحالات للـ optimistic + reconciliation.
- ⚠️ لا حذف للـ event listeners عند unmount في كل المسارات — أُلتقط في `useChat.ts` (good) لكن انظر `SocketProvider` لا يقطع عند تغيير المستخدم (logout).

### E. UploadThing → Server
- العميل يرفع مباشرة → UploadThing → `onUploadComplete` callback على الـ server → ثم يستلم العميل URL.
- ✅ ثلاث endpoints: `mediaPost`, `avatarUpload`, `productImages`.
- ⚠️ `onUploadComplete` يطبع URL — احذف في الإنتاج.

### F. Middleware → Upstash Redis
- ✅ في `src/middleware.ts`، يستخدم Sliding Window 10 req / 10s.
- ⚠️ إن وقع `redis` خطأ، يسمح للطلب → fail‑open. سجل تنبيه ولكن لا تحجب.

### G. Geofencing (Client only)
- `useGeofencing` يفحص المسافة locally على كل تحديث GPS.
- ✅ لا server load.
- ⚠️ لا debounce — كل 20s قد يكون كثيراً عند آلاف الـ listings. أضف `useDebounce(listings, 500ms)`.

## 4.3 نقاط الفصل المفقودة / Missing Decoupling

- **`src/actions/feed.ts`** يحوي تعريفات الـ DTO **و** خوارزمية الدمج. هذا أبعد ما يكون نظيفاً. اقترح:
  - `src/types/feed.ts` ← `FeedItemDTO`.
  - `src/services/feedService.ts` ← خوارزمية الدمج (موجود).
  - `src/actions/feed.ts` ← orchestration فقط.

- **`src/actions/market.ts`** يدمج Anchor Rule logic. الأنسب أن تكون دالة `applyAnchorRule(user, lat, lng)` في `utils/anchor.ts` تُستدعى من 3 مواضع (market, social, stories) بدل التكرار.

## 4.4 تكامل خارجي / External Integration Hooks المفقودة

- ❌ **Payments**: لا Stripe/CMI/PayPal — منطقي لـ MVP.
- ❌ **SMS/OTP**: التسجيل بكلمة مرور فقط، بدون تأكيد رقم. خطر "وهمية الحسابات".
- ❌ **Push Notifications (web push)**: الإشعارات تعتمد Socket فقط — يضيع لو المستخدم خارج التطبيق.
- ❌ **Analytics/Telemetry**: لا PostHog/Mixpanel/Plausible.
- ❌ **Search**: لا Algolia/Meilisearch — `SearchMenu.tsx` فيه `TODO` يدل على ذلك.

---

# 5) الدراسة الهندسية والأداء — Engineering & Performance

## 5.1 خوارزميات / Algorithms

### 5.1.1 Orbital Spread (`utils/geo.ts`)
**صحيح رياضياً.** يستخدم متغيرات قطبية (r, θ) ثم يحوّل عبر `1° latitude ≈ 111320 m` ويضرب الـ longitude بـ `cos(latitude)`. النطاق 15–35 m مناسب للمدينة. **اختبار حواف مفقود:** عندما `centerLat` قرب القطبين (±89°) فالقسمة على `cos(lat)` تنفجر — أضف clamp.

### 5.1.2 Smart Matching (`services/matchingService.ts`)
- Haversine صحيح.
- **N+1 محتمل:** يجلب كل `Listing` matching ثم يصفّيها بـ JS. عند آلاف الـ listings: مشكلة. الحل: استعلام بـ PostGIS `ST_DWithin` على القاعدة مباشرة.
- 5km لمتجر و300m لفرد — منطق ذكي. لكن `300m` ثابت — وفّر إعدادات قابلة للضبط من جدول `AppConfig`.

### 5.1.3 Hybrid Feed (`services/feedService.ts`)
- يجلب 3 أنواع متوازياً (✅ `Promise.all`).
- ⚠️ يقسّم العدد بنسب (50% posts, 30% stories, 20% listings في SOCIAL mode) — جميل، لكن إن لم تكن هناك قصص كافية، الصفحة "تنحسر".
- ⚠️ كل query بدون `where: { userId: { not: blockedUsers } }` — لا نظام حظر بعد.
- **`countInteractions` و `checkLiked`:** يفترضان `interactions` معبأة من Prisma — جيد، لكن `interactions: { select: ...} ` بدون `take` قد يجلب آلاف التفاعلات لكل post. أضف `take: 5000` كحماية.

### 5.1.4 Trust Score (`services/trustService.ts`)
- وزن `RATING_WEIGHTS` ثابت — منطقي.
- ⚠️ **لا transaction** يحوّل التعديل: قراءة `reputationScore` ثم تحديث (TOCTOU). إن قيمت 5 نجوم من مستخدمين بنفس اللحظة → ضياع تحديث.
- ⚠️ لا تطبيع لزمن (decay) أو "عدد التقييمات" — مستخدم بـ 1000 نقطة من 2 تقييم = نفس مستخدم بـ 1000 من 500. Bayesian average أنسب.

### 5.1.5 Supercluster Layer
- ✅ Debounce 100ms على `moveend/zoomend` — جيد.
- ✅ `zIndexPriority` (Shop=1000, Listing/Story=900, User=800) — هرمية واضحة.
- ⚠️ تجميع الـ items يحدث في `useMemo`، لكن `points` يعاد بناؤه كاملاً عند أي تغير في `items` — مع آلاف الدبابيس يصبح ثقيلاً. الحل: index ثابت + diffing.

## 5.2 Cache Strategy

- ✅ `unstable_cache` على `getMixedFeed` (revalidate 60s, tag 'feed').
- 🔴 **مفتاح الكاش يتضمن `currentUserId`** → كاش لكل مستخدم! عند 100k مستخدم نشط: 100k × ~5KB = ~500MB. الحل:
  ```ts
  // كاش بدون user
  const raw = await getMixedFeedCached(page, limit, filterType)
  // طبق isLiked بعد الكاش
  const items = raw.map(i => ({ ...i, isLiked: liked.has(i.id) }))
  ```
- ⚠️ `Math.random()` على Golden Deal بعد الكاش — صحيح أن يكون خارج الكاش، لكن استخدم seed مستقر (مثل page+date) ليكون قابلاً للـ pagination.

## 5.3 N+1 محتمل / Potential N+1

| المكان | المشكلة | الإصلاح |
|--------|---------|--------|
| `getCommments` | يجلب user لكل تعليق (`include: { user }`) — OK لأن Prisma يفعل JOIN | ✅ |
| `getMixedFeedLogic` | كل post يجلب كل interactions — يمكن أن ينفجر | حدد `take: 5000` + استخدم `_count` |
| `matchingService.runMatchingEngine` | يجلب كل matches ثم يصفّي بـ JS | استبدل بـ PostGIS `ST_DWithin` |
| `getProfileContent` | `count` + `findMany` منفصلتان لكل tab | استخدم `Promise.all` (مطبَّق ✅) |

## 5.4 الذاكرة / Memory

- `socket.io` rooms في الذاكرة → بدون Redis adapter، استخدام RAM ينمو مع عدد المتصلين.
- Particles على landing page (40 particles, 30fps) — جيد للموبايل.
- `Map.tsx` يحمّل كل الـ users globally (`getAllActiveUsers` بحد 200) — منطقي.

## 5.5 Frontend Performance

- ✅ Next 16 RSC، Server Components حيث يصلح.
- ✅ `framer-motion` مستخدم باعتدال.
- ✅ Lazy import للـ Leaflet في `Map.tsx` (تتطلب window).
- ⚠️ `Cairo` + `Inter` font subsets — `Cairo arabic+latin` ثقيل (~300KB). فكر في `display: swap` (موجود في Next افتراضياً).
- ⚠️ صور خارجية (Unsplash) في `next.config.mjs` — احرص أن تكون كلها مع `next/image` و `priority`/`loading=lazy` صحيحاً.

## 5.6 توصيات الأداء بالأولوية

1. **PostGIS + GiST** → تسريع 10–100× على استعلامات الخريطة عند 100k+ نقطة.
2. **افصل isLiked عن الكاش** → خفّض ذاكرة Next 80%+.
3. **استبدل `Math.random()` في feed** بـ `seedrandom(userId+page)` لاستقرار الـ pagination.
4. **أضف Redis adapter لـ Socket.io** قبل التوسعة.
5. **أضف `take: 5000` على `interactions` في `feedService`** كحاجز انفجار.
6. **Pre‑render route segments** الثابتة (مثل `/`, `/login`, `/signup`).

---

# 6) دراسة قاعدة البيانات — Data Layer

## 6.1 المخطط / Schema review

**نقاط القوة:**
- ✅ Enums لـ types (UserType, ListingType, MediaType, PostType, InteractionType) — صلابة منع typos.
- ✅ Indexes على `phone`, `username`, `geoHash`, `(lat,lng)`.
- ✅ Unique constraints مركّبة على `Interaction` لمنع double-like.
- ✅ `Follow` بـ `@@unique([followerId, followingId])`.

**نقاط ضعف:**

1. **`Listing.images: String`** — أسوأ قرار في المخطط. CSV بدل علاقة. مشاكل:
   - لا فهرس على ترتيب الصور.
   - لا حد لعدد.
   - تحليل في كل قراءة (`split(',')`).
   - لا حذف cascading.
   - **حل:** أضف `model ListingImage { id, listingId, url, order }`.

2. **`Float lat/lng`** بدل `Geography(Point, 4326)` — لا فهارس مكانية حقيقية. **حل:** PostGIS extension + ترقية الحقول.

3. **`Listing.category: String?`** — لا FK لـ `Category`. يمكن أن يصير "Electrnics" بدل "Electronics". **حل:** `categoryId String?` + FK.

4. **`Interaction` polymorphic** — `postId`, `listingId`, `targetUserId` كلها `String?`. صحيح، لكن صعب القلق منه. أضف check constraint: "exactly one of postId, listingId, targetUserId is not null".

5. **`ZoneMaster.currentLordId`** بدون cascade — حذف user يكسر zone.

6. **`User.password: String`** — مقبول، لكن لا `passwordUpdatedAt` لتطبيق سياسة "غيّر كلمة المرور كل 6 أشهر".

7. **لا `softDelete` على Listing/Post/Story** — حذف نهائي يكسر سجل التقييمات والإحصاءات. أضف `deletedAt: DateTime?`.

8. **`createdAt` indexed على SocialPost فقط** — أضف على Listing, MapStory, Conversation لتسريع `orderBy: createdAt desc`.

## 6.2 الهجرات / Migrations

- ⚠️ هجرة واحدة فقط `20260213192512_init_with_enums` — كل ما يلي تم عبر `db push`. هذا يفسر `db push --accept-data-loss` في start.
- 🔴 **خطر إنتاج:** يجب تثبيت سلسلة هجرات منذ الآن قبل أن يصبح rebuild الكامل ضرورياً.

## 6.3 Backups / DR

- لا scripts backup في المستودع.
- Railway يوفّر snapshots لكن يجب توثيق سياسة retention.

## 6.4 توصيات Data Layer

| توصية | أولوية | تأثير |
|------|--------|------|
| تثبيت `prisma migrate` بدل `db push` في prod | 🔴 P0 | تجنب فقدان بيانات |
| PostGIS extension | 🟠 P1 | تسريع 10–100× |
| `ListingImage[]` relation | 🟠 P1 | نظافة + ميزات |
| `categoryId` FK | 🟡 P2 | اتساق |
| `deletedAt` soft delete | 🟡 P2 | سلامة سجلات |
| Bayesian rep score | 🟡 P2 | عدالة |
| Check constraints على Interaction | 🟢 P3 | صلابة |
| Backup retention policy | 🟠 P1 | DR |

---

# 7) الدراسة التكرارية والتنظيمية — Iteration & Organization

## 7.1 DRY violations / تكرار الكود

### 7.1.1 Anchor Rule مكرّر 3 مرات

نفس البلوك يظهر في `actions/market.ts`, `actions/social.ts`, `actions/stories.ts`:

```ts
const user = await db.user.findUnique(...)
if (user.type === 'SHOP' || user.type === 'COMPANY') {
  if (user.latitude && user.longitude) {
    const orbit = getOrbitLocation(user.latitude, user.longitude)
    finalLat = orbit.lat
    finalLng = orbit.lng
    shouldUpdateUserGPS = false
  }
}
```

**حل مقترح:**
```ts
// utils/anchor.ts
export async function resolveAnchoredLocation(userId, requestedLat, requestedLng) {
  const user = await db.user.findUnique({ where: { id: userId }, select: { type, latitude, longitude } })
  // ...
  return { lat, lng, shouldSync, user }
}
```

### 7.1.2 Cookie + Auth Boilerplate مكرّر في كل action

```ts
const cookieStore = await cookies()
const userId = cookieStore.get('user_id')?.value
if (!userId) return { error: 'Unauthorized' }
```

**حل مقترح:** wrapper `withAuth(actionFn)`:
```ts
// lib/withAuth.ts
export function withAuth<T extends any[], R>(fn: (userId: string, ...args: T) => Promise<R>) {
  return async (...args: T) => {
    const userId = (await cookies()).get('user_id')?.value
    if (!userId) return { error: 'Unauthorized' } as R
    return fn(userId, ...args)
  }
}
```

### 7.1.3 `operations: any[]` ثلاث مرات

في `market.ts`, `social.ts`, `stories.ts` نفس النمط — `$transaction([...])` ديناميكي مبني من mutations مشروطة.

**حل مقترح:** نوع `Prisma.PrismaPromise<unknown>[]` بدل `any[]`.

## 7.2 SRP (Single Responsibility) violations

- ✅ `services/` تقوم بمسؤولية واحدة (feed, matching, trust, conversation).
- ⚠️ `actions/feed.ts` يدمج تعريف DTO + خوارزمية الـ post‑cache. افصل DTO إلى `types/feed.ts`.
- ⚠️ `actions/social.ts → createPost` يتولى: cookie, validation, anchor, transaction, revalidate. الـ split الأنظف:
  - `validateCreatePost(input)` → Zod
  - `withAuth(...)` → cookie
  - `resolveAnchoredLocation()` → anchor
  - الـ action يصبح 10 أسطر فقط.

## 7.3 أنماط متضاربة / Inconsistent patterns

| الميزة | actions تستخدم | الاتفاق |
|---------|----------------|---------|
| Zod | login, signup, createListing | ✅ |
| تحقق يدوي | comments, posts, stories, interactions | ❌ غير موحد |
| Return shape | `{ success, error?, payload? }` غالباً | ✅ |
| لكن: | `getListings` يرجع `[]` فقط في error | ❌ |
| logging | `console.error('Foo Error:', e)` | ⚠️ نص ثابت بدل structured logging |

## 7.4 توصيات تنظيمية

1. **أنشئ `lib/serverAction.ts`** بدوال مساعدة (`withAuth`, `withValidation(schema)`, `respond({...})`).
2. **استخرج `utils/anchor.ts`** لقاعدة الـ Anchor.
3. **استخرج `utils/log.ts`** يلف pino + Sentry.
4. **عمّم نمط `try/catch` إلى wrapper** يلتقط كل الأخطاء ويُسجلها.
5. **اجمع كل أنواع feed/profile/listing في `types/index.ts` أو `types/<domain>.ts`**.

## 7.5 جودة الكود التفصيلية

- ✅ Prettier + ESLint مُعدّان.
- ✅ TypeScript strict (يفترض من tsconfig).
- ⚠️ 3 مواضع `any` فعلية + 4 مواضع في tests فقط (مقبول للموك).
- ⚠️ 79 `console.log/warn/error` — استخدم logger موحَّد.
- ⚠️ 1 TODO قديم (`SearchMenu.tsx`).
- ✅ تعليقات وصفية ممتازة في الـ business logic (Anchor, Crowd Drop, Trust).

---

# 8) دراسة التغطية الاختبارية — Test Coverage

## 8.1 ما هو مغطى

- ✅ `lib/schemas.test.ts` — صحة Zod (login, signup, createListing).
- ✅ `actions/__tests__/server-actions.test.ts` — 28 اختبار يغطي:
  - Anchor Rule (Individual / Shop / Company).
  - Watch‑to‑Earn Daily Cap.
  - Zone Purchase TOCTOU.
  - Orbital Spread distribution.
- ✅ `utils/geo.test.ts` — حسابات `getOrbitLocation`.

## 8.2 ما هو **غير** مغطى

- ❌ `services/feedService.ts` — خوارزمية مهمة.
- ❌ `services/matchingService.ts` — 5km/300m logic.
- ❌ `services/trustService.ts` — حساب السمعة.
- ❌ `socket events` (join_room, send_message).
- ❌ `middleware.ts` — rate limit + redirects.
- ❌ Race conditions في `submitTransactionRating`.
- ❌ مكونات الـ UI — لا اختبارات DOM/integration.
- ❌ E2E (Playwright/Cypress) — لا اختبارات قصة كاملة.

## 8.3 توصيات Testing

1. **أضف اختبارات `feedService`** — تحقق من ratio و pagination.
2. **أضف اختبارات `matchingService`** — تأكد من radius logic.
3. **أضف اختبار TOCTOU لـ `submitTransactionRating`** — race scenario.
4. **أضف Playwright E2E** لـ: signup → create listing → like → chat → rating.
5. **هدف:** 60% coverage على services + 80% على actions الحرجة.

---

# 9) DevOps والـ Deployability

## 9.1 CI/CD

- ✅ GitHub Actions: TypeCheck → Vitest → Build.
- ✅ Railway auto‑deploy على push للـ main.
- ⚠️ لا staging environment — كل push على main يصل الإنتاج. أضف `develop` branch + Railway preview deploys.

## 9.2 Build script issues

```json
"build": "next build && tsc server.ts --module CommonJS --moduleResolution node --esModuleInterop --skipLibCheck",
"start": "npx prisma db push --accept-data-loss && NODE_ENV=production node server.js"
```

🔴 **`db push --accept-data-loss`** عند كل بدء تشغيل خطر مدمّر. الإصلاح:
```json
"start": "npx prisma migrate deploy && NODE_ENV=production node server.js"
```

⚠️ `tsc server.ts` يولّد `server.js` لكن لا يصدر `tsconfig` خاص بالخادم — قد يخلق ملفات unused. اعتمد `tsc -p tsconfig.server.json`.

## 9.3 Monitoring

- ❌ لا Sentry / Logtail / Datadog.
- ❌ لا APM (New Relic / Highlight).
- ❌ لا uptime monitoring (UptimeRobot / BetterStack).
- 🔴 لا alarms عند سقوط Redis / DB.

**أولوية:** أضف **Sentry** أولاً (free tier). جديرة بـ 30 دقيقة وتحوّل الـ MTTR من ساعات إلى دقائق.

## 9.4 Observability

- ❌ لا structured logs.
- ❌ لا metrics (Prometheus / OpenTelemetry).
- ❌ لا traces.

**اقتراح Phase 1:** pino + pino-pretty محلياً، pino-http للـ HTTP logs، Sentry للأخطاء.

---

# 10) لوحة قيادة الأولويات — Priority Dashboard

## 10.1 P0 — عاجل (أيام)

| # | المهمة | المخاطرة |
|---|--------|---------|
| P0-1 | استبدل `db push --accept-data-loss` بـ `migrate deploy` | فقدان بيانات إنتاج |
| P0-2 | أضف Sentry للأخطاء | لا رؤية للحوادث |
| P0-3 | وقّع كوكي `user_id` (iron-session أو jose) | سرقة جلسة سهلة |
| P0-4 | rate limit لـ Socket.io send | DDoS داخلي |
| P0-5 | افصل `isLiked` عن مفتاح كاش الـ feed | ذاكرة Next تنفجر |

## 10.2 P1 — مهم (أسابيع)

| # | المهمة | الفائدة |
|---|--------|-------|
| P1-1 | PostGIS + GiST | أداء جغرافي ×10–100 |
| P1-2 | `ListingImage[]` بدل CSV | نظافة + ميزات |
| P1-3 | `withAuth` + `withValidation` wrappers | تقليل 30% boilerplate |
| P1-4 | استخراج `utils/anchor.ts` | DRY |
| P1-5 | اختبارات feedService + matchingService | ثقة عند التطوير |
| P1-6 | nonce CSP بدل unsafe-inline | حماية XSS أصرم |
| P1-7 | `socket.io-redis-adapter` | جاهزية توسعة |
| P1-8 | Cron job: حذف الحسابات المُجمَّدة بعد 6 أشهر | تنظيف فعلي |
| P1-9 | تصحيح pagination الـ feed (seedrandom) | UX سلس |
| P1-10 | Bayesian Trust Score | عدالة |

## 10.3 P2 — تحسين (شهور)

| # | المهمة |
|---|--------|
| P2-1 | OTP/SMS لتأكيد الهاتف عند signup |
| P2-2 | Web Push notifications |
| P2-3 | Search عبر Meilisearch |
| P2-4 | 2FA للمشرفين |
| P2-5 | Audit log للإدارة |
| P2-6 | Soft delete (deletedAt) |
| P2-7 | Playwright E2E |
| P2-8 | Staging environment |
| P2-9 | Analytics (PostHog) |
| P2-10 | API rate limit per‑user (مش فقط per‑IP) |

---

# 11) خارطة الطريق المقترحة (16 أسبوع) — Suggested Roadmap

### الأسبوع 1–2: **استقرار حرج (P0)**
- إصلاح `migrate deploy`، Sentry، signed cookie، socket rate limit، cache fix.

### الأسبوع 3–5: **بنية بيانات (P1 جغرافي)**
- PostGIS + GiST migration.
- `ListingImage[]`.
- `categoryId` FK + soft delete.

### الأسبوع 6–8: **تنظيم الكود (P1 جودة)**
- `withAuth`, `withValidation`, `utils/anchor.ts`.
- pino logging.
- Redis adapter لـ Socket.io.

### الأسبوع 9–11: **اختبارات (P1 ثقة)**
- اختبارات services، Playwright E2E، coverage 70%.

### الأسبوع 12–14: **أمن متقدم (P1)**
- nonce CSP، 2FA admins، audit log، CSRF on Route Handlers.

### الأسبوع 15–16: **تحضير للنمو (P2)**
- OTP, Search, Web Push, staging env.

---

# 12) ملاحق — Appendices

## 12.1 ملحق A — مقاييس سريعة

| مقياس | قيمة |
|------|------|
| TS/TSX files | 146 |
| إجمالي أسطر `.ts/.tsx` | ~14,045 |
| أكبر ملف | `EditProfileModal.tsx` (367 سطراً) |
| Server Actions | 21 ملف |
| Services | 4 |
| Components | 60+ |
| Hooks | 5 |
| Zustand stores | 3 |
| Prisma models | 11 |
| Prisma enums | 6 |
| اختبارات | 28+ |
| `any` (غير tests) | 3 مواضع |
| TODO/FIXME | 1 |

## 12.2 ملحق B — الملفات الأكثر إلحاحاً للمراجعة

1. `web/package.json` (إصلاح start script) — P0-1
2. `web/server.ts` (Socket auth + CORS) — P0-3, P0-4
3. `web/src/actions/feed.ts` (cache key fix) — P0-5
4. `web/prisma/schema.prisma` (هجرات + PostGIS) — P1-1, P1-2
5. `web/src/services/trustService.ts` ($transaction wrap) — P1-x

## 12.3 ملحق C — كود مثال للإصلاحات الحرجة

### C.1 — `package.json` start (P0-1)
```json
"start": "npx prisma migrate deploy && NODE_ENV=production node server.js"
```

### C.2 — Signed cookie via iron-session (P0-3)
```ts
// lib/session.ts
import { getIronSession } from 'iron-session'
export const sessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: 'session',
  cookieOptions: { secure: true, httpOnly: true, sameSite: 'lax' }
}
export type SessionData = { userId: string }
```

### C.3 — Socket io.use middleware (P0-3)
```ts
io.use(async (socket, next) => {
  const cookieHeader = socket.handshake.headers.cookie || ''
  const session = await parseSession(cookieHeader)
  if (!session.userId) return next(new Error('unauthorized'))
  socket.data.userId = session.userId
  next()
})
```

### C.4 — Cache fix (P0-5)
```ts
// feed.ts
const getCachedRawFeed = unstable_cache(
  (page, limit, filterType) => getMixedFeedLogic(page, limit, undefined, filterType),
  ['mixed-feed-cache'],
  { revalidate: 60, tags: ['feed'] }
)
export async function getMixedFeed(page, limit, currentUserId, filterType) {
  const raw = await getCachedRawFeed(page, limit, filterType)
  const likedIds = currentUserId ? await getLikedIdsForUser(currentUserId) : new Set()
  return mergeIsLiked(raw, likedIds) // map + isLiked apply
}
```

### C.5 — Anchor helper (P1-4)
```ts
// utils/anchor.ts
export async function resolveAnchor(userId: string, lat: number, lng: number) {
  const user = await db.user.findUnique({
    where: { id: userId }, select: { type: true, latitude: true, longitude: true }
  })
  if (!user) throw new Error('User not found')
  if ((user.type === 'SHOP' || user.type === 'COMPANY') && user.latitude && user.longitude) {
    const orbit = getOrbitLocation(user.latitude, user.longitude)
    return { lat: orbit.lat, lng: orbit.lng, shouldSync: false, user }
  }
  return { lat, lng, shouldSync: true, user }
}
```

### C.6 — withAuth wrapper (P1-3)
```ts
// lib/withAuth.ts
export function withAuth<A extends any[], R>(
  fn: (userId: string, ...args: A) => Promise<R>
) {
  return async (...args: A): Promise<R | { error: string }> => {
    const userId = (await cookies()).get('user_id')?.value
    if (!userId) return { error: 'Unauthorized' }
    return fn(userId, ...args)
  }
}
// استخدام:
export const updateUserLocation = withAuth(async (userId, lat: number, lng: number) => {
  /* ... */
})
```

---

## 🏁 خاتمة

أنت أمام **MVP تقريباً جاهز للإنتاج التجاري**. القرارات المعمارية القاعدية (Server Actions + Socket+Next واحد + Anchor/Orbital) سليمة، والمعالجات الحاسمة (Race safety, Admin Guard, CSP) موجودة.

تنفيذ الـ P0 خلال أسبوع، ثم P1 خلال 8–10 أسابيع، سيرفع التقدير من **3.8** إلى **4.5+** ويجعل المنصة مهيأة لـ **100k+ مستخدم نشط** دون إعادة هندسة جذرية.

> *كل ميزة جديدة يجب أن تخدم الرؤية: جعل كل شخص ومتجر وشركة مرئياً وقابلاً للتفاعل معه على الخريطة.* — هذا هو الميثاق.

---

**تمت المراجعة بواسطة:** Claude (Cowork mode)
**التاريخ:** 12 مايو 2026
**المراجَع التالية الموصى بها:** بعد تنفيذ P0 (≈ 2 أسبوع)، ثم بعد PostGIS migration (≈ 6 أسابيع).

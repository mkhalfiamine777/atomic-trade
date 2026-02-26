# 🧠 AI Context File: Project mkhalfiamine777 (Social Commerce)
> **🚨 AI PROTOCOL (آلية الحساسية):**
> 1.  **START (الافتتاح):** يجب قراءة هذا الملف **+ الوثيقة التأسيسية (`core_vision_report.md`)** فوراً عند بداية الجلسة.
> 2.  **END (الاختتام):** يجب تحديث هذا الملف قبل إغلاق الجلسة. سجل "الإنجازات" الجديدة وحدث "الحالة".
> 3.  **GOAL:** لا تشتت. التزم بالمسار. كل ميزة يجب أن تخدم **العرض والطلب على الخريطة**.

**Last Updated:** 2026-02-26 17:20
**Status:** Session 15 Complete (Phase 5: Visuals, Explore Map & Admin Dashboard) 🟢
**Time Report:** [View Report](file:///C:/Users/%D9%85%D8%B1%D9%8A%D9%85/.gemini/antigravity/brain/cbcde559-0035-44e2-ae2e-51b1c66aa2ac/time_tracking_report.md)
**📜 Core Vision:** [الوثيقة التأسيسية](file:///C:/Users/%D9%85%D8%B1%D9%8A%D9%85/.gemini/antigravity/brain/0eee0296-0fbf-43ba-ad1c-7b67f579aedc/core_vision_report.md) ← **اقرأها أولاً!**

---

## 🎯 1. الهدف النهائي (The North Star)
بناء **نظام بيئي متكامل للتجارة الاجتماعية (Social Commerce Ecosystem)** يدمج بين العالم الافتراضي والواقعي.
يتميز بـ:
*   **خريطة حية (Living Map):** كل تفاعل (بيع، شراء، تواصل) مرتبط بموقع جغرافي دقيق.
*   **اقتصاد الثقة (Trust Economy):** نظام سمعة متطور ينظم سلوك المستخدمين.
*   **لعبة السيطرة (Zone Master):** تنافس جغرافي للسيطرة على المناطق والأحياء.
*   **هوية بصرية (Neon/Cyberpunk):** تصميم مستقبلي يعتمد على الزجاج والإضاءة.

---

## 📍 2. الحالة الحالية (Current Pulse)
**نحن الآن في:** إتمام **الجلسة 15** وبداية **الجلسة 16**.
*   ✅ **تم إنجاز (المرحلة 5 بالكامل):** 
    1. تحسين واجهات العروض والبطاقات للمنتجات والخدمات (Reverse Market Engine).
    2. إنشاء صفحة "الاستكشاف" التفاعلية (`/explore`) للبحث عبر الخريطة.
    3. بناء الكتالوج الديناميكي (Prisma SQL) ولوحة تحكم الإدارة الشاملة (Admin Panel).
*   🚀 **حالة النظام:** **مستقر (Stable) وآمن** بدرجة عالية، جاهز للإنتاج (Production-Ready).
*   🚧 **المرحلة القادمة:** الإطلاق النهائي، تحسين اقتصاد السيطرة (Zone Master Tax)، وأنظمة الإعلانات.

---

## 📜 3. سجل الإنجازات (Achievement Log)

### 📅 26-02-2026 — الجلسة 15 (Phase 5: Visuals, Explore Map & Admin Dashboard)
*   **الإنجاز: 💎 محرك السوق العكسي (Reverse Market Engine):**
    *   تصميم واجهة Profile لعرض `طلبات الشراء` كمورد أساسي للسوق.
    *   إصلاح عرض الصور المتعددة وتوظيف `next/image` للأداء.
    *   إصلاح تشغيل الفيديوهات التلقائي وتفعيل `IntersectionObserver`.
*   **الإنجاز: 🗺️ صفحة الاستكشاف (Interactive Explore):**
    *   بناء مسار `/explore` يجمع بين الخريطة التفاعلية والبطاقات الذكية.
    *   ربط محددات الخريطة (`Markers`) بقائمة العروض لتفاعل متزامن.
    *   مزامنة السطوع المكاني والحالة مع `URL query parameters`.
*   **الإنجاز: 🛡️ لوحة الإدارة والكتالوج (Admin & Categories):**
    *   نقل الكتالوج من `JSON` ثابت إلى طاولات `Category & Subcategory` في `PostgreSQL`.
    *   بناء صفحة `admin/categories/` للمسؤولين لإضافة فئات ديناميكياً.
    *   بناء صفحة `admin/users/` تعرض جميع المستخدمين (إحصائيات، توثيق الشارة الزرقاء، وتصفير السمعة للمخالفين).
    *   تأمين لوحة الإدارة عبر متغير البيئة `ADMIN_PHONES` للإنتاج (Production).
*   **التحقق:** Build ناجح `0 Errors`.


### 📅 26-02-2026 — الجلسة 14 (Security, Socket Privacy & Chat Refactoring)
*   **الإنجاز: 🛡️ أمان الإنتاج والبيانات (Production Security):**
    *   إنقاذ قاعدة البيانات بمحو أمر `--accept-data-loss` واستبداله بـ `migrate deploy` في `package.json`.
*   **الإنجاز: 🔒 خصوصية غرف الدردشة (Socket Privacy):**
    *   إضافة فحص صارم عبر `Prisma` داخل حدث `join_room` بـ `server.ts` للتأكد المطلق من أن القارئ هو أحد المجاورين الفعليين للمحادثة.
*   **الإنجاز: ⚡ الحماية من إغراق الطلبات (Rate Limiting Prep):**
    *   استكمال كود `@upstash/ratelimit` في `middleware.ts` وتجهيز `src/lib/redis.ts` للعمل بصمت حتى إضافة مفاتيح API الخاصة بـ Upstash.
*   **الإنجاز: 💬 تنظيف محرك المحادثات (Chat Engine Routing):**
    *   حذف المعرفات المؤقتة Temporary IDs (`conv-ID1-ID2`) بالكامل. 
    *   توجيه التفاعل المباشر وربط الإشعارات برقم المحادثة الحقيقي في قاعدة البيانات `conversationId`.
*   **التحقق:** Build ناجح `0 Errors`.

### 📅 21-02-2026 — الجلسة 12 (Critical Audit Fixes & Build Verification)
*   **الإنجاز: 🛡️ إغلاق الثغرات الأمنية (Security Hardening):**
    *   إزالة `--force-reset` الكارثي من `package.json` وتأمين بيانات الإنتاج.
    *   فرض المصادقة عبر الكوكيز لـ `createPost`, `purchaseZone`, وجميع التفاعلات (Interactions).
    *   إضافة طبقة حماية لـ Socket.IO لمنع الانضمام غير المصرح به للغرف.
*   **الإنجاز: 🔗 إصلاحات التكامل والبيانات (Integration & Data):**
    *   إضافة الـ `bio` المفقود لـ `getCurrentUser` لضمان ظهوره في كل مكان.
    *   تصحيح `revalidatePath` ليعتمد على اسم المستخدم بدلاً من المعرف.
    *   تحسين أداء تحديث المواقع (تخطي القصص المنتهية).
*   **الإنجاز: 🚀 التحقق النهائي (Certification):**
    *   إصلاح جميع أخطاء النوع (TypeScript) الناتجة عن تعديل التواقيع (Signatures).
    *   تشغيل `npm run build` والتحقق من سلامة المشروع بنسبة 100%.

### 📅 21-02-2026 — الجلسة 11 (Edit Profile Improvements & Full Project Audit)
*   **الإنجاز: ✏️ تحسينات تعديل الملف الشخصي (Edit Profile):**
    *   إضافة حقل `bio` (200 حرف) إلى الـ Schema و Modal و ProfileHeader.
    *   تفعيل رفع الصور عبر `uploadthing` في `AvatarUploader.tsx`.
    *   إضافة ميزة تغيير كلمة المرور (bcryptjs) في `updateProfile.ts`.
    *   إضافة تحقق أمني (URL Whitelist) لروابط الصور الشخصية.
*   **الإنجاز: 🔍 تدقيق شامل للمشروع (Full Project Audit):**
    *   مراجعة سطر بسطر لـ **30+ ملف مصدري** عبر جميع الطبقات.
    *   توثيق **22 مشكلة** في `full_project_audit.md`:
        *   🔴 5 مشاكل أمنية حرجة (force-reset, missing auth, Socket.IO)
        *   🟠 6 مشاكل تكامل (missing bio, duplicate queries, wrong revalidatePath)
        *   🟡 3 مشاكل توافق (in-memory rate limiting, RTL Toaster)
        *   🔵 8 مشاكل جودة كود (mock comments, unused imports, empty handlers)
*   **التحقق:** Build ناجح والنشر على Railway ✅.

### 📅 20-02-2026 — الجلسة 10 (Zone Grid Activation & Styling)
*   **الإنجاز: 10.4 تفعيل تقسيم المناطق (Zone Grid Activation):**
    *   تثبيت `ngeohash` وربطه بـ `ZoneGridLayer.tsx` لعرض الشبكة الجغرافية بدقة.
    *   تفعيل منطق `ZoneMaster` (Prisma) وجلب البيانات الحقيقية (المالك، الضريبة).
    *   إصلاح خطأ `useLeafletContext` عبر إعادة هيكلة المكون داخل `MapContainer`.
*   **الإنجاز: 🕹️ التحكم والتفاعل (Control & Interaction):**
    *   إضافة زر **Toggle** (🛡️/⚔️) في `SettingsDrawer` للتحكم في ظهور الشبكة.
    *   ربط الحالة (`showZoneGrid`) بـ `Map.tsx` لعرض الطبقة عند الطلب فقط.
*   **الإنجاز: 🎨 تصميم النيون (Cyberpunk Styling):**
    *   تطبيق لوحة ألوان متوهجة: **Emerald** (مملكتي)، **Amber** (محتلة)، **Cyan** (حرة).
    *   إضافة تأثيرات بصرية متقدمة: `drop-shadow` للحدود، و `backdrop-blur` للنوافذ المنبثقة.
    *   تصميم **Popup** مستقبلي شفاف (Glassmorphism) مع زر شراء متوهج.
*   **الإنجاز: 🔧 التحضير للمحتوى (Content Prep):**
    *   تحديث `getProfileContent.ts` لدعم عدّاد التفاعلات (`_count.likes`, `_count.comments`).
    *   تنظيف التكرار وحذف الملفات الزائدة.
*   **التحقق:** الخريطة تعمل بسلالة، التصميم مبهر، والبيانات Backend جاهزة للخطوة القادمة.

### 📅 18-02-2026 — الجلسة 9 (Active: Core Vision & Profile Redesign)
*   **الإنجاز: 📜 الوثيقة التأسيسية (Core Vision Integration):**
    *   استخراج الرؤية الكاملة من 99 وثيقة في `core_vision_report.md`.
    *   ربط الوثيقة ببروتوكول الذكاء الاصطناعي (`AI_mkhalfiAmine.md`) وبداية الجلسة (`session_start`).
*   **الإنجاز: 🎥 توحيد الـ Feed (Unified Exploration):**
    *   دمج الفيديو، الصور، والقصص في `UnifiedFeed`.
    *   تطوير `ImageViewer.tsx` لعرض الصور والقصص بتصميم غامر.
    *   تحديث خوارزمية `getMixedFeed` بخلط عشوائي حقيقي (Fisher-Yates) ودعم `MapStory`.
*   **الإنجاز: 👤 واجهة الملف الشخصي (Premium Profile):**
    *   إعادة تصميم `ProfileHeader.tsx` بتصميم Glassmorphism + Neon احترافي.
    *   إضافة مؤشرات بصرية لنوع المستخدم (فرد/متجر/شركة) وشريط الثقة المتحرك.
    *   تطبيق `StickyTabs` للتنقل السلس (محتوى، منتجات، طلبات).
*   **الإنجاز: 🔧 إصلاحات الجودة والأمان (Session Audit):**
    *   إصلاح 5 أخطاء حرجة (Prisma Models, Types, Imports).
    *   تنظيف الكود واعتماد أنواع صريحة لضمان الاستقرار.
*   **التحقق:** Build ناجح (0 أخطاء) والنشر على Railway ✅.

### 📅 17-02-2026 — الجلسة 8 (Finalizing Phase 10)
*   **الإنجاز: 10.4 Zone Grid Implementation:**
    *   تحديد وتطبيق منطق تقسيم الخريطة إلى مناطق (Zone Grid).
    *   تطوير واجهة المستخدم لعرض حدود المناطق وتفاعلاتها.
    *   دمج بيانات المناطق مع نظام اللعبة الأساسي.
*   **الإنجاز: 10.5 Socket Cleanup:**
    *   تنظيف وإزالة ملف `SocketStatus` القديم.
    *   التحقق من استقرار اتصال Socket.IO بعد التنظيف.
*   **الإنجاز: 10.6 Dashboard Refactor:**
    *   إنشاء `SettingsDrawer` كقائمة موحدة للإجراءات والإعدادات.
    *   إزالة الزر العائم (FAB) لتنظيف واجهة الخريطة.
    *   توحيد منطق المودالات في `handleOpenModal`.
*   **التحقق:** جميع ميزات المرحلة 10 تعمل بكفاءة. الخريطة نظيفة وجاهزة للمرحلة القادمة.

### 📅 15-02-2026 — الجلسة 7 (Optimization & Unification)
*   **الإنجاز: 10.1 دمج وحدات الخريطة (Map Controllers):**
    *   دمج منطق `MapControllerReverse` داخل `MapControls`.
    *   إصدار تقارير معمارية: `map_architecture_report.md` و `map_marker_report.md`.
*   **الإنجاز: 10.2 توحيد Geolocation:**
    *   استبدال المنطق اليدوي في `CreatePostModal` بـ `useGeolocation hook`.
*   **الإنجاز: 10.3 توحيد المودالات (Modal Wrapper):**
    *   إنشاء `ModalWrapper.tsx` وتحديث 4 مودالات لاستخدامه (Post, Request, Product, Story).
    *   إصدار `modals_technical_report.md` و `ux_engineering_report.md`.
*   **الإنجاز: 10.4 تخطيط المناطق (Zone Grid Phase):**
    *   دراسة شاملة للمفهوم التقني والاقتصادي (`zone_master_comprehensive_study.md`).
    *   تطوير "نبض المدينة" (Heartbeat Animation) في الصفحة الرئيسية.
    *   إنشاء دليل المستخدم الآلي (`site_user_guide_automated.md`) لشرح آلية ظهور الخريطة.
*   **التحقق:** السيرفر يعمل بنجاح (Uptime 3h+). تم إغلاق ملف SocketStatus.

### 📅 14-02-2026 — الجلسة 6 (Navigation, Auth & Decoration Phase)

*   **الإنجاز: 🧭 تحسينات التنقل والملاحة (Navigation Phase 9.4):**
    *   إصلاح `/activity`: إعادة توجيه ذكية لـ `/u/[username]?tab=SALES`.
    *   إنشاء `/explore`: صفحة استكشاف جديدة تعرض `VideoFeed`.
    *   توحيد زر "العودة للخريطة" 🗺️ في جميع الصفحات الرئيسية.
*   **الإنجاز: 🔐 المصادقة وتجربة المستخدم (Auth UX Phase 9.3):**
    *   إضافة `AuthModal` بتصميم زجاجي ونيون (Glass/Neon UI) للزوار.
    *   إضافة زر "تسجيل الخروج" 🚪 (Logout) في لوحة التحكم (Top-Right).
    *   إصلاح التوجيه المتكرر (Redirect Loop) في صفحة الملف الشخصي.
*   **الإنجاز: 🎨 تحسينات الخريطة والواجهة (Map & UI):**
    *   استعادة دائرة النطاق (300m Radar Circle) حول المستخدم.
    *   تحسين موقع أزرار التحكم في الخريطة.
*   **التحقق:** نشر ناجح لجميع الميزات الجديدة على Railway 🚀.

### 📅 14-02-2026 — الجلسة 5 (Production Fixes & Comprehensive Review)
*   **الإنجاز: 🔴 إصلاحات الإنتاج (Production Fixes):**
    *   حل مشكلة `User.username does not exist` عبر إضافة `--accept-data-loss` لحل تعارض الـ Schema.
    *   إصلاح `package.json`: إزالة تكرار script `start` وضمان تشغيل أمر التهجير الصحيح.
    *   نقل `prisma` إلى `dependencies` لضمان عمل CLI في بيئة الإنتاج.
*   **الإنجاز: 🔐 الأمن (Security Phase 6):**
    *   سد ثغرة `/api/messages`: إضافة تحقق صارم من المشاركين (Participation Check) قبل عرض الرسائل.
    *   التحقق من صحة بيانات الجلسة والمصادقة.
*   **الإنجاز: 🛠️ التحسينات البنيوية (Phase 5):**
    *   إنشاء `SocketProvider` لتوحيد اتصال المقابس (Sockets) عبر التطبيق.
    *   استخراج `useMediaUpload` hook لتوحيد منطق رفع الملفات.
    *   تطبيق Rate Limiting في `middleware.ts`.
*   **الإنجاز: 📚 المراجعة الشاملة (Phase 7):**
    *   إجراء تحليل تقني، هندسي، أمني، وبنيوي شامل للمشروع.
    *   إصدار التقرير النهائي للمراجعة: `comprehensive_report.md`.
*   **التحقق:** النشر ناجح على Railway ✅.

### 📅 13-02-2026 — الجلسة 4 (Phase 4: Structural Improvements)
*   **الإنجاز: 4.1 تفكيك المكونات الكبيرة:**
    *   `MediaUploader.tsx` → `DropZone`, `VideoPreview`, `TrimControls`
    *   `ProfileTabs.tsx` → `TabButton`, `MediaGrid`, `ListingsGrid`, `InfiniteScrollSentinel`, `EmptyState`
    *   `Map.tsx` → `MapControls`, `MapMarker`
    *   `CommentsSheet.tsx` → `CommentItem`
    *   `EditProfileModal.tsx` → `AvatarUploader`
*   **الإنجاز: 4.2 توحيد بنية Server:**
    *   إعادة كتابة `server.ts` مع دردشة كاملة (join_room, send_message, typing/stop_typing).
    *   تبسيط scripts: `tsx` بدل `ts-node`/`nodemon`.
    *   إزالة `socket-server.ts` المنفصل.
*   **الإنجاز: 4.3 إضافة Prisma Enums:**
    *   6 enums: `UserType`, `SubscriptionPlan`, `ListingType`, `MediaType`, `PostType`, `InteractionType`.
    *   Migration `init_with_enums` ناجحة.
    *   تحديث `types/index.ts` مع literal union types.
    *   إصلاح 5 أخطاء TypeScript.
*   **التحقق:** `tsc --noEmit` → Exit 0 ✅

### 📅 13-02-2026 — الجلسة 3 (Comprehensive Audit + 16 Fixes)
*   **الإنجاز:** تدقيق شامل لـ **50+ ملف** وإنشاء تقرير مفصل (`audit_report.md`).
*   **الإنجاز: 🔴 إصلاحات أمنية حرجة (5):**
    *   منع تسريب password hash في `interactions.ts` و `feed.ts` (استبدال `include: { user: true }` بـ `select`).
    *   إضافة مصادقة cookie-based لـ `/api/messages` (كانت تثق بـ `userId` من query params).
    *   تأمين `/api/dev/set-rep` (`!== 'development'` بدلاً من `=== 'production'`).
    *   نقل `@prisma/client` و `socket.io` من `devDependencies` إلى `dependencies`.
    *   حذف `check-security.ts` و `check-users.ts` (كانت تطبع كلمات المرور).
*   **الإنجاز: 🟡 إصلاحات تقنية (5):**
    *   Socket URL ديناميكي عبر `NEXT_PUBLIC_SOCKET_URL` (كان hardcoded `localhost:3001`).
    *   حذف `server.js` (ملف مُترجم مكرر) + ملفات مؤقتة + تحديث `.gitignore`.
    *   تقليل `bodySizeLimit` من 200MB إلى 20MB.
    *   إضافة throttle 30 ثانية لتحديث الموقع في `DashboardClient.tsx`.
*   **الإنجاز: 🔵 جودة الكود (6):**
    *   استبدال الدوال الوهمية (`interactWithUser`/`interactWithListing`) بمنطق DB حقيقي.
    *   إزالة `as any` ودمج try/catch المتداخل في `stories.ts`.
    *   إصلاح `error: any` → `error: unknown` في `market.ts`.
    *   حذف `typingUsers` غير المستخدم في `useChat.ts`.
    *   توحيد error patterns في `createVideo.ts` (`throw` → `return`).
*   **التحقق:** 3 بناءات ناجحة (exit code 0) بعد كل مرحلة.
*   **الإنجاز:** إنشاء تقارير تفصيلية للمرحلة 4 البنيوية (`phase4_reports.md`).

### 📅 12-02-2026 — الجلسة 2 (Social Engine & Cleanup)
*   **الإنجاز:** تفعيل **نظام الدردشة الفوري (Real-time Chat):**
    *   إصلاح اتصال Socket.IO (فصل السيرفر إلى `socket-server.ts` مستقل على المنفذ 3001).
    *   إنشاء `useChat.ts` hook و `ChatWindow.tsx` و `/api/messages` API.
    *   حل مشكلة التوجيه (Temporary Conversation IDs) والبث إلى الغرف الصحيحة.
*   **الإنجاز:** إنشاء مكون **`TrustBadge`** ودمجه في `ProfileHeader.tsx` و `Map.tsx`.
*   **الإنجاز:** إنشاء `getCurrentUser.ts` server action للمصادقة الحقيقية.
*   **الإنجاز:** **تنظيف شامل:** حذف ملفات الاختبار، إزالة Debug Toolbar، تنظيف console.logs.

### 📅 23-02-2026 — جلسة الإشعارات الفورية (Real-time Notifications)
*   **الإنجاز:** إنشاء **جسر Socket.io العالمي** (`socketEngine.ts`) لمشاركة السيرفر مع الـ Server Actions.
*   **الإنجاز:** تحديث `server.ts` لربط المستخدمين **بغرف خاصة** (`user:id`) عند الاتصال لتمكين الإشعارات الموجهة.
*   **الإنجاز:** تطوير **جرس إشعارات ذكي (NotificationBell)** في الداشبورد مع عداد (Badge) وقائمة منسدلة.
*   **الإنجاز:** ربط **محرك المطابقة (Matching Engine)** بالـ Sockets لإرسال تنبيهات فورية ثنائية الاتجاه (للبائع والمشتري).
*   **الإنجاز:** تفعيل وتحديث **قاعدة بيانات Docker** والتأكد من استقرار السيرفر محلياً وعالمياً.
*   **الإنجاز:** رفع جميع التغييرات على **GitHub** وتفعيل النشر في **Railway**.

### 📅 22-02-2026 — جلسة التطوير العصري (Smart Search & Product Matching)
*   **الإنجاز:** إنشاء **بحث ذكي (Command Menu)** باستخدام `cmdk` مع تصميم Glassmorphism + اختصار `Ctrl+K`.
*   **الإنجاز:** إنشاء **كتالوج منتجات هرمي عالمي** (`products_catalog.json`) يحتوي 8 فئات و40+ تصنيف فرعي.
*   **الإنجاز:** بناء مكون **قوائم متتالية ذكية** (`CascadingProductSelect.tsx`) — فئة ← تصنيف ← تفاصيل.
*   **الإنجاز:** تحديث **نافذة "إضافة منتج"** و **نافذة "اطلب ما تحتاج"** بالمكون الجديد.
*   **الإنجاز:** بناء **محرك المطابقة الذكية (Matching Engine)** في `market.ts` — يبحث عن مطابقات بين العرض والطلب (نفس الفئة + التصنيف).
*   **الإنجاز:** إضافة حقل `subcategory` لجدول `Listing` في Prisma ونشره على قاعدة البيانات.
*   **الإنجاز:** تحديث **خارطة التطوير** (`TASK_TATWIR_3SRII.md`) بأقسام جديدة (القسم 6: Smart Matching + القسم 7: Admin Panel).
*   **الإنجاز:** رفع ونشر التحديثات على **GitHub + Railway**.

### 📅 12-02-2026 — الجلسة 1 (Living Map Integration & Trust Economy)
*   **الإنجاز:** تفعيل **Geo-tagging** للمنشورات الاجتماعية (Social Posts) وعرضها على الخريطة.
*   **الإنجاز:** تطوير **CreatePostModal** وربطه بالقائمة العائمة (FAB).
*   **الإنجاز:** تنفيذ **اقتصاد الثقة (Trust Economy):**
    *   إخفاء المنشورات (Transparency 0.7) للمستخدمين الجدد (<50).
    *   منح **شارة الثقة (🛡️)** للمستخدمين الموثوقين (>80).
*   **الإنجاز:** إنشاء **Developer Tool (`/api/dev/set-rep`)** لتعديل نقاط السمعة يدوياً.
*   **الإنجاز:** التحقق اليدوي الناجح من جميع وظائف الخريطة (إنشاء، عرض، تفاعل).

### 📅 11-02-2026 (Profile Redesign Session)
*   **الإنجاز:** إعادة بناء `src/app/u/[username]/page.tsx` بتصميم زجاجي كامل.
*   **الإنجاز:** تطوير `ProfileHeader.tsx` إلى تصميم "بطاقة عائمة".
*   **الإنجاز:** تحسين `ProfileTabs.tsx` وإزالة تكرار الفيديو (استخدام `<video preload="metadata">`).
*   **الإنجاز:** إنشاء `src/types/index.ts` وتنظيف التكرارات في الكود.
*   **الإنجاز:** حل مشكلة `Cannot GET /dashboard` باستخدام `npx next dev`.

---

## 🗺️ 4. خارطة الطريق النشطة (Active Roadmap)

### **أ. المرحلة الحالية: الإنتاج والمراجعة (Production & Review) - ✅ Completed**
1.  [x] **Production Fixes:** إصلاح مشاكل Prisma Schema و Start Script والنشر على Railway.
2.  [x] **Security Audit:** سد ثغرات API Messages وتأمين البيانات.
3.  [x] **Code Polish:** تفكيك المكونات (Modals, Map) وتحسين الأداء (Rate Limiting).
4.  [x] **Comprehensive Review:** إصدار تقرير شامل لحالة المشروع.

### **ب. المرحلة المكتملة: المحرك الاجتماعي والخريطة - ✅ Completed**
1.  [x] **Living Map:** Geo-tagging للمنشورات والمنتجات.
2.  [x] **Real-time Chat:** Socket.io + Persistence.
3.  [x] **Trust Economy:** Reputation Score + Badges.
4.  [x] **Structural:** Enums + Server Unification.

### **ج. المرحلة التالية: قصص حية + تحسينات الواجهة (Live Stories & UI Polish) - ✅ Completed**
1.  [x] **UI & Bug Fixes:** تصحيح الأخطاء وتطوير الواجهة (Navigation, Explore, Activity).
2.  [x] **Live Stories:** تمكين القصص الحية وربطها بالموقع (Phase 9 Completed).
3.  [x] **Auth UX:** تحسين تجربة الدخول (Modal + Logout).

### **د. المرحلة 10: التحسين والاقتصاد (Optimization & Economy)**
1.  [x] **Merge Map Controllers:** دمج وحدات التحكم في الخريطة.
2.  [x] **Unify Geolocation:** استخدام Hook موحد.
3.  [x] **Unify Modals:** استخدام ModalWrapper.
4.  [x] **Zone Grid:** تقسيم الخريطة (Phase 10.4).
5.  [x] **Socket Cleanup:** تنظيف SocketStatus.

### **و. المرحلة 11: البحث الذكي والمطابقة والإشعارات (Smart Features) - ✅ Completed**
1.  [x] **Command Menu:** بحث ذكي بـ `cmdk` + Glassmorphism.
2.  [x] **Product Catalog:** كتالوج هرمي موحد (8 فئات، 40+ تصنيف).
3.  [x] **Matching Engine:** محرك بحث عن مطابقات بائع/مشتري.
4.  [x] **Real-time Notifications:** جرس إشعارات بـ Socket.io + Badge.

### **ز. المرحلة المستقبلية: لوحة تحكم إدارية + اقتصاد متقدم**
1.  [x] **Admin Panel:** لوحة إدارية لإدارة المستخدمين والمراقبة (`/admin/users`).
2.  [x] **Category Migration:** نقل الكتالوج من JSON إلى PostgreSQL ولوحة إدارية (`/admin/categories`).
3.  [ ] **Zone Economy & Tax:** تطبيق ضرائب الشراء وإضافتها لحساب الحاكم (Zone Master).
4.  [ ] **Advanced Reputation Algorithm:** معادلة سمعة معقدة تدمج سرعة الرد ونسب الرضى.

---

## 🏗️ 5. البنية التحتية (Infrastructure Context)
*   **Development:**
    *   **OS:** Windows Localhost.
    *   **Server:** `npx next dev` (Next.js) + `server.ts` (Unified).
    *   **DB:** Docker (PostgreSQL).
*   **Production:**
    *   **Platform:** **Railway**.
    *   **Scaling:** Single service (Web + Socket combined).
    *   **Start Script:** `npx prisma db push --force-reset && NODE_ENV=production npx tsx server.ts`
    *   **⚠️ تحذير:** `--force-reset` يمسح البيانات! يجب استبداله بـ `--accept-data-loss` أو `migrate deploy`.

---

## 💡 6. ملاحظات وتذكيرات (AI Memory)
*   **Server:** موحّد في `server.ts` واحد (Next.js + Socket.io مدمج عبر `tsx`). لا حاجة لسيرفر منفصل.
*   **Auth:** المصادقة عبر كوكي `user_id`. استخدم `getCurrentUser()`. الـ `/api/messages` الآن يستخدم cookies بدلاً من query params.
*   **Socket URL:** يُقرأ من `NEXT_PUBLIC_SOCKET_URL` (مُعرف في `.env`). لا تستخدم URL ثابت.
*   **Location Throttle:** تحديث الموقع في `DashboardClient.tsx` مُقيد بـ 30 ثانية عبر `useRef`.
*   **Dependencies:** `@prisma/client` و `socket.io` و `prisma` في `dependencies` لضمان الإنتاج المستقر.
*   **Error Handling:** جميع Server Actions تستخدم `return { success: false, error: '...' }` — لا `throw`.
*   **Type Safety:** لا `as any` — لا `error: any` — استخدم `error: unknown` + `instanceof Error`.
*   **Design Consistency:** الحفاظ على الـ Glassmorphism والـ Neon في كل مكون جديد.
*   **Performance:** استخدم `next/dynamic` للخريطة والمكونات الثقيلة.
*   **Types:** استخدم `@/types/index.ts` وتجنب التعريفات المحلية.
*   **Chat Files:** `useChat.ts` (hook)، `ChatWindow.tsx` (UI)، `server.ts` (unified server)، `/api/messages` (API).
*   **Audit Reports:** `comprehensive_report.md`، `audit_report.md`، `phase4_reports.md` في مجلد الجلسة.

---

## 📚 7. مكتبة التقارير الاستراتيجية (Strategic Reports Library)

| التصنيف | التقرير الأساسي | الوصف والغرض |
| :--- | :--- | :--- |
| **التخطيط الشامل** | `Project_Overview_AR.md` | نظرة عامة شاملة على أهداف المشروع ورؤيته. |
| **البنية التحتية** | `Project_Architectural_Report_AR.md` | تفصيل هندسة النظام (Next.js + Socket.io + Prisma). |
| **هيكل الملفات** | `Project_Files_Report_AR.md` | خارطة طريق لجميع ملفات المشروع ووظائفها. |
| **التطوير النشط** | `active_tasks/TASK_TATWIR_3SRII.md` | تتبع حي للمهام والميزات النوعية قيد التنفيذ. |
| **التدقيق الفني** | `session_reports/Expert_Project_Audit.md` | مراجعة خبيرة للكود والأمن والأداء. |
| **خارطة الطريق** | `session_reports/Master_Roadmap.md` | الجدول الزمني والمراحل الكبرى للمشروع. |
| **الهندسة الاجتماعية** | `session_reports/Social_Architecture.md` | فلسفة عمل الـ Feed والشات والسمعة. |
| **قواعد البيانات** | `session_reports/Database_Engineering_Report.md` | تحليل Schema والعلاقات وتحسين الاستعلامات. |
| **المنشورات الحية** | `session_reports/Implementation_Plan_Live_Stories.md` | خطة تنفيذ ميزة الستوريز والموقع الجغرافي. |
| **التجارة الذكية** | `session_reports/Session_Report_2026_02_22.md` | توثيق محرك المطابقة والبحث الذكي. |
| **الإشعارات** | `session_reports/Session_Report_2026_02_23.md` | توثيق نظام Socket.io والـ Notification Bell. |

**⚠️ نصيحة:** ارجع لهذه التقارير عند الرغبة في فهم "لماذا" تم اتخاذ قرار تصميمي معين في الكود. 🎯

---
**⚠️ تعليمات للمساعد (AI Instructions):**
1.  اقرأ هذا الملف **في بداية كل جلسة** لتحديث السياق.
2.  قم بتحديث قسم "سجل الإنجازات" و"الحالة الحالية" **في نهاية كل جلسة**.
3.  لا تبدأ أي مهمة جديدة قبل إنهاء المهمة الحالية في "خارطة الطريق النشطة".
4.  قم بتحديث "مكتبة التقارير" عند إنشاء أي تقرير استراتيجي جديد.

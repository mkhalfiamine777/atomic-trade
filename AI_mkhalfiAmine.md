# 🧠 AI Context File: Project mkhalfiamine777 (Social Commerce)
> **🚨 AI PROTOCOL (آلية الحساسية):**
> 1.  **START (الافتتاح):** يجب قراءة هذا الملف فوراً عند بداية الجلسة. انسخ "الحالة الحالية" و"خارطة الطريق النشطة" إلى ذاكرتك.
> 2.  **END (الاختتام):** يجب تحديث هذا الملف قبل إغلاق الجلسة. سجل "الإنجازات" الجديدة وحدث "الحالة".
> 3.  **GOAL:** لا تشتت. التزم بالمسار.

**Last Updated:** 2026-02-13 20:33

**Status:** Session Closed (Phase 4 Complete — Decomposition + Server + Enums) ✅

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
**نحن الآن في:** بعد **المرحلة 4 البنيوية** — تفكيك المكونات + توحيد Server + Prisma Enums.
*   ✅ **تم إنجاز:** الخريطة الحية، الدردشة، نظام الثقة، تدقيق شامل، + المرحلة 4 كاملة.
*   🚧 **المرحلة القادمة:** القصص الحية (Live Stories) — قصص متحركة على الخريطة.
*   ⏳ **مستقبلي:** لعبة السيطرة (Zone Master)، خوارزمية السمعة المتقدمة.

---

## 📜 3. سجل الإنجازات (Achievement Log)

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

### **أ. المرحلة الحالية: الخريطة والبيانات (Geo-Data Foundation) - ✅ Completed**
1.  [x] **DB Schema Check:** التأكد من دعم `lat`, `lng` في `SocialPost` و `Listing`.
2.  [x] **Backend Action:** تحديث `createPost` و `createListing` لاستقبال وحفظ الإحداثيات.
3.  [x] **Frontend (Creation):** تحديث مودالات الإنشاء (`CreateRequestModal`, `AddProductModal`) لإرسال الموقع الحالي.
4.  [x] **Frontend (Map):** تحديث `Map.tsx` لعرض العلامات (Markers) للمنشورات والمنتجات الجديدة.

### **ب. المرحلة المكتملة: المحرك الاجتماعي (Social Engine) - ✅ Completed**
1.  [x] **Socket Server:** فصل السيرفر إلى `socket-server.ts` مستقل (المنفذ 3001).
2.  [x] **Chat:** تفعيل المحادثات المباشرة (Real-time عبر Socket.IO).
3.  [x] **Trust Score:** إنشاء `TrustBadge` (3 مستويات: ذهبي/فضي/برونزي) ودمجه في الملف الشخصي والخريطة.

### **ج. المرحلة المكتملة: التحسينات البنيوية (Structural) - ✅ Completed**
1.  [x] **Component Decomposition:** تفكيك 5 مكونات كبيرة.
2.  [x] **Server Unification:** توحيد `server.ts` (Railway + Socket.io مدمج).
3.  [x] **Prisma Enums:** 6 enums + migration + type safety.

### **د. المرحلة التالية: القصص الحية (Live Stories)**
1.  [x] **Location Tracking:** تحديث موقع المستخدم تلقائياً — ✅ مع throttle 30 ثانية.
2.  [ ] **Live Stories:** جعل قصص الأفراد تتحرك مع موقعهم، وبقاء قصص المتاجر ثابتة.

### **هـ. المرحلة المستقبلية: الاقتصاد واللعب (Economy)**
1.  [ ] **Advanced Trust Algorithm:** خوارزمية سمعة متقدمة.
2.  [ ] **Zone Layout:** تقسيم الخريطة إلى مربعات (Grids) — لعبة السيطرة.

---

## 🏗️ 5. البنية التحتية (Infrastructure Context)
*   **Development:**
    *   **OS:** Windows Localhost.
    *   **Server:** `npx next dev` (Next.js) + `npm run dev:socket` (Standalone Socket Server).
    *   **DB:** Docker (PostgreSQL).
*   **Production:**
    *   **Platform:** **Railway**.
    *   **Scaling:** Single service or Microservices (TBD for Socket.io).

---

## 💡 6. ملاحظات وتذكيرات (AI Memory)
*   **Server:** موحّد في `server.ts` واحد (Next.js + Socket.io مدمج عبر `tsx`). لا حاجة لسيرفر منفصل.
*   **Auth:** المصادقة عبر كوكي `user_id`. استخدم `getCurrentUser()`. الـ `/api/messages` الآن يستخدم cookies بدلاً من query params.
*   **Socket URL:** يُقرأ من `NEXT_PUBLIC_SOCKET_URL` (مُعرف في `.env`). لا تستخدم URL ثابت.
*   **Location Throttle:** تحديث الموقع في `DashboardClient.tsx` مُقيد بـ 30 ثانية عبر `useRef`.
*   **Dependencies:** `@prisma/client` و `socket.io` في `dependencies` (ليس devDependencies).
*   **Error Handling:** جميع Server Actions تستخدم `return { success: false, error: '...' }` — لا `throw`.
*   **Type Safety:** لا `as any` — لا `error: any` — استخدم `error: unknown` + `instanceof Error`.
*   **Design Consistency:** الحفاظ على الـ Glassmorphism والـ Neon في كل مكون جديد.
*   **Performance:** استخدم `next/dynamic` للخريطة والمكونات الثقيلة.
*   **Types:** استخدم `@/types/index.ts` وتجنب التعريفات المحلية.
*   **Chat Files:** `useChat.ts` (hook)، `ChatWindow.tsx` (UI)، `socket-server.ts` (server)، `/api/messages` (API).
*   **Audit Reports:** `audit_report.md`، `phase4_reports.md` في مجلد الجلسة.

---
**⚠️ تعليمات للمساعد (AI Instructions):**
1.  اقرأ هذا الملف **في بداية كل جلسة** لتحديث السياق.
2.  قم بتحديث قسم "سجل الإنجازات" و"الحالة الحالية" **في نهاية كل جلسة**.
3.  لا تبدأ أي مهمة جديدة قبل إنهاء المهمة الحالية في "خارطة الطريق النشطة".

# 📝 تقرير المراجعة الشاملة للأكواد — الجلسة 26
**التاريخ:** 20-03-2026  
**النطاق:** 15+ ملف رئيسي عبر جميع الطبقات (Actions, Server, Middleware, Services, Components)

---

## 🔍 نظرة عامة
| المحور | الحالة | المشاكل |
|--------|--------|---------|
| 1. الأسلوب والتنظيم | 🟢 جيد جداً | 1 ملاحظة |
| 2. الأداء | 🟠 يحتاج تحسين | 3 مشاكل |
| 3. الأمان | 🟢 قوي | 2 ملاحظتان |
| 4. القابلية للصيانة | 🟢 جيد | 2 ملاحظتان |
| 5. الاختبارات | 🔴 غائب | 1 مشكلة حرجة |
| 6. التوثيق | 🔴 غائب | 3 مشاكل |

**الإجمالي: 12 ملاحظة** (4 🔴 حرجة، 5 🟠 متوسطة، 3 🟡 منخفضة)

---

## ✅ 1. الأسلوب والتنظيم

### ✅ نقاط القوة
- ✅ أسماء الدوال والملفات **واضحة ومعبرة** (`toggleLike`, `interactWithListing`, `purchaseZone`)
- ✅ هيكل المجلدات **منطقي ومنظم** (`actions/`, `services/`, `components/`, `hooks/`, `lib/`)
- ✅ فصل واضح بين Server Actions والأعمال الخلفية (Services)
- ✅ استخدام Prisma Enums (`UserType`, `MediaType`, `ListingType`) بدلاً من السلاسل النصية

### 🟡 S-1: `as any` متبقٍ واحد
**الملف:** `useMediaUpload.ts:28`
```typescript
const { startUpload: uploadThingStart } = useUploadThing(endpoint as any, {
```
**الأثر:** منخفض (مكتبة خارجية)  
**الحل:** استخدام Generic type أو `// @ts-expect-error` مع تعليق

---

## ⚡ 2. الأداء

### 🟠 P-1: `getListings()` بدون تصفح (Pagination)
**الملف:** `market.ts:86`
```typescript
const listings = await db.listing.findMany({
    orderBy: { createdAt: 'desc' },
    include: { seller: { select: {...} } }
})
```
**الخطر:** يجلب **جميع** المنتجات دفعة واحدة مع نمو قاعدة البيانات.  
**الحل:** إضافة `take: 50` + cursor-based pagination مثل `getComments`.

### 🟠 P-2: `getMapPosts()` يُحمّل 50 منشوراً بدون فلتر جغرافي
**الملف:** `social.ts:60`  
**الحل:** إضافة فلتر جغرافي (viewport bounds) لتقليل الحمل.

### 🟡 P-3: `addComment` يحفظ `content` الخام بدلاً من `trimmedContent`
**الملف:** `interactions.ts:109`
```typescript
const trimmedContent = content.trim()  // ← يتم التقليم والتحقق
// ...
data: { content: content }  // ← لكن يُحفظ الأصلي!
```
**الحل:** استبدال `content` بـ `trimmedContent` في سطر 109.

---

## 🛡️ 3. الأمان

### ✅ نقاط القوة
- ✅ **المصادقة:** جميع Server Actions تستخدم `cookies()` — لا تثق بـ FormData/params
- ✅ **التحقق من المدخلات:** Zod schemas لـ login/signup/createListing
- ✅ **كلمات المرور:** bcryptjs مع 10-12 rounds
- ✅ **Race Condition:** `$transaction` في الخصومات الجماعية والعملات
- ✅ **CORS:** ديناميكي حسب البيئة
- ✅ **CSP:** شامل بدون `unsafe-eval`
- ✅ **Socket.io:** فحص عضوية الغرفة قبل الإرسال
- ✅ **URL Whitelist:** للصور الشخصية
- ✅ **Rate Limiting:** Upstash Redis جاهز

### 🟠 SEC-1: `purchaseZone` — سباق بيانات (TOCTOU)
**الملف:** `zones.ts:17-50`
```typescript
const existingZone = await db.zoneMaster.findUnique(...)  // CHECK
// ... gap ...
const [newZone] = await db.$transaction([               // ACT
    db.zoneMaster.create(...)
])
```
**الخطر:** مستخدمان يتحققان في نفس اللحظة → كلاهما يشتري نفس المنطقة.  
**الحل:** نقل `findUnique` داخل `$transaction` (interactive transaction مثل `interactWithListing`).

### 🟡 SEC-2: `middleware.ts` — تعارض في matcher
**الملف:** `middleware.ts:85`  
الـ `matcher` يستبعد `/api/*` لكن الكود بداخل الميدلوير يتحقق من `pathname.startsWith('/api/')` لتطبيق Rate Limiting.  
**الأثر:** Rate Limiting لن يُطبّق أبداً على API routes لأن الميدلوير لا يُنفَّذ عليها.  
**الحل:** إضافة `/api/:path*` إلى الـ matcher أو نقل Rate Limiting إلى route handler.

---

## 🔧 4. القابلية للصيانة

### ✅ نقاط القوة
- ✅ المكونات **مفككة بشكل ممتاز** (ProfileTabs → MediaGrid, ListingsGrid, EmptyState)
- ✅ **ModalWrapper** موحد لجميع المودالات
- ✅ **adminGuard.ts** مشترك — مبدأ DRY
- ✅ **useGeolocation** hook موحد
- ✅ **Error handling:** نمط موحد `return { success, error }` — لا `throw`

### 🟠 M-1: `feedService.ts` — تعليقات الأنواع المكررة
**الملف:** `feedService.ts:117-119`
```typescript
post.interactions.filter((i: { type: string }) => ...)
```
يتكرر هذا النمط 6 مرات. يمكن استخراجه لدالة مساعدة:
```typescript
const countByType = (interactions: {type: string}[], type: string) => 
    interactions.filter(i => i.type === type).length
```

### 🟡 M-2: `social.ts:createPost` — استعلام إضافي للـ username
**الملف:** `social.ts:46`  
بعد إنشاء المنشور، يُرسل استعلام ثانٍ لجلب `username` فقط من أجل `revalidatePath`.  
**الحل:** إضافة `include: { user: { select: { username: true } } }` للاستعلام الأول.

---

## 🧪 5. الاختبارات

### 🔴 TEST-1: لا توجد اختبارات وحدات أو تكامل
**الحالة:** لا يوجد أي ملف `*.test.ts` أو `*.spec.ts` في المشروع.  
**الأولوية:** حرجة — النظام يعتمد فقط على `npm run build` و `tsc --noEmit` للتحقق.  
**التوصية:**
1. إضافة `vitest` لاختبارات Server Actions الحرجة (`auth.ts`, `earnCoins.ts`, `purchaseZone`)
2. اختبار السيناريوهات الأمنية (Rate Condition, Auth bypass)

---

## 📚 6. التوثيق

### 🔴 DOC-1: لا يوجد README للمشروع
**الحالة:** الملف الموجود هو README افتراضي من Next.js (`web/README.md`).  
**التوصية:** إنشاء `README.md` رئيسي يشرح: الرؤية، كيفية التشغيل، المتطلبات، هيكل الملفات.

### 🔴 DOC-2: واجهات API غير موثقة
**الحالة:** لا يوجد توثيق لـ `/api/messages`, `/api/uploadthing`, `/api/categories`.  
**التوصية:** إضافة ملف `API_DOCS.md` أو تعليقات JSDoc.

### 🟠 DOC-3: Server Actions بدون JSDoc
**الحالة:** معظم Server Actions لا تحتوي تعليقات JSDoc (باستثناء `earnCoins.ts`).  
**التوصية:** إضافة `@param` و `@returns` للدوال العامة.

---

## 📊 ملخص الأولويات

| الأولوية | المعرّف | الوصف | الجهد |
|----------|---------|-------|-------|
| 🔴 | SEC-1 | TOCTOU في `purchaseZone` | 15 دقيقة |
| 🔴 | TEST-1 | إضافة اختبارات أساسية | 2-4 ساعات |
| 🔴 | DOC-1 | إنشاء README | 30 دقيقة |
| 🔴 | DOC-2 | توثيق APIs | 1 ساعة |
| 🟠 | P-1 | Pagination لـ `getListings` | 15 دقيقة |
| 🟠 | SEC-2 | تعارض matcher الميدلوير | 10 دقائق |
| 🟠 | P-2 | فلتر جغرافي لـ `getMapPosts` | 30 دقيقة |
| 🟠 | M-1 | استخراج دالة مساعدة للتفاعلات | 10 دقائق |
| 🟠 | DOC-3 | إضافة JSDoc | 1 ساعة |
| 🟡 | P-3 | إصلاح `trimmedContent` | 2 دقائق |
| 🟡 | S-1 | إزالة `as any` الأخير | 5 دقائق |
| 🟡 | M-2 | دمج استعلام username في createPost | 5 دقائق |

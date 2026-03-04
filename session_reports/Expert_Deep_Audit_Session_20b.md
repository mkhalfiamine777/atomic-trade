# 🔬 تقرير المراجعة العميقة للمشروع — Expert Deep Audit
**التاريخ:** 04-03-2026 | **المراجع:** AI Expert Engineer
**النطاق:** 25+ ملف مصدري عبر جميع الطبقات (Actions, Services, Types, Components, App Pages, Lib, Middleware)

---

## 🔴 1. أخطاء منطقية في الكود (Logic Errors)

### 🔴 L-1: `trustService.ts` — دالة التقييم تتوقف على Neutral بدون إرجاع `newScore`
**الملف:** `services/trustService.ts:56`
```typescript
if (scoreAdjustment === 0) return { success: true, message: 'Neutral rating recorded' }
// ⛔ المشكلة: لا يُرجع `newScore` — الكلاينت يتوقعه!
```
**التأثير:** `trust.ts:20` يقرأ `result.newScore` → يُرجع `undefined` للمستخدم.
**الإصلاح:** إرجاع `newScore: targetUser.reputationScore` قبل الخروج المبكر.

---

### 🔴 L-2: `zones.ts` — شراء المنطقة بدون خصم من الرصيد
**الملف:** `actions/zones.ts:25-41`
```typescript
// 2. Check User Balance (Mocked for Demo - We assume he is rich)
// ⛔ التعليق يقول "Mocked" لكن لا يوجد أي فحص حقيقي!
// 4. Update User stats (Mock)
// await db.user.update(...)  ← مُعلَّق!
```
**التأثير:** أي مستخدم يمكنه السيطرة على مناطق غير محدودة بدون رصيد — كسر اقتصاد اللعبة.
**الإصلاح:** تفعيل فحص `walletBalance` والخصم فعلياً أو على الأقل خصم `coins`.

---

### 🟠 L-3: `earnCoins.ts:44` — مكافأة عشوائية بدون حد يومي
**الملف:** `actions/earnCoins.ts:44`
```typescript
const coinsEarned = Math.floor(Math.random() * 11) + 5 // 5-15 عملة عشوائية
```
**التأثير:** لا يوجد حد يومي (daily cap) → Bot يمكنه مشاهدة 1000 فيديو = **5,000-15,000** عملة/يوم.
**الإصلاح:** إضافة `dailyCoinsCap` (مثلاً 100 عملة/يوم) + فحص `COUNT` اليومي.

---

### 🟠 L-4: `updateUserLocation` — نقل جميع المنتجات بدون تأكيد
**الملف:** `actions/user.ts:26-43`
```typescript
if (user.type === 'INDIVIDUAL') {
    await db.listing.updateMany(...) // ينقل جميع المنتجات
    await db.mapStory.updateMany(...) // ينقل جميع القصص
}
```
**التأثير:** عند تحديث الموقع تلقائياً (GPS)، يتحرك كل شيء — المستخدم ربما يبيع منتجاً في مكان ثابت.
**الإصلاح:** إضافة `pinned: Boolean` لنموذج Listing — المنتجات المثبتة لا تنتقل.

---

## 🟡 2. تعارضات الأنواع (Type Conflicts)

### 🔴 T-1: `UserProfile.type` لا يتضمن `COMPANY`
**الملف:** `types/index.ts:14`
```typescript
type: 'INDIVIDUAL' | 'SHOP' | null  // ⛔ ينقصها 'COMPANY'
```
**التأثير:** بعد إضافة `COMPANY` للـ Schema في الجلسة 20، الأنواع المحلية أصبحت غير متزامنة.
**المتأثرون:** `UserProfile`, `LocationUser` — جميع المكونات التي تستخدمها.

---

### 🟠 T-2: `PostWithRelations` و`StoryWithUser` مُعرَّفان في مكانين
**الملفان:** `actions/feed.ts:41-53` + `services/feedService.ts:6-17`
**التأثير:** نسختان متطابقتان — أي تعديل مستقبلي على واحدة يُنسى في الأخرى.
**الإصلاح:** تعريفهما في `feed.ts` فقط وتصديرهما.

---

### 🟠 T-3: `FeedItemDTO` لا تشمل `LISTING` في `type`
**الملف:** `actions/feed.ts:9`
```typescript
type: 'VIDEO' | 'IMAGE' | 'STORY' | 'LISTING'
```
لكن `feedService.ts:167` يُعيِّن `type: 'IMAGE'` للـ Listings بدلاً من `'LISTING'`:
```typescript
type: 'IMAGE' as 'VIDEO' | 'IMAGE', // ⛔ خطأ: يجب أن يكون 'LISTING'
```
**التأثير:** الـ Feed يعامل كروت المنتجات كصور عادية — قد يُخفي أزرار السعر.

---

## 🛡️ 3. فجوات أمنية (Security Gaps)

### 🔴 S-1: `trust.ts` — لا يتحقق أن المعاملة حدثت فعلاً
**الملف:** `actions/trust.ts:6-19`
```typescript
export async function submitReview(targetUserId, listingId, rating, comment) {
    // ⛔ لا يتحقق أن userId اشترى فعلاً من targetUserId عبر listingId!
}
```
**التأثير:** أي مستخدم يمكنه تقييم أي شخص بـ 1 نجمة → **قصف السمعة** (-15 نقطة لكل تقييم).
**الإصلاح:** فحص `Conversation` أو `isSold` + `sellerId` لإثبات المعاملة.

---

### 🟠 S-2: `createListingSchema` — `latitude`/`longitude` اختياريان
**الملف:** `lib/schemas.ts:26-27`
```typescript
latitude: z.coerce.number().nullish(),
longitude: z.coerce.number().nullish(),
```
**التأثير:** منتج بدون إحداثيات = **لا يظهر على الخريطة** — يتناقض مع رؤية المشروع.
**الإصلاح:** جعلهما إجباريين: `z.coerce.number()` بدون `.nullish()`.

---

### 🟠 S-3: `auth.ts:35` — `bcrypt.compare` مع كلمة فارغة
```typescript
const isMatch = await bcrypt.compare(password, user?.password || '')
```
**التأثير:** إذا `user = null`، يقارن مع `''` → يرجع `false` (سليم أمنياً). لكن يُجري عملية bcrypt فارغة بشكل غير ضروري ويُسرب أن المستخدم غير موجود (timing attack بسيط).
**الإصلاح:** `if (!user) return { error: '...' }` قبل `bcrypt.compare`.

---

## 🔗 4. فجوات التكامل (Missing Integrations)

### 🔴 I-1: `matchingService.ts` — يستورد `socketEngine` غير موجود
**الملف:** `services/matchingService.ts:34`
```typescript
const { getIO } = await import('@/lib/socketEngine')
```
**التأثير:** إذا لم يكن `socketEngine.ts` موجوداً → خطأ runtime صامت (يُلتقط بـ catch).
**الإصلاح:** التحقق من وجود الملف أو إنشاء stub يُرجع `null`.

---

### 🟠 I-2: `matchingService` لا يُستدعى من `createListing`
**الملف:** `actions/market.ts` (createListing)
```typescript
// ⛔ لا يوجد أي استدعاء لـ runMatchingEngine بعد إنشاء Listing!
```
**التأثير:** محرك المطابقة (المنتج/الطلب) معطَّل فعلياً — لن يتم إشعار أي بائع/مشتري.
**الإصلاح:** إضافة `runMatchingEngine(...)` بعد إنشاء الـ Listing بنجاح.

---

### 🟠 I-3: `getProfileContent` لا يعرض Stories
**الملف:** `actions/getProfileContent.ts:5`
```typescript
export type ContentType = 'VIDEOS' | 'IMAGES' | 'SALES' | 'REQUESTS'
// ⛔ لا يوجد 'STORIES' — رغم أن ProfileTabs تعرضها
```
**التأثير:** تبويب الـ Stories في الملف الشخصي يُحمَّل من مكان آخر أو لا يعمل أصلاً.

---

## 🔄 5. التكرارات وعدم الاتساق (Duplications & Inconsistencies)

### 🟠 D-1: `getUser` ما زال موجوداً في `auth.ts` بعد التوحيد
**الملف:** `actions/auth.ts:124` — الدالة لم تُحذف رغم نقل Admin لاستخدام `getCurrentUser`.
**التأثير:** كود ميت قابل للاستدعاء — مربك لأي مطور.

---

### 🟠 D-2: 3 أماكن مختلفة تجلب بيانات المستخدم
| الملف | الدالة | الحقول |
|-------|--------|--------|
| `auth.ts` | `getUser()` | id, name, phone, type, isVerified, reputationScore |
| `getCurrentUser.ts` | `getCurrentUser()` | id, name, username, avatarUrl, type, isVerified, reputationScore, bio, shopCategory |
| `dashboard/page.tsx` | inline query | type, name |
| `u/[username]/page.tsx` | inline query | id, name, username, type, avatarUrl, bio, shopCategory, isVerified, reputationScore, createdAt, stories |

**التأثير:** 4 أشكال مختلفة لجلب نفس البيانات — مستحيل الصيانة.
**الإصلاح:** `getCurrentUser(fields?: string[])` مع قائمة حقول ديناميكية.

---

### 🟡 D-3: `Prisma.?GetPayload` يتكرر في كل ملف
**الملفان:** `feed.ts` + `feedService.ts` — نفس تعريفات `PostWithRelations`, `StoryWithUser`, `ListingWithSeller`.
**الإصلاح:** تجميعها في `types/prisma.types.ts`.

---

## 📐 6. مشاكل سلامة البيانات (Data Integrity)

### 🔴 DI-1: Crowd Price Drop يُطبق مرة واحدة فقط
**الملف:** `actions/interactions.ts:190-197`
```typescript
await db.listing.update({
    data: {
        price: newPrice,
        crowdTarget: null,   // ← يمسح الهدف!
        crowdDiscount: null  // ← يمسح الخصم!
    }
})
```
**التأثير:** بعد التطبيق، لا يمكن معرفة أن هذا المنتج كان له تخفيض جماعي — لا يُحفظ في سجل.
**الإصلاح:** إضافة `originalPrice Float?` أو `priceDropAppliedAt DateTime?` للنموذج.

---

### 🟠 DI-2: حذف Interaction عند إعادة الضغط يكسر عدّاد Like
**الملف:** `actions/interactions.ts:163-165`
```typescript
if (existing) {
    await db.interaction.delete(...)  // يحذف Like
    return { action: 'removed' }     // ⛔ لا يتحقق: هل crowdTarget وصل سابقاً؟
}
```
**التأثير:** المستخدم يُعجب (like count = 100 = target!) → السعر ينخفض → المستخدم يزيل الإعجاب → like count = 99 لكن السعر ظل منخفضاً. **غير عكوس**.

---

## ⚡ 7. ملاحظات على الأداء والبنية

### 🟡 P-1: `u/[username]/page.tsx` — 5 استعلامات متوازية لكن `stories: true` يجلب كل الحقول
```typescript
select: { ..., stories: true }  // ⛔ يجلب جميع حقول Story بما فيها mediaUrl الكبير
```
**الإصلاح:** `stories: { select: { id: true }, take: 1 }` فقط لمعرفة وجود قصة.

---

### 🟡 P-2: `feed.ts` يستورد `feedService` ديناميكياً
```typescript
const { getMixedFeedLogic } = await import('@/services/feedService')
```
**التأثير:** `dynamic import` في كل طلب feed = تعطيل tree-shaking + overhead.
**الإصلاح:** استيراد ثابت `import { getMixedFeedLogic } from '@/services/feedService'`.

---

## 📊 ملخص التقرير

| الفئة | حرجة 🔴 | متوسطة 🟠 | منخفضة 🟡 | المجموع |
|-------|---------|-----------|-----------|---------|
| أخطاء منطقية | 2 | 2 | 0 | **4** |
| تعارض أنواع | 1 | 2 | 0 | **3** |
| فجوات أمنية | 1 | 2 | 0 | **3** |
| تكامل مفقود | 1 | 2 | 0 | **3** |
| تكرارات | 0 | 2 | 1 | **3** |
| سلامة البيانات | 1 | 1 | 0 | **2** |
| أداء وبنية | 0 | 0 | 2 | **2** |
| **المجموع** | **6** | **11** | **3** | **20** |

---

## 🎯 خطة الإصلاح المقترحة (الأولوية)

### المرحلة 1 — فورية (الجلسة 21)
1. **S-1:** إضافة فحص المعاملة في `submitReview`
2. **L-1:** إصلاح return shape في `trustService`
3. **T-1:** إضافة `COMPANY` لـ `UserProfile` و`LocationUser` في `types/index.ts`
4. **L-2:** تفعيل خصم الرصيد في `purchaseZone`
5. **I-2:** ربط `matchingService` بـ `createListing`
6. **DI-1:** حفظ السعر الأصلي قبل Crowd Price Drop

### المرحلة 2 — قريبة
7. **L-3:** إضافة حد يومي لـ Watch-to-Earn
8. **S-2:** جعل lat/lng إجبارية في `createListingSchema`
9. **T-2/D-3:** توحيد Prisma types في ملف مركزي
10. **D-1/D-2:** حذف `getUser` وتوحيد كل queries المستخدم

### المرحلة 3 — تحسينات
11. البقية: P-1, P-2, I-3, T-3, L-4, S-3

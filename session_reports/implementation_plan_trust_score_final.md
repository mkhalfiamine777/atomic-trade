# 🛡️ خطة تنفيذ نهائية: نقاط الثقة الاجتماعية (Social Trust Score Final)

## 🎯 الهدف
إظهار "موثوقية" البائع أو المستخدم على الخريطة لتعزيز الأمان والشفافية.

## ⚙️ التعديلات الخلفية (Server Actions)
يجب تحديث دوال جلب البيانات لتشمل حقول الثقة (`reputationScore`, `isVerified`).

### 1. ملف `src/actions/stories.ts`
*   تحديث دالة `getStories`:
    *   إضافة `reputationScore: true`
    *   إضافة `isVerified: true`
    *   إلى جملة `include: { user: { select: ... } }`.

### 2. ملف `src/actions/market.ts`
*   تحديث دالة `getListings`:
    *   إضافة `reputationScore: true`
    *   إضافة `isVerified: true`
    *   إلى جملة `include: { seller: { select: ... } }`.

## 📍 التعديلات المرئية (Frontend) - `Map.tsx`

### 1. تحديث واجهات الأنواع (`Interfaces`)
*   `Listing` & `Story`: إضافة الحقول الجديدة لتعريف النوع.

### 2. تعديل أيقونات الخريطة (`getStoryIcon` & `renderMarker`)
*   **المنطق:**
    *   إذا كان `reputationScore >= 80` أو `isVerified === true` -> 🛡️ **موثوق (Golden Shield)**.
    *   خلاف ذلك -> عرض الأيقونة العادية.
*   **التنفيذ:**
    *   سنستخدم `L.DivIcon` لاحتواء الأيقونة الأصلية + "شارة" صغيرة مطلقة (`absolute`) في الزاوية.

### 3. النافذة المنبثقة (`Popup`)
*   عرض شارة "✅ بائع موثوق" بجانب الاسم إذا انطبقت الشروط.

## ✅ التحقق (Verification)
1.  تعديل درجة مستخدم يدوياً في قاعدة البيانات (`db_push` أو تعديل وهمي) لتصبح 90.
2.  تحديث الخريطة ورؤية "الدرع الذهبي" يظهر على قصصه ومنتجاته.

جاهزون للتنفيذ الفوري. 🚀

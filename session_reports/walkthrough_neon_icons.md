# 🚶‍♂️ جولة في التحديثات - أيقونات النيون

## 🎨 التغيير الأساسي: أيقونات الأفراد (Individual Icons)

تم تحويل أيقونة "الأفراد" من دبوس تقليدي إلى **قرص نيون أزرق مشع** ليعكس حيوية الخريطة.

### 🎥 ما تم تنفيذه

| النوع | الحالة | الشكل | الوصف |
|-------|--------|-------|-------|
| **👤 الفرد** | 🟢 متصل | ![Online Individual](https://placehold.co/24x24/3b82f6/ffffff?text=👤) | قرص **أزرق** مشع + نبض |
| **👤 الفرد** | ⚪ غير متصل | ![Offline Individual](https://placehold.co/24x24/94a3b8/ffffff?text=👤) | قرص رمادي باهت + ثابت |
| **🏪 المتجر** | 🟡 متصل | ![Online Shop](https://placehold.co/24x24/f59e0b/ffffff?text=🏪) | قرص **ذهبي** مشع + نبض |
| **🏪 المتجر** | ⚪ غير متصل | ![Offline Shop](https://placehold.co/24x24/fde68a/ffffff?text=🏪) | قرص ذهبي باهت + ثابت |
| **🏢 الشركة** | 🟣 متصل | ![Online Company](https://placehold.co/24x24/a78bfa/ffffff?text=🏢) | قرص **بنفسجي** مشع + نبض |
| **🏢 الشركة** | ⚪ غير متصل | ![Offline Company](https://placehold.co/24x24/ddd6fe/ffffff?text=🏢) | قرص بنفسجي باهت + ثابت |
| **📣 طلب** | 🔴 نشط | ![Request](https://placehold.co/24x24/ef4444/ffffff?text=📣) | قرص **أحمر** بنبض سريع (Urgent) |
| **📸 قصة** | 🩷 جديد | ![Story](https://placehold.co/24x24/ec4899/ffffff?text=📸) | قرص **وردي** مع توهج (Glow) |

### 🛠️ الكود المضاف

#### 1. CSS Animation (`globals.css`)
```css
@keyframes neon-pulse {
  0% { box-shadow: ...; transform: scale(0.95); }
  70% { box-shadow: ...; transform: scale(1); }
  100% { box-shadow: ...; transform: scale(0.95); }
}
```

#### 2. Logic (`mapIcons.ts`)
```typescript
export const getIndividualIcon = (hasStories, isOnline = true) => {
    if (isOnline) return NeonBlueIcon; // ⚡
    return FadedGrayIcon; // 💤
}
```

> **ملاحظة:** حالياً، الحالة الافتراضية هي `isOnline = true` لكي يظهر التأثير فوراً للمستخدمين. سيتم ربطها بحالة socket الحقيقية في مرحلة قادمة.

# 🚶‍♂️ جولة في التحديثات - أيقونات النيون

## 🎨 التغيير الأساسي: أيقونات الأفراد (Individual Icons)

تم تحويل أيقونة "الأفراد" من دبوس تقليدي إلى **قرص نيون أزرق مشع** ليعكس حيوية الخريطة.

### 🎥 ما تم تنفيذه

| الحالة | الشكل | الوصف |
|--------|-------|-------|
| **🟢 متصل (Online)** | ![Online](https://placehold.co/24x24/3b82f6/ffffff?text=👤) | قرص أزرق مشع + تأثير نبض (Pulse Animation) |
| **⚪ غير متصل (Offline)** | ![Offline](https://placehold.co/24x24/94a3b8/ffffff?text=👤) | قرص رمادي باهت + ثابت (دون حركة) |

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

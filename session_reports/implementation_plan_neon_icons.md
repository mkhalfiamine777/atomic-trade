# 🎨 خطة تحسين أيقونات الخريطة - المرحلة الأولى

## 🎯 الهدف
تحويل أيقونة **"فرد" (Individual)** على الخريطة من شكل دبوس تقليدي إلى **قرص دائري أزرق مشع (Neon Blue Disc)** ينبض بالحياة، للدلالة على النشاط والاتصال بالإنترنت.

## 📝 المواصفات المطلوبة
1.  **الشكل:** دائري (Disc).
2.  **اللون:** أزرق نيون (Electric Blue).
3.  **التأثير:** إشعاع (Glow) + نبض (Pulse Animation).
4.  **الحالة:** يظهر النبض فقط عندما يكون المستخدم "متصلاً" أو نشطاً.
5.  **النطاق:** التعديل يشمل **الخريطة فقط** (Leaflet Icons).

## 🛠️ التغييرات التقنية

### 1. تعديل `globals.css`
إضافة كود CSS للأنيميشن الجديد (Pulse Neon):

```css
@keyframes neon-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7), 0 0 20px rgba(59, 130, 246, 0.5); 
    transform: scale(0.95);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(59, 130, 246, 0), 0 0 40px rgba(59, 130, 246, 0);
    transform: scale(1);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0), 0 0 0 rgba(59, 130, 246, 0);
    transform: scale(0.95);
  }
}

.neon-active {
  animation: neon-pulse 2s infinite;
  background: radial-gradient(circle, #60a5fa 0%, #2563eb 100%);
  border: 2px solid #93c5fd;
}
```

### 2. تعديل `src/utils/mapIcons.ts`
تحديث دالة `getIndividualIcon` (بدلاً من Shop):

```typescript
export const getIndividualIcon = (hasStories: boolean, isOnline: boolean = true) => {
    // إذا كان متصلاً -> قرص نيون أزرق + نبض
    if (isOnline) {
        return L.divIcon({
            className: '',
            html: `<div class="w-6 h-6 rounded-full neon-active shadow-lg flex items-center justify-center text-white text-xs font-bold">👤</div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
            popupAnchor: [0, -12]
        })
    }
    
    // إذا لم يكن متصلاً -> شكل باهت (رمادي/أزرق فاتح) + بدون نبض
    return L.divIcon({
        className: '',
        html: `<div class="w-6 h-6 rounded-full bg-slate-400/80 shadow-sm flex items-center justify-center text-white text-xs font-bold border-2 border-slate-300">👤</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12]
    })
}
```

## ⚠️ ملاحظة
سنحتاج لتمرير حالة `isOnline` للأيقونة. حالياً سنفترض أنها `true` لإظهار التأثير الجديد فوراً، ثم نربطها بحالة الاتصال الحقيقية لاحقاً.

---
**هل نبدأ التنفيذ؟** 🚀

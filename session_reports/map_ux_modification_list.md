# 🏥 قائمة ملفات "الجراحة" (Map UX Surgery Checklist)

هذه القائمة تحدد الملفات التي سيتم تعديلها أو إنشاؤها لتطبيق ميزات "التصفية" و "التمدد الذكي".

## 🆕 ملفات جديدة (New Components)
1.  **`src/components/MapFilterBar.tsx`**
    *   **الوظيفة:** شريط شفاف يحتوي على أزرار (فيديو، صور، طلبات، منتجات).
    *   **الموقع:** مجلد المكونات.

2.  **`src/components/SmartMarkerGroup.tsx`**
    *   **الوظيفة:** مكون ذكي يجمع الأيقونات المتطابقة ويفككها عند التمرير (Spiderfy Logic).
    *   **الموقع:** مجلد المكونات.

## 🛠️ ملفات سيتم تعديلها (Modified Files)
3.  **`src/components/Map.tsx`**
    *   **التعديل:**
        *   استيراد `MapFilterBar` و `SmartMarkerGroup`.
        *   إضافة `useState` للفلاتر (`selectedFilters`).
        *   تطبيق منطق التصفية على مصفوفات `listings` و `stories`.
        *   استبدال الـ Markers العادية بـ `SmartMarkerGroup` في حالة التكدس.

## ⚠️ ملفات للمراجعة (Context Reference)
*   `src/app/dashboard/DashboardClient.tsx` (قد نحتاج تمرير بعض الخصائص، لكن التركيز سيكون داخل Map.tsx).

---
*احتفظ بهذا الملف للعودة إليه في حال حدوث أي خطأ أثناء الدمج.*

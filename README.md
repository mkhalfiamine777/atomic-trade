# Atomic Trade (التجارة الذرية) 🚀

منصة هجينة مبتكرة تجمع بين **التجارة الإلكترونية (Social Commerce)** و **التواصل الاجتماعي (Social Media)**، مصممة بطابع Gamification قوي (Zone Economy، استكشاف مبني على الإدمان المعرفي، وعملات ذهبية افتراضية).

## ✨ الميزات الرئيسية
- 🛒 **متجر اجتماعي متكامل**: نشر المنتجات، الطلبات، والبحث الديناميكي.
- 🗺️ **اقتصاد الخرائط (Zone Economy)**: سيطرة على المناطق، فرض ضرائب افتراضية، وعرض قصص مستندة إلى الموقع الجغرافي.
- 📱 **واجهة استكشاف (Explore Feed)**: دمج بين منشورات المستخدمين، المحتوى التجاري (Listings)، وميزات "Watch-To-Earn".
- 🛡️ **نظام ثقة (Trust Score)**: تقييمات موثوقة بناءً على المعاملات بين المستخدمين لمنع الاحتيال.
- ⚡ **أداء فائق**: بناء باستخدام Next.js App Router و Prisma و PostgreSQL.

## 🛠️ التقنيات المستخدمة
- **الواجهة الأمامية**: Next.js 15 (App Router), React 19, TailwindCSS, Framer Motion
- **الواجهة الخلفية**: Next.js Server Actions, Socket.io (للمحادثات المباشرة)
- **قاعدة البيانات**: PostgreSQL, Prisma ORM
- **التخزين**: Uploadthing (للصور والفيديوهات)
- **نظام الخرائط**: Leaflet + Geohash

## 🚀 كيفية التثبيت والتشغيل خطوة بخطوة

### 1. المتطلبات الأساسية
تأكد من تثبيت:
- Node.js (v18+)
- PostgreSQL (V15+)

### 2. إعداد قاعدة البيانات والملفات البيئية
1. انسخ ملف البيئة وأكمل المتغيرات:
   ```bash
   cp .env.example .env
   ```
2. تأكد من إعداد `DATABASE_URL` برابط قاعدة بيانات PostgreSQL الخاصة بك.
3. قم بتهيئة Prisma:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

### 3. تشغيل خادم التطوير
```bash
npm install
npm run dev
```
افتح المتصفح على [http://localhost:3000](http://localhost:3000)

## 📁 هيكل المشروع الرئيسي
- `/src/app` - صفحات ومسارات Next.js (App Router)
- `/src/actions` - Server Actions لجميع عمليات قاعدة البيانات والمصادقة
- `/src/components` - المكونات المشتركة (UI, Modals, Forms)
- `/src/services` - منطق الأعمال الثقيل (Feed Algorithm, Matching Engine)
- `/src/lib` - الإعدادات المشتركة (Prisma, Zod Schemas)
- `/server.ts` - خادم Node.js مخصص لدعم Socket.io بجانب Next.js

## 🛡️ الأمان
المشروع مزود بـ:
- **Rate Limiting** عبر Upstash Redis لحماية منافذ الـ API والمصادقة.
- **CSP (Content Security Policy)** شاملة للحماية من XSS.
- **المصادقة المبنية على الـ Cookies (httpOnly)** لتأمين الجلسات الحساسة.

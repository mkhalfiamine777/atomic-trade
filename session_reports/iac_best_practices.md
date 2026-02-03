# 📋 تقرير أفضل ممارسات النشر (Infrastructure as Code)
**التاريخ:** 03 فبراير 2026  
**الحالة:** 📚 للمراجعة والدراسة  
**ختم التقرير:** 03 فبراير 2026 - 21:19 GMT+1

---

## ما هو Infrastructure as Code (IaC)؟
هو نهج مهني يعتمد على كتابة إعدادات النشر والخوادم في **ملفات نصية** داخل الكود المصدري، بدلاً من إعدادها يدوياً عبر لوحات التحكم (Dashboards).

**ملفات IaC الشائعة:**
- `railway.json` أو `railway.toml` (Railway)
- `vercel.json` (Vercel)
- `Dockerfile` (Docker)
- `terraform.tf` (Terraform)
- `.github/workflows/*.yml` (GitHub Actions)

---

## لماذا IaC أفضل من الإعداد اليدوي؟

| الميزة | إعداد يدوي (Dashboard) | Infrastructure as Code |
|---|---|---|
| **التوثيق** | ❌ ضائع في الذاكرة | ✅ موثق في الكود |
| **التعاون** | ❌ شخص واحد يعرف | ✅ الفريق كله يرى التكوين |
| **التكرار** | ❌ إعادة يدوية لكل بيئة | ✅ نسخ ولصق |
| **التتبع** | ❌ لا سجل للتغييرات | ✅ Git History كامل |
| **التراجع** | ❌ صعب أو مستحيل | ✅ `git revert` فوري |
| **الأمان** | ⚠️ قد يُحذف بالخطأ | ✅ محمي بالـ Version Control |
| **الأتمتة** | ❌ تدخل بشري | ✅ CI/CD تلقائي |

---

## خطة التطبيق لمشروع Atomic Trade

### الخطوة 1: استخدام `railway.toml` (الصيغة الرسمية)
ملف `railway.toml` هو الصيغة المفضلة من Railway:
```toml
# web/railway.toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "npm start"
restartPolicyType = "ON_FAILURE"
```

### الخطوة 2: ضبط Root Directory في Dashboard (مرة واحدة)
1. اذهبي إلى Railway Dashboard → Settings
2. ابحثي عن **Root Directory**
3. اكتبي: `web`
4. احفظي

### الخطوة 3: التحقق
بعد الضبط، Railway سيقرأ `railway.toml` من داخل `web/` تلقائياً.

---

## الفوائد المستقبلية للمشروع

1. **إضافة مطورين جدد:** أي مطور ينضم للفريق سيفهم بنية النشر فوراً.
2. **بيئات متعددة:** يمكن إنشاء `railway-staging.toml` و `railway-production.toml`.
3. **الأتمتة الكاملة:** ربط GitHub Actions لنشر تلقائي عند كل commit.
4. **التوسع:** عند الانتقال لـ Kubernetes مستقبلاً، ستكون الثقافة جاهزة.

---

## الملفات ذات الصلة في المشروع
- `web/railway.json` - الملف الحالي (JSON)
- `web/package.json` - أوامر البناء والتشغيل
- `web/server.ts` - السيرفر المخصص

---

> **ملاحظة:** هذا التقرير للدراسة. عند العودة للتطبيق، راجعي الخطوات أعلاه.

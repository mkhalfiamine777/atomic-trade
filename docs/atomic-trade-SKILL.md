---
name: atomic-trade
description: |
  Specialized skill for the Atomic Trade (Social Commerce on a live map) codebase.
  Use whenever the user asks you to:
  - add or modify a Server Action in src/actions/
  - touch the Prisma schema, run a migration, or change DB models
  - work on the map / Leaflet / Supercluster / Zone Grid
  - add a real-time feature using Socket.io
  - add or update a feed/listing/post/story/interaction/zone/trust feature
  - audit the project (security, performance, integration, architecture)
  - apply the Anchor Rule, Orbital Spread, or any geolocation logic
  - write Vitest tests for actions/services
  - update CLAUDE.md / AI_mkhalfiAmine.md memory
  Triggers: "atomic trade", "social commerce", "anchor rule", "orbital spread", "zone master", "matching engine", "trust score", "crowd price drop", "watch-to-earn", "feedService", "matchingService", "server action", "socket.io" in this repo.
license: Proprietary to the Atomic Trade project (mkhalfiAmine).
---

# Atomic Trade — Project Skill

> **Invoke this Skill** before touching any code in the Atomic Trade project. It contains the rules that **must not be broken** and the templates to follow.

> **هذا الملف هو نسخة مرجعية من الـ Skill لمشروع Atomic Trade.** نسخة قابلة للتثبيت (atomic-trade.skill.zip) موجودة بجوار هذا الملف. يمكنك أيضاً نسخ هذا الملف يدوياً إلى مجلد Claude skills الخاص بك.

(للمحتوى الكامل، راجع `.claude/skills/atomic-trade/SKILL.md` بعد تثبيت الـ Skill، أو الملف `atomic-trade-SKILL-full.md` بجواره.)

## ملخص القواعد الذهبية

1. **Cardinal Location Rule** — كل نشاط له `latitude/longitude`.
2. **Anchor + Orbital Spread** — SHOP/COMPANY مثبّتان، الأنشطة تدور 15–35م.
3. **Server Actions only** للكتابة في DB.
4. **`{ success, error? }` shape** لكل return من action.
5. **`$transaction`** لكل كتابة مركّبة.
6. **Zod** لكل مدخل خارجي.
7. **cookie auth** فقط — لا تثق بـ body/FormData لـ userId.
8. **لا `db push` في الإنتاج** — `migrate deploy` فقط.
9. **Z-Index على الخريطة:** Shop=1000, Listing/Story=900, Individual=800.
10. **العربية RTL** لكل نص للمستخدم.

## كيفية التثبيت (محلياً)

ضع المجلد `atomic-trade-skill/` تحت:
- Windows: `%APPDATA%\Claude\skills\atomic-trade\`
- macOS: `~/Library/Application Support/Claude/skills/atomic-trade/`

ثم أعد تشغيل Claude. ستظهر `atomic-trade` ضمن `<available_skills>` في الجلسات المستقبلية.

## المحتوى الكامل

ملف `SKILL.md` الموسّع (12 قسماً) محفوظ في `outputs/atomic-trade-skill/SKILL.md` لاستخدامه عند نسخ المجلد.

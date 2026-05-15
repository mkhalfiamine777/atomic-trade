# 📋 Task Tracker — الجلسة 34: P0 Production Hardening

**Commits:** `ca39b3f` → `9e5f0b6` → `0e981bb` | **Branch:** `main` | **Date:** 2026-05-13

---

## ✅ P0-2: Sentry Configuration [مكتمل]
- [x] تثبيت `@sentry/nextjs`
- [x] configs: client + server + edge + instrumentation.ts
- [x] `next.config.mjs`: withSentryConfig + tunnelRoute + bundleSizeOptimizations ×5
- [x] CSP updates in server.ts + next.config.mjs
- [x] `lib/serverAction.ts` (withSentry wrapper)
- [x] `.env.example` template

## ✅ P0-2: Error Boundaries [مكتمل]
- [x] global-error.tsx + dashboard/error.tsx + explore/error.tsx + u/[username]/error.tsx

## ✅ P0-2: Actions Sweep — 38 captureException [مكتمل]
- [x] 18 action files × 38 catch blocks covered

## ✅ P0-2.1: Breadcrumb UUID Scrub [مكتمل]
- [x] `sentry.server.config.ts` — `beforeBreadcrumb` (sibling to `beforeSend`)
- [x] `sentry.client.config.ts` — `beforeBreadcrumb` (matching)
- [x] Commit: `9e5f0b6`

## ✅ P0-2: Test Endpoint Cleanup [مكتمل]
- [x] `/api/sentry-test` محذوف
- [x] Commit: `0e981bb`

## ✅ P0-5: Cache Memory Fix [مكتمل]
- [x] feedService.ts + feed.ts — user-independent cache

## ✅ P0-4: Socket Rate Limiting [مكتمل]
- [x] server.ts — 30 msg / 10s per userId

## ✅ إصلاحات إضافية [مكتمل]
- [x] geo.test.ts — 15-35m range
- [x] .gitignore — .env.example + compiled JS exclusion

## ✅ Verification [مكتمل]
- [x] `tsc --noEmit`: Exit 0
- [x] `vitest`: 28/28 green
- [x] `build`: Exit 0
- [x] Production: Sentry event received + source maps + cookie filter
- [x] Git push: `ca39b3f..0e981bb` on main

---

## ✅ إغلاق الجلسة 34 — مكتمل

- [x] Sentry Alert 1 (Notify Suggested Assignees) ← active
- [x] Sentry Alert 2 (Outbreak Detection — Issue Escalation) ← active
- [ ] Sentry Alert 3 (Critical Actions Failure) ← مؤجّل 48h
- [x] CLAUDE.md محدّث
- [x] AI_mkhalfiAmine.md محدّث (الجلسة 34 موثّقة)
- [x] atomic-trade SKILL محدّث
- [x] walkthrough.md محدّث
- [x] Git commits: ca39b3f → 9e5f0b6 → 0e981bb
- [ ] Git tag: session-34-complete
- [ ] Final commit + push للوثائق

## 🟡 P1 Candidates

- [ ] إن تكرر vitest cold-start flake → أضف Sentry mock في `vitest.setup.ts` (تفصيل: أول `import('@/actions/user')` يحمّل `@sentry/nextjs` ببطء — 10s timeout في الـ run الأول، 1s في الـ retry)

## 📅 جلسة 35 (الأربعاء/الخميس) — Pre-flight

- [ ] افحص Sentry → Issues (آخر 48h)
- [ ] افحص Sentry → Usage (< 50%)
- [ ] إعادة Alert 3 (action tag الآن متاح)
- [ ] P1-quick: take: 5000 limit على interactions
- [ ] P1-quick: console.log audit في server.ts

## 📅 الجلسة 36: P0-3 (جمعة/سبت)
- [ ] iron-session + signed cookies

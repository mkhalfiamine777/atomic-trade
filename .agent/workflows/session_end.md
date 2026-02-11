---
description: "Safely wrap up the current development session."
trigger: "end session, wrap up, اختتام الجلسة, إغلاق, finish"
---

# 🚪 Session End Protocol (آلية الاختتام)

> هذا الملف يعمل "كمجس" (Sensor) لنهاية الجلسة.

1.  **📊 Progress Update (تحديث التقدم):**
    -   Ask the user: "What did we accomplish today?"
    -   Update `AI_mkhalfiAmine.md` > `Achievement Log` section.
    -   Update `AI_mkhalfiAmine.md` > `Active Roadmap`.

2.  **📝 Documentation (التوثيق):**
    -   Generate or update a `Session_Report_YYYY_MM_DD.md` in `session_reports/`.

3.  **📦 Code Freeze (تجميد الكود):**
    -   Run `git status` to check pending changes.
    -   Prompt to commit changes.

4.  **👋 Farewell (التوديع):**
    -   Summarize the *Next Step* for the upcoming session.
    -   Say: "Session closed successfully. See you next time!"

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

3.  **💥 boom_Report (السجل التاريخي):**
    -   Open `session_reports/boom_Report.md`.
    -   Add a new entry at the TOP of the current month section (or create a new month section if needed).
    -   Use this format:
    ```markdown
    ### 🟢 DD-MM-YYYY | HH:MM → HH:MM | الجلسة XX — [وصف قصير]
    | الوقت | الحدث | التقرير/الملف |
    |-------|-------|---------------|
    | HH:MM | [وصف الحدث] | `filename.tsx` أو [Report Name](link) |
    | ✅ | [Session_Report_YYYY_MM_DD](Session_Report_YYYY_MM_DD.md) | |
    ```
    -   **IMPORTANT:** Include ALL changes made during this session (files modified, features added, bugs fixed, reports generated).
    -   **IMPORTANT:** Include timestamps from the task boundary history if available.
    -   **IMPORTANT:** Link any generated reports (both in `session_reports/` and in the brain artifacts directory).

4.  **📦 Code Freeze (تجميد الكود):**
    -   Run `git status` to check pending changes.
    -   Prompt to commit changes.

5.  **👋 Farewell (التوديع):**
    -   Summarize the *Next Step* for the upcoming session.
    -   Say: "Session closed successfully. See you next time!"

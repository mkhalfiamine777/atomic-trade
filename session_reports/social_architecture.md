# 🏗️ البنية الهيكلية: ميزات التواصل الاجتماعي

## 📁 الهيكل الحالي + الإضافات الجديدة

```
web/src/
├── 📂 app/
│   ├── 📄 page.tsx                    # ✅ موجود (Landing)
│   ├── 📄 layout.tsx                  # ✅ موجود
│   ├── 📂 dashboard/                  # ✅ موجود
│   │
│   │── 🆕 📂 feed/                    # صفحة For You الرئيسية
│   │   └── 📄 page.tsx
│   │
│   │── 🆕 📂 upload/                  # رفع فيديو جديد
│   │   └── 📄 page.tsx
│   │
│   │── 🆕 📂 stories/                 # القصص
│   │   ├── 📄 page.tsx               # عرض القصص
│   │   └── 📂 create/
│   │       └── 📄 page.tsx           # إنشاء قصة
│   │
│   │── 🆕 📂 live/                    # البث المباشر
│   │   ├── 📄 page.tsx               # قائمة البث
│   │   ├── 📂 [id]/
│   │   │   └── 📄 page.tsx           # مشاهدة بث
│   │   └── 📂 start/
│   │       └── 📄 page.tsx           # بدء بث
│   │
│   │── 🆕 📂 profile/                 # الملف الشخصي
│   │   └── 📂 [id]/
│   │       └── 📄 page.tsx
│   │
│   └── 📂 api/
│       │── 🆕 📂 videos/
│       │   ├── 📄 route.ts           # GET/POST videos
│       │   └── 📂 [id]/
│       │       ├── 📄 route.ts       # GET/DELETE video
│       │       ├── 📂 like/
│       │       │   └── 📄 route.ts
│       │       └── 📂 comment/
│       │           └── 📄 route.ts
│       │
│       │── 🆕 📂 stories/
│       │   └── 📄 route.ts
│       │
│       │── 🆕 📂 live/
│       │   └── 📄 route.ts
│       │
│       └── 🆕 📂 users/
│           └── 📂 [id]/
│               └── 📂 follow/
│                   └── 📄 route.ts
│
├── 📂 components/
│   ├── 📄 Map.tsx                     # ✅ موجود
│   ├── 📄 ParticleField.tsx           # ✅ موجود
│   │
│   │── 🆕 📂 video/
│   │   ├── 📄 VideoPlayer.tsx
│   │   ├── 📄 VideoCard.tsx
│   │   ├── 📄 VideoFeed.tsx
│   │   ├── 📄 VideoRecorder.tsx
│   │   ├── 📄 VideoActions.tsx
│   │   └── 📄 VideoUploader.tsx
│   │
│   │── 🆕 📂 stories/
│   │   ├── 📄 StoryCircle.tsx
│   │   ├── 📄 StoryViewer.tsx
│   │   ├── 📄 StoryBar.tsx
│   │   └── 📄 StoryCreator.tsx
│   │
│   │── 🆕 📂 live/
│   │   ├── 📄 LivePlayer.tsx
│   │   ├── 📄 LiveControls.tsx
│   │   ├── 📄 LiveChat.tsx
│   │   └── 📄 LiveGifts.tsx
│   │
│   └── 🆕 📂 social/
│       ├── 📄 FollowButton.tsx
│       ├── 📄 CommentSection.tsx
│       ├── 📄 ShareModal.tsx
│       └── 📄 UserAvatar.tsx
│
├── 📂 hooks/
│   │── 🆕 📄 useVideoUpload.ts
│   │── 🆕 📄 useInfiniteScroll.ts
│   │── 🆕 📄 useLiveStream.ts
│   │── 🆕 📄 useMediaRecorder.ts
│   └── 📄 useGeofencing.ts           # ✅ موجود
│
├── 📂 lib/
│   │── 🆕 📄 cloudflare.ts
│   │── 🆕 📄 recommendation.ts
│   │── 🆕 📄 video-utils.ts
│   └── 📄 utils.ts                   # ✅ موجود
│
└── 📂 prisma/
    └── 📄 schema.prisma              # 🔄 تحديث
```

---

## 🔗 تدفق البيانات

```
┌─────────────────────────────────────────────────────────────┐
│                         المستخدم                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Frontend                         │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │  Feed   │  │ Stories │  │  Live   │  │ Upload  │        │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘        │
└───────┼────────────┼────────────┼────────────┼──────────────┘
        │            │            │            │
        ▼            ▼            ▼            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js API Routes                       │
│  /api/videos  /api/stories  /api/live  /api/users           │
└─────────────────────────────────────────────────────────────┘
        │                                      │
        ▼                                      ▼
┌──────────────────┐                ┌──────────────────┐
│   PostgreSQL     │                │   Cloudflare     │
│   (Prisma)       │                │   R2 + Stream    │
└──────────────────┘                └──────────────────┘
```

---

## 📊 ملخص الإضافات

| النوع | العدد |
|-------|-------|
| **صفحات جديدة** | 8 |
| **مكونات جديدة** | 16 |
| **APIs جديدة** | 10 |
| **Hooks جديدة** | 4 |
| **جداول قاعدة بيانات** | 4 |

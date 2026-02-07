# 🧩 تقرير المكونات الستة عشر (16 Components)

## 📋 نظرة عامة

| المجلد | المكونات | العدد |
|--------|----------|-------|
| `video/` | VideoPlayer, VideoCard, VideoFeed, VideoRecorder, VideoActions, VideoUploader | 6 |
| `stories/` | StoryCircle, StoryViewer, StoryBar, StoryCreator | 4 |
| `live/` | LivePlayer, LiveControls, LiveChat, LiveGifts | 4 |
| `social/` | FollowButton, CommentSection, ShareModal, UserAvatar | 4 |

---

# 📹 مكونات الفيديو (video/)

## 1. VideoPlayer.tsx

### 🎯 الوظيفة
مشغل الفيديو الأساسي مع تحكم كامل.

### 📥 Props
```typescript
interface VideoPlayerProps {
  src: string;              // رابط الفيديو
  poster?: string;          // صورة المعاينة
  autoPlay?: boolean;       // تشغيل تلقائي
  muted?: boolean;          // كتم الصوت
  loop?: boolean;           // تكرار
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onProgress?: (progress: number) => void;
}
```

### ⚙️ الميزات
- تشغيل/إيقاف
- شريط التقدم
- التحكم بالصوت
- ملء الشاشة
- Picture-in-Picture

---

## 2. VideoCard.tsx

### 🎯 الوظيفة
بطاقة فيديو واحدة في التغذية (تشبه TikTok).

### 📥 Props
```typescript
interface VideoCardProps {
  video: {
    id: string;
    url: string;
    thumbnail: string;
    caption: string;
    user: User;
    product?: Product;
    likes: number;
    comments: number;
    shares: number;
  };
  isActive: boolean;        // هل في viewport
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onBuy?: () => void;
}
```

### 🖼️ البنية
```
┌────────────────────────┐
│ [VideoPlayer] ملء      │
│                        │
│ ┌──┐ معلومات المستخدم  │
│ └──┘ @username         │
│ 📝 الوصف...            │
│             [Actions]→ │
└────────────────────────┘
```

---

## 3. VideoFeed.tsx

### 🎯 الوظيفة
التغذية الرئيسية مع التمرير اللانهائي.

### 📥 Props
```typescript
interface VideoFeedProps {
  initialVideos: Video[];
  fetchMore: () => Promise<Video[]>;
  type: 'forYou' | 'following' | 'nearby';
}
```

### ⚙️ الميزات
- Infinite Scroll
- تتبع الفيديو الحالي
- Preload للفيديو التالي
- Intersection Observer

---

## 4. VideoRecorder.tsx

### 🎯 الوظيفة
تسجيل فيديو من الكاميرا مباشرة.

### 📥 Props
```typescript
interface VideoRecorderProps {
  maxDuration: number;      // بالثواني (15, 30, 60)
  onRecordComplete: (blob: Blob) => void;
  onCancel: () => void;
}
```

### ⚙️ الميزات
- MediaRecorder API
- تبديل كاميرا أمامية/خلفية
- عداد الوقت
- معاينة فورية

---

## 5. VideoActions.tsx

### 🎯 الوظيفة
أزرار التفاعل على الفيديو (❤️💬🔗🔖🛒).

### 📥 Props
```typescript
interface VideoActionsProps {
  videoId: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  isSaved: boolean;
  productId?: string;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onSave: () => void;
  onBuy?: () => void;
}
```

---

## 6. VideoUploader.tsx

### 🎯 الوظيفة
رفع الفيديو إلى السيرفر.

### 📥 Props
```typescript
interface VideoUploaderProps {
  onUploadComplete: (videoUrl: string) => void;
  onUploadProgress: (progress: number) => void;
  maxSize?: number;         // MB
  acceptedFormats?: string[];
}
```

---

# 📖 مكونات القصص (stories/)

## 7. StoryCircle.tsx

### 🎯 الوظيفة
دائرة القصة في الشريط العلوي.

### 📥 Props
```typescript
interface StoryCircleProps {
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  hasUnwatchedStory: boolean;
  isOwn?: boolean;          // لإضافة قصة
  onClick: () => void;
}
```

### 🎨 الحالات
```
◉ حدود ملونة = قصة جديدة
○ حدود رمادية = تمت مشاهدتها
⊕ علامة + = إضافة قصتك
```

---

## 8. StoryViewer.tsx

### 🎯 الوظيفة
عارض القصص ملء الشاشة.

### 📥 Props
```typescript
interface StoryViewerProps {
  stories: Story[];
  initialIndex: number;
  onClose: () => void;
  onStoryViewed: (storyId: string) => void;
  onReply: (storyId: string, message: string) => void;
}
```

---

## 9. StoryBar.tsx

### 🎯 الوظيفة
شريط القصص الأفقي القابل للتمرير.

### 📥 Props
```typescript
interface StoryBarProps {
  stories: UserWithStories[];
  onStoryClick: (userId: string) => void;
  onAddStory: () => void;
}
```

---

## 10. StoryCreator.tsx

### 🎯 الوظيفة
إنشاء قصة جديدة مع أدوات التحرير.

### 📥 Props
```typescript
interface StoryCreatorProps {
  onPublish: (story: NewStory) => void;
  onCancel: () => void;
}
```

### ⚙️ الميزات
- إضافة نص
- ملصقات
- رسم حر
- استطلاع رأي

---

# 🔴 مكونات البث المباشر (live/)

## 11. LivePlayer.tsx

### 🎯 الوظيفة
مشغل البث المباشر للمشاهدين.

### 📥 Props
```typescript
interface LivePlayerProps {
  streamUrl: string;
  streamId: string;
  hostInfo: User;
  viewerCount: number;
  onClose: () => void;
}
```

---

## 12. LiveControls.tsx

### 🎯 الوظيفة
لوحة تحكم المذيع في البث.

### 📥 Props
```typescript
interface LiveControlsProps {
  isLive: boolean;
  viewerCount: number;
  duration: number;
  onEndStream: () => void;
  onFlipCamera: () => void;
  onToggleMic: () => void;
  onAddProduct: () => void;
}
```

---

## 13. LiveChat.tsx

### 🎯 الوظيفة
دردشة البث المباشر الفورية.

### 📥 Props
```typescript
interface LiveChatProps {
  streamId: string;
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
}
```

---

## 14. LiveGifts.tsx

### 🎯 الوظيفة
نظام الهدايا الافتراضية.

### 📥 Props
```typescript
interface LiveGiftsProps {
  gifts: Gift[];
  onSendGift: (giftId: string) => void;
  userCoins: number;
}
```

---

# 👥 مكونات اجتماعية (social/)

## 15. FollowButton.tsx

### 📥 Props
```typescript
interface FollowButtonProps {
  userId: string;
  isFollowing: boolean;
  onFollow: () => void;
  onUnfollow: () => void;
  size?: 'sm' | 'md' | 'lg';
}
```

---

## 16. CommentSection.tsx

### 📥 Props
```typescript
interface CommentSectionProps {
  videoId: string;
  comments: Comment[];
  onAddComment: (content: string) => void;
  onLikeComment: (commentId: string) => void;
}
```

---

## 17. ShareModal.tsx

### 📥 Props
```typescript
interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
  title: string;
}
```

---

## 18. UserAvatar.tsx

### 📥 Props
```typescript
interface UserAvatarProps {
  src: string;
  alt: string;
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isOnline?: boolean;
  hasStory?: boolean;
  onClick?: () => void;
}
```

---

## 📊 ملخص

| المكون | الأولوية | التعقيد |
|--------|----------|---------|
| VideoPlayer | 🔴 عالية | متوسط |
| VideoCard | 🔴 عالية | متوسط |
| VideoFeed | 🔴 عالية | عالي |
| VideoRecorder | 🔴 عالية | عالي |
| VideoActions | 🟡 متوسطة | منخفض |
| VideoUploader | 🔴 عالية | متوسط |
| StoryCircle | 🟡 متوسطة | منخفض |
| StoryViewer | 🟡 متوسطة | متوسط |
| StoryBar | 🟡 متوسطة | منخفض |
| StoryCreator | 🟡 متوسطة | عالي |
| LivePlayer | 🟢 منخفضة | عالي |
| LiveControls | 🟢 منخفضة | عالي |
| LiveChat | 🟢 منخفضة | متوسط |
| LiveGifts | 🟢 منخفضة | متوسط |
| FollowButton | 🟡 متوسطة | منخفض |
| CommentSection | 🟡 متوسطة | متوسط |

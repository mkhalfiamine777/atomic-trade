# 🔌 تقرير الـ APIs العشرة

## 📋 نظرة عامة

| # | المسار | الطريقة | الوظيفة |
|---|--------|---------|---------|
| 1 | `/api/videos` | GET | جلب الفيديوهات |
| 2 | `/api/videos` | POST | رفع فيديو جديد |
| 3 | `/api/videos/[id]` | GET | جلب فيديو محدد |
| 4 | `/api/videos/[id]/like` | POST | إعجاب/إلغاء إعجاب |
| 5 | `/api/videos/[id]/comment` | POST | إضافة تعليق |
| 6 | `/api/stories` | GET/POST | القصص |
| 7 | `/api/live` | GET | قائمة البث |
| 8 | `/api/live/start` | POST | بدء بث مباشر |
| 9 | `/api/live/[id]` | GET/DELETE | بث محدد |
| 10 | `/api/users/[id]/follow` | POST | متابعة/إلغاء |

---

# 📹 APIs الفيديو

## 1. GET `/api/videos`

### 📥 Query Parameters
```typescript
{
  page?: number;           // الصفحة (default: 1)
  limit?: number;          // العدد (default: 10)
  type?: 'forYou' | 'following' | 'nearby';
  lat?: number;            // للقريب
  lng?: number;
  radius?: number;         // بالمتر
}
```

### 📤 Response
```typescript
{
  success: true,
  data: {
    videos: Video[],
    nextPage: number | null,
    total: number
  }
}
```

### 🔒 المصادقة: اختيارية (للتخصيص)

---

## 2. POST `/api/videos`

### 📥 Request Body (FormData)
```typescript
{
  video: File;              // ملف الفيديو
  caption: string;          // الوصف
  productId?: string;       // ربط بمنتج
  isStory?: boolean;        // قصة أم فيديو
  tags?: string[];          // هاشتاغات
}
```

### 📤 Response
```typescript
{
  success: true,
  data: {
    id: string,
    url: string,
    thumbnail: string,
    status: 'processing' | 'ready'
  }
}
```

### 🔒 المصادقة: مطلوبة ✅

---

## 3. GET `/api/videos/[id]`

### 📤 Response
```typescript
{
  success: true,
  data: {
    id: string,
    url: string,
    thumbnail: string,
    caption: string,
    duration: number,
    views: number,
    likes: number,
    comments: number,
    shares: number,
    user: {
      id: string,
      name: string,
      avatar: string,
      isFollowing: boolean
    },
    product?: {
      id: string,
      name: string,
      price: number,
      image: string
    },
    isLiked: boolean,
    isSaved: boolean,
    createdAt: string
  }
}
```

---

## 4. POST `/api/videos/[id]/like`

### 📥 Request Body
```typescript
{
  action: 'like' | 'unlike'
}
```

### 📤 Response
```typescript
{
  success: true,
  data: {
    likes: number,
    isLiked: boolean
  }
}
```

### 🔒 المصادقة: مطلوبة ✅

---

## 5. POST `/api/videos/[id]/comment`

### 📥 Request Body
```typescript
{
  content: string;
  replyTo?: string;        // رد على تعليق
}
```

### 📤 Response
```typescript
{
  success: true,
  data: {
    id: string,
    content: string,
    user: User,
    createdAt: string
  }
}
```

### 🔒 المصادقة: مطلوبة ✅

---

# 📖 APIs القصص

## 6. GET/POST `/api/stories`

### GET - جلب القصص
```typescript
// Query
{ following?: boolean }

// Response
{
  success: true,
  data: {
    users: [{
      user: User,
      stories: Story[],
      hasUnwatched: boolean
    }]
  }
}
```

### POST - إنشاء قصة
```typescript
// Request (FormData)
{
  media: File,             // صورة أو فيديو
  type: 'image' | 'video',
  duration?: number,       // للفيديو
  stickers?: Sticker[],
  poll?: Poll
}

// Response
{
  success: true,
  data: {
    id: string,
    expiresAt: string      // بعد 24 ساعة
  }
}
```

---

# 🔴 APIs البث المباشر

## 7. GET `/api/live`

### 📥 Query Parameters
```typescript
{
  lat?: number,
  lng?: number,
  radius?: number,
  category?: string
}
```

### 📤 Response
```typescript
{
  success: true,
  data: {
    streams: [{
      id: string,
      title: string,
      host: User,
      viewerCount: number,
      thumbnail: string,
      startedAt: string,
      products: Product[]
    }]
  }
}
```

---

## 8. POST `/api/live/start`

### 📥 Request Body
```typescript
{
  title: string,
  description?: string,
  productIds?: string[],
  category?: string
}
```

### 📤 Response
```typescript
{
  success: true,
  data: {
    streamId: string,
    streamKey: string,      // للمذيع
    playbackUrl: string,    // للمشاهدين
    rtmpUrl: string         // للبث
  }
}
```

### 🔒 المصادقة: مطلوبة ✅ (تاجر فقط)

---

## 9. GET/DELETE `/api/live/[id]`

### GET - معلومات البث
```typescript
{
  success: true,
  data: {
    id: string,
    title: string,
    host: User,
    viewerCount: number,
    playbackUrl: string,
    products: Product[],
    isLive: boolean,
    startedAt: string
  }
}
```

### DELETE - إنهاء البث
```typescript
{
  success: true,
  data: {
    duration: number,
    totalViewers: number,
    peakViewers: number
  }
}
```

---

# 👥 APIs المستخدمين

## 10. POST `/api/users/[id]/follow`

### 📥 Request Body
```typescript
{
  action: 'follow' | 'unfollow'
}
```

### 📤 Response
```typescript
{
  success: true,
  data: {
    isFollowing: boolean,
    followerCount: number
  }
}
```

### 🔒 المصادقة: مطلوبة ✅

---

# 🔐 المصادقة

جميع الـ APIs المحمية تتطلب:

```typescript
// Header
Authorization: Bearer <jwt_token>

// أو Cookie
session: <session_id>
```

### أخطاء المصادقة
```typescript
// 401 Unauthorized
{
  success: false,
  error: {
    code: 'UNAUTHORIZED',
    message: 'يجب تسجيل الدخول'
  }
}

// 403 Forbidden
{
  success: false,
  error: {
    code: 'FORBIDDEN',
    message: 'لا تملك صلاحية لهذا الإجراء'
  }
}
```

---

# 📊 ملخص

| API | المصادقة | Rate Limit |
|-----|----------|------------|
| GET /videos | ❌ | 100/دقيقة |
| POST /videos | ✅ | 10/ساعة |
| POST /like | ✅ | 60/دقيقة |
| POST /comment | ✅ | 30/دقيقة |
| GET /stories | ❌ | 100/دقيقة |
| POST /stories | ✅ | 20/ساعة |
| GET /live | ❌ | 60/دقيقة |
| POST /live/start | ✅ | 5/يوم |
| POST /follow | ✅ | 100/ساعة |

---

# 🛠️ التقنيات

| المجال | التقنية |
|--------|---------|
| Framework | Next.js API Routes |
| Validation | Zod |
| Auth | NextAuth.js |
| Rate Limit | Upstash Redis |
| File Upload | Cloudflare R2 |

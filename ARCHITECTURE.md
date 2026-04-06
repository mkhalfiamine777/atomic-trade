# 🏗️ Architecture Guide — Social Commerce Platform

> **For developers joining the project.** This document explains how the system is organized.

## Overview

Social Commerce is a **geo-social marketplace** where users, shops, and companies interact on a live map. Every activity is tied to a geographic coordinate.

```
┌─────────────────────────────────────────────────┐
│                   Browser (Client)              │
│  ┌──────────┐  ┌──────────┐  ┌───────────────┐ │
│  │ Dashboard │  │  Map     │  │ Explore Feed  │ │
│  │ (React)   │  │ (Leaflet)│  │ (VideoFeed)   │ │
│  └─────┬─────┘  └────┬─────┘  └──────┬────────┘ │
│        │             │               │           │
│        └─────────────┼───────────────┘           │
│                      │ Server Actions / API      │
├──────────────────────┼──────────────────────────-┤
│                  Next.js Server                  │
│  ┌──────────┐  ┌──────────┐  ┌───────────────┐ │
│  │ Actions/  │  │ Services/│  │ Socket.io     │ │
│  │ (Server   │  │ (Business│  │ (Real-time    │ │
│  │  Actions) │  │  Logic)  │  │  Chat/Notify) │ │
│  └─────┬─────┘  └────┬─────┘  └──────┬────────┘ │
│        └─────────────┼───────────────┘           │
│                      │ Prisma ORM                │
├──────────────────────┼──────────────────────────-┤
│              PostgreSQL Database                 │
└─────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js 16 (App Router) | SSR, Routing, Server Actions |
| UI | React 19 + TailwindCSS | Components, Styling |
| Map | Leaflet + Supercluster | Geo visualization, clustering |
| Database | PostgreSQL + Prisma | Data persistence, ORM |
| Real-time | Socket.io | Chat, notifications, live updates |
| File Upload | UploadThing | Image/video uploads |
| Auth | Cookie-based (`user_id`) | Simple session management |

## Directory Structure

```
web/
├── prisma/
│   └── schema.prisma          # Database schema (source of truth)
├── src/
│   ├── actions/               # Server Actions (backend logic)
│   │   ├── auth.ts            # Login, signup, getCurrentUser
│   │   ├── market.ts          # Create/get listings (products, requests)
│   │   ├── social.ts          # Social posts
│   │   ├── stories.ts         # Map stories (24h expiry)
│   │   ├── user.ts            # Location updates
│   │   ├── trust.ts           # Reputation scoring
│   │   └── zones.ts           # Zone Master territory system
│   ├── app/                   # Next.js App Router pages
│   │   ├── dashboard/         # Main map dashboard
│   │   ├── explore/           # Full-screen content feed
│   │   ├── u/[username]/      # User profiles
│   │   ├── admin/             # Admin panel
│   │   └── messages/          # Chat interface
│   ├── components/
│   │   ├── map/               # Map rendering (core of the app)
│   │   │   ├── Map.tsx        # Main map container
│   │   │   ├── SuperclusterLayer.tsx  # Clustering + Z-Index
│   │   │   ├── MapMarker.tsx  # Marker delegation
│   │   │   ├── ListingMarker.tsx
│   │   │   └── UserMarker.tsx
│   │   ├── modals/            # Product/Request/Story creation
│   │   ├── profile/           # Profile components
│   │   └── ui/                # Reusable UI primitives
│   ├── lib/                   # Shared utilities
│   │   ├── db.ts              # Prisma client singleton
│   │   ├── schemas.ts         # Zod validation schemas
│   │   └── adminGuard.ts      # Admin verification
│   ├── services/              # Business logic services
│   │   ├── feedService.ts     # Hybrid feed algorithm
│   │   ├── matchingService.ts # Supply-demand matching
│   │   └── trustService.ts    # Trust score calculation
│   ├── utils/
│   │   ├── geo.ts             # Orbital Spread algorithm
│   │   └── mapIcons.ts        # Neon map icon generators
│   └── types/
│       └── index.ts           # Shared TypeScript types
├── server.ts                  # Unified Next.js + Socket.io server
└── package.json
```

## Key Architectural Rules

### 1. The Cardinal Location Rule
Every user's icon is bound to their **last known GPS coordinates**. All activities are stamped with the user's real-time location.

- **INDIVIDUAL** users: Location updates every 20 seconds via GPS polling.
- **SHOP/COMPANY** users: Location is **fixed** (Anchor Rule). Activities orbit 10-20 meters around the shop (Orbital Spread).

### 2. Server Actions Only
All database operations go through Server Actions in `src/actions/`. **Never** call Prisma from client components.

```typescript
// ✅ Correct
'use server'
export async function createListing(...) {
    const [result] = await db.$transaction([...])
    return { success: true, data: result }
}

// ❌ Wrong — never throw, never use Prisma in client
throw new Error('...')
```

### 3. Error Handling Pattern
All Server Actions return `{ success: boolean, error?: string }` — never `throw`.

### 4. Type Safety
- No `as any` — No `error: any`
- Use `error: unknown` + `instanceof Error`
- All types live in `src/types/index.ts`

### 5. Design Language
- Dark theme: `bg-zinc-950` base
- Neon accents: Amber (shops), Cyan (individuals), Purple (companies)
- Glassmorphism + subtle animations

## Entity Types

| Type | Color | Icon | Location Behavior |
|------|-------|------|-------------------|
| `INDIVIDUAL` | Blue Neon | 👤 | Moves with user (20s GPS sync) |
| `SHOP` | Gold Neon | 🏪 | Fixed (Anchor Rule) |
| `COMPANY` | Purple Neon | 🏢 | Fixed (Anchor Rule) |

## Running Locally

```bash
# Prerequisites: Docker (for PostgreSQL)
cd web
docker compose up -d     # Start PostgreSQL
npm install
npx prisma db push       # Sync schema
npm run dev              # Start dev server (Next.js + Socket.io)
```

## Testing

```bash
cd web
npx vitest run           # Run all tests
npx vitest --ui          # Interactive test UI
```

## Deployment

- **Platform:** Railway (auto-deploys on push to `main`)
- **CI/CD:** GitHub Actions runs TypeCheck → Tests → Build on every push
- **Database:** Railway PostgreSQL (schema synced via `prisma db push` at startup)

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Unified `server.ts` | Simplifies deployment to 1 service on Railway |
| Cookie auth (not NextAuth) | Simpler for MVP; phone-based auth |
| `$transaction` for all writes | Prevents race conditions in concurrent operations |
| Supercluster for map | Handles thousands of markers efficiently |
| 20s GPS polling | Balance between accuracy and battery/bandwidth |

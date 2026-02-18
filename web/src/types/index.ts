// --- Base Types ---
export interface Coordinates {
    lat: number
    lng: number
}

// --- Domain Types ---

export interface UserProfile {
    id: string
    name: string | null
    username: string | null
    email?: string | null
    type: 'INDIVIDUAL' | 'SHOP' | null
    avatarUrl: string | null
    isVerified: boolean
    reputationScore: number
    shopCategory?: string | null
    joinDate?: Date
    createdAt?: Date
    latitude?: number | null
    longitude?: number | null
}

export interface LocationUser {
    id: string
    name: string | null
    username: string | null
    avatarUrl: string | null
    latitude: number
    longitude: number
    type: 'INDIVIDUAL' | 'SHOP' | null
    isOnline: boolean
    hasStories: boolean
}

export interface Message {
    id: string
    content: string
    senderId: string
    sender?: {
        id: string
        name: string | null
        avatarUrl: string | null
    }
    createdAt: string | Date
    conversationId?: string
}

export interface Listing {
    id: string
    title: string
    description?: string | null
    price: number
    currency?: string
    images: string // JSON string or array usage depends on parsing
    latitude: number
    longitude: number
    type: 'PRODUCT' | 'REQUEST'
    sellerId: string
    seller?: UserProfile
    createdAt: Date
}

export interface Story {
    id: string
    mediaUrl: string
    mediaType: 'IMAGE' | 'VIDEO'
    caption?: string | null
    latitude: number
    longitude: number
    userId: string
    user?: UserProfile
    createdAt: Date
    expiresAt?: Date
}

export interface Post { // SocialPost
    id: string
    caption?: string | null
    mediaUrl: string
    mediaType: 'IMAGE' | 'VIDEO'
    latitude: number
    longitude: number
    userId: string
    user?: UserProfile
    createdAt: Date
    likesCount?: number
}

// --- Component Props Types (Tabs) ---

export interface TabStory {
    id: string
    mediaUrl: string
    mediaType: 'IMAGE' | 'VIDEO'
    caption?: string | null
}

export interface TabListing {
    id: string
    title: string
    price: number
    images: string
}

export interface TabPost {
    id: string
    mediaUrl: string
    mediaType: 'IMAGE' | 'VIDEO'
    caption?: string | null
}


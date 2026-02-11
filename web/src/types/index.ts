export interface TabStory {
    id: string
    mediaUrl: string
    mediaType: string
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
    mediaType: string
    caption?: string | null
}

export interface UserProfile {
    id: string
    name: string | null
    username: string | null
    type: string | null
    avatarUrl: string | null
    isVerified: boolean
    reputationScore: number
    joinDate: Date
}

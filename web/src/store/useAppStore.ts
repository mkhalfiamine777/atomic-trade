import { create } from 'zustand'

// Define the shape of our User, picking only what's needed globally
export interface GlobalUser {
    id: string
    name: string | null
    username: string | null
    avatarUrl: string | null
    reputationScore: number
    isVerified: boolean
    type: string
}

interface AppState {
    // User State
    currentUser: GlobalUser | null
    isAuthLoaded: boolean // Helps UI know if we finished checking auth
    setCurrentUser: (user: GlobalUser | null) => void

    // Global Socket State
    isConnected: boolean
    activeUsers: number
    setSocketStatus: (connected: boolean, usersCount?: number) => void

    // UI Settings
    showZoneGrid: boolean
    toggleZoneGrid: () => void
}

export const useAppStore = create<AppState>((set) => ({
    currentUser: null,
    isAuthLoaded: false,
    setCurrentUser: (user) => set({ currentUser: user, isAuthLoaded: true }),

    isConnected: false,
    activeUsers: 0,
    setSocketStatus: (connected, usersCount) => set((state) => ({
        isConnected: connected,
        activeUsers: usersCount !== undefined ? usersCount : state.activeUsers
    })),

    showZoneGrid: false,
    toggleZoneGrid: () => set((state) => ({ showZoneGrid: !state.showZoneGrid }))
}))

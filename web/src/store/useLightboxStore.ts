import { create } from 'zustand'

interface LightboxState {
    isOpen: boolean
    activeVideoUrl: string | null
    layoutId: string | null
    openLightbox: (url: string, id?: string) => void
    closeLightbox: () => void
}

export const useLightboxStore = create<LightboxState>((set) => ({
    isOpen: false,
    activeVideoUrl: null,
    layoutId: null,
    openLightbox: (url, id) => {
        // Prevent background scrolling when open
        if (typeof document !== 'undefined') {
            document.body.style.overflow = 'hidden'
        }
        set({ isOpen: true, activeVideoUrl: url, layoutId: id || null })
    },
    closeLightbox: () => {
        // Restore background scrolling
        if (typeof document !== 'undefined') {
            document.body.style.overflow = ''
        }
        set({ isOpen: false, activeVideoUrl: null, layoutId: null })
    }
}))

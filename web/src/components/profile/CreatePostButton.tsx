'use client'

import { useState } from 'react'
import { CreatePostModal } from '@/components/modals/CreatePostModal'

export function CreatePostButton({ userId }: { userId: string }) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-24 left-6 z-50 bg-gx-primary hover:bg-pink-600 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-2xl transition-transform hover:scale-110 border-2 border-white/20"
                title="منشور جديد"
            >
                ➕
            </button>

            <CreatePostModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                userId={userId}
            />
        </>
    )
}

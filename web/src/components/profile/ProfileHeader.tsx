'use client'

import { InteractionBar } from './InteractionBar'
import { BadgeCheck, Store, Building2, User as UserIcon, Star, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface UserProfile {
    id: string
    name: string | null
    type: string | null
    avatarUrl: string | null
    isVerified: boolean
    reputationScore: number
    joinDate: Date
}

interface ProfileHeaderProps {
    user: UserProfile
    stats: {
        likes: number
        loves: number
    }
    currentUserId?: string
}

export function ProfileHeader({ user, stats, currentUserId }: ProfileHeaderProps) {
    return (
        <div className="relative mb-6">
            {/* Cover Image (Placeholder for now) */}
            <div className="h-48 bg-gradient-to-r from-indigo-500 to-purple-600 w-full relative">
                <div className="absolute inset-0 bg-black/20" />
                {/* Back Button */}
                <Link href="/dashboard" className="absolute top-4 right-4 bg-black/30 p-2 rounded-full text-white hover:bg-black/50 transition-colors z-20">
                    <ArrowRight className="w-6 h-6" />
                </Link>
            </div>

            {/* Profile Info */}
            <div className="px-4 -mt-16 relative z-10 flex flex-col items-center">
                {/* Avatar */}
                <div className="w-32 h-32 rounded-full border-4 border-zinc-950 bg-zinc-800 overflow-hidden shadow-2xl relative group">
                    {user.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={user.avatarUrl}
                            alt={user.name || 'User'}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl bg-zinc-700 text-zinc-400">
                            {user.name?.[0]?.toUpperCase() || '?'}
                        </div>
                    )}
                    {user.isVerified && (
                        <div className="absolute bottom-2 right-2 bg-blue-500 text-white rounded-full p-1 shadow-lg" title="موثق">
                            <BadgeCheck className="w-4 h-4" />
                        </div>
                    )}
                </div>

                {/* Name & Type */}
                <div className="mt-3 text-center">
                    <h1 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                        {user.name}
                        {user.reputationScore > 100 && (
                            <span title="بائع موثوق" className="text-yellow-500">
                                <Star className="w-5 h-5 fill-yellow-500" />
                            </span>
                        )}
                    </h1>
                    <div className="flex items-center justify-center gap-2 text-zinc-400 text-sm mt-1">
                        {user.type === 'SHOP' ? (
                            <span className="flex items-center gap-1"><Store className="w-4 h-4" /> متجر</span>
                        ) : user.type === 'COMPANY' ? (
                            <span className="flex items-center gap-1"><Building2 className="w-4 h-4" /> شركة</span>
                        ) : (
                            <span className="flex items-center gap-1"><UserIcon className="w-4 h-4" /> بائع مستقل</span>
                        )}
                        <span className="mx-1">•</span>
                        <span>منذ {new Date(user.joinDate).getFullYear()}</span>
                    </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 mt-6 bg-zinc-900/50 backdrop-blur-sm p-4 rounded-xl border border-zinc-800">
                    <div className="text-center">
                        <div className="text-xl font-bold text-white">{user.reputationScore}</div>
                        <div className="text-xs text-zinc-500">السمعة</div>
                    </div>
                    <div className="w-px h-8 bg-zinc-800" />
                    <div className="text-center">
                        <div className="text-xl font-bold text-pink-500">{stats.loves}</div>
                        <div className="text-xs text-zinc-500">أحبوه</div>
                    </div>
                    <div className="w-px h-8 bg-zinc-800" />
                    <div className="text-center">
                        <div className="text-xl font-bold text-blue-500">{stats.likes}</div>
                        <div className="text-xs text-zinc-500">أعجبهم</div>
                    </div>
                </div>

                {/* Interaction Actions */}
                <div className="mt-6 w-full max-w-sm">
                    {currentUserId && currentUserId !== user.id && (
                        <InteractionBar
                            targetUserId={user.id}
                            currentUserId={currentUserId}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}

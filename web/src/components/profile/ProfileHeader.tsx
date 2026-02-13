'use client'

import { useState } from 'react'
import { EditProfileModal } from './EditProfileModal'
import { TrustBadge } from '../trust/TrustBadge'
import { InteractionBar } from './InteractionBar'
import { BadgeCheck, Store, Building2, User as UserIcon, Star, Edit2, MapPin } from 'lucide-react'
import { motion } from 'framer-motion'
import { UserProfile } from '@/types'

interface ProfileHeaderProps {
    user: UserProfile
    stats: {
        likes: number
        loves: number
    }
    currentUserId?: string
}

export function ProfileHeader({ user, stats, currentUserId }: ProfileHeaderProps) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const isOwner = currentUserId === user.id

    return (
        <div className="relative mb-8 pb-4 border-b border-white/5">
            {/* Cover Image (Dynamic Gradient for now) */}
            <div className="h-40 sm:h-52 bg-gradient-to-tr from-indigo-900 via-purple-900 to-black w-full relative overflow-hidden group">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 pointer-events-none" />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/90 to-transparent" />

                {/* Edit Button (Owner Only) - Floating on Cover */}
                {isOwner && (
                    <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-md p-2 px-4 rounded-full text-white hover:bg-white/10 transition-all border border-white/10 flex items-center gap-2 group/edit"
                    >
                        <Edit2 className="w-4 h-4 group-hover/edit:text-indigo-400 transition-colors" />
                        <span className="text-xs font-bold">تعديل الغلاف</span>
                    </button>
                )}
            </div>

            {/* Profile Info Section */}
            <div className="px-6 relative z-10 flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-16 sm:-mt-20">

                {/* Avatar - Floating & Glowing */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative"
                >
                    <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-[6px] border-zinc-900 bg-zinc-800 overflow-hidden shadow-2xl relative group ring-4 ring-black/20">
                        {user.avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={user.avatarUrl}
                                alt={user.name || 'User'}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-zinc-700 to-zinc-900 text-zinc-400">
                                {user.name?.[0]?.toUpperCase() || '?'}
                            </div>
                        )}
                    </div>

                    {/* Verification Badge */}
                    {user.isVerified && (
                        <div className="absolute bottom-2 right-2 bg-blue-500 text-white rounded-full p-1.5 shadow-lg border-4 border-zinc-900" title="موثق">
                            <BadgeCheck className="w-5 h-5" />
                        </div>
                    )}

                    {/* Online Status (Mock) */}
                    <div className="absolute bottom-4 left-2 w-4 h-4 bg-green-500 rounded-full border-2 border-zinc-900 shadow-glow-green" title="نشط الآن" />
                </motion.div>

                {/* Info Text */}
                <div className="flex-1 text-center sm:text-right pb-2">
                    <div className="flex flex-col sm:flex-row items-center sm:items-end gap-2 sm:justify-between">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center justify-center sm:justify-start gap-2 tracking-tight">
                                {user.name}
                                <TrustBadge score={user.reputationScore} showLabel={false} className="ml-2 bg-white/5 p-1 px-2 rounded-full border border-white/5" />
                            </h1>

                            <div className="flex items-center gap-2 justify-center sm:justify-start mt-1">
                                {user.username && (
                                    <p className="text-zinc-400 text-sm dir-ltr font-mono bg-white/5 px-2 py-0.5 rounded-md" style={{ direction: 'ltr' }}>
                                        @{user.username}
                                    </p>
                                )}
                                <span className="w-1 h-1 bg-zinc-600 rounded-full" />
                                <div className="flex items-center gap-1 text-zinc-400 text-xs font-medium uppercase tracking-wider">
                                    {user.type === 'SHOP' ? (
                                        <><Store className="w-3 h-3 text-pink-500" /> متجر</>
                                    ) : (
                                        <><UserIcon className="w-3 h-3 text-indigo-500" /> بائع مستقل</>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Actions (Follow / Message) */}
                        <div className="mt-4 sm:mt-0">
                            {isOwner ? (
                                <button
                                    onClick={() => setIsEditModalOpen(true)}
                                    className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-full font-bold text-sm transition-colors border border-white/10 flex items-center gap-2"
                                >
                                    <Edit2 className="w-4 h-4" />
                                    تعديل الملف
                                </button>
                            ) : (
                                <div className="flex gap-2 w-full max-w-xs mx-auto sm:mx-0">
                                    {currentUserId && (
                                        <InteractionBar
                                            targetUserId={user.id}
                                            currentUserId={currentUserId}
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="mt-8 mx-6 grid grid-cols-3 gap-4">
                <div className="bg-zinc-900/50 p-3 rounded-2xl border border-white/5 text-center group hover:bg-white/5 transition-colors">
                    <div className="text-2xl font-black text-white group-hover:scale-110 transition-transform">{user.reputationScore}</div>
                    <div className="text-[10px] sm:text-xs text-zinc-500 uppercase tracking-wider font-bold">نقاط السمعة</div>
                </div>
                <div className="bg-zinc-900/50 p-3 rounded-2xl border border-white/5 text-center group hover:bg-white/5 transition-colors">
                    <div className="text-2xl font-black text-pink-500 group-hover:scale-110 transition-transform">{stats.loves}</div>
                    <div className="text-[10px] sm:text-xs text-zinc-500 uppercase tracking-wider font-bold">أحبوه</div>
                </div>
                <div className="bg-zinc-900/50 p-3 rounded-2xl border border-white/5 text-center group hover:bg-white/5 transition-colors">
                    <div className="text-2xl font-black text-blue-500 group-hover:scale-110 transition-transform">{stats.likes}</div>
                    <div className="text-[10px] sm:text-xs text-zinc-500 uppercase tracking-wider font-bold">أعجبهم</div>
                </div>
            </div>

            {/* Edit Profile Modal */}
            <EditProfileModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                user={user}
            />
        </div >
    )
}

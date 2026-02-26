'use client'

import { useState, useEffect } from 'react'
import { EditProfileModal } from './EditProfileModal'
import { TrustBadge } from '../trust/TrustBadge'
import { InteractionBar } from './InteractionBar'
import { BadgeCheck, Store, Building2, User as UserIcon, Star, Edit2, MapPin, MessageCircle, ShoppingCart, ChevronRight, Sparkles, UserPlus, UserCheck, UserMinus, Loader2, Users } from 'lucide-react'
import { motion } from 'framer-motion'
import { UserProfile } from '@/types'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toggleFollow, getFollowStatus, getFollowCounts } from '@/actions/follow'
import { startConversation } from '@/actions/chat'

import { useAppStore } from '@/store/useAppStore'

interface ProfileHeaderProps {
    user: UserProfile
    stats: {
        likes: number
        loves: number
        posts: number
        products: number
    }
}

export function ProfileHeader({ user, stats }: ProfileHeaderProps) {
    const { currentUser } = useAppStore()
    const currentUserId = currentUser?.id
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const isOwner = currentUserId === user.id

    // Follow State
    const [isFollowing, setIsFollowing] = useState(false)
    const [isFollowLoading, setIsFollowLoading] = useState(false)
    const [isHoveringFollow, setIsHoveringFollow] = useState(false)
    const [followCounts, setFollowCounts] = useState({ followers: 0, following: 0 })

    useEffect(() => {
        if (!isOwner && currentUserId) {
            getFollowStatus(user.id).then(res => setIsFollowing(res.isFollowing))
        }
        getFollowCounts(user.id).then(res => setFollowCounts(res))
    }, [user.id, currentUserId, isOwner])

    const handleToggleFollow = async () => {
        setIsFollowLoading(true)
        const res = await toggleFollow(user.id)
        if (res.success) {
            setIsFollowing(res.isFollowing ?? false)
            setFollowCounts(prev => ({
                ...prev,
                followers: prev.followers + (res.isFollowing ? 1 : -1)
            }))
        }
        setIsFollowLoading(false)
    }

    // Message State
    const router = useRouter()
    const [isMessageLoading, setIsMessageLoading] = useState(false)

    const handleMessage = async () => {
        setIsMessageLoading(true)
        const res = await startConversation(null, user.id)
        if (res.conversationId) {
            router.push(`/messages?id=${res.conversationId}`)
        }
        setIsMessageLoading(false)
    }

    const userTypeConfig = {
        SHOP: { icon: Store, label: 'متجر', color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/20', glow: 'shadow-pink-500/20' },
        COMPANY: { icon: Building2, label: 'شركة', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', glow: 'shadow-amber-500/20' },
        INDIVIDUAL: { icon: UserIcon, label: 'بائع مستقل', color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20', glow: 'shadow-indigo-500/20' },
    }

    const typeInfo = userTypeConfig[user.type as keyof typeof userTypeConfig] || userTypeConfig.INDIVIDUAL
    const TypeIcon = typeInfo.icon

    return (
        <div className="relative mb-4">
            {/* Cover Image (Animated Gradient) */}
            <div className="h-44 sm:h-56 bg-gradient-to-tr from-indigo-950 via-purple-900/80 to-zinc-900 w-full relative overflow-hidden group">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-15 pointer-events-none" />
                {/* Animated Orbs */}
                <motion.div
                    animate={{ x: [0, 30, 0], y: [0, -20, 0], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute top-10 right-20 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{ x: [0, -20, 0], y: [0, 15, 0], opacity: [0.2, 0.5, 0.2] }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                    className="absolute bottom-10 left-10 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />

                {/* Edit Button (Owner Only) */}
                {isOwner && (
                    <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-md p-2 px-4 rounded-full text-white hover:bg-white/10 transition-all border border-white/10 flex items-center gap-2 group/edit z-10"
                    >
                        <Edit2 className="w-4 h-4 group-hover/edit:text-indigo-400 transition-colors" />
                        <span className="text-xs font-bold">تعديل</span>
                    </button>
                )}
            </div>

            {/* Profile Info Section */}
            <div className="px-5 relative z-10 -mt-20">
                {/* Row: Avatar + Info */}
                <div className="flex items-end gap-4">
                    {/* Avatar */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                        className="relative shrink-0"
                    >
                        <div className={`w-28 h-28 sm:w-36 sm:h-36 rounded-2xl border-4 border-zinc-950 bg-zinc-800 overflow-hidden shadow-2xl relative group ${typeInfo.glow}`}>
                            {user.avatarUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={user.avatarUrl}
                                    alt={user.name || 'User'}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-zinc-700 to-zinc-900 text-zinc-400 font-black">
                                    {user.name?.[0]?.toUpperCase() || '?'}
                                </div>
                            )}
                        </div>

                        {/* Verification Badge */}
                        {user.isVerified && (
                            <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-lg p-1.5 shadow-lg border-2 border-zinc-950" title="موثق">
                                <BadgeCheck className="w-4 h-4" />
                            </div>
                        )}
                    </motion.div>

                    {/* Name + Type */}
                    <div className="flex-1 min-w-0 pb-1">
                        <h1 className="text-xl sm:text-2xl font-black text-white truncate tracking-tight">
                            {user.name}
                        </h1>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {user.username && (
                                <span className="text-zinc-500 text-xs font-mono" style={{ direction: 'ltr' }}>
                                    @{user.username}
                                </span>
                            )}
                            <span className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${typeInfo.bg} ${typeInfo.color}`}>
                                <TypeIcon className="w-3 h-3" />
                                {typeInfo.label}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Bio */}
                {user.bio && (
                    <p className="mt-3 text-sm text-zinc-400 leading-relaxed">{user.bio}</p>
                )}

                {/* Trust Score Ribbon */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-4 flex items-center gap-3"
                >
                    <TrustBadge score={user.reputationScore} showLabel={false} className="bg-white/5 p-1 px-3 rounded-xl border border-white/5" />
                    <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(user.reputationScore, 100)}%` }}
                            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
                            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"
                        />
                    </div>
                    <span className="text-xs font-bold text-zinc-500">{user.reputationScore}/100</span>
                </motion.div>

                {/* Stats Grid */}
                <div className="mt-4 grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {[
                        { value: followCounts.followers, label: 'متابع', color: 'text-cyan-400' },
                        { value: followCounts.following, label: 'يتابع', color: 'text-purple-400' },
                        { value: stats.posts, label: 'منشور', color: 'text-white' },
                        { value: stats.products, label: 'منتج', color: 'text-emerald-400' },
                        { value: stats.likes, label: 'إعجاب', color: 'text-blue-400' },
                        { value: stats.loves, label: 'أحبوه', color: 'text-pink-400' },
                    ].map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + i * 0.1 }}
                            className="bg-white/[0.03] backdrop-blur-sm p-2.5 rounded-xl border border-white/5 text-center group hover:bg-white/[0.06] transition-all cursor-default"
                        >
                            <div className={`text-lg sm:text-xl font-black ${stat.color} group-hover:scale-110 transition-transform`}>
                                {stat.value}
                            </div>
                            <div className="text-[9px] sm:text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                                {stat.label}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Action Buttons (Commerce-Focused) */}
                <div className="mt-4 flex gap-2">
                    {isOwner ? (
                        <button
                            onClick={() => setIsEditModalOpen(true)}
                            className="flex-1 bg-white/10 hover:bg-white/15 text-white py-2.5 rounded-xl font-bold text-sm transition-all border border-white/10 flex items-center justify-center gap-2"
                        >
                            <Edit2 className="w-4 h-4" />
                            تعديل الملف الشخصي
                        </button>
                    ) : (
                        <>
                            {currentUserId && (
                                <>
                                    {/* Follow/Unfollow Button */}
                                    <button
                                        onClick={handleToggleFollow}
                                        onMouseEnter={() => setIsHoveringFollow(true)}
                                        onMouseLeave={() => setIsHoveringFollow(false)}
                                        disabled={isFollowLoading}
                                        className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all border flex items-center justify-center gap-2 ${isFollowLoading
                                            ? 'bg-white/5 border-white/10 text-zinc-400 cursor-wait'
                                            : isFollowing
                                                ? isHoveringFollow
                                                    ? 'bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30'
                                                    : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                                                : 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/10'
                                            }`}
                                    >
                                        {isFollowLoading ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : isFollowing ? (
                                            isHoveringFollow ? (
                                                <><UserMinus className="w-4 h-4" /> إلغاء المتابعة</>
                                            ) : (
                                                <><UserCheck className="w-4 h-4" /> متابَع</>
                                            )
                                        ) : (
                                            <><UserPlus className="w-4 h-4" /> متابعة</>
                                        )}
                                    </button>

                                    {/* Message Button */}
                                    <button
                                        onClick={handleMessage}
                                        disabled={isMessageLoading}
                                        className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 px-4 py-2.5 rounded-xl font-bold text-sm transition-all border border-purple-500/20 flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-purple-500/10"
                                    >
                                        {isMessageLoading ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <><MessageCircle className="w-4 h-4" /> رسالة</>
                                        )}
                                    </button>

                                    {/* Interaction Bar */}
                                    <div className="flex gap-2">
                                        <InteractionBar
                                            targetUserId={user.id}
                                        />
                                    </div>
                                </>
                            )}
                            <Link
                                href={`/dashboard?focus=${user.id}`}
                                className="bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 px-4 py-2.5 rounded-xl font-bold text-xs transition-all border border-indigo-500/20 flex items-center gap-1.5 shrink-0"
                            >
                                <MapPin className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">على الخريطة</span>
                                <span className="sm:hidden">🗺️</span>
                            </Link>
                        </>
                    )}
                </div>
            </div>

            {/* Edit Profile Modal */}
            <EditProfileModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                user={user}
            />
        </div>
    )
}

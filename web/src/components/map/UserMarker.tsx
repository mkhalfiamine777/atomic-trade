import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Marker, Popup } from 'react-leaflet'
import { getShopIcon, getCompanyIcon, getIndividualIcon } from '@/utils/mapIcons'
import { LocationUser } from "@/types"
import { User as UserIcon, MessageCircle } from 'lucide-react'
import { MapItem, getOffsetIcon } from './MapMarker'

export function UserMarker({ item, position, zIndexOffset, onStartChat, onMouseEnter, onMouseLeave }: {
    item: MapItem
    position: [number, number]
    zIndexOffset?: number
    onStartChat: (listingId: string, sellerId: string, sellerName?: string | null) => void
    onMouseEnter?: () => void
    onMouseLeave?: () => void
}) {
    const user = item.data as LocationUser
    const userType = (user.type || 'INDIVIDUAL') as string

    const baseIcon = userType === 'SHOP'
        ? getShopIcon(false, true)
        : userType === 'COMPANY'
            ? getCompanyIcon(false, true)
            : getIndividualIcon(false, true)

    const finalIcon = getOffsetIcon(baseIcon, item)
    const typeLabel = userType === 'SHOP' ? '🏪 متجر' : userType === 'COMPANY' ? '🏢 شركة' : '👤 فرد'
    const typeColor = userType === 'SHOP' ? 'text-amber-500' : userType === 'COMPANY' ? 'text-purple-400' : 'text-blue-400'

    return (
        <Marker
            key={`user-${user.id}`}
            position={position}
            icon={finalIcon}
            zIndexOffset={zIndexOffset}
            eventHandlers={{ mouseover: onMouseEnter, mouseout: onMouseLeave }}
        >
            <Popup>
                <div className="text-right min-w-[160px] p-1" dir="rtl">
                    <div className="flex items-center gap-2 mb-2">
                        {user.avatarUrl ? (
                            <Image src={user.avatarUrl} width={32} height={32} className="rounded-full object-cover border-2 border-white shadow" alt={user.name || user.username || 'مستخدم'} />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center">
                                <UserIcon size={16} className="text-zinc-400" />
                            </div>
                        )}
                        <div>
                            <h3 className="font-bold text-sm leading-tight">{user.name || user.username || 'مستخدم'}</h3>
                            <span className={`text-[10px] font-medium ${typeColor}`}>{typeLabel}</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        {user.username && (
                            <Link href={`/u/${user.username}`} onClick={(e) => e.stopPropagation()}
                                className="bg-blue-600 text-white px-3 py-1.5 rounded text-xs w-full flex justify-center items-center gap-1 hover:bg-blue-700 transition">
                                <UserIcon size={12} /> زيارة الملف
                            </Link>
                        )}
                        <button
                            className="bg-emerald-600 text-white px-3 py-1.5 rounded text-xs w-full flex justify-center items-center gap-1 hover:bg-emerald-700 transition"
                            onClick={(e) => { e.stopPropagation(); onStartChat(user.id, user.id, user.name); }}>
                            <MessageCircle size={12} /> تواصل
                        </button>
                    </div>
                </div>
            </Popup>
        </Marker>
    )
}

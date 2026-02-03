'use client'

interface ActivityItem {
    id: string
    type: string
    mediaUrl: string
    caption?: string
}

export function LiveActivityFeed({ items }: { items: ActivityItem[] }) {
    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
                <div className="text-4xl mb-2">📭</div>
                <p>لا يوجد نشاط حديث لعرضه</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-1 p-1">
            {items.map(item => (
                <div
                    key={item.id}
                    className="relative aspect-square bg-zinc-900 group cursor-pointer overflow-hidden"
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={item.mediaUrl}
                        alt={item.caption || 'Activity'}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                    />

                    {/* Overlay Icon based on Type */}
                    <div className="absolute top-2 right-2">
                        {item.type === 'VIDEO' && (
                            <span className="bg-black/50 text-white p-1 rounded text-xs">🎥</span>
                        )}
                        {item.type === 'OFFER' && (
                            <span className="bg-gx-primary text-white px-2 py-0.5 rounded text-[10px] font-bold shadow-sm">
                                عرض 🔥
                            </span>
                        )}
                    </div>

                    {/* Gradient Overlay on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                        <p className="text-white text-xs line-clamp-1">{item.caption}</p>
                    </div>
                </div>
            ))}
        </div>
    )
}

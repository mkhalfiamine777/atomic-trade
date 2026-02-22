'use client'

import { useEffect, useState, useCallback } from 'react'
import { Polygon, Popup, useMap } from 'react-leaflet'
import ngeohash from 'ngeohash'
import { toast } from 'sonner'
import { getZones, purchaseZone } from '@/actions/zones'

// Zone Interface
interface Zone {
    id: string
    geohash: string
    ownerName: string | null
    ownerId: string | null
    taxRate: number
    price: number
    bounds: [[number, number], [number, number], [number, number], [number, number]]
}

// Internal component to handle map logic safely
function ZoneGridContent({ currentUserId }: { currentUserId?: string | null }) {
    const map = useMap()
    const [zones, setZones] = useState<Zone[]>([])
    const [hoveredZone, setHoveredZone] = useState<Zone | null>(null)
    const [loading, setLoading] = useState(false)

    // Calculate Grid and Fetch Data
    const updateGrid = useCallback(async () => {
        if (!map) return

        const z = map.getZoom()

        if (z < 15) {
            // Only show at high zoom
            setZones([])
            return
        }

        const bounds = map.getBounds()
        const sw = bounds.getSouthWest()
        const ne = bounds.getNorthEast()

        // Precision 6 = ~1.2km x 0.6km
        const precision = 6
        const hashes = ngeohash.bboxes(sw.lat, sw.lng, ne.lat, ne.lng, precision)

        // Fetch real data for these hashes
        try {
            const serverZones = await getZones(hashes)
            const ownedMap = new Map(serverZones.map(z => [z.geoHash, z]))

            const newZones: Zone[] = hashes.map(hash => {
                const bbox = ngeohash.decode_bbox(hash)
                const polygon: [[number, number], [number, number], [number, number], [number, number]] = [
                    [bbox[0], bbox[1]], // SW
                    [bbox[2], bbox[1]], // NW
                    [bbox[2], bbox[3]], // NE
                    [bbox[0], bbox[3]] // SE
                ]

                const dbZone = ownedMap.get(hash)

                return {
                    id: hash,
                    geohash: hash,
                    ownerName: dbZone?.currentLord?.name || null,
                    ownerId: dbZone?.currentLordId || null,
                    taxRate: dbZone?.taxRate || 0,
                    price: 5000,
                    bounds: polygon
                }
            })
            setZones(newZones)
        } catch (error) {
            console.error("Failed to fetch zones:", error)
        }
    }, [map])

    useEffect(() => {
        if (!map) return
        map.on('moveend', updateGrid)
        updateGrid() // Initial load
        return () => {
            map.off('moveend', updateGrid)
        }
    }, [map, updateGrid])

    // Purchase Handler
    const handlePurchase = async (zone: Zone) => {
        if (!currentUserId) {
            toast.error('يجب تسجيل الدخول لشراء الإقطاعية! 🛑')
            return
        }

        setLoading(true)
        toast.loading('جاري شراء المنطقة...', { id: 'buy-zone' })

        try {
            const result = await purchaseZone(zone.geohash)
            if (result.error) {
                toast.error(result.error, { id: 'buy-zone' })
            } else {
                toast.success(`🎉 مبروك! أصبحت سيد منطقة ${zone.geohash}`, { id: 'buy-zone' })
                updateGrid() // Refresh grid
            }
        } catch (e) {
            toast.error('حدث خطأ غير متوقع', { id: 'buy-zone' })
        } finally {
            setLoading(false)
        }
    }

    if (zones.length === 0) return null

    return (
        <>
            {zones.map(zone => {
                const isOwned = !!zone.ownerId
                const isMine = zone.ownerId === currentUserId

                // 🎨 CYBERPUNK STYLING
                let color = '#334155' // Slate 700 (Default Border)
                let fillColor = '#0f172a' // Slate 900 (Default Fill)
                let fillOpacity = 0.1
                let className = 'transition-all duration-300 ease-in-out' // Base transition

                if (isMine) { // My Land takes precedence
                    color = '#10b981' // Emerald 500 (Mine)
                    fillColor = '#064e3b' // Emerald 950
                    fillOpacity = 0.5
                    className += ' drop-shadow-[0_0_10px_rgba(16,185,129,0.8)]'
                } else if (isOwned) { // Owned
                    color = '#f59e0b' // Amber 500 (Owned - Gold)
                    fillColor = '#451a03' // Amber 950
                    fillOpacity = 0.4
                    className += ' hover:drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]'
                } else {
                    // Free Zone - Neon Cyan Hover
                    color = '#0ea5e9' // Sky 500
                    fillColor = '#082f49' // Sky 950
                    fillOpacity = 0.05
                    className += ' hover:drop-shadow-[0_0_5px_rgba(14,165,233,0.5)] hover:stroke-2'
                }

                return (
                    <Polygon
                        key={zone.geohash}
                        positions={zone.bounds}
                        pathOptions={{
                            color,
                            weight: isOwned || isMine ? 2 : 1,
                            fillColor,
                            fillOpacity: hoveredZone?.id === zone.id ? 0.6 : fillOpacity,
                            className: className
                        }}
                        eventHandlers={{
                            mouseover: e => {
                                const layer = e.target
                                layer.setStyle({ weight: 3, fillOpacity: 0.6 })
                                setHoveredZone(zone)
                            },
                            mouseout: e => {
                                const layer = e.target
                                layer.setStyle({
                                    weight: isMine || isOwned ? 2 : 1,
                                    fillOpacity: isMine ? 0.5 : isOwned ? 0.4 : 0.05
                                })
                                setHoveredZone(null)
                            }
                        }}
                    >
                        <Popup autoPan={false} closeButton={false} className="cyberpunk-popup">
                            <div className="text-center min-w-[180px] bg-zinc-950/90 backdrop-blur-xl p-3 text-white border border-white/10 shadow-2xl rounded-xl ring-1 ring-white/5">
                                {/* Header Badge */}
                                <div className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-wider mb-2 border ${isMine
                                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                    : isOwned
                                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                        : 'bg-sky-500/20 text-sky-400 border-sky-500/30'
                                    }`}>
                                    {isMine ? 'مملكتك الخاصة 🏰' : isOwned ? 'منطقة محتلة ⚔️' : 'منطقة حرة 💎'}
                                </div>

                                <div className="text-2xl font-black mb-1 tracking-tighter">
                                    {isMine
                                        ? 'S E C T O R'
                                        : isOwned
                                            ? `LORD: ${zone.ownerName?.toUpperCase()}`
                                            : 'F R E E  L A N D'}
                                </div>

                                <div className="text-[10px] text-zinc-500 font-mono tracking-widest mb-4 border-b border-white/5 pb-2">
                                    DATA_HASH: {zone.geohash}
                                </div>

                                {isOwned ? (
                                    <div className="space-y-2 bg-black/40 p-3 rounded-lg border border-white/5">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-zinc-400">المالك:</span>
                                            <span className="font-bold text-amber-400 drop-shadow-sm">
                                                {zone.ownerName}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-zinc-400">الضريبة:</span>
                                            <span className="font-bold text-emerald-400 font-mono">
                                                {zone.taxRate}% 💸
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => handlePurchase(zone)}
                                        disabled={loading}
                                        className="w-full group relative overflow-hidden rounded-lg bg-indigo-600 px-4 py-2 font-bold text-white shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all hover:scale-105 hover:bg-indigo-500 hover:shadow-[0_0_30px_rgba(79,70,229,0.6)]"
                                    >
                                        <span className="relative z-10 flex items-center justify-center gap-2">
                                            {loading ? 'PROCESSING...' : `DEPLOY CLAIM 💎 ${zone.price}`}
                                        </span>
                                        <div className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
                                    </button>
                                )}
                            </div>
                        </Popup>
                    </Polygon>
                )
            })}
        </>
    )
}

export function ZoneGridLayer({ currentUserId }: { currentUserId?: string | null }) {
    // We just render the content. The MapContainer check is done by where this is placed in Map.tsx
    return <ZoneGridContent currentUserId={currentUserId} />
}

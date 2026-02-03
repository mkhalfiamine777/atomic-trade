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

export function ZoneGridLayer({ currentUserId }: { currentUserId?: string | null }) {
    const map = useMap()
    const [zones, setZones] = useState<Zone[]>([])
    const [hoveredZone, setHoveredZone] = useState<Zone | null>(null)
    const [loading, setLoading] = useState(false)

    // Calculate Grid and Fetch Data
    const updateGrid = useCallback(async () => {
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
        const serverZones = await getZones(hashes)
        const ownedMap = new Map(serverZones.map(z => [z.geoHash, z]))

        const newZones: Zone[] = hashes.map(hash => {
            const bbox = ngeohash.decode_bbox(hash)
            const polygon: [
                [number, number],
                [number, number],
                [number, number],
                [number, number]
            ] = [
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
                price: 5000, // Fixed price for now
                bounds: polygon
            }
        })

        setZones(newZones)
    }, [map])

    useEffect(() => {
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
            const result = await purchaseZone(zone.geohash, currentUserId)
            if (result.error) {
                toast.error(result.error, { id: 'buy-zone' })
            } else {
                toast.success(`🎉 مبروك! أصبحت سيد منطقة ${zone.geohash}`, { id: 'buy-zone' })
                // Play sound or effect here?
                updateGrid() // Refresh grid to show gold color
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

                // Color Logic
                let color = '#64748b' // Slate (Free)
                let fillColor = '#1e293b'
                let opacity = 0.1

                if (isOwned) {
                    color = '#fbbf24' // Gold (Owned)
                    fillColor = '#fbbf24'
                    opacity = 0.2
                }
                if (isMine) {
                    color = '#10b981' // Emerald (My Land)
                    fillColor = '#10b981'
                    opacity = 0.3
                }

                return (
                    <Polygon
                        key={zone.geohash}
                        positions={zone.bounds}
                        pathOptions={{
                            color,
                            weight: isOwned ? 2 : 1,
                            fillColor,
                            fillOpacity: hoveredZone?.id === zone.id ? 0.4 : opacity,
                            className: 'cursor-pointer transition-all duration-300'
                        }}
                        eventHandlers={{
                            mouseover: e => {
                                const layer = e.target
                                layer.setStyle({ weight: 3, fillOpacity: 0.5 })
                                setHoveredZone(zone)
                            },
                            mouseout: e => {
                                const layer = e.target
                                // Reset style
                                // We need to re-apply the logic because we don't have scope access to 'isOwned' easily in event
                                // But here in render scope we do.
                                layer.setStyle({
                                    weight: isOwned ? 2 : 1,
                                    fillOpacity: isOwned ? 0.2 : 0.1
                                })
                                setHoveredZone(null)
                            }
                        }}
                    >
                        <Popup autoPan={false} closeButton={false}>
                            <div className="text-center min-w-[150px] p-1">
                                <h4 className="font-bold text-lg mb-1">
                                    {isMine
                                        ? '🏰 مملكتي'
                                        : isOwned
                                          ? `👑 إقطاعية ${zone.ownerName}`
                                          : '🌑 منطقة حرة'}
                                </h4>
                                <div className="text-xs text-zinc-500 font-mono mb-3">
                                    {zone.geohash}
                                </div>

                                {isOwned ? (
                                    <div className="space-y-1 bg-zinc-50 p-2 rounded border">
                                        <div className="flex justify-between text-xs">
                                            <span>المالك:</span>
                                            <span className="font-bold text-indigo-600">
                                                {zone.ownerName}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span>الضريبة:</span>
                                            <span className="font-bold text-green-600">
                                                {zone.taxRate}% 💰
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => handlePurchase(zone)}
                                        disabled={loading}
                                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm font-bold py-2 rounded shadow-lg transform hover:scale-105 transition-all flex items-center justify-center gap-2"
                                    >
                                        {loading
                                            ? 'جاري التملك...'
                                            : `شراء بـ ${zone.price} درهم 💎`}
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

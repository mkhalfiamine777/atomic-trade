'use client'

import { useState, useRef, useEffect, Fragment as M_Fragment } from 'react'
import { Marker, useMap, FeatureGroup } from 'react-leaflet'
import L from 'leaflet'

import { getClusterIcon, getCloseIcon } from '@/utils/mapIcons'

interface SmartMarkerGroupProps<T> {
    center: [number, number]
    items: T[]
    renderMarker: (item: T, position: [number, number], index: number) => React.ReactNode
    forceExpanded?: boolean
}

export function SmartMarkerGroup<T>({
    center,
    items,
    renderMarker,
    forceExpanded = false
}: SmartMarkerGroupProps<T>) {
    const [isExpanded, setIsExpanded] = useState(false)
    const map = useMap()
    const closeTimer = useRef<NodeJS.Timeout | null>(null)

    // Sync with forceExpanded prop (Filter Trigger)
    useEffect(() => {
        // Safety: Only auto-expand if item count is reasonable (e.g., <= 12) to avoid chaos
        if (forceExpanded && items.length <= 12) {
            setIsExpanded(prev => (!prev ? true : prev))
        } else if (!forceExpanded) {
            // Only collapse if we are explicitly turning OFF forceExpanded (Reset)
            // But we should allow manual hover to still work.
            // If we are in "Normal Mode" (forceExpanded=false), we start collapsed.
            setIsExpanded(prev => (prev ? false : prev))
        }
    }, [forceExpanded, items.length])

    // Handlers
    const handleMouseEnter = () => {
        if (closeTimer.current) {
            clearTimeout(closeTimer.current)
            closeTimer.current = null
        }
        setIsExpanded(true)
    }

    const handleMouseLeave = () => {
        closeTimer.current = setTimeout(() => {
            setIsExpanded(false)
        }, 500) // 500ms delay before collapsing
    }

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (closeTimer.current) clearTimeout(closeTimer.current)
        }
    }, [])

    // Cluster Icon (shows count when collapsed)
    const clusterIcon = getClusterIcon(items.length)

    // Calculate Spiderfy Positions - Now 3x farther for better visibility
    const getSpiderPosition = (index: number, total: number): [number, number] => {
        if (!isExpanded && total > 1) return center // Collapsed
        if (total === 1) return center

        const radius = 0.0006 // Spread radius (~60 meters) - 3x original
        const angle = (index / total) * Math.PI * 2 // Equal distribution in circle

        return [center[0] + Math.cos(angle) * radius, center[1] + Math.sin(angle) * radius]
    }

    if (items.length === 1) {
        return <>{renderMarker(items[0], center, 0)}</>
    }

    return (
        <>
            {/* The Trigger/Cluster Marker (Visible when collapsed) */}
            {!isExpanded && (
                <Marker
                    position={center}
                    icon={clusterIcon}
                    eventHandlers={{
                        mouseover: handleMouseEnter,
                        mouseout: handleMouseLeave,
                        click: () => {
                            handleMouseEnter()
                            const currentZoom = map.getZoom()
                            if (currentZoom < 18) map.flyTo(center, 18)
                        }
                    }}
                />
            )}

            {/* The Expanded Markers (Spider Legs) */}
            {isExpanded && (
                <FeatureGroup
                    eventHandlers={{
                        mouseover: handleMouseEnter,
                        mouseout: handleMouseLeave
                    }}
                >
                    {/* Render Items */}
                    {items.map((item, index) => (
                        <M_Fragment key={index}>
                            {renderMarker(item, getSpiderPosition(index, items.length), index)}
                        </M_Fragment>
                    ))}

                    {/* Center "Close" Button (Optional, to collapse manually) */}
                    <Marker
                        position={center}
                        icon={getCloseIcon()}
                        eventHandlers={{
                            click: e => {
                                L.DomEvent.stopPropagation(e)
                                setIsExpanded(false)
                            }
                        }}
                    />
                </FeatureGroup>
            )}
        </>
    )
}

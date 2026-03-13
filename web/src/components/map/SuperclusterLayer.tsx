'use client';

import { useEffect, useState, useMemo } from 'react';
import { useMap, Marker } from 'react-leaflet';
import useSupercluster from 'use-supercluster';
import { MapMarker, MapItem } from './MapMarker';
import { getSmartClusterIcon } from '@/utils/mapIcons';
import { LocationUser } from '@/types';

export function SuperclusterLayer({
    items,
    onStartChat,
    onViewStory,
    onMouseEnter,
    onMouseLeave
}: {
    items: MapItem[];
    onStartChat: (listingId: string, sellerId: string, sellerName?: string | null) => void;
    onViewStory?: (story: any) => void;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
}) {
    const map = useMap();
    const [bounds, setBounds] = useState<[number, number, number, number] | undefined>(undefined);
    const [zoom, setZoom] = useState(16);

    const updateMap = () => {
        const b = map.getBounds();
        setBounds([
            b.getSouthWest().lng,
            b.getSouthWest().lat,
            b.getNorthEast().lng,
            b.getNorthEast().lat
        ]);
        setZoom(map.getZoom());
    };

    useEffect(() => {
        updateMap();
        map.on('move', updateMap);
        map.on('zoom', updateMap);
        return () => {
            map.off('move', updateMap);
            map.off('zoom', updateMap);
        };
    }, [map]);

    const points = useMemo(() => {
        return items.map(item => {
            // Determine if this item belongs to a Shop for priority styling
            let isShop = false;
            let zIndexPriority = 800; // Default low priority for normal individuals

            if (item.type === 'USER') {
                const user = item.data as unknown as LocationUser;
                isShop = user.type === 'SHOP';
            } else if (item.data && 'seller' in item.data) {
                const sellerInfo = (item.data as any).seller;
                if (sellerInfo && sellerInfo.type === 'SHOP') {
                    isShop = true;
                }
            }

            // Assign Z-Index Priority Mode (1. Shop, 2. Company, 3. Item, 4. User)
            if (isShop) {
                zIndexPriority = 1000;
            } else if (item.type === 'LISTING' || item.type === 'STORY') {
                zIndexPriority = 900;
            }

            return {
                type: 'Feature' as const,
                properties: {
                    cluster: false,
                    itemId: item.id,
                    itemData: item,
                    isShop,
                    zIndexPriority
                },
                geometry: {
                    type: 'Point' as const,
                    coordinates: [
                        item.lng, // longitude first in GeoJSON
                        item.lat
                    ]
                }
            };
        });
    }, [items]);

    const { clusters, supercluster } = useSupercluster({
        points,
        bounds,
        zoom,
        options: { radius: 60, maxZoom: 22 } // maxZoom means past 22 it will spiderfy/break apart natively
    });

    if (!bounds) return null;

    return (
        <>
            {clusters.map((cluster) => {
                const [longitude, latitude] = cluster.geometry.coordinates;
                const { cluster: isCluster, point_count } = cluster.properties as any;
                const clusterId = cluster.id as number;

                if (isCluster) {
                    const leaves = supercluster?.getLeaves(clusterId, Infinity) || [];

                    // Spiderfy overlapping items when max zoom is reached
                    if (zoom >= 18) {
                        return leaves.map((leaf, index) => {
                            const total = leaves.length;
                            let spiderX = 0;
                            let spiderY = 0;

                            // Spread out in a circle or spiral
                            if (total > 1) {
                                if (total <= 8) {
                                    const angle = (index / total) * (2 * Math.PI) - (Math.PI / 2);
                                    const radius = 50; // Spread out enough pixels
                                    spiderX = Math.cos(angle) * radius;
                                    spiderY = Math.sin(angle) * radius;
                                } else {
                                    const angle = 0.6 * index;
                                    const radius = 30 + (5 * index);
                                    spiderX = Math.cos(angle) * radius;
                                    spiderY = Math.sin(angle) * radius;
                                }
                            }

                            const itemWithSpiderOffset = {
                                ...leaf.properties.itemData,
                                offsetX: spiderX,
                                offsetY: spiderY
                            };

                            return (
                                <MapMarker
                                    key={`spider-${leaf.properties.itemId}`}
                                    item={itemWithSpiderOffset}
                                    position={[latitude, longitude]} // Use cluster center
                                    onStartChat={onStartChat}
                                    onViewStory={onViewStory}
                                    onMouseEnter={onMouseEnter}
                                    onMouseLeave={onMouseLeave}
                                />
                            );
                        });
                    }

                    const containsShop = leaves.some(l => l.properties.isShop);

                    return (
                        <Marker
                            key={`cluster-${clusterId}`}
                            position={[latitude, longitude]}
                            icon={getSmartClusterIcon(point_count ?? leaves.length, containsShop)}
                            eventHandlers={{
                                click: () => {
                                    const expansionZoom = Math.min(
                                        supercluster?.getClusterExpansionZoom(clusterId) || 18,
                                        18 // Max zoom limit
                                    );
                                    map.setView([latitude, longitude], expansionZoom, { animate: true });
                                }
                            }}
                            zIndexOffset={containsShop ? 1000 : 800} // Prioritize shops
                        />
                    );
                }

                // Render single unclustered item
                return (
                    <MapMarker
                        key={cluster.properties.itemId}
                        item={cluster.properties.itemData}
                        position={[latitude, longitude]}
                        onStartChat={onStartChat}
                        onViewStory={onViewStory}
                        onMouseEnter={onMouseEnter}
                        onMouseLeave={onMouseLeave}
                    />
                );
            })}
        </>
    );
}

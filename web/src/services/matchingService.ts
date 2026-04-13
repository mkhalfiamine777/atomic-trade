import { db } from '@/lib/db'
import { ListingType } from '@prisma/client'

// Haversine formula to calculate distance between two coordinates in kilometers
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export async function runMatchingEngine(
    newListingId: string,
    sellerId: string,
    title: string,
    type: ListingType,
    category: string,
    subcategory: string
) {
    try {
        const creator = await db.user.findUnique({
            where: { id: sellerId },
            select: { id: true, type: true, latitude: true, longitude: true, name: true }
        });

        if (!creator || !creator.latitude || !creator.longitude) return;

        // Dynamically import Socket Engine 
        const { getIO } = await import('@/lib/socketEngine');
        const io = getIO();

        if (!io) return;

        // Constants for Geo-filtering (As per Bi-Directional requirements)
        const SHOP_RADIUS_KM = 5;
        const USER_RADIUS_KM = 0.3; // 300 meters

        const isProduct = type === ListingType.PRODUCT;

        // ==========================================
        // 🛍️ CORE MATCHING ENGINE (Products <-> Requests)
        // ==========================================
        const counterpartType = type === ListingType.PRODUCT ? ListingType.REQUEST : ListingType.PRODUCT;

        const existingMatches = await db.listing.findMany({
            where: {
                category: category,
                subcategory: subcategory,
                type: counterpartType,
                isSold: false,
                sellerId: { not: sellerId }
            },
            include: {
                seller: { select: { id: true, type: true, latitude: true, longitude: true } }
            }
        });

        // Filter existing matches based on the Golden (5km) vs Neon (500m) rule
        const validMatches = existingMatches.filter(match => {
            const target = match.seller;
            if (!target.latitude || !target.longitude) return false;

            const distance = getDistanceFromLatLonInKm(
                creator.latitude!, creator.longitude!,
                target.latitude, target.longitude
            );

            // Rule: If ANY of the two parties is a SHOP, the radius is 5km (Shop's Radar).
            // If BOTH are INDIVIDUALs, the radius is 500m.
            const maxDistance = (creator.type === 'SHOP' || target.type === 'SHOP') ? SHOP_RADIUS_KM : USER_RADIUS_KM;

            return distance <= maxDistance;
        });

        if (validMatches.length > 0) {
            console.log(`[Geo-Match Engine] 🎯 Found ${validMatches.length} matches within allowed radius!`);

            // Notify Creator
            io.to(`user:${sellerId}`).emit('match_found', {
                type: isProduct ? 'buyers_found' : 'sellers_found',
                message: isProduct
                    ? `🎯 ${validMatches.length} شخص يبحث عن "${title}" بالقرب منك!`
                    : `🎯 ${validMatches.length} نتيجة سابقة تطابق "${title}" بالقرب منك!`,
                matchCount: validMatches.length,
                category,
                subcategory,
                listingId: newListingId,
                timestamp: new Date().toISOString()
            });

            // Notify matched counterparts
            for (const match of validMatches) {
                io.to(`user:${match.sellerId}`).emit('match_found', {
                    type: isProduct ? 'new_product' : 'new_request',
                    message: isProduct
                        ? `🛍️ بائع جديد يعرض "${title}" بالقرب منك!`
                        : `📣 شخص بالقرب منك يبحث عن "${match.title}"!`,
                    category,
                    subcategory,
                    listingId: isProduct ? newListingId : match.id,
                    timestamp: new Date().toISOString()
                });
            }
        }

        // ==========================================
        // 🔮 REVERSE MARKET ALERTING (Proactive Shop Targeting)
        // If an INDIVIDUAL posts a REQUEST, proactively alert nearby SHOPs 
        // that match the category, EVEN IF the shop hasn't posted a product yet!
        // ==========================================
        if (type === ListingType.REQUEST && creator.type === 'INDIVIDUAL') {
            const potentialShops = await db.user.findMany({
                where: {
                    type: 'SHOP',
                    shopCategory: category,
                    latitude: { not: null },
                    longitude: { not: null }
                },
                select: { id: true, name: true, latitude: true, longitude: true }
            });

            const nearbyShops = potentialShops.filter(shop => {
                const distance = getDistanceFromLatLonInKm(
                    creator.latitude!, creator.longitude!,
                    shop.latitude!, shop.longitude!
                );
                return distance <= SHOP_RADIUS_KM; // Shop acts as a 5km radar!
            });

            // We want to avoid double-notifying shops that already had a matching product.
            const alreadyNotifiedShopIds = new Set(
                validMatches.filter(m => m.seller.type === 'SHOP').map(m => m.sellerId)
            );

            let newAlertsCount = 0;
            for (const shop of nearbyShops) {
                if (!alreadyNotifiedShopIds.has(shop.id)) {
                    io.to(`user:${shop.id}`).emit('match_found', {
                        type: 'reverse_market_alert',
                        message: `🚨 زبون بالقرب منك يطلب "${title}"! أرسل له عرضك الآن قبل المنافسين.`,
                        category,
                        subcategory,
                        listingId: newListingId,
                        timestamp: new Date().toISOString()
                    });
                    newAlertsCount++;
                }
            }
            if (newAlertsCount > 0) {
                console.log(`[Reverse Market] 🎯 Proactively alerted ${newAlertsCount} additional shops within 5km!`);
            }
        }

    } catch (error) {
        console.error('[Matching Engine Error]:', error);
    }
}

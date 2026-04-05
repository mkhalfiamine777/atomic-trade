'use server'

import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { ListingType } from '@prisma/client'

import { createListingSchema } from '@/lib/schemas'
import { getOrbitLocation } from '@/utils/geo'

/**
 * Creates a new Listing (Product or Request)
 * Performs input validation via Zod, checks authentication, checks for existence of required media.
 * Also asynchronously triggers the background matching engine.
 *
 * @param formData - The FormData containing 'title', 'price', 'description', 'type', 'category', 'subcategory', 'imageUrl', 'lat', 'lng'.
 * @returns Object with `success: true` or `{ error: string }` if validation or creation failed.
 */
export async function createListing(formData: FormData) {
    // 1. Auth Check
    const userId = (await cookies()).get('user_id')?.value
    if (!userId) {
        return { error: 'Unauthorized' }
    }

    // 2. Data Extraction & Validation
    const rawData = {
        title: formData.get('title'),
        price: formData.get('price'),
        description: formData.get('description'),
        type: formData.get('type') || ListingType.PRODUCT,
        category: formData.get('category'),
        subcategory: formData.get('subcategory'),
        imageUrl: formData.get('imageUrl'),
        latitude: formData.get('lat'),
        longitude: formData.get('lng'),
    }

    const validatedFields = createListingSchema.safeParse(rawData)

    if (!validatedFields.success) {
        const errors = validatedFields.error.flatten().fieldErrors
        console.error("❌ Validation Failed in createListing:", { rawData, errors })
        return { error: errors.title?.[0] || errors.price?.[0] || "بيانات غير صالحة" }
    }

    const { title, price, description, type, category, subcategory, imageUrl, latitude, longitude } = validatedFields.data

    // 3. Logic: Logic requires image for Product but not Request
    if (type === ListingType.PRODUCT && !imageUrl) {
        return { error: 'يجب إضافة صورة للمنتج! 📸' }
    }

    // Ensure location is present (schema makes them optional, but logic might require them)
    if (!latitude || !longitude) {
        return { error: 'الموقع مطلوب' }
    }

    try {
        // 4. Anchor Rule Logic: Check user type
        const user = await db.user.findUnique({ where: { id: userId }, select: { type: true, latitude: true, longitude: true } });
        if (!user) return { error: 'User not found' };

        let finalLat = latitude;
        let finalLng = longitude;
        let shouldUpdateUserGPS = true;

        if (user.type === 'SHOP' || user.type === 'COMPANY') {
            if (user.latitude && user.longitude) {
                // ⚓ THE ANCHOR RULE + ORBIT RULE:
                // Force the activity to spawn around the shop's physical location (10 to 20 meters away)
                const orbit = getOrbitLocation(user.latitude, user.longitude)
                finalLat = orbit.lat;
                finalLng = orbit.lng;
                shouldUpdateUserGPS = false; // Prevent moving the shop to the owner's laptop/home GPS
            }
        }

        // 5. Create Listing in DB AND Update User's Sync Location (if INDIVIDUAL or initial SHOP setup)
        const operations: any[] = [
            db.listing.create({
                data: {
                    title,
                    price,
                    description: description || '',
                    images: imageUrl || '', // Saved URL
                    type,
                    category: category,
                    subcategory: subcategory,
                    latitude: finalLat,
                    longitude: finalLng,
                    sellerId: userId
                }
            })
        ];

        if (shouldUpdateUserGPS) {
            operations.push(
                db.user.update({
                    where: { id: userId },
                    data: { latitude: finalLat, longitude: finalLng }
                })
            );
        }

        const [newListing] = await db.$transaction(operations);

        // 5. Smart Matching Engine 🎯 (Extracted to Service)
        if (category && subcategory) {
            import('@/services/matchingService').then(({ runMatchingEngine }) => {
                // Run matching in the background, don't await so it doesn't block the response
                runMatchingEngine(newListing.id, userId, title, type, category, subcategory);
            }).catch(e => console.error("Failed to dynamically import matching service", e));
        }

        // 6. Update UI
        revalidatePath('/dashboard')
        return { success: true }
    } catch (error: unknown) {
        console.error('Market Error:', error instanceof Error ? error.message : error)
        return { error: 'فشل إنشاء العرض، يرجى المحاولة لاحقاً.' }
    }
}

/**
 * Retrieves a paginated list of market listings in descending order of creation.
 * Returns only safe user data (avoids leaking passwords or phone numbers).
 *
 * @param limit - Optional maximum number of items to return (default: 50)
 * @param cursor - Optional ID from the last listing item for backwards pagination
 * @returns Array of Listing objects including Seller data.
 */
export async function getListings(limit: number = 50, cursor?: string) {
    try {
        const listings = await db.listing.findMany({
            take: limit,
            ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
            where: { isSold: false },
            orderBy: { createdAt: 'desc' },
            include: {
                seller: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        avatarUrl: true,
                        // ⛔ phone removed — prevent public leak
                        reputationScore: true, // 🛡️ Trust Score
                        isVerified: true, // ✅ Verified Badge
                        type: true, // 👤 INDIVIDUAL, 🏪 SHOP
                        shopCategory: true, // 🏷️ Category
                        // ⛔ latitude/longitude removed — prevent public tracking of sellers
                    }
                }
            }
        })

        return listings
    } catch (_error) {
        return []
    }
}

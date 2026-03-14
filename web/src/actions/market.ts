'use server'

import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { ListingType } from '@prisma/client'

import { createListingSchema } from '@/lib/schemas'

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
        // 4. Create Listing in DB
        const newListing = await db.listing.create({
            data: {
                title,
                price,
                description: description || '',
                images: imageUrl || '', // Saved URL
                type,
                category: category,
                subcategory: subcategory,
                latitude,
                longitude,
                sellerId: userId
            }
        })

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

export async function getListings() {
    try {
        const listings = await db.listing.findMany({
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

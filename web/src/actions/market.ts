'use server'

import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { ListingType } from '@prisma/client'

import { createListingSchema } from '@/lib/schemas'

export async function createListing(formData: FormData) {
    console.log("🚀 Create Listing Action Triggered!")
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
        imageUrl: formData.get('imageUrl'),
        latitude: formData.get('lat'),
        longitude: formData.get('lng'),
    }

    const validatedFields = createListingSchema.safeParse(rawData)

    if (!validatedFields.success) {
        const errors = validatedFields.error.flatten().fieldErrors
        return { error: errors.title?.[0] || errors.price?.[0] || "بيانات غير صالحة" }
    }

    const { title, price, description, type, category, imageUrl, latitude, longitude } = validatedFields.data

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
        await db.listing.create({
            data: {
                title,
                price,
                description: description || '',
                images: imageUrl || '', // Saved URL
                type,
                category: category,
                latitude,
                longitude,
                sellerId: userId
            }
        })

        // 5. Update UI
        revalidatePath('/dashboard')
        return { success: true }
    } catch (error: unknown) {
        const errDetails = error instanceof Error ? {
            message: error.message,
            stack: error.stack
        } : { message: String(error) }
        console.error('Market Error Details:', errDetails)
        return { error: 'فشل إنشاء العرض' }
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
                        phone: true,
                        reputationScore: true, // 🛡️ Trust Score
                        isVerified: true, // ✅ Verified Badge
                        type: true, // 👤 INDIVIDUAL, 🏪 SHOP
                        shopCategory: true, // 🏷️ Category
                        latitude: true, // 📍 Fetch Seller Location
                        longitude: true
                    }
                }
            }
        })

        // Live Location Overwrite for INDIVIDUALS 🚶‍♂️
        return listings.map(l => {
            if (l.seller.type === 'INDIVIDUAL' && l.seller.latitude && l.seller.longitude) {
                return {
                    ...l,
                    latitude: l.seller.latitude,
                    longitude: l.seller.longitude
                }
            }
            return l
        })
    } catch (_error) {
        return []
    }
}

'use server'

import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function createListing(formData: FormData) {
    console.log("🚀 Create Listing Action Triggered!")
    // 1. Auth Check
    const userId = (await cookies()).get('user_id')?.value
    if (!userId) {
        return { error: 'Unauthorized' }
    }

    // 2. Data Extraction
    const title = formData.get('title') as string
    const price = parseFloat(formData.get('price') as string)
    const description = formData.get('description') as string
    const type = (formData.get('type') as string) || 'PRODUCT' // PRODUCT or REQUEST
    const imageUrl = (formData.get('imageUrl') as string) || '' // 📸 Image URL or empty string

    // Geo-Location (Sent from Client)
    const lat = parseFloat(formData.get('lat') as string)
    const lng = parseFloat(formData.get('lng') as string)

    // Validation
    if (!title || isNaN(price) || !lat || !lng) {
        return { error: 'Missing required fields' }
    }

    // If Logic requires image for Product but not Request
    if (type === 'PRODUCT' && !imageUrl) {
        return { error: 'يجب إضافة صورة للمنتج! 📸' }
    }

    try {
        // 4. Create Listing in DB
        await db.listing.create({
            data: {
                title,
                price,
                description: description || '',
                images: imageUrl, // Saved URL
                type,
                latitude: lat,
                longitude: lng,
                sellerId: userId
            }
        })

        // 5. Update UI
        revalidatePath('/dashboard')
        return { success: true }
    } catch (error: any) {
        console.error('Market Error Details:', {
            message: error.message,
            code: error.code,
            meta: error.meta,
            stack: error.stack
        })
        return { error: 'Failed to create listing' }
    }
}

export async function getListings() {
    try {
        const listings = await db.listing.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                seller: {
                    select: {
                        name: true,
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

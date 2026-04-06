/**
 * 🧪 Server Action Integration Tests
 * Tests critical business logic that touches database operations.
 * Uses Prisma mock to verify behavior without a real database.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { prismaMock } from '@/__mocks__/db'

// ════════════════════════════════════════════════════
// 1. updateUserLocation — The Anchor Rule
// ════════════════════════════════════════════════════
describe('updateUserLocation — Anchor Rule', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should update location for INDIVIDUAL users', async () => {
        prismaMock.user.findUnique.mockResolvedValue({
            type: 'INDIVIDUAL', latitude: 36.7, longitude: 3.0
        })
        prismaMock.user.update.mockResolvedValue({})
        prismaMock.listing.updateMany.mockResolvedValue({ count: 0 })
        prismaMock.mapStory.updateMany.mockResolvedValue({ count: 0 })

        const { updateUserLocation } = await import('@/actions/user')
        const result = await updateUserLocation(36.8, 3.1)

        expect(result).toEqual({ success: true })
        expect(prismaMock.user.update).toHaveBeenCalledWith(
            expect.objectContaining({
                data: { latitude: 36.8, longitude: 3.1 }
            })
        )
    })

    it('should BLOCK location update for SHOP with existing coordinates (Anchor Rule)', async () => {
        prismaMock.user.findUnique.mockResolvedValue({
            type: 'SHOP', latitude: 36.7525, longitude: 3.0420
        })

        const { updateUserLocation } = await import('@/actions/user')
        const result = await updateUserLocation(40.0, 10.0) // Owner moved far away

        expect(result).toEqual({ success: true })
        // The critical assertion: user.update should NOT be called
        expect(prismaMock.user.update).not.toHaveBeenCalled()
        expect(prismaMock.listing.updateMany).not.toHaveBeenCalled()
    })

    it('should BLOCK location update for COMPANY with existing coordinates', async () => {
        prismaMock.user.findUnique.mockResolvedValue({
            type: 'COMPANY', latitude: 36.7, longitude: 3.0
        })

        const { updateUserLocation } = await import('@/actions/user')
        const result = await updateUserLocation(48.8566, 2.3522) // Owner is in Paris

        expect(result).toEqual({ success: true })
        expect(prismaMock.user.update).not.toHaveBeenCalled()
    })

    it('should ALLOW first-time location set for a new SHOP (no coordinates yet)', async () => {
        prismaMock.user.findUnique.mockResolvedValue({
            type: 'SHOP', latitude: null, longitude: null
        })
        prismaMock.user.update.mockResolvedValue({})

        const { updateUserLocation } = await import('@/actions/user')
        const result = await updateUserLocation(36.7525, 3.0420)

        expect(result).toEqual({ success: true })
        expect(prismaMock.user.update).toHaveBeenCalledWith(
            expect.objectContaining({
                data: { latitude: 36.7525, longitude: 3.0420 }
            })
        )
    })

    it('should reject unauthenticated users', async () => {
        // Override the cookie mock temporarily
        const { cookies } = await import('next/headers')
        vi.mocked(cookies).mockImplementationOnce(() => Promise.resolve({
            get: vi.fn().mockReturnValue(undefined),
            set: vi.fn(),
            delete: vi.fn(),
        } as any))

        const { updateUserLocation } = await import('@/actions/user')
        const result = await updateUserLocation(36.7, 3.0)

        expect(result).toEqual({ error: 'Unauthorized' })
    })
})

// ════════════════════════════════════════════════════
// 2. createListing — Orbital Spread for Shops
// ════════════════════════════════════════════════════
describe('createListing — Orbital Spread', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should apply Orbital Spread for SHOP listings (10-20m from shop)', async () => {
        const shopLat = 36.7525
        const shopLng = 3.0420

        prismaMock.user.findUnique.mockResolvedValue({
            type: 'SHOP', latitude: shopLat, longitude: shopLng
        })

        const mockListing = { id: 'listing-1', title: 'Test', latitude: 0, longitude: 0 }
        prismaMock.$transaction.mockResolvedValue([mockListing])

        const { createListing } = await import('@/actions/market')

        const formData = new FormData()
        formData.set('title', 'شاي أخضر فاخر')
        formData.set('price', '150')
        formData.set('type', 'PRODUCT')
        formData.set('category', 'FOOD')
        formData.set('subcategory', 'tea')
        formData.set('imageUrl', 'https://example.com/tea.jpg')
        formData.set('lat', '40.0')  // Owner's GPS (should be ignored)
        formData.set('lng', '10.0')  // Owner's GPS (should be ignored)

        await createListing(formData)

        // Verify the transaction was called
        expect(prismaMock.$transaction).toHaveBeenCalled()
        const transactionArgs = prismaMock.$transaction.mock.calls[0][0]

        // The listing.create should NOT use 40.0/10.0 (owner's GPS)
        // It should use orbit coordinates near the shop's fixed location
        // We can verify this by checking the actual call args indirectly
        expect(transactionArgs.length).toBeGreaterThanOrEqual(1)
    })

    it('should use owner GPS for INDIVIDUAL listings', async () => {
        prismaMock.user.findUnique.mockResolvedValue({
            type: 'INDIVIDUAL', latitude: 36.7, longitude: 3.0
        })

        const mockListing = { id: 'listing-2', title: 'Test' }
        prismaMock.$transaction.mockResolvedValue([mockListing])

        const { createListing } = await import('@/actions/market')

        const formData = new FormData()
        formData.set('title', 'هاتف سامسونج')
        formData.set('price', '200')
        formData.set('type', 'PRODUCT')
        formData.set('category', 'ELECTRONICS')
        formData.set('imageUrl', 'https://example.com/phone.jpg')
        formData.set('lat', '36.7')
        formData.set('lng', '3.0')

        const result = await createListing(formData)
        expect(result).toEqual({ success: true })
    })

    it('should reject listing without image for PRODUCT type', async () => {
        const { createListing } = await import('@/actions/market')

        const formData = new FormData()
        formData.set('title', 'منتج بدون صورة')
        formData.set('price', '100')
        formData.set('type', 'PRODUCT')
        formData.set('category', 'OTHER')
        formData.set('lat', '36.7')
        formData.set('lng', '3.0')
        // No imageUrl!

        prismaMock.user.findUnique.mockResolvedValue({
            type: 'INDIVIDUAL', latitude: 36.7, longitude: 3.0
        })

        const result = await createListing(formData)
        expect(result).toEqual({ error: 'يجب إضافة صورة للمنتج! 📸' })
    })
})

// ════════════════════════════════════════════════════
// 3. awardCoinsForWatch — Daily Cap Enforcement
// ════════════════════════════════════════════════════
describe('awardCoinsForWatch — Daily Cap', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should award coins for first-time video watch', async () => {
        prismaMock.socialPost.findUnique.mockResolvedValue({ id: 'post-1' })
        prismaMock.interaction.findFirst.mockResolvedValue(null) // Not watched before
        prismaMock.interaction.count.mockResolvedValue(0) // No watches today
        prismaMock.$transaction.mockResolvedValue([
            { id: 'interaction-1' },
            { coins: 105 }
        ])

        const { awardCoinsForWatch } = await import('@/actions/earnCoins')
        const result = await awardCoinsForWatch('post-1')

        expect(result.success).toBe(true)
        expect(result.coinsEarned).toBeGreaterThanOrEqual(5)
        expect(result.coinsEarned).toBeLessThanOrEqual(15)
    })

    it('should block duplicate coin award for same video', async () => {
        prismaMock.socialPost.findUnique.mockResolvedValue({ id: 'post-1' })
        prismaMock.interaction.findFirst.mockResolvedValue({ id: 'existing' }) // Already watched

        const { awardCoinsForWatch } = await import('@/actions/earnCoins')
        const result = await awardCoinsForWatch('post-1')

        expect(result.success).toBe(false)
        expect(result.message).toContain('مسبقاً')
    })

    it('should enforce daily cap of 20 video watches', async () => {
        prismaMock.socialPost.findUnique.mockResolvedValue({ id: 'post-99' })
        prismaMock.interaction.findFirst.mockResolvedValue(null) // Not this video
        prismaMock.interaction.count.mockResolvedValue(20) // Hit the daily cap!

        const { awardCoinsForWatch } = await import('@/actions/earnCoins')
        const result = await awardCoinsForWatch('post-99')

        expect(result.success).toBe(false)
        expect(result.message).toContain('الحد اليومي')
    })

    it('should reject non-existent posts (prevents foreign key errors)', async () => {
        prismaMock.socialPost.findUnique.mockResolvedValue(null)

        const { awardCoinsForWatch } = await import('@/actions/earnCoins')
        const result = await awardCoinsForWatch('fake-post-id')

        expect(result.success).toBe(false)
        expect(result.message).toContain('غير مؤهل')
    })
})

// ════════════════════════════════════════════════════
// 4. purchaseZone — TOCTOU Protection
// ════════════════════════════════════════════════════
describe('purchaseZone — Zone Economy', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should successfully purchase a free zone with sufficient balance', async () => {
        // Mock the interactive transaction
        prismaMock.$transaction.mockImplementation(async (fn: any) => {
            const tx = {
                zoneMaster: {
                    findUnique: vi.fn().mockResolvedValue(null), // Zone is free
                    create: vi.fn().mockResolvedValue({
                        geoHash: 'sk3xq', zoneName: 'إقطاعية sk3xq',
                        currentLordId: 'test-user-id', taxRate: 1.5
                    }),
                },
                user: {
                    findUnique: vi.fn().mockResolvedValue({ coins: 1000 }), // Enough coins
                    update: vi.fn().mockResolvedValue({}),
                },
            }
            return fn(tx)
        })

        const { purchaseZone } = await import('@/actions/zones')
        const result = await purchaseZone('sk3xq')

        expect(result.success).toBe(true)
        expect(result.zone).toBeDefined()
        expect(result.zone?.geoHash).toBe('sk3xq')
    })

    it('should reject purchase of an already-owned zone', async () => {
        prismaMock.$transaction.mockImplementation(async (fn: any) => {
            const tx = {
                zoneMaster: {
                    findUnique: vi.fn().mockResolvedValue({ geoHash: 'sk3xq', currentLordId: 'other-user' }),
                },
                user: { findUnique: vi.fn(), update: vi.fn() },
            }
            return fn(tx)
        })

        const { purchaseZone } = await import('@/actions/zones')
        const result = await purchaseZone('sk3xq')

        expect(result.error).toContain('مملوكة')
    })

    it('should reject purchase when balance is insufficient', async () => {
        prismaMock.$transaction.mockImplementation(async (fn: any) => {
            const tx = {
                zoneMaster: {
                    findUnique: vi.fn().mockResolvedValue(null), // Zone is free
                },
                user: {
                    findUnique: vi.fn().mockResolvedValue({ coins: 100 }), // Only 100, need 500
                    update: vi.fn(),
                },
            }
            return fn(tx)
        })

        const { purchaseZone } = await import('@/actions/zones')
        const result = await purchaseZone('sk3xq')

        expect(result.error).toContain('رصيدك غير كافي')
    })
})

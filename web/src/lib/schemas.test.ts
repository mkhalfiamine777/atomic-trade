import { describe, it, expect } from 'vitest'
import { loginSchema, signupSchema, createListingSchema } from '@/lib/schemas'
import { ListingType } from '@prisma/client'

describe('Zod Validation Schemas', () => {

    describe('loginSchema', () => {
        it('should pass with valid credentials', () => {
            const result = loginSchema.safeParse({
                phone: '12345678',
                password: 'password123'
            })
            expect(result.success).toBe(true)
        })

        it('should fail with short phone number', () => {
            const result = loginSchema.safeParse({
                phone: '1234567',
                password: 'password123'
            })
            expect(result.success).toBe(false)
        })
    })

    describe('signupSchema', () => {
        it('should pass with valid signup data', () => {
            const result = signupSchema.safeParse({
                name: 'Ahmed',
                phone: '55555555',
                password: 'securepassword',
                type: 'INDIVIDUAL'
            })
            expect(result.success).toBe(true)
        })

        it('should fail if name is too short', () => {
            const result = signupSchema.safeParse({
                name: 'A',
                phone: '55555555',
                password: 'securepassword',
                type: 'INDIVIDUAL'
            })
            expect(result.success).toBe(false)
        })
    })

    describe('createListingSchema', () => {
        it('should pass for a valid product listing', () => {
            const result = createListingSchema.safeParse({
                title: 'Playstation 5',
                price: '150',
                description: 'Used PS5 in good condition',
                type: ListingType.PRODUCT,
                category: 'Gaming',
                latitude: '24.7136',
                longitude: '46.6753'
            })
            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data.price).toBe(150) // coerced to number
                expect(result.data.latitude).toBe(24.7136)
            }
        })

        it('should fail if price is negative', () => {
            const result = createListingSchema.safeParse({
                title: 'Playstation 5',
                price: '-50',
                type: ListingType.PRODUCT,
                category: 'Gaming',
                latitude: '24.7136',
                longitude: '46.6753'
            })
            expect(result.success).toBe(false)
        })
    })
})

import { describe, it, expect, vi, afterEach } from 'vitest'
import { getOrbitLocation } from '@/utils/geo'

describe('getOrbitLocation (Orbital Spread)', () => {
    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('should return coordinates different from the center', () => {
        const result = getOrbitLocation(36.7525, 3.0420)
        expect(result.lat).not.toBe(36.7525)
        expect(result.lng).not.toBe(3.0420)
    })

    it('should return coordinates within 10-20 meter radius', () => {
        // Run 100 times to validate the statistical guarantee
        for (let i = 0; i < 100; i++) {
            const center = { lat: 36.7525, lng: 3.0420 }
            const result = getOrbitLocation(center.lat, center.lng)

            // Haversine-lite: approximate distance in meters
            const dLat = (result.lat - center.lat) * 111320
            const dLng = (result.lng - center.lng) * 111320 * Math.cos(center.lat * (Math.PI / 180))
            const distance = Math.sqrt(dLat * dLat + dLng * dLng)

            expect(distance).toBeGreaterThanOrEqual(9.9) // Allow tiny float tolerance
            expect(distance).toBeLessThanOrEqual(20.1)
        }
    })

    it('should return identity when center is null', () => {
        // @ts-expect-error testing null safety
        const result = getOrbitLocation(null, null)
        expect(result.lat).toBeNull()
        expect(result.lng).toBeNull()
    })

    it('should produce different results on successive calls (randomness)', () => {
        const results = new Set<string>()
        for (let i = 0; i < 10; i++) {
            const r = getOrbitLocation(36.7525, 3.0420)
            results.add(`${r.lat.toFixed(8)},${r.lng.toFixed(8)}`)
        }
        // At least 5 unique positions out of 10 (extremely high probability)
        expect(results.size).toBeGreaterThanOrEqual(5)
    })

    it('should work correctly at the equator (lat=0)', () => {
        const result = getOrbitLocation(0, 0)
        expect(result.lat).toBeDefined()
        expect(result.lng).toBeDefined()
        expect(Number.isFinite(result.lat)).toBe(true)
        expect(Number.isFinite(result.lng)).toBe(true)
    })

    it('should work correctly at extreme latitudes', () => {
        // Near the north pole
        const result = getOrbitLocation(89, 0)
        expect(Number.isFinite(result.lat)).toBe(true)
        expect(Number.isFinite(result.lng)).toBe(true)
    })

    it('should produce exact known output with mocked Math.random', () => {
        // Mock Math.random to return a deterministic sequence
        const mockRandom = vi.spyOn(Math, 'random')
        mockRandom.mockReturnValueOnce(0.5) // r = 10 + 0.5*10 = 15 meters
        mockRandom.mockReturnValueOnce(0)   // theta = 0 radians (due east on unit circle → north in lat)

        const result = getOrbitLocation(36.7525, 3.0420)

        // With r=15, theta=0: latOffset = 15*cos(0)/111320 = 15/111320
        const expectedLatOffset = 15 / 111320
        expect(result.lat).toBeCloseTo(36.7525 + expectedLatOffset, 8)

        // lngOffset = 15*sin(0)/... = 0
        expect(result.lng).toBeCloseTo(3.0420, 8)
    })
})

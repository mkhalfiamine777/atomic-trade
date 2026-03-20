import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock generic Next.js router
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        prefetch: vi.fn(),
        back: vi.fn(),
    }),
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams(),
    redirect: vi.fn(),
}))

// Mock generic Next.js cookies
vi.mock('next/headers', () => ({
    cookies: () => ({
        get: vi.fn().mockReturnValue({ value: 'test-user-id' }),
        set: vi.fn(),
        delete: vi.fn(),
    }),
}))

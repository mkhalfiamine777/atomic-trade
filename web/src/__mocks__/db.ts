/**
 * 🧪 Prisma Mock — Provides a deep-mocked PrismaClient for unit testing Server Actions.
 * Every model method (findUnique, create, updateMany, $transaction, etc.) is a vi.fn()
 * that can be configured per-test with mockResolvedValue / mockImplementation.
 */
import { vi } from 'vitest'

// Create mock functions for each model method
const createModelMock = () => ({
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
    upsert: vi.fn(),
})

export const prismaMock = {
    user: createModelMock(),
    listing: createModelMock(),
    socialPost: createModelMock(),
    mapStory: createModelMock(),
    interaction: createModelMock(),
    conversation: createModelMock(),
    message: createModelMock(),
    zoneMaster: createModelMock(),
    category: createModelMock(),
    follow: createModelMock(),
    $transaction: vi.fn(),
}

// Auto-mock the db module so all Server Actions use this mock
vi.mock('@/lib/db', () => ({
    db: prismaMock,
}))

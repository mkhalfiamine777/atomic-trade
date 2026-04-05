'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { verifyAdmin } from '@/lib/adminGuard'

// Fetch all categories and subcategories
export async function getCategories() {
    try {
        const categories = await db.category.findMany({
            include: { subcategories: true },
            orderBy: { createdAt: 'asc' }
        });
        return { success: true, categories };
    } catch (error) {
        console.error('Failed to fetch categories:', error);
        return { error: 'Failed to fetch categories.' };
    }
}

// Add a new main Category
export async function createCategory(name: string, icon: string) {
    const { authorized, error: authError } = await verifyAdmin()
    if (!authorized) return { error: authError }
    try {
        const newCat = await db.category.create({
            data: { name, icon }
        });
        revalidatePath('/admin/categories');
        return { success: true, category: newCat };
    } catch (error) {
        console.error('Failed to create category:', error);
        return { error: 'Failed to create category.' };
    }
}

// Delete a main Category
export async function deleteCategory(id: string) {
    const { authorized, error: authError } = await verifyAdmin()
    if (!authorized) return { error: authError }
    try {
        await db.category.delete({
            where: { id }
        });
        revalidatePath('/admin/categories');
        return { success: true };
    } catch (error) {
        console.error('Failed to delete category:', error);
        return { error: 'Failed to delete category.' };
    }
}

// Add a new Subcategory
export async function createSubcategory(name: string, categoryId: string) {
    const { authorized, error: authError } = await verifyAdmin()
    if (!authorized) return { error: authError }
    try {
        const newSub = await db.subcategory.create({
            data: { name, categoryId }
        });
        revalidatePath('/admin/categories');
        return { success: true, subcategory: newSub };
    } catch (error) {
        console.error('Failed to create subcategory:', error);
        return { error: 'Failed to create subcategory.' };
    }
}

// Delete a Subcategory
export async function deleteSubcategory(id: string) {
    const { authorized, error: authError } = await verifyAdmin()
    if (!authorized) return { error: authError }
    try {
        await db.subcategory.delete({
            where: { id }
        });
        revalidatePath('/admin/categories');
        return { success: true };
    } catch (error) {
        console.error('Failed to delete subcategory:', error);
        return { error: 'Failed to delete subcategory.' };
    }
}

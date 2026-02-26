import { PrismaClient } from '@prisma/client'
import catalogData from '../src/data/products_catalog.json'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Starting Categories Seed...')

    // Optional: Clear existing categories to avoid duplicates during testing
    // await prisma.subcategory.deleteMany()
    // await prisma.category.deleteMany()
    // console.log('🗑️ Cleared existing categories.')

    let categoriesAdded = 0;
    let subcategoriesAdded = 0;

    for (const [key, categoryObj] of Object.entries(catalogData)) {
        console.log(`Processing category: ${categoryObj.label}...`);

        // Upsert to handle re-runs gracefully
        const category = await prisma.category.upsert({
            where: { name: categoryObj.label },
            update: { icon: categoryObj.icon },
            create: {
                name: categoryObj.label,
                icon: categoryObj.icon,
            },
        })
        categoriesAdded++;

        for (const sub of categoryObj.subcategories) {
            // Find if it exists to prevent duplicates (since we don't have unique constraint on subcategory name across the board)
            const existingSub = await prisma.subcategory.findFirst({
                where: { name: sub.label, categoryId: category.id }
            });

            if (!existingSub) {
                await prisma.subcategory.create({
                    data: {
                        name: sub.label,
                        categoryId: category.id
                    }
                });
                subcategoriesAdded++;
            }
        }
    }

    console.log(`\n✅ Seeding finished. Added/Updated ${categoriesAdded} Categories and ${subcategoriesAdded} Subcategories.`)
}

main()
    .catch((e) => {
        console.error('❌ Error during seeding:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

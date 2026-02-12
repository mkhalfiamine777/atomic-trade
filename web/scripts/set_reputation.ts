
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const args = process.argv.slice(2)
    if (args.length < 2) {
        console.error('Usage: npx ts-node web/scripts/set_reputation.ts <identifier> <score>')
        console.error('Identifier can be: username, name, or id')
        process.exit(1)
    }

    const identifier = args[0]
    const score = parseInt(args[1], 10)

    if (isNaN(score)) {
        console.error('Score must be a number')
        process.exit(1)
    }

    try {
        // Try finding by username (unique)
        let user = await prisma.user.findUnique({
            where: { username: identifier }
        })

        // If not found, try by name (first match)
        if (!user) {
            console.log(`User not found by username "${identifier}". Trying by name...`)
            user = await prisma.user.findFirst({
                where: { name: identifier }
            })
        }

        // If still not found, try by ID
        if (!user) {
            console.log(`User not found by name "${identifier}". Trying by ID...`)
            user = await prisma.user.findUnique({
                where: { id: identifier }
            })
        }

        if (!user) {
            console.error(`❌ User "${identifier}" not found anywhere!`)
            process.exit(1)
        }

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: { reputationScore: score }
        })

        console.log(`✅ Success! Updated reputation for user "${updatedUser.name}" (${updatedUser.username}) to ${updatedUser.reputationScore}`)

    } catch (error) {
        console.error('❌ Error updating user:', error)
    } finally {
        await prisma.$disconnect()
    }
}

main()

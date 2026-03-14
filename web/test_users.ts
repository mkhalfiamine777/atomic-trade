import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: { id: true, name: true, username: true, type: true }
    })
    console.log(users)

    const usernameToFind = 'بيتزيرياأمين405'.toLowerCase()
    console.log('Searching for:', usernameToFind)

    const specificUser = await prisma.user.findUnique({
        where: { username: usernameToFind }
    })

    console.log('Found:', specificUser)
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())

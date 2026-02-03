import { db } from './src/lib/db'

async function checkPasswords() {
    console.log('🔍 Checking latest users...')
    const users = await db.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { phone: true, password: true, name: true }
    })

    console.log('\n📊 Latest Users & Password Status:')
    users.forEach((u: { password: string; name: string | null; phone: string }) => {
        const isHashed = u.password.startsWith('$2b$') || u.password.startsWith('$2a$')
        console.log(`- User: ${u.name} (${u.phone})`)
        console.log(`  Password: ${u.password.substring(0, 15)}...`)
        console.log(`  Status: ${isHashed ? '✅ SECURE (Hashed)' : '❌ INSECURE (Plain Text)'}`)
        console.log('-----------------------------------')
    })
}

checkPasswords()
    .catch(e => console.error(e))
    .finally(async () => {
        await db.$disconnect()
    })

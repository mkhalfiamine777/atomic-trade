
import { db } from './src/lib/db'

async function checkUsers() {
    console.log('Checking DB users...')
    try {
        const count = await db.user.count()
        console.log(`User count: ${count}`)
        const users = await db.user.findMany({ select: { id: true, name: true, phone: true } })
        console.log('Users:', users)
    } catch (error) {
        console.error('Error:', error)
    }
}

checkUsers()

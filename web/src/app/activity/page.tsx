import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { db } from '@/lib/db'

export default async function ActivityRedirectPage() {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value

    if (!userId) {
        redirect('/login')
    }

    const user = await db.user.findUnique({
        where: { id: userId },
        select: { username: true, name: true }
    })

    if (user?.username) {
        // Redirect to profile with SALES tab activated
        redirect(`/u/${user.username}?tab=SALES`)
    } else {
        // Self-heal: Generate username (Same logic as Profile fix)
        const newUsername = user?.name
            ? `${user.name.replace(/\s+/g, '').toLowerCase()}${Math.floor(Math.random() * 1000)}`
            : `user${Math.floor(Math.random() * 10000)}`

        await db.user.update({
            where: { id: userId },
            data: { username: newUsername }
        })

        redirect(`/u/${newUsername}?tab=SALES`)
    }
}

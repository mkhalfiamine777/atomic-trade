import { cookies } from 'next/headers'
import DashboardClient from './DashboardClient'
import GuestDashboardClient from './GuestDashboardClient'
import { db } from '@/lib/db'

export default async function DashboardPage() {
    const userId = (await cookies()).get('user_id')?.value

    if (!userId) {
        return <GuestDashboardClient />
    }

    // 🛡️ Fetch User Details to know their Role (Shop vs Individual)
    const user = await db.user.findUnique({
        where: { id: userId },
        select: { type: true, name: true }
    })

    if (!user) {
        return <GuestDashboardClient />
    }

    return <DashboardClient userId={userId} userType={user.type} userName={user.name} />
}

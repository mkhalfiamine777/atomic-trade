import { redirect } from "next/navigation"
import { getCurrentUser } from "@/actions/getCurrentUser"
import { db } from "@/lib/db"

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const user = await getCurrentUser()

    if (!user) {
        redirect("/")
    }

    // Security for Production (Railway):
    // Check if the user's phone number exists in the allowed ADMIN_PHONES environment variable.
    const adminPhones = process.env.ADMIN_PHONES ? process.env.ADMIN_PHONES.split(',') : []
    const isDev = process.env.NODE_ENV === 'development'

    if (!isDev && adminPhones.length > 0) {
        const dbUser = await db.user.findUnique({ where: { id: user.id }, select: { phone: true } })
        if (!dbUser || !adminPhones.includes(dbUser.phone)) {
            redirect("/")
        }
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col md:flex-row">
            <aside className="w-full md:w-64 bg-zinc-900 border-r border-zinc-800 p-6 flex flex-col gap-4">
                <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500 mb-6">
                    🛡️ غرفة التحكم (Admin)
                </h2>
                <nav className="flex flex-col gap-2">
                    <a href="/admin" className="px-4 py-3 rounded-lg hover:bg-zinc-800 transition-colors">📊 الإحصائيات العامة</a>
                    <a href="/admin/categories" className="px-4 py-3 rounded-lg bg-indigo-600/20 text-indigo-400 font-medium">📋 إدارة التصنيفات</a>
                    <a href="/admin/users" className="px-4 py-3 rounded-lg hover:bg-zinc-800 transition-colors">👥 إدارة المتاجر والأفراد</a>
                </nav>
            </aside>

            <main className="flex-1 p-6 md:p-10 overflow-y-auto">
                {children}
            </main>
        </div>
    )
}

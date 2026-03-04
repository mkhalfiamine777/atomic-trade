import { UserManagement } from "@/components/admin/UserManagement"

export const dynamic = 'force-dynamic'

export const metadata = {
    title: 'إدارة المستخدمين | غرفة التحكم',
}

export default function AdminUsersPage() {
    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold text-white mb-2">👥 المتاجر والأفراد</h1>
                <p className="text-zinc-400">تحكم بحسابات المنصة، راقب السمعة، قم بتوثيق المتاجر الموثوقة أو حظر المخالفين.</p>
            </header>

            <UserManagement />
        </div>
    )
}

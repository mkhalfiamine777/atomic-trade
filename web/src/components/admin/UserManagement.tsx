'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { BadgeCheck, AlertTriangle, Store, User as UserIcon, ShieldAlert } from 'lucide-react'
import { getAllUsers, toggleUserVerification, resetReputation } from '@/actions/adminUsers'

// Simplified User Type for the table
type AdminUser = {
    id: string;
    name: string | null;
    username: string | null;
    phone: string;
    type: 'INDIVIDUAL' | 'SHOP';
    shopCategory: string | null;
    isVerified: boolean;
    reputationScore: number;
    createdAt: Date;
    _count: { listings: number }
}

export function UserManagement() {
    const [users, setUsers] = useState<AdminUser[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setIsLoading(true)
        const res = await getAllUsers()
        if (res.success && res.users) {
            setUsers(res.users as unknown as AdminUser[]) // Simple cast for dates
        } else {
            toast.error(res.error || 'فشل تحميل بيانات المستخدمين')
        }
        setIsLoading(false)
    }

    const handleToggleVerify = async (userId: string, currentStatus: boolean, userName: string | null) => {
        if (!confirm(`هل أنت متأكد من ${currentStatus ? 'سحب التوثيق من' : 'توثيق حساب'} ${userName || 'هذا المستخدم'}؟`)) return;

        const res = await toggleUserVerification(userId, currentStatus)
        if (res.success) {
            toast.success(currentStatus ? '❌ تم سحب التوثيق' : '✅ تم توثيق الحساب بنجاح')
            // Optimistic Update
            setUsers(users.map(u => u.id === userId ? { ...u, isVerified: !currentStatus } : u))
        } else {
            toast.error(res.error)
        }
    }

    const handleResetReputation = async (userId: string, userName: string | null) => {
        if (!confirm(`⚠️ إنذار: هل أنت متأكد من تصفير سمعة ${userName || 'هذا المستخدم'}؟ سينخفض التقييم إلى 50 نقطة كإجراء عقابي.`)) return;

        const res = await resetReputation(userId)
        if (res.success) {
            toast.success('تم تصفير السمعة كإجراء عقابي')
            setUsers(users.map(u => u.id === userId ? { ...u, reputationScore: 50 } : u))
        } else {
            toast.error(res.error)
        }
    }

    const filteredUsers = users.filter(user =>
        (user.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.phone.includes(searchTerm)) ||
        (user.shopCategory?.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    if (isLoading) {
        return <div className="animate-pulse bg-zinc-800 h-96 rounded-xl border border-zinc-700 w-full flex items-center justify-center">جاري استدعاء البيانات...</div>
    }

    return (
        <div className="space-y-6">

            {/* Search and Filters */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                <input
                    type="text"
                    placeholder="ابحث بالاسم، رقم الهاتف، أو التصنيف..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-zinc-950 border border-zinc-700 text-white px-4 py-2 rounded-lg w-full md:w-96 focus:border-indigo-500 outline-none"
                />
                <div className="text-zinc-400 text-sm">
                    إجمالي الحسابات: <span className="text-white font-bold">{users.length}</span>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-right" dir="rtl">
                        <thead className="bg-zinc-950 text-zinc-400 border-b border-zinc-800">
                            <tr>
                                <th className="px-6 py-4 font-medium">المستخدم</th>
                                <th className="px-6 py-4 font-medium">النوع</th>
                                <th className="px-6 py-4 font-medium">النشاط (عروض)</th>
                                <th className="px-6 py-4 font-medium">نقاط السمعة 🌟</th>
                                <th className="px-6 py-4 font-medium">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/50">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-8 text-zinc-500">لا يوجد بيانات تطابق بحثك</td>
                                </tr>
                            ) : filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-zinc-800/20 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${user.type === 'SHOP' ? 'bg-indigo-600' : 'bg-emerald-600'}`}>
                                                {user.type === 'SHOP' ? <Store size={20} /> : <UserIcon size={20} />}
                                            </div>
                                            <div>
                                                <div className="font-bold text-white flex items-center gap-1">
                                                    {user.name || 'بدون اسم'}
                                                    {user.isVerified && <BadgeCheck className="w-4 h-4 text-blue-500" />}
                                                </div>
                                                <div className="text-xs text-zinc-400 font-mono">{user.phone}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${user.type === 'SHOP' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-zinc-700 text-zinc-300'}`}>
                                            {user.type === 'SHOP' ? `متجر (${user.shopCategory || 'عام'})` : 'فردي'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-zinc-300 font-medium">
                                        {user._count.listings}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-24 h-2 bg-zinc-800 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${user.reputationScore < 60 ? 'bg-red-500' : user.reputationScore > 90 ? 'bg-emerald-500' : 'bg-yellow-500'}`}
                                                    style={{ width: `${Math.min(100, (user.reputationScore / 1000) * 100)}%` }}
                                                />
                                            </div>
                                            <span className="text-sm text-zinc-400">{user.reputationScore}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleToggleVerify(user.id, user.isVerified, user.name)}
                                                className={`p-2 rounded-lg transition-colors ${user.isVerified ? 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20' : 'bg-zinc-800 text-zinc-400 hover:text-blue-400'}`}
                                                title={user.isVerified ? "إلغاء التوثيق" : "منح شارة التوثيق"}
                                            >
                                                <BadgeCheck size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleResetReputation(user.id, user.name)}
                                                className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                                                title="إنذار: تصفير السمعة"
                                            >
                                                <ShieldAlert size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    )
}

import { getDashboardStats } from '@/actions/adminDashboard'
import { Users, Store, BadgeCheck, ShoppingBag, Megaphone, MonitorPlay, MessageSquarePlus, Activity, CreditCard, Sparkles } from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata = {
    title: 'الإحصائيات العامة | غرفة التحكم',
}

export default async function AdminPage() {
    const res = await getDashboardStats()

    if (!res.success || !res.stats) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-zinc-500">
                <p>⚠️ {res.error || 'حدث خطأ أثناء تحميل الإحصائيات'}</p>
            </div>
        )
    }

    const { users, content } = res.stats

    return (
        <div className="space-y-8" dir="rtl">
            <header>
                <h1 className="text-3xl font-bold flex items-center gap-3 text-white mb-2">
                    <Activity className="text-indigo-500" size={32} />
                    الإحصائيات العامة
                </h1>
                <p className="text-zinc-400">نظرة عامة ومباشرة على أداء المنصة والنشاط الحالي.</p>
            </header>

            {/* Users Section */}
            <section>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Users className="text-blue-400" size={24} /> حالة المستخدمين
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="إجمالي الحسابات" value={users.total} icon={<Users size={20} />} color="blue" />
                    <StatCard title="المتاجر والأعمال" value={users.shops} icon={<Store size={20} />} color="purple" />
                    <StatCard title="الحسابات الموثقة" value={users.verified} icon={<BadgeCheck size={20} />} color="emerald" />
                    <StatCard title="متوسط السمعة" value={`${users.avgReputation} 🌟`} icon={<Activity size={20} />} color="yellow" />
                </div>
            </section>

            {/* Subscriptions Section */}
            <section>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2 mt-8">
                    <CreditCard className="text-pink-400" size={24} /> الاشتراكات والباقات
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="إجمالي الاشتراكات" value={users.totalSubscriptions} icon={<CreditCard size={20} />} color="pink" />
                    <StatCard title="الباقة الأساسية (Basic)" value={users.basicSubs} icon={<Store size={20} />} color="blue" />
                    <StatCard title="الباقة المميزة (Premium)" value={users.premiumSubs} icon={<Sparkles size={20} />} color="yellow" />
                </div>
            </section>

            {/* Content Section */}
            <section>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2 mt-8">
                    <ShoppingBag className="text-orange-400" size={24} /> المحتوى المعروض
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="المنتجات المعروضة" value={content.products} icon={<ShoppingBag size={20} />} color="blue" />
                    <StatCard title="الطلبات المفتوحة" value={content.requests} icon={<Megaphone size={20} />} color="orange" />
                    <StatCard title="منشورات التغذية" value={content.posts} icon={<MessageSquarePlus size={20} />} color="purple" />
                    <StatCard title="القصص (Stories)" value={content.stories} icon={<MonitorPlay size={20} />} color="pink" />
                </div>
            </section>
        </div>
    )
}

function StatCard({ title, value, icon, color }: { title: string, value: string | number, icon: React.ReactNode, color: string }) {
    const colorStyles: Record<string, string> = {
        blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        yellow: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
        orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
        pink: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    }

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col justify-between hover:border-zinc-700 transition-colors">
            <div className="flex justify-between items-start mb-4">
                <span className="text-zinc-400 font-medium">{title}</span>
                <div className={`p-2 rounded-lg ${colorStyles[color] || 'bg-zinc-800 text-zinc-400'}`}>
                    {icon}
                </div>
            </div>
            <div className="text-3xl font-bold text-white">
                {value}
            </div>
        </div>
    )
}

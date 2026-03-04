import { CategoryManager } from "@/components/admin/CategoryManager"

export const dynamic = 'force-dynamic'

export const metadata = {
    title: 'إدارة التصنيفات | غرفة التحكم',
}

export default function AdminCategoriesPage() {
    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold text-white mb-2">إدارة التصنيفات (Dynamic Catalog)</h1>
                <p className="text-zinc-400">تحكم بالكتالوج الذي يشاهده المستخدمون عند إضافة المنتجات أو تصفح السوق.</p>
            </header>

            <CategoryManager />
        </div>
    )
}

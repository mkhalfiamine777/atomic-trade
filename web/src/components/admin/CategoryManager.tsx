'use client'

import { useState, useEffect } from 'react'
import { getCategories, createCategory, deleteCategory, createSubcategory, deleteSubcategory } from '@/actions/categories'
import { toast } from 'sonner'
import { Trash, Plus, Layers } from 'lucide-react'

// Define matching types here since we're crossing the boundary
type Subcategory = { id: string; name: string; categoryId: string }
type Category = { id: string; name: string; icon: string | null; subcategories: Subcategory[] }

export function CategoryManager() {
    const [categories, setCategories] = useState<Category[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // Form States
    const [newCatName, setNewCatName] = useState('')
    const [newCatIcon, setNewCatIcon] = useState('')

    const [newSubName, setNewSubName] = useState('')
    const [activeCatForSub, setActiveCatForSub] = useState<string | null>(null)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setIsLoading(true)
        const res = await getCategories()
        if (res.success && res.categories) {
            setCategories(res.categories as Category[])
        } else {
            toast.error(res.error || 'فشل تحميل التصنيفات')
        }
        setIsLoading(false)
    }

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newCatName) return;

        const res = await createCategory(newCatName, newCatIcon)
        if (res.success) {
            toast.success('تمت الإضافة بنجاح')
            setNewCatName('')
            setNewCatIcon('')
            loadData()
        } else {
            toast.error(res.error)
        }
    }

    const handleAddSubcategory = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newSubName || !activeCatForSub) return;

        const res = await createSubcategory(newSubName, activeCatForSub)
        if (res.success) {
            toast.success('تم إضافة التقسيم الفرعي')
            setNewSubName('')
            setActiveCatForSub(null)
            loadData()
        } else {
            toast.error(res.error)
        }
    }

    const handleDeleteCat = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا التصنيف الرئيسي؟ سيتم حذف كل فروعه!')) return;
        const res = await deleteCategory(id)
        if (res.success) {
            toast.success('تم الحذف')
            loadData()
        } else {
            toast.error(res.error)
        }
    }

    const handleDeleteSub = async (id: string) => {
        if (!confirm('حذف هذا الفرع؟')) return;
        const res = await deleteSubcategory(id)
        if (res.success) {
            toast.success('تم الحذف')
            loadData()
        } else {
            toast.error(res.error)
        }
    }

    if (isLoading) {
        return <div className="animate-pulse bg-zinc-800 h-64 rounded-xl border border-zinc-700 w-full flex items-center justify-center">جاري التحميل...</div>
    }

    return (
        <div className="space-y-8">
            {/* Add New Category Card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl" />

                <h2 className="text-xl font-bold flex items-center gap-2 mb-4 text-white">
                    <Layers className="text-indigo-400" /> إضافة تصنيف رئيسي جديد
                </h2>

                <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row gap-4">
                    <input
                        type="text"
                        placeholder="الأيقونة (مثال: 🚗)"
                        className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 w-full sm:w-32 focus:border-indigo-500 outline-none text-xl text-center"
                        value={newCatIcon}
                        onChange={(e) => setNewCatIcon(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="اسم التصنيف (مثال: مركبات بحرية)"
                        className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 flex-1 focus:border-indigo-500 outline-none"
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        required
                    />
                    <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2">
                        <Plus size={18} /> إضافة
                    </button>
                </form>
            </div>

            {/* Existing Categories List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {categories.map((cat) => (
                    <div key={cat.id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-colors">
                        <div className="bg-zinc-950/50 p-4 border-b border-zinc-800 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-white flex items-center gap-2">
                                <span className="bg-zinc-800 w-8 h-8 rounded flex items-center justify-center shadow-inner">{cat.icon || '📌'}</span>
                                {cat.name}
                            </h3>
                            <button onClick={() => handleDeleteCat(cat.id)} className="text-red-400 hover:text-red-300 p-2 rounded hover:bg-red-400/10 transition-colors">
                                <Trash size={18} />
                            </button>
                        </div>

                        <div className="p-4 space-y-3">
                            {/* Tags for Subs */}
                            <div className="flex flex-wrap gap-2">
                                {cat.subcategories.map(sub => (
                                    <div key={sub.id} className="bg-zinc-800/50 border border-zinc-700 rounded-full px-3 py-1 flex items-center gap-2 text-sm text-zinc-300 group">
                                        {sub.name}
                                        <button onClick={() => handleDeleteSub(sub.id)} className="text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Trash size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Add Sub Form inside card */}
                            {activeCatForSub === cat.id ? (
                                <form onSubmit={handleAddSubcategory} className="flex gap-2 mt-4">
                                    <input
                                        type="text"
                                        autoFocus
                                        placeholder="اسم الفرع.."
                                        className="bg-zinc-950 border border-zinc-800 rounded p-2 text-sm flex-1 outline-none focus:border-indigo-500 text-white"
                                        value={newSubName}
                                        onChange={(e) => setNewSubName(e.target.value)}
                                        required
                                    />
                                    <button type="submit" className="bg-zinc-800 hover:bg-zinc-700 text-xs px-3 rounded text-white border border-zinc-700">حفظ</button>
                                    <button type="button" onClick={() => setActiveCatForSub(null)} className="text-red-400 text-xs px-2 hover:bg-zinc-800 rounded">إلغاء</button>
                                </form>
                            ) : (
                                <button
                                    onClick={() => setActiveCatForSub(cat.id)}
                                    className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-1 mt-4"
                                >
                                    <Plus size={12} /> إضافة فرع جديد
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

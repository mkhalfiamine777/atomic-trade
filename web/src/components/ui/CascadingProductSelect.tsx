
'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown, Loader2 } from 'lucide-react'

// Define the shape coming from the Database
type Subcategory = { id: string; name: string }
type Category = { id: string; name: string; icon: string | null; subcategories: Subcategory[] }

interface Props {
    required?: boolean
}

export function CascadingProductSelect({ required = true }: Props) {
    const [categories, setCategories] = useState<Category[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')
    const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string>('')

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch('/api/categories')
                if (res.ok) {
                    const data = await res.json()
                    setCategories(data)
                }
            } catch (error) {
                console.error("Failed to load categories", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchCategories()
    }, [])

    const activeCategory = categories.find(c => c.id === selectedCategoryId)

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-16 text-emerald-500 gap-2">
                <Loader2 className="animate-spin w-5 h-5" />
                <span className="text-sm">جاري تحميل الكتالوج...</span>
            </div>
        )
    }

    // We pass the string `name` instead of `id` for backwards compatibility with existing db structure
    // If the schema for `Listing.category` changes to ID, we can change value={cat.name} to value={cat.id}
    const selectedCategoryName = activeCategory?.name || ''
    const selectedSubcategoryName = activeCategory?.subcategories.find(s => s.id === selectedSubcategoryId)?.name || ''

    return (
        <div className="space-y-4">
            {/* Hidden inputs to pass data automatically in Forms */}
            <input type="hidden" name="category" value={selectedCategoryName} required={required} />
            <input type="hidden" name="subcategory" value={selectedSubcategoryName} required={required} />

            {/* Step 1: Category */}
            <div>
                <label className="block text-sm font-medium text-emerald-400 mb-1">
                    الفئة الرئيسية
                </label>
                <div className="relative">
                    <select
                        className="w-full appearance-none bg-black/40 border border-emerald-500/30 text-emerald-50 text-sm rounded-lg h-11 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all cursor-pointer backdrop-blur-sm shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:bg-black/60"
                        value={selectedCategoryId}
                        onChange={(e) => {
                            setSelectedCategoryId(e.target.value)
                            setSelectedSubcategoryId('') // Reset subcategory when category changes
                        }}
                        dir="rtl"
                    >
                        <option value="" disabled className="text-zinc-500 bg-zinc-900">اختر الفئة...</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id} className="bg-zinc-900 text-zinc-100">
                                {cat.icon} {cat.name}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute left-3 top-3.5 w-4 h-4 text-emerald-500 pointer-events-none" />
                </div>
            </div>

            {/* Step 2: Subcategory (Only shows if a category is selected) */}
            {selectedCategoryId && activeCategory && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="block text-sm font-medium text-emerald-400 mb-1">
                        تصنيف المنتج الدقيق <span className="text-emerald-500/50 text-xs">(للمطابقة الذكية)</span>
                    </label>
                    <div className="relative">
                        <select
                            className="w-full appearance-none bg-black/40 border border-emerald-500/30 text-emerald-50 text-sm rounded-lg h-11 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all cursor-pointer backdrop-blur-sm shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:bg-black/60"
                            value={selectedSubcategoryId}
                            onChange={(e) => setSelectedSubcategoryId(e.target.value)}
                            dir="rtl"
                        >
                            <option value="" disabled className="text-zinc-500 bg-zinc-900">تخصيص المنتج...</option>
                            {activeCategory.subcategories.map(sub => (
                                <option key={sub.id} value={sub.id} className="bg-zinc-900 text-zinc-100">
                                    {sub.name}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute left-3 top-3.5 w-4 h-4 text-emerald-500 pointer-events-none" />
                    </div>
                </div>
            )}
        </div>
    )
}

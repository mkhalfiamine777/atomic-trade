'use client'

import { useState } from 'react'
import catalogData from '@/data/products_catalog.json'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

// Define the shape of our catalog JSON
type Subcategory = { id: string; label: string }
type Category = { label: string; icon: string; subcategories: Subcategory[] }
type Catalog = Record<string, Category>

const catalog = catalogData as Catalog
const categoryOptions = Object.entries(catalog).map(([key, value]) => ({
    id: key,
    label: value.label,
    icon: value.icon,
    subcategories: value.subcategories
}))

interface Props {
    // Optional props if we want to control it from outside, otherwise it manages its own hidden inputs
    required?: boolean
}

export function CascadingProductSelect({ required = true }: Props) {
    const [selectedCategory, setSelectedCategory] = useState<string>('')
    const [selectedSubcategory, setSelectedSubcategory] = useState<string>('')

    const activeCategory = categoryOptions.find(c => c.id === selectedCategory)

    return (
        <div className="space-y-4">
            {/* Hidden inputs to pass data automatically in Forms */}
            <input type="hidden" name="category" value={selectedCategory} required={required} />
            <input type="hidden" name="subcategory" value={selectedSubcategory} required={required} />

            {/* Step 1: Category */}
            <div>
                <label className="block text-sm font-medium text-emerald-400 mb-1">
                    الفئة الرئيسية
                </label>
                <div className="relative">
                    <select
                        className="w-full appearance-none bg-black/40 border border-emerald-500/30 text-emerald-50 text-sm rounded-lg h-11 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all cursor-pointer backdrop-blur-sm shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:bg-black/60"
                        value={selectedCategory}
                        onChange={(e) => {
                            setSelectedCategory(e.target.value)
                            setSelectedSubcategory('') // Reset subcategory when category changes
                        }}
                        dir="rtl"
                    >
                        <option value="" disabled className="text-zinc-500 bg-zinc-900">اختر الفئة...</option>
                        {categoryOptions.map(cat => (
                            <option key={cat.id} value={cat.id} className="bg-zinc-900 text-zinc-100">
                                {cat.icon} {cat.label}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute left-3 top-3.5 w-4 h-4 text-emerald-500 pointer-events-none" />
                </div>
            </div>

            {/* Step 2: Subcategory (Only shows if a category is selected) */}
            {selectedCategory && activeCategory && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="block text-sm font-medium text-emerald-400 mb-1">
                        تصنيف المنتج الدقيق <span className="text-emerald-500/50 text-xs">(للمطابقة الذكية)</span>
                    </label>
                    <div className="relative">
                        <select
                            className="w-full appearance-none bg-black/40 border border-emerald-500/30 text-emerald-50 text-sm rounded-lg h-11 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all cursor-pointer backdrop-blur-sm shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:bg-black/60"
                            value={selectedSubcategory}
                            onChange={(e) => setSelectedSubcategory(e.target.value)}
                            dir="rtl"
                        >
                            <option value="" disabled className="text-zinc-500 bg-zinc-900">تخصيص المنتج...</option>
                            {activeCategory.subcategories.map(sub => (
                                <option key={sub.id} value={sub.id} className="bg-zinc-900 text-zinc-100">
                                    {sub.label}
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

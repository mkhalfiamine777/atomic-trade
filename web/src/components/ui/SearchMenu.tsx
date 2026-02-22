'use client'
import * as React from 'react'
import { Command } from 'cmdk'
import categories from '@/data/categories.json'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

export function SearchMenu() {
    const [open, setOpen] = React.useState(false)
    const [value, setValue] = React.useState('')

    // Toggle the menu when ⌘K is pressed
    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }
        document.addEventListener('keydown', down)
        return () => document.removeEventListener('keydown', down)
    }, [])

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="fixed top-4 left-4 z-50 flex items-center gap-2 px-4 py-2 text-sm text-emerald-400 bg-black/40 border border-emerald-500/30 rounded-xl backdrop-blur-md shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:bg-black/60 transition-all duration-300"
            >
                <Search className="w-4 h-4" />
                <span className="hidden md:inline">بحث ذكي عن المنتجات...</span>
                <kbd className="hidden md:inline-flex items-center gap-1 px-1.5 font-mono text-[10px] font-medium text-emerald-500 border border-emerald-500/30 rounded bg-black/50">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </button>

            {open && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-black/80 border border-emerald-500/40 shadow-[0_0_40px_rgba(16,185,129,0.2)] backdrop-blur-xl animate-in zoom-in-95 duration-200">
                        <Command
                            className="w-full"
                            value={value}
                            onValueChange={setValue}
                            shouldFilter={false} // Enable custom filtering if needed later
                        >
                            <div className="flex items-center px-4 border-b border-emerald-500/20">
                                <Search className="w-5 h-5 text-emerald-500 shrink-0" />
                                <Command.Input
                                    autoFocus
                                    placeholder="ما الذي تبحث عنه؟ (هواتف، طعام، سيارات...)"
                                    className="w-full px-4 py-4 bg-transparent outline-none text-emerald-50 placeholder:text-emerald-500/50"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Escape') {
                                            setOpen(false)
                                        }
                                    }}
                                />
                            </div>

                            <Command.List className="max-h-[300px] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-emerald-500/20 scrollbar-track-transparent">
                                <Command.Empty className="py-6 text-center text-sm text-emerald-500/50">
                                    لم يتم العثور على أي نتائج.
                                </Command.Empty>

                                <Command.Group heading="الفئات الرئيسية" className="px-2 py-2 text-xs font-semibold text-emerald-500/70">
                                    {categories.filter(c => c.label.includes(value) || c.category.includes(value)).map((category) => (
                                        <Command.Item
                                            key={category.id}
                                            value={category.label}
                                            onSelect={() => {
                                                console.log(`Searching for: ${category.id}`)
                                                setOpen(false)
                                                // TODO: Implement actual filtering logic here by pushing to router or setting map context state
                                            }}
                                            className={cn(
                                                "flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-colors mt-1 hover:bg-emerald-500/20 aria-selected:bg-emerald-500/20 aria-selected:text-emerald-400"
                                            )}
                                        >
                                            <span className="text-xl">{category.icon}</span>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-emerald-50">{category.label}</span>
                                                <span className="text-xs text-emerald-500/50">{category.category}</span>
                                            </div>
                                        </Command.Item>
                                    ))}
                                </Command.Group>
                            </Command.List>
                        </Command>
                    </div>
                    {/* Backdrop click to close */}
                    <div className="absolute inset-0 -z-10" onClick={() => setOpen(false)} />
                </div>
            )}
        </>
    )
}

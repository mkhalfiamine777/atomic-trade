'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, PlusCircle, Activity, User } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export function BottomNav() {
    const pathname = usePathname()

    // Hide on non-mobile if desired, or keep as main nav
    // For this design, we want it visible mostly on mobile, but it can work on desktop too as a centered dock.

    const navItems = [
        { href: '/dashboard', label: 'الرئيسية', icon: Home },
        { href: '/explore', label: 'استكشف', icon: Search },
        // { href: '/create', label: 'إضافة', icon: PlusCircle, isPrimary: true }, // We have FAB for this now
        { href: '/activity', label: 'نشاطي', icon: Activity },
        { href: '/profile', label: 'ملفي', icon: User },
    ]

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
            <motion.nav
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex items-center justify-around bg-[#333333]/95 backdrop-blur-xl border border-white/5 rounded-[2rem] px-2 py-2 shadow-2xl h-[68px]"
            >
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "relative flex flex-col items-center justify-center w-14 h-14 rounded-full transition-all duration-300",
                                isActive ? "text-white" : "text-zinc-400 hover:text-zinc-300"
                            )}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="nav-pill"
                                    className="absolute inset-0 bg-[#4a4a4c] rounded-full scale-90"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <item.icon size={26} strokeWidth={isActive ? 2 : 1.5} className="z-10 relative" />
                            {isActive && (
                                <span className="absolute bottom-[2px] w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)] z-10" />
                            )}
                        </Link>
                    )
                })}
            </motion.nav>
        </div>
    )
}

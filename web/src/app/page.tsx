'use client'

import Link from 'next/link'
import { MapPin, Users, Store, Building2, BellRing, ArrowLeft } from 'lucide-react'
import ParticleField from '@/components/ui/ParticleField'

export default function Home() {
    return (
        <main className="relative flex min-h-screen flex-col items-center justify-between overflow-hidden">
            {/* 🖼️ Full Screen Static Map Background with Living Pulse */}
            <div className="fixed inset-0 z-0">
                <div
                    className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2600&auto=format&fit=crop')] bg-cover bg-center living-map"
                ></div>

                {/* 🎨 Dynamic Gradient Mesh Overlay */}
                <div className="absolute inset-0 gradient-mesh opacity-[0.65]"></div>

                {/* Overlay to ensure text readability */}
                <div className="absolute inset-0 bg-background/40"></div>

                {/* 🌠 Smart Particles Layer */}
                <ParticleField />

                {/* 📍 Live Elements (Floating Icons) */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none z-[2]">
                    {/* Center "You" */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center animate-bounce">
                        <MapPin className="h-16 w-16 text-primary drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                        <span className="mt-2 bg-background/80 px-3 py-1 rounded-full text-xs font-bold border shadow-sm">
                            أنت هنا
                        </span>
                    </div>

                    {/* Nearby Nodes Simulation */}
                    <div className="absolute top-1/4 left-1/4 animate-pulse duration-1000">
                        <Store className="h-8 w-8 text-orange-500" />
                    </div>
                    <div className="absolute bottom-1/3 right-1/4 animate-pulse duration-700">
                        <Users className="h-6 w-6 text-green-500" />
                    </div>
                    <div className="absolute top-1/2 right-10 animate-pulse duration-500">
                        <Building2 className="h-10 w-10 text-purple-500" />
                    </div>
                </div>
            </div>

            {/* Content Overlay (z-10 to stay on top) */}
            <div className="relative z-10 w-full flex flex-col items-center justify-between min-h-screen">

                {/* Hero Section */}
                <section className="w-full flex flex-col items-center justify-center pt-32 pb-12 px-4 text-center">
                    <div className="inline-flex items-center rounded-full border border-primary/30 liquid-glass px-4 py-1.5 text-sm font-medium text-primary mb-6 shadow-lg">
                        <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse mr-2"></span>
                        قريباً في الدار البيضاء
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl drop-shadow-2xl text-foreground leading-tight">
                        التجارة من حيك <br />
                        إلى العالم، <span className="text-primary bg-background/50 px-2 rounded-lg decoration-clone">أذكى وأقرب</span> مما تتخيل.
                    </h1>

                    <p className="text-lg md:text-xl text-foreground/90 font-medium max-w-2xl mb-10 liquid-glass p-5 rounded-2xl shadow-lg">
                        منصة التجارة الاجتماعية الأولى التي تربطك بمحيطك.
                        <br />
                        اكتشف، اشترِ، وبع لمن حولك في دائرة 300 متر.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                        <Link
                            href="/dashboard"
                            className="inline-flex h-14 items-center justify-center rounded-full bg-primary px-8 text-base font-bold text-primary-foreground shadow-xl transition-all hover:bg-primary/90 hover:scale-105 hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            إبحث في الخريطة
                            <ArrowLeft className="mr-2 h-5 w-5" />
                        </Link>
                        <Link
                            href="/dashboard"
                            className="inline-flex h-14 items-center justify-center rounded-full liquid-glass px-8 text-base font-bold shadow-lg transition-all hover:bg-white/10 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            دخول للأعضاء
                        </Link>
                    </div>
                </section>

                {/* Features Grid (3D Portal Cards) */}
                <section className="w-full max-w-6xl px-4 py-20 grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Card 1: Alert Feature */}
                    <div className="relative flex flex-col items-center text-center p-8 rounded-2xl liquid-glass portal-card">
                        <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(59,130,246,0.4)]">
                            <BellRing className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-2xl font-bold mb-3">تنبيه الـ 300 متر</h3>
                        <p className="text-muted-foreground font-medium">
                            لا تفوت أي صفقة. نرسل لك إشعاراً فورياً عندما تمر بجانب منتج تبحث عنه.
                        </p>
                    </div>

                    {/* Card 2: Local Commerce */}
                    <div className="relative flex flex-col items-center text-center p-8 rounded-2xl liquid-glass portal-card">
                        <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(34,197,94,0.4)]">
                            <Store className="h-8 w-8 text-green-500" />
                        </div>
                        <h3 className="text-2xl font-bold mb-3">تجارة الحي</h3>
                        <p className="text-muted-foreground font-medium">
                            ادعم اقتصاد حيك. اكتشف الباعة المتجولين والمحلات الصغيرة و الكبيرة من حولك.
                        </p>
                    </div>

                    {/* Card 3: Community */}
                    <div className="relative flex flex-col items-center text-center p-8 rounded-2xl liquid-glass portal-card">
                        <div className="h-16 w-16 rounded-full bg-purple-500/20 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                            <Users className="h-8 w-8 text-purple-500" />
                        </div>
                        <h3 className="text-2xl font-bold mb-3">مجتمع تفاعلي</h3>
                        <p className="text-muted-foreground font-medium">
                            خاصية &quot;سيد الحومة&quot; وقصص الفيديو تجعل التسوق تجربة اجتماعية ممتعة.
                        </p>
                    </div>
                </section>

                <footer className="w-full py-6 text-center text-sm font-medium text-white/60 liquid-glass">
                    © 2026 SouqMap. جميع الحقوق محفوظة.
                </footer>
            </div>
        </main>
    )
}

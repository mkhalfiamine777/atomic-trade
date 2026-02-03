import Link from 'next/link'
import { MapPin, Users, Store, Building2, BellRing, ArrowLeft } from 'lucide-react'

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-between">
            {/* Hero Section */}
            <section className="w-full flex flex-col items-center justify-center pt-24 pb-12 px-4 text-center bg-gradient-to-b from-background to-secondary/20">
                <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-6">
                    <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse mr-2"></span>
                    قريباً في المغرب
                </div>
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 max-w-4xl">
                    التجارة من حيك إلى العالم، <span className="text-primary">أذكى وأقرب</span> مما تتخيل.
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10">
                    منصة التجارة الاجتماعية الأولى التي تربطك بمحيطك و بالعالم. اكتشف، اشترِ، وبع لمن حولك في
                    دائرة 50 متر.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                    <Link
                        href="/dashboard"
                        className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                        إبحث في الخريطة
                        <ArrowLeft className="mr-2 h-4 w-4" />
                    </Link>
                    <Link
                        href="/dashboard"
                        className="inline-flex h-12 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                        دخول للأعضاء
                    </Link>
                </div>
            </section>

            {/* Visual Placeholder (Map Simulation) */}
            <section className="w-full max-w-6xl px-4 py-12">
                <div className="relative aspect-video w-full rounded-xl border bg-card/50 overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2074&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex flex-col items-center animate-bounce">
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
                    {/* Radius Circle */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-primary/30 rounded-full animate-pulse"></div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="w-full max-w-5xl px-4 py-20 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <BellRing className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">تنبيه الـ 50 متر</h3>
                    <p className="text-muted-foreground">
                        لا تفوت أي صفقة. نرسل لك إشعاراً فورياً عندما تمر بجانب منتج تبحث عنه.
                    </p>
                </div>
                <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                    <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                        <Store className="h-6 w-6 text-green-500" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">تجارة الحي</h3>
                    <p className="text-muted-foreground">
                        ادعم اقتصاد حيك. اكتشف الباعة المتجولين والمحلات الصغيرة و الكبيرة من حولك.
                    </p>
                </div>
                <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                    <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center mb-4">
                        <Users className="h-6 w-6 text-purple-500" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">مجتمع تفاعلي</h3>
                    <p className="text-muted-foreground">
                        خاصية &quot;سيد الحومة&quot; وقصص الفيديو تجعل التسوق تجربة اجتماعية ممتعة.
                    </p>
                </div>
            </section>

            <footer className="w-full py-6 text-center text-sm text-muted-foreground border-t">
                © 2026 SouqMap. جميع الحقوق محفوظة.
            </footer>
        </main>
    )
}

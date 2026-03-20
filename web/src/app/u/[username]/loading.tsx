export default function ProfileLoading() {
    return (
        <main className="min-h-screen bg-zinc-950 text-zinc-100">
            <div className="container mx-auto max-w-2xl pt-20 pb-32 px-4">
                <div className="bg-zinc-900/30 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl p-6">
                    {/* Avatar skeleton */}
                    <div className="flex flex-col items-center gap-4 mb-8">
                        <div className="w-24 h-24 rounded-full bg-zinc-800 animate-pulse" />
                        <div className="h-5 w-40 bg-zinc-800 rounded-lg animate-pulse" />
                        <div className="h-4 w-28 bg-zinc-800/60 rounded-lg animate-pulse" />
                    </div>
                    {/* Stats skeleton */}
                    <div className="flex justify-center gap-8 mb-8">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex flex-col items-center gap-2">
                                <div className="h-6 w-10 bg-zinc-800 rounded animate-pulse" />
                                <div className="h-3 w-14 bg-zinc-800/60 rounded animate-pulse" />
                            </div>
                        ))}
                    </div>
                    {/* Grid skeleton */}
                    <div className="grid grid-cols-3 gap-1">
                        {Array.from({ length: 9 }).map((_, i) => (
                            <div key={i} className="aspect-square bg-zinc-800/50 rounded-lg animate-pulse" />
                        ))}
                    </div>
                </div>
            </div>
        </main>
    )
}

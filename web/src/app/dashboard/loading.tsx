export default function DashboardLoading() {
    return (
        <div className="h-screen w-full bg-zinc-950 flex flex-col items-center justify-center gap-4">
            <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-zinc-800 border-t-cyan-500 animate-spin" />
                <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-b-blue-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
            </div>
            <p className="text-zinc-500 text-sm animate-pulse">جارٍ تحميل الخريطة...</p>
        </div>
    )
}

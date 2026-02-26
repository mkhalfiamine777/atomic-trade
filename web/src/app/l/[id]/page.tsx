
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, MapPin, MessageCircle, Share2, ShieldCheck, ShoppingBag, Store } from 'lucide-react'
import { ListingImageGallery } from '@/components/listing/ListingImageGallery'

// Helper to format currency
const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'MAD',
        maximumFractionDigits: 0
    }).format(price).replace('MAD', 'د.م')
}

export default async function ListingDetailPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params
    const listingId = params.id

    // Fetch listing with seller details
    const listing = await db.listing.findUnique({
        where: { id: listingId },
        include: {
            seller: {
                select: {
                    id: true,
                    name: true,
                    username: true,
                    avatarUrl: true,
                    isVerified: true,
                    reputationScore: true
                }
            }
        }
    })

    if (!listing) {
        return notFound()
    }

    // Parse images (comma-separated string URLs)
    const images = listing.images ? listing.images.split(',') : []

    return (
        <main className="min-h-screen bg-zinc-900 flex justify-center">
            <div className="w-full max-w-md bg-zinc-950 min-h-screen relative shadow-2xl overflow-hidden pt-0 pb-20">

                {/* Header / Navigation */}
                <div className="absolute top-0 left-0 right-0 z-50 p-4 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
                    <Link href={`/u/${listing.seller.username || listing.seller.id}`} className="bg-black/40 backdrop-blur-md p-2 rounded-full pointer-events-auto hover:bg-white/10 transition-colors text-white">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <div className="flex gap-2 pointer-events-auto text-white">
                        <button className="bg-black/40 backdrop-blur-md p-2 rounded-full hover:bg-white/10 transition-colors">
                            <Share2 className="w-6 h-6" />
                        </button>
                        {/* Add to Cart or Save could go here */}
                    </div>
                </div>

                {/* Image Gallery */}
                <div className="relative w-full aspect-square bg-zinc-900">
                    <ListingImageGallery images={images} title={listing.title} />
                </div>

                {/* Content Container */}
                <div className="-mt-6 relative bg-zinc-950 rounded-t-3xl p-6 min-h-[500px] border-t border-white/5">
                    {/* Title & Price Header */}
                    <div className="flex justify-between items-start mb-2">
                        <h1 className="text-2xl font-bold flex-1 ml-4 leading-tight text-white">{listing.title}</h1>
                        <div className="text-xl font-bold text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-lg border border-emerald-400/20">
                            {formatPrice(listing.price)}
                        </div>
                    </div>

                    {/* Meta Info */}
                    <div className="flex items-center gap-4 text-zinc-400 text-sm mb-6 border-b border-white/5 pb-6">
                        <span className="flex items-center gap-1 bg-zinc-900 px-2 py-1 rounded-md">
                            <ShoppingBag className="w-4 h-4" />
                            {listing.type === 'PRODUCT' ? 'للبيع' : 'طلب شراء'}
                        </span>
                        {listing.category && (
                            <span className="bg-zinc-900 px-2 py-1 rounded-md text-zinc-300">
                                {listing.category}
                            </span>
                        )}
                        <span className="flex items-center gap-1 ml-auto">
                            <MapPin className="w-4 h-4 text-zinc-500" />
                            الدار البيضاء
                        </span>
                    </div>

                    {/* Seller Info Card */}
                    <Link href={`/u/${listing.seller.username || listing.seller.id}`} className="flex items-center gap-3 bg-zinc-900/40 p-3 rounded-xl mb-6 hover:bg-zinc-900 transition-colors border border-white/5 group">
                        <div className="relative">
                            <div className="w-12 h-12 rounded-full bg-zinc-800 overflow-hidden ring-2 ring-transparent group-hover:ring-indigo-500 transition-all">
                                {listing.seller.avatarUrl ? (
                                    <Image src={listing.seller.avatarUrl} alt={listing.seller.name || 'Seller'} fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-zinc-500">
                                        <Store className="w-6 h-6" />
                                    </div>
                                )}
                            </div>
                            {listing.seller.isVerified && (
                                <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-0.5 border-2 border-zinc-950">
                                    <ShieldCheck className="w-3 h-3 text-white" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                {listing.seller.name || 'مستخدم مجهول'}
                            </h3>
                            <p className="text-xs text-zinc-400">@{listing.seller.username || 'username'}</p>
                        </div>
                        <div className="text-xs text-yellow-500 font-bold bg-yellow-500/10 px-2 py-1 rounded flex items-center gap-1">
                            <span>★</span> {listing.seller.reputationScore / 20}
                        </div>
                    </Link>

                    {/* Description */}
                    <div className="mb-24">
                        <h3 className="font-bold text-lg mb-2 text-white border-r-4 border-indigo-500 pr-3">الوصف</h3>
                        <p className="text-zinc-300 leading-relaxed whitespace-pre-line text-sm opacity-90">
                            {listing.description}
                        </p>
                    </div>

                    {/* Sticky Action Bar */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-zinc-950/80 backdrop-blur-lg border-t border-white/10 flex gap-3 z-40">
                        <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg shadow-indigo-600/20">
                            <MessageCircle className="w-5 h-5" />
                            تواصل مع البائع
                        </button>
                        {/* Secondary Action (Call / Location) */}
                    </div>
                </div>
            </div>
        </main>
    )
}

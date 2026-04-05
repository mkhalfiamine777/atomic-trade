import L from 'leaflet'

const getBadgeHtml = (count?: number) => {
    return (count && count > 1) ? `<div class="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-md z-50">${count}</div>` : '';
}

// 🔥 Unified Pin Logic (DRY Principle)
export const getPinIcon = (
    colorStart: string,
    colorEnd: string,
    borderColor: string,
    shadowColor: string,
    hasStories: boolean,
    className: string
) =>
    L.divIcon({
        className: '',
        html: `<div class="${hasStories ? className : ''}" style="width:20px;height:25px;background:linear-gradient(135deg,${colorStart},${colorEnd});border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid ${borderColor};box-shadow:0 2px 5px rgba(0,0,0,0.3);${hasStories ? `animation:beacon-pulse 1.3s infinite;filter:drop-shadow(0 0 8px ${shadowColor});` : ''}"></div>`,
        iconSize: [20, 25],
        iconAnchor: [10, 25],
        popupAnchor: [0, -25]
    })

// ── User Type Icon Config ───────────────────────────────────
interface UserIconConfig {
    emoji: string
    neonClass: string           // CSS class for online/active neon effect
    offlineBgClass: string      // Tailwind background for offline state
    offlineBorderClass: string  // Tailwind border for offline state
}

const USER_ICON_CONFIGS: Record<string, UserIconConfig> = {
    SHOP: {
        emoji: '🏪',
        neonClass: 'gold-neon-active',
        offlineBgClass: 'bg-amber-200',
        offlineBorderClass: 'border-amber-100',
    },
    COMPANY: {
        emoji: '🏢',
        neonClass: 'purple-neon-active',
        offlineBgClass: 'bg-violet-200',
        offlineBorderClass: 'border-violet-100',
    },
    INDIVIDUAL: {
        emoji: '👤',
        neonClass: 'neon-active',
        offlineBgClass: 'bg-slate-400',
        offlineBorderClass: 'border-slate-300',
    },
}

// 🧩 Unified User Icon Factory (replaces getShopIcon, getCompanyIcon, getIndividualIcon)
const createUserIcon = (
    config: UserIconConfig,
    isOnline: boolean,
    isVisible: boolean,
    count?: number
) => {
    const badge = getBadgeHtml(count);

    // 🔴 Hidden Mode — Red neon warning
    if (!isVisible) {
        return L.divIcon({
            className: '',
            html: `<div class="relative w-8 h-8"><div class="w-full h-full rounded-full red-neon-active shadow-lg flex items-center justify-center text-white text-sm font-bold animate-bounce">${config.emoji}</div>${badge}</div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
            popupAnchor: [0, -16]
        })
    }

    // 🟢 Online — Neon glow
    if (isOnline) {
        return L.divIcon({
            className: '',
            html: `<div class="relative w-8 h-8"><div class="w-full h-full rounded-full ${config.neonClass} shadow-lg flex items-center justify-center text-white text-sm font-bold">${config.emoji}</div>${badge}</div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
            popupAnchor: [0, -16]
        })
    }

    // ⚫ Offline — Faded static
    return L.divIcon({
        className: '',
        html: `<div class="relative w-8 h-8"><div class="w-full h-full rounded-full ${config.offlineBgClass} shadow-sm flex items-center justify-center text-white text-sm font-bold border-2 ${config.offlineBorderClass} opacity-80">${config.emoji}</div>${badge}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16]
    })
}

// ── Public API (backward-compatible) ────────────────────────

// 🏪 Shop: Gold Neon
export const getShopIcon = (hasStories: boolean, isOnline: boolean = true, isVisible: boolean = true, count?: number) =>
    createUserIcon(USER_ICON_CONFIGS.SHOP, isOnline, isVisible, count)

// 🏢 Company: Purple Neon
export const getCompanyIcon = (hasStories: boolean, isOnline: boolean = true, isVisible: boolean = true, count?: number) =>
    createUserIcon(USER_ICON_CONFIGS.COMPANY, isOnline, isVisible, count)

// 👤 Individual: Blue Neon
export const getIndividualIcon = (hasStories: boolean, isOnline: boolean = true, isVisible: boolean = true, count?: number) =>
    createUserIcon(USER_ICON_CONFIGS.INDIVIDUAL, isOnline, isVisible, count)

// 📦 Product: Green Neon
export const getProductIcon = (count?: number) => {
    const badge = getBadgeHtml(count);
    return L.divIcon({
        className: '',
        html: `<div class="relative w-8 h-8"><div class="w-full h-full rounded-full green-neon-active shadow-lg flex items-center justify-center text-white text-sm font-bold">📦</div>${badge}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16]
    })
}

// 📣 Request Icon: Red Neon
export const getRequestIcon = (count?: number) => {
    const badge = getBadgeHtml(count);
    return L.divIcon({
        className: '',
        html: `<div class="relative w-8 h-8"><div class="w-full h-full rounded-full red-neon-active shadow-lg flex items-center justify-center text-sm font-bold border-2 border-white">📣</div>${badge}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16]
    })
}

// 📸 Story Icon: Pink Neon Glow
export const getStoryIcon = (mediaUrl: string, mediaType: string, count?: number) => {
    const badge = getBadgeHtml(count);
    const borderColor = mediaType === 'VIDEO' ? 'border-pink-500' : 'border-cyan-400';
    return L.divIcon({
        className: '',
        html: `<div class="relative w-8 h-8"><div class="w-full h-full rounded-full overflow-hidden pink-neon-glow shadow-lg relative bg-black border-2 ${borderColor}">
            ${mediaType === 'VIDEO'
                ? `<video src="${mediaUrl}" class="w-full h-full object-cover opacity-90" muted loop autoplay playsinline></video>`
                : `<img src="${mediaUrl}" class="w-full h-full object-cover opacity-90" />`
            }
          </div>${badge}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16]
    })
}

// 🏴‍☠️ Loot Chest Icon (ZoneMaster feature)
export const getLootIcon = (rarity: 'COMMON' | 'RARE' | 'LEGENDARY' = 'COMMON') => {
    const colors = {
        COMMON: ['#9ca3af', '#4b5563'],
        RARE: ['#60a5fa', '#2563eb'],
        LEGENDARY: ['#fbbf24', '#d97706']
    }
    const [start, end] = colors[rarity]

    return L.divIcon({
        className: '',
        html: `<div class="marker-loot w-8 h-8 rounded-md flex items-center justify-center text-lg shadow-lg border-2 border-white" style="background:linear-gradient(135deg,${start},${end}); animation:bounce 2s infinite;">🎁</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    })
}

// 🔴 Smart Cluster Icon
export const getSmartClusterIcon = (count: number, hasShop: boolean) => {
    const bgClass = hasShop ? 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.6)] border-amber-200' : 'bg-indigo-600 shadow-lg border-white';

    return L.divIcon({
        html: `<div class="${bgClass} text-white font-bold rounded-full w-10 h-10 flex items-center justify-center border-2 relative ml-[-10px] mt-[-10px] transform transition-transform hover:scale-110">
                ${count}
                ${hasShop ? '<div class="absolute -top-1 -right-1 text-[10px] bg-white text-amber-500 rounded-full w-4 h-4 flex items-center justify-center font-black shadow-sm">🏪</div>' : ''}
               </div>`,
        className: 'custom-cluster-icon',
        iconSize: [40, 40],
        iconAnchor: [20, 20]
    })
}

// ❌ Close/Collapse Icon
export const getCloseIcon = () =>
    L.divIcon({
        html: '<div class="text-red-500 font-bold text-xl cursor-pointer">×</div>',
        className: '',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
    })

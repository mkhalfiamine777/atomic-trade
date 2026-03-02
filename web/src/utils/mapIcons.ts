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
        className: '', // Empty for proper positioning
        html: `<div class="${hasStories ? className : ''}" style="width:20px;height:25px;background:linear-gradient(135deg,${colorStart},${colorEnd});border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid ${borderColor};box-shadow:0 2px 5px rgba(0,0,0,0.3);${hasStories ? `animation:beacon-pulse 1.3s infinite;filter:drop-shadow(0 0 8px ${shadowColor});` : ''}"></div>`,
        iconSize: [20, 25],
        iconAnchor: [10, 25],
        popupAnchor: [0, -25]
    })

// 🏪 Shop: Gold Neon (Online Status)
export const getShopIcon = (hasStories: boolean, isOnline: boolean = true, count?: number) => {
    const badge = getBadgeHtml(count);
    // If Online -> Neon Gold Disc + Pulse
    if (isOnline) {
        return L.divIcon({
            className: '',
            html: `<div class="relative w-8 h-8"><div class="w-full h-full rounded-full gold-neon-active shadow-lg flex items-center justify-center text-white text-sm font-bold">🏪</div>${badge}</div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
            popupAnchor: [0, -16]
        })
    }

    // If Offline -> Faded Static Gold
    return L.divIcon({
        className: '',
        html: `<div class="relative w-8 h-8"><div class="w-full h-full rounded-full bg-amber-200 shadow-sm flex items-center justify-center text-white text-sm font-bold border-2 border-amber-100 opacity-80">🏪</div>${badge}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16]
    })
}

// 🏢 Company: Purple Neon (Online Status)
export const getCompanyIcon = (hasStories: boolean, isOnline: boolean = true, count?: number) => {
    const badge = getBadgeHtml(count);
    // If Online -> Neon Purple Disc + Pulse
    if (isOnline) {
        return L.divIcon({
            className: '',
            html: `<div class="relative w-8 h-8"><div class="w-full h-full rounded-full purple-neon-active shadow-lg flex items-center justify-center text-white text-sm font-bold">🏢</div>${badge}</div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
            popupAnchor: [0, -16]
        })
    }

    // If Offline -> Faded Static Purple
    return L.divIcon({
        className: '',
        html: `<div class="relative w-8 h-8"><div class="w-full h-full rounded-full bg-violet-200 shadow-sm flex items-center justify-center text-white text-sm font-bold border-2 border-violet-100 opacity-80">🏢</div>${badge}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16]
    })
}

// 👤 Individual: Blue
// 👤 Individual: Blue Neon (Online Status)
export const getIndividualIcon = (hasStories: boolean, isOnline: boolean = true, isVisible: boolean = true, count?: number) => {
    const badge = getBadgeHtml(count);
    // 🔴 Hidden Mode — Same icon, red color
    if (!isVisible) {
        return L.divIcon({
            className: '',
            html: `<div class="relative w-8 h-8"><div class="w-full h-full rounded-full red-neon-active shadow-lg flex items-center justify-center text-white text-sm font-bold animate-bounce">👤</div>${badge}</div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
            popupAnchor: [0, -16]
        })
    }

    // If Online -> Neon Blue Disc + Pulse
    if (isOnline) {
        return L.divIcon({
            className: '',
            html: `<div class="relative w-8 h-8"><div class="w-full h-full rounded-full neon-active shadow-lg flex items-center justify-center text-white text-sm font-bold animate-bounce">👤</div>${badge}</div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
            popupAnchor: [0, -16]
        })
    }

    // If Offline -> Faded Static Disc (No Pulse)
    return L.divIcon({
        className: '',
        html: `<div class="relative w-8 h-8"><div class="w-full h-full rounded-full bg-slate-400 shadow-sm flex items-center justify-center text-white text-sm font-bold border-2 border-slate-300 opacity-80 animate-bounce">👤</div>${badge}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16]
    })
}

// 📣 Request Icon (Distinct Circular Shape)
// 📣 Request Icon (Red Neon - Fast Pulse)
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

// 📸 Story Icon (Pink Neon Glow)
// 📸 Story Icon (Pink Neon Glow)
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

// 🏴‍☠️ Loot Chest Icon (Treasure)
// Adding this now as we prepare for the "ZoneMaster Loot" feature
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

// 🔴 Cluster Icon
export const getClusterIcon = (count: number) =>
    L.divIcon({
        html: `<div class="bg-indigo-600 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center border-2 border-white shadow-lg relative ml-[-6px] mt-[-6px]">
                ${count}
               </div>`,
        className: 'custom-cluster-icon',
        iconSize: [32, 32],
        iconAnchor: [16, 16] // Center anchor
    })

// ❌ Close/Collapse Icon
export const getCloseIcon = () =>
    L.divIcon({
        html: '<div class="text-red-500 font-bold text-xl cursor-pointer">×</div>',
        className: '',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
    })

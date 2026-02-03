import L from 'leaflet'

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

// 🏪 Shop: Orange/Gold
export const getShopIcon = (hasStories: boolean) =>
    getPinIcon('#f59e0b', '#d97706', '#fff', '#f59e0b', hasStories, 'marker-shop')

// 🏢 Company: Yellow/Gold
export const getCompanyIcon = (hasStories: boolean) =>
    getPinIcon('#fbbf24', '#f59e0b', '#fff', '#fbbf24', hasStories, 'marker-company')

// 👤 Individual: Blue
export const getIndividualIcon = (hasStories: boolean) =>
    getPinIcon('#3b82f6', '#1d4ed8', '#fbbf24', '#3b82f6', hasStories, 'marker-individual')

// 📣 Request Icon (Distinct Circular Shape)
export const getRequestIcon = () =>
    L.divIcon({
        className: '',
        html: `<div class="marker-request w-8 h-8 rounded-full bg-gradient-to-br from-red-400 to-rose-600 flex items-center justify-center text-sm shadow-lg border-2 border-white" style="animation:beacon-pulse 1s infinite;filter:drop-shadow(0 0 8px #ef4444);">📣</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    })

// 📸 Story Icon (Distinct Image Shape)
export const getStoryIcon = (mediaUrl: string, mediaType: string) =>
    L.divIcon({
        className: '',
        html: `<div class="marker-story w-10 h-10 rounded-full overflow-hidden border-3 border-pink-500 shadow-lg" style="animation:beacon-glow 2s infinite;box-shadow:0 0 15px #ec4899;">
            ${mediaType === 'VIDEO'
                ? `<video src="${mediaUrl}" class="w-full h-full object-cover" muted loop autoplay playsinline></video>`
                : `<img src="${mediaUrl}" class="w-full h-full object-cover" />`
            }
          </div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40]
    })

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

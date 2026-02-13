import React from 'react'
import { X, Play, Pause } from 'lucide-react'

interface VideoPreviewProps {
    previewUrl: string
    isVideo: boolean
    isPlaying: boolean
    togglePlay: () => void
    onRemove: () => void
    uploading: boolean
    videoRef: React.RefObject<HTMLVideoElement | null>
    onLoadedMetadata: () => void
    onTimeUpdate: () => void
    onEnded: () => void
}

export function VideoPreview({
    previewUrl,
    isVideo,
    isPlaying,
    togglePlay,
    onRemove,
    uploading,
    videoRef,
    onLoadedMetadata,
    onTimeUpdate,
    onEnded
}: VideoPreviewProps) {
    return (
        <div className="relative aspect-video bg-black group">
            {isVideo ? (
                <video
                    ref={videoRef}
                    src={previewUrl}
                    className="w-full h-full object-contain"
                    onLoadedMetadata={onLoadedMetadata}
                    onTimeUpdate={onTimeUpdate}
                    onEnded={onEnded}
                />
            ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
            )}

            {/* Remove Button */}
            <button
                onClick={onRemove}
                className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-500/80 rounded-full text-white backdrop-blur-sm transition-colors z-10"
                disabled={uploading}
            >
                <X className="w-4 h-4" />
            </button>

            {/* Video Controls Overlay */}
            {isVideo && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                    <button
                        onClick={togglePlay}
                        className="w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all transform hover:scale-110"
                    >
                        {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
                    </button>
                </div>
            )}
        </div>
    )
}

import React from 'react'
import { Scissors } from 'lucide-react'

interface TrimControlsProps {
    duration: number
    currentTime: number
    trimRange: [number, number]
    onTrimChange: (type: 'start' | 'end', value: number) => void
    formatTime: (seconds: number) => string
}

export function TrimControls({
    duration,
    currentTime,
    trimRange,
    onTrimChange,
    formatTime
}: TrimControlsProps) {
    if (duration <= 0) return null

    return (
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/50">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-zinc-400 text-sm">
                    <Scissors className="w-4 h-4" />
                    <span>قص الفيديو (Trimming)</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm font-mono text-indigo-400 font-bold min-w-[3rem] text-center bg-zinc-800/50 rounded px-2 py-0.5">
                        {formatTime(currentTime)}
                    </span>
                    <span className="text-zinc-600 text-[10px]">|</span>
                    <span className="text-xs text-zinc-500 font-mono" dir="ltr">
                        {formatTime(trimRange[0])} - {formatTime(trimRange[1])}
                    </span>
                </div>
            </div>

            {/* Range Slider */}
            <div className="relative h-12 bg-zinc-800 rounded-lg overflow-hidden select-none">
                {/* Progress Bar */}
                <div
                    className="absolute top-0 bottom-0 left-0 bg-indigo-500/20 pointer-events-none"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                />

                {/* Trim Region - Left Shade */}
                <div
                    className="absolute top-0 bottom-0 left-0 bg-black/60 pointer-events-none"
                    style={{ width: `${(trimRange[0] / duration) * 100}%` }}
                />

                {/* Trim Region - Right Shade */}
                <div
                    className="absolute top-0 bottom-0 right-0 bg-black/60 pointer-events-none"
                    style={{ width: `${100 - (trimRange[1] / duration) * 100}%` }}
                />

                {/* Range Inputs */}
                <input
                    type="range"
                    min="0"
                    max={duration}
                    step="0.1"
                    value={trimRange[0]}
                    onChange={(e) => onTrimChange('start', parseFloat(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <input
                    type="range"
                    min="0"
                    max={duration}
                    step="0.1"
                    value={trimRange[1]}
                    onChange={(e) => onTrimChange('end', parseFloat(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />

                {/* Visual Handles */}
                <div
                    className="absolute top-0 bottom-0 w-1 bg-indigo-500 pointer-events-none z-20"
                    style={{ left: `${(trimRange[0] / duration) * 100}%` }}
                />
                <div
                    className="absolute top-0 bottom-0 w-1 bg-indigo-500 pointer-events-none z-20"
                    style={{ left: `${(trimRange[1] / duration) * 100}%` }}
                />
            </div>
        </div>
    )
}

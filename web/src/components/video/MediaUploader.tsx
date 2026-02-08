'use client'

import React, { useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, Play, Pause, Scissors, Check, AlertCircle } from 'lucide-react'
import { useUploadThing } from '@/utils/uploadthing'
import { Button } from '@/ui/Button'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface MediaUploaderProps {
    onUploadComplete: (url: string, type: 'IMAGE' | 'VIDEO', metadata?: any) => void
    disabled?: boolean
    className?: string
    maxSize?: number // in MB
}

export function MediaUploader({
    onUploadComplete,
    disabled = false,
    className,
    maxSize = 250 // increased for video
}: MediaUploaderProps) {
    const [file, setFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [uploading, setUploading] = useState(false)
    const [progress, setProgress] = useState(0)

    // Video specific state
    const [isVideo, setIsVideo] = useState(false)
    const [isPlaying, setIsPlaying] = useState(false)
    const [duration, setDuration] = useState(0)
    const [currentTime, setCurrentTime] = useState(0)
    const [trimRange, setTrimRange] = useState<[number, number]>([0, 0])
    const [isTrimming, setIsTrimming] = useState(false)

    const fileInputRef = useRef<HTMLInputElement>(null)
    const videoRef = useRef<HTMLVideoElement>(null)

    const { startUpload } = useUploadThing("mediaPost", {
        onClientUploadComplete: (res) => {
            setUploading(false)
            if (res && res[0]) {
                toast.success("تم الرفع بنجاح!")
                onUploadComplete(res[0].url, isVideo ? 'VIDEO' : 'IMAGE', {
                    duration,
                    trimStart: trimRange[0],
                    trimEnd: trimRange[1]
                })
            }
        },
        onUploadError: (error) => {
            setUploading(false)
            toast.error(`فشل الرفع: ${error.message}`)
        },
        onUploadProgress: (p) => {
            setProgress(p)
        }
    })

    // Handle file selection
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (!selectedFile) return

        // Limit size
        if (selectedFile.size > maxSize * 1024 * 1024) {
            toast.error(`الملف كبير جداً. الحد الأقصى هو ${maxSize} ميجابايت`)
            return
        }

        setFile(selectedFile)
        const objectUrl = URL.createObjectURL(selectedFile)
        setPreviewUrl(objectUrl)
        setIsVideo(selectedFile.type.startsWith('video/'))

        // Reset video state
        setDuration(0)
        setTrimRange([0, 0])
        setIsTrimming(false)
    }

    // Handle drag and drop
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        if (disabled || uploading) return

        const droppedFile = e.dataTransfer.files[0]
        if (droppedFile) {
            if (droppedFile.size > maxSize * 1024 * 1024) {
                toast.error(`الملف كبير جداً. الحد الأقصى هو ${maxSize} ميجابايت`)
                return
            }
            setFile(droppedFile)
            setPreviewUrl(URL.createObjectURL(droppedFile))
            setIsVideo(droppedFile.type.startsWith('video/'))
        }
    }

    // Video metadata loaded
    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            const vidDuration = videoRef.current.duration
            setDuration(vidDuration)
            setTrimRange([0, vidDuration])
        }
    }

    // Handle trim change
    const handleTrimChange = (type: 'start' | 'end', value: number) => {
        if (!videoRef.current) return

        const newRange = [...trimRange] as [number, number]
        if (type === 'start') {
            newRange[0] = Math.min(value, newRange[1] - 1) // Min 1s duration
            videoRef.current.currentTime = newRange[0]
        } else {
            newRange[1] = Math.max(value, newRange[0] + 1)
            videoRef.current.currentTime = newRange[1]
        }
        setTrimRange(newRange)
    }

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause()
            } else {
                videoRef.current.play()
            }
            setIsPlaying(!isPlaying)
        }
    }

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            const time = videoRef.current.currentTime
            setCurrentTime(time)
            // Loop loop logic for trimming preview
            if (time >= trimRange[1]) {
                videoRef.current.currentTime = trimRange[0]
                if (!isPlaying) videoRef.current.pause()
            }
        }
    }

    const handleUpload = async () => {
        if (!file) return
        setUploading(true)
        await startUpload([file])
    }

    const removeFile = () => {
        setFile(null)
        setPreviewUrl(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    // Cleanup object URL
    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl)
        }
    }, [previewUrl])

    return (
        <div className={cn("w-full", className)}>
            <AnimatePresence mode="wait">
                {!file ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={cn(
                            "border-2 border-dashed border-zinc-700 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-zinc-900/50 hover:bg-zinc-800/50 hover:border-indigo-500/50 group",
                            disabled && "opacity-50 cursor-not-allowed"
                        )}
                        onClick={() => !disabled && fileInputRef.current?.click()}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                    >
                        <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Upload className="w-8 h-8 text-zinc-400 group-hover:text-indigo-400 transition-colors" />
                        </div>
                        <p className="text-zinc-300 font-medium text-lg">اضغط للرفع أو اسحب الملف هنا</p>
                        <p className="text-zinc-500 text-sm mt-2">صور (JPEG, PNG) أو فيديو (MP4, WEBM) حتى {maxSize}MB</p>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="rounded-xl overflow-hidden bg-zinc-900 border border-zinc-700"
                    >
                        {/* Preview Area */}
                        <div className="relative aspect-video bg-black group">
                            {isVideo ? (
                                <video
                                    ref={videoRef}
                                    src={previewUrl!}
                                    className="w-full h-full object-contain"
                                    onLoadedMetadata={handleLoadedMetadata}
                                    onTimeUpdate={handleTimeUpdate}
                                    onEnded={() => setIsPlaying(false)}
                                />
                            ) : (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={previewUrl!} alt="Preview" className="w-full h-full object-contain" />
                            )}

                            {/* Remove Button */}
                            <button
                                onClick={removeFile}
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

                        {/* Trimming UI (Video Only) */}
                        {isVideo && duration > 0 && (
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
                                        onChange={(e) => handleTrimChange('start', parseFloat(e.target.value))}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    <input
                                        type="range"
                                        min="0"
                                        max={duration}
                                        step="0.1"
                                        value={trimRange[1]}
                                        onChange={(e) => handleTrimChange('end', parseFloat(e.target.value))}
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
                        )}

                        {/* Action Bar */}
                        <div className="p-4 flex items-center gap-3 bg-zinc-900">
                            {uploading ? (
                                <div className="flex-1">
                                    <div className="flex justify-between text-xs text-zinc-400 mb-1">
                                        <span>جاري الرفع...</span>
                                        <span>{progress}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-indigo-500 transition-all duration-300"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <Button
                                    onClick={handleUpload}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 py-6 text-lg font-bold shadow-lg shadow-indigo-500/20"
                                >
                                    {/* Icon removed to fix TS error */}
                                    <Check className="w-5 h-5 ml-2 inline-block" />
                                    تأكيد ونشر
                                </Button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
            />
        </div>
    )
}

function formatTime(seconds: number) {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
}

'use client'

import React, { useRef, useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { useUploadThing } from '@/utils/uploadthing'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { DropZone } from './DropZone'
import { VideoPreview } from './VideoPreview'
import { TrimControls } from './TrimControls'

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

    // Handle file selection from DropZone or Input
    const handleFileSelect = (selectedFile: File) => {
        setFile(selectedFile)
        const objectUrl = URL.createObjectURL(selectedFile)
        setPreviewUrl(objectUrl)
        setIsVideo(selectedFile.type.startsWith('video/'))

        // Reset video state
        setDuration(0)
        setTrimRange([0, 0])
    }

    // Input change handler
    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            if (maxSize && e.target.files[0].size > maxSize * 1024 * 1024) {
                toast.error(`الملف كبير جداً. الحد الأقصى هو ${maxSize} ميجابايت`)
                return
            }
            handleFileSelect(e.target.files[0])
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
                    <DropZone
                        onFileSelect={handleFileSelect}
                        disabled={disabled}
                        maxSize={maxSize}
                        fileInputRef={fileInputRef}
                    />
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="rounded-xl overflow-hidden bg-zinc-900 border border-zinc-700"
                    >
                        <VideoPreview
                            previewUrl={previewUrl!}
                            isVideo={isVideo}
                            isPlaying={isPlaying}
                            togglePlay={togglePlay}
                            onRemove={removeFile}
                            uploading={uploading}
                            videoRef={videoRef}
                            onLoadedMetadata={handleLoadedMetadata}
                            onTimeUpdate={handleTimeUpdate}
                            onEnded={() => setIsPlaying(false)}
                        />

                        {isVideo && duration > 0 && (
                            <TrimControls
                                duration={duration}
                                currentTime={currentTime}
                                trimRange={trimRange}
                                onTrimChange={handleTrimChange}
                                formatTime={formatTime}
                            />
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
                onChange={onInputChange}
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

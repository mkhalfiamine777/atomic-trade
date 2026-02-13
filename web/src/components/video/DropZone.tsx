import React from 'react'
import { motion } from 'framer-motion'
import { Upload } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface DropZoneProps {
    onFileSelect: (file: File) => void
    disabled?: boolean
    maxSize: number // in MB
    fileInputRef: React.RefObject<HTMLInputElement | null>
}

export function DropZone({ onFileSelect, disabled, maxSize, fileInputRef }: DropZoneProps) {
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        if (disabled) return

        const droppedFile = e.dataTransfer.files[0]
        if (droppedFile) {
            if (droppedFile.size > maxSize * 1024 * 1024) {
                toast.error(`الملف كبير جداً. الحد الأقصى هو ${maxSize} ميجابايت`)
                return
            }
            onFileSelect(droppedFile)
        }
    }

    return (
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
    )
}

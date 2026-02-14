'use client'

import { useState, useEffect } from 'react'
import { useUploadThing } from '@/utils/uploadthing'
import { toast } from 'sonner'
import { ClientUploadedFileData } from 'uploadthing/types'

interface UseMediaUploadOptions {
    endpoint?: "mediaPost" | "imageUploader" // Add other endpoints as needed from core.ts
    maxSize?: number // in MB
    onUploadComplete?: (res: ClientUploadedFileData<any>[]) => void
}

export function useMediaUpload({
    endpoint = "mediaPost",
    maxSize = 250,
    onUploadComplete
}: UseMediaUploadOptions = {}) {
    const [file, setFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [uploading, setUploading] = useState(false)
    const [progress, setProgress] = useState(0)
    const [isVideo, setIsVideo] = useState(false)

    const { startUpload: uploadThingStart } = useUploadThing(endpoint as any, {
        onClientUploadComplete: (res) => {
            setUploading(false)
            if (res) {
                if (onUploadComplete) {
                    onUploadComplete(res)
                } else {
                    toast.success("تم الرفع بنجاح!")
                }
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

    const handleFileSelect = (selectedFile: File) => {
        if (maxSize && selectedFile.size > maxSize * 1024 * 1024) {
            toast.error(`الملف كبير جداً. الحد الأقصى هو ${maxSize} ميجابايت`)
            return
        }
        setFile(selectedFile)
        setIsVideo(selectedFile.type.startsWith('video/'))

        const objectUrl = URL.createObjectURL(selectedFile)
        setPreviewUrl(objectUrl)
    }

    const removeFile = () => {
        setFile(null)
        setPreviewUrl(null)
        setIsVideo(false)
    }

    const startUpload = async () => {
        if (!file) return null
        setUploading(true)
        try {
            const res = await uploadThingStart([file])
            return res
        } catch (e) {
            setUploading(false)
            return null
        }
    }

    // Input Change Handler Wrapper
    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            handleFileSelect(e.target.files[0])
        }
    }

    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl)
        }
    }, [previewUrl])

    return {
        file,
        previewUrl,
        isVideo,
        uploading,
        progress,
        handleFileSelect,
        onInputChange,
        removeFile,
        startUpload
    }
}

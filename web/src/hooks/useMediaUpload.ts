'use client'

import { useState, useEffect } from 'react'
import { useUploadThing } from '@/utils/uploadthing'
import { toast } from 'sonner'
import { ClientUploadedFileData } from 'uploadthing/types'

interface UseMediaUploadOptions {
    endpoint?: "mediaPost" | "avatarUpload" | "productImages" // Added productImages
    maxSize?: number // in MB
    maxFiles?: number // Limit multiple files
    onUploadComplete?: (res: ClientUploadedFileData<any>[]) => void
}

export function useMediaUpload({
    endpoint = "mediaPost",
    maxSize = 250,
    maxFiles = 1,
    onUploadComplete
}: UseMediaUploadOptions = {}) {
    const [files, setFiles] = useState<File[]>([])
    const [previewUrls, setPreviewUrls] = useState<string[]>([])
    const [uploading, setUploading] = useState(false)
    const [progress, setProgress] = useState(0)
    const [isVideo, setIsVideo] = useState(false)

    // UploadThing SDK expects a literal endpoint string, not a union variable — cast required
    const { startUpload: uploadThingStart } = useUploadThing(endpoint, {
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

    const handleFileSelect = (selectedFilesList: FileList | File[]) => {
        const selectedArr = Array.from(selectedFilesList);

        if (maxSize) {
            const oversized = selectedArr.find(f => f.size > maxSize * 1024 * 1024);
            if (oversized) {
                toast.error(`الملف ${oversized.name} كبير جداً. الحد الأقصى هو ${maxSize} ميجابايت.`);
                return;
            }
        }

        if (files.length + selectedArr.length > maxFiles) {
            toast.error(`لا يمكنك رفع أكثر من ${maxFiles} ملفات.`);
            return;
        }

        setFiles(prev => [...prev, ...selectedArr]);

        // Single video check optimization
        if (selectedArr.length === 1 && selectedArr[0].type.startsWith('video/')) {
            setIsVideo(true);
        }

        const newUrls = selectedArr.map(f => URL.createObjectURL(f));
        setPreviewUrls(prev => [...prev, ...newUrls]);
    }

    const removeFile = (index: number = 0) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
        setPreviewUrls(prev => {
            const latest = [...prev];
            URL.revokeObjectURL(latest[index]);
            latest.splice(index, 1);
            return latest;
        });
        if (files.length <= 1) setIsVideo(false);
    }

    const startUpload = async () => {
        if (files.length === 0) return null
        setUploading(true)
        try {
            const res = await uploadThingStart(files)
            return res
        } catch (e) {
            setUploading(false)
            return null
        }
    }

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.length) {
            handleFileSelect(e.target.files)
        }
    }

    useEffect(() => {
        return () => {
            previewUrls.forEach(url => URL.revokeObjectURL(url));
        }
    }, [previewUrls])

    // Notice we return BOTH `file`/`previewUrl` (for old endpoints) AND `files`/`previewUrls` (for Multi-modals).
    return {
        file: files[0] || null,
        files,
        previewUrl: previewUrls[0] || null,
        previewUrls,
        isVideo,
        uploading,
        progress,
        handleFileSelect,
        onInputChange,
        removeFile,
        startUpload
    }
}

'use client'

import React, { useState } from 'react'
import { X, Loader2, Camera } from 'lucide-react'
import { UploadButton } from '@/utils/uploadthing'

interface AvatarUploaderProps {
    value: string
    onChange: (url: string) => void
}

export function AvatarUploader({ value, onChange }: AvatarUploaderProps) {
    const [isUploading, setIsUploading] = useState(false)

    return (
        <div className="space-y-3">
            <label className="text-sm font-medium text-zinc-400">صورة الملف الشخصي</label>

            {/* Centered vertical layout */}
            <div className="flex flex-col items-center gap-3">
                {/* Avatar Preview */}
                <div className="relative">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-zinc-700 bg-zinc-800 shadow-lg">
                        {value ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={value} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <Camera className="w-8 h-8 text-zinc-600" />
                            </div>
                        )}
                    </div>

                    {/* Remove Button */}
                    {value && (
                        <button
                            type="button"
                            onClick={() => onChange('')}
                            className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 shadow-md hover:bg-red-600 transition-colors"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    )}
                </div>

                {/* Upload Button */}
                {isUploading ? (
                    <div className="flex items-center gap-2 text-zinc-400 text-sm py-2">
                        <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                        <span>جارٍ الرفع...</span>
                    </div>
                ) : (
                    <div className="w-full [&_label]:!w-full [&_div]:!items-center">
                        <UploadButton
                            endpoint="avatarUpload"
                            onUploadBegin={() => setIsUploading(true)}
                            onClientUploadComplete={(res) => {
                                setIsUploading(false)
                                if (res?.[0]?.ufsUrl) {
                                    onChange(res[0].ufsUrl)
                                }
                            }}
                            onUploadError={(error: Error) => {
                                setIsUploading(false)
                                console.error('Upload error:', error)
                            }}
                            appearance={{
                                button: 'w-full bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/20 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ut-uploading:bg-zinc-800',
                                container: 'w-full flex flex-col items-center gap-1',
                                allowedContent: 'text-zinc-500 text-xs',
                            }}
                            content={{
                                button: ({ ready }) => ready ? 'رفع صورة' : 'جارٍ التحضير...',
                                allowedContent: 'صور فقط (4MB كحد أقصى)',
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}

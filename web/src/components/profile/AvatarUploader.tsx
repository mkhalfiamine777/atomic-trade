import React from 'react'
import { Upload } from 'lucide-react'

interface AvatarUploaderProps {
    value: string
    onChange: (url: string) => void
}

export function AvatarUploader({ value, onChange }: AvatarUploaderProps) {
    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">صورة الملف الشخصي (رابط)</label>
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <input
                        type="url"
                        value={value}
                        onChange={e => onChange(e.target.value)}
                        placeholder="https://example.com/avatar.jpg"
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 pl-10 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <Upload className="w-4 h-4 text-zinc-500 absolute left-3 top-3.5" />
                </div>
                {value && (
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-zinc-700 bg-zinc-800 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={value} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                )}
            </div>
        </div>
    )
}

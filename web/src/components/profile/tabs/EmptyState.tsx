import React from 'react'
import { FolderOpen } from 'lucide-react'

export function EmptyState({ label }: { label: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
            <div className="bg-zinc-900 p-4 rounded-full mb-4">
                <FolderOpen className="w-8 h-8 opacity-50" />
            </div>
            <p className="text-sm font-medium">{label}</p>
        </div>
    )
}

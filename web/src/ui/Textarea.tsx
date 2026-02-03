import { TextareaHTMLAttributes, forwardRef } from 'react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, label, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm text-zinc-400 mb-1">
                        {label}
                    </label>
                )}
                <textarea
                    className={cn(
                        "w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 focus:outline-none focus:border-primary placeholder:text-zinc-600 text-zinc-100 transition-colors min-h-[80px]",
                        className
                    )}
                    ref={ref}
                    {...props}
                />
            </div>
        )
    }
)
Textarea.displayName = 'Textarea'

export { Textarea }

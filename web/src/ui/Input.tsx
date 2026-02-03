import { InputHTMLAttributes, forwardRef } from 'react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, label, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm text-zinc-400 mb-1">
                        {label}
                    </label>
                )}
                <input
                    type={type}
                    className={cn(
                        "w-full bg-zinc-950 border border-zinc-800 rounded-lg h-10 px-3 focus:outline-none focus:border-primary placeholder:text-zinc-600 text-zinc-100 transition-colors",
                        className
                    )}
                    ref={ref}
                    {...props}
                />
            </div>
        )
    }
)
Input.displayName = 'Input'

export { Input }

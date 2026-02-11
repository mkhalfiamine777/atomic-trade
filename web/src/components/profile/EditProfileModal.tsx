'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save, Upload, User, Store } from 'lucide-react'
import { updateProfile } from '@/actions/updateProfile'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

// ... imports

interface EditProfileModalProps {
    isOpen: boolean
    onClose: () => void
    user: {
        id: string
        name: string | null
        username: string | null
        avatarUrl: string | null
        type: string | null
    }
}

export function EditProfileModal({ isOpen, onClose, user }: EditProfileModalProps) {
    const [name, setName] = useState(user.name || '')
    const [username, setUsername] = useState(user.username || '')
    const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '')
    const [type, setType] = useState(user.type || 'INDIVIDUAL')
    const [shopCategory, setShopCategory] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        const formData = new FormData()
        formData.append('name', name)
        formData.append('username', username)
        formData.append('avatarUrl', avatarUrl)
        formData.append('type', type)
        if (type === 'SHOP') formData.append('shopCategory', shopCategory)

        const result = await updateProfile(formData)

        if (result.success) {
            toast.success('تم تحديث الملف الشخصي بنجاح! 🎉')
            onClose()
            router.refresh()
        } else {
            toast.error(result.error || 'فشل التحديث')
        }

        setIsLoading(false)
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-zinc-900 w-full max-w-md rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/50 sticky top-0 backdrop-blur-md z-10">
                        <h3 className="font-bold text-white text-lg">تعديل الملف الشخصي</h3>
                        <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">

                        {/* Avatar Input */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-400">صورة الملف الشخصي (رابط)</label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <input
                                        type="url"
                                        value={avatarUrl}
                                        onChange={e => setAvatarUrl(e.target.value)}
                                        placeholder="https://example.com/avatar.jpg"
                                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 pl-10 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                    <Upload className="w-4 h-4 text-zinc-500 absolute left-3 top-3.5" />
                                </div>
                                {avatarUrl && (
                                    <div className="w-12 h-12 rounded-full overflow-hidden border border-zinc-700 bg-zinc-800 shrink-0">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Name Input */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-400">الاسم الظاهر</label>
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                minLength={2}
                                required
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>

                        {/* Username Input */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-400">اسم المستخدم (Username)</label>
                            <div className="relative">
                                <span className="absolute right-4 top-3.5 text-zinc-500 font-bold">@</span>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    placeholder="username"
                                    pattern="[a-zA-Z0-9_]{3,20}"
                                    title="أحرف إنجليزية، أرقام، و _ فقط (3-20 حرف)"
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 pr-8 text-white focus:ring-2 focus:ring-indigo-500 outline-none dir-ltr"
                                    style={{ direction: 'ltr' }}
                                />
                            </div>
                            <p className="text-xs text-zinc-500">يستخدم في الروابط والبحث. يجب أن يكون فريداً.</p>
                        </div>

                        {/* Account Type */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-400">نوع الحساب</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setType('INDIVIDUAL')}
                                    className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${type === 'INDIVIDUAL'
                                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400'
                                        : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700'
                                        }`}
                                >
                                    <User className="w-6 h-6" />
                                    <span className="text-sm font-bold">فرد / مستقل</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setType('SHOP')}
                                    className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${type === 'SHOP'
                                        ? 'bg-pink-600/20 border-pink-500 text-pink-400'
                                        : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700'
                                        }`}
                                >
                                    <Store className="w-6 h-6" />
                                    <span className="text-sm font-bold">متجر تجاري</span>
                                </button>
                            </div>
                        </div>

                        {/* Shop Category (Conditional) */}
                        {type === 'SHOP' && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-400">فئة المتجر</label>
                                <select
                                    value={shopCategory}
                                    onChange={e => setShopCategory(e.target.value)}
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                                >
                                    <option value="">اختر الفئة...</option>
                                    <option value="FASHION">ملابس وأزياء</option>
                                    <option value="ELECTRONICS">إلكترونيات</option>
                                    <option value="HOME">منزل وديكور</option>
                                    <option value="BEAUTY">صحة وجمال</option>
                                    <option value="FOOD">طعام ومشروبات</option>
                                </select>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    <span>حفظ التغييرات</span>
                                </>
                            )}
                        </button>

                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}

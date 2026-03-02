import { z } from 'zod';
import { UserType, ListingType } from '@prisma/client';

export const loginSchema = z.object({
    phone: z.string().min(8, { message: "رقم الهاتف غير صالح" }),
    password: z.string().min(1, { message: "كلمة المرور مطلوبة" }),
});

export const signupSchema = z.object({
    name: z.string().min(2, { message: "الاسم يجب أن يكون حرفين على الأقل" }),
    phone: z.string().min(8, { message: "رقم الهاتف يجب أن يكون 8 أرقام على الأقل" }),
    password: z.string().min(6, { message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" }),
    type: z.nativeEnum(UserType).default(UserType.INDIVIDUAL),
    shopCategory: z.string().optional().nullable(),
});

export const createListingSchema = z.object({
    title: z.string().min(3, { message: "العنوان يجب أن يكون 3 أحرف على الأقل" })
        .max(100, { message: "العنوان طويل جداً (الحد الأقصى 100 حرف)" }),
    description: z.string().nullish(),
    price: z.coerce.number().min(0, { message: "السعر يجب أن يكون رقماً موجباً" }),
    type: z.nativeEnum(ListingType),
    category: z.string().min(1, { message: "التصنيف مطلوب" }),
    subcategory: z.string().nullish(),
    imageUrl: z.string().nullish(), // URL from Uploadthing
    latitude: z.coerce.number().nullish(),
    longitude: z.coerce.number().nullish(),
});

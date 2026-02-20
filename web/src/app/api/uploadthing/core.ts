import { createUploadthing, type FileRouter } from "uploadthing/next";
import { cookies } from "next/headers";

const f = createUploadthing();

export const ourFileRouter = {
    // Define as many FileRoutes as you like, each with a unique routeSlug
    mediaPost: f({ image: { maxFileSize: "16MB", maxFileCount: 1 }, video: { maxFileSize: "128MB", maxFileCount: 1 } })
        .middleware(async ({ req }) => {
            const user = (await cookies()).get("user_id")?.value;
            if (!user) throw new Error("Unauthorized");
            return { userId: user };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            console.log("Upload complete for userId:", metadata.userId);
            console.log("file url", file.ufsUrl);
            return { uploadedBy: metadata.userId };
        }),

    // Avatar Upload (profile picture)
    avatarUpload: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
        .middleware(async ({ req }) => {
            const user = (await cookies()).get("user_id")?.value;
            if (!user) throw new Error("Unauthorized");
            return { userId: user };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            console.log("Avatar uploaded for userId:", metadata.userId);
            return { url: file.ufsUrl };
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

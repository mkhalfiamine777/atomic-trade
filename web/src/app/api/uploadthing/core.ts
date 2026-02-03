import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
    // Define as many FileRoutes as you like, each with a unique routeSlug
    mediaPost: f({ image: { maxFileSize: "16MB", maxFileCount: 1 }, video: { maxFileSize: "128MB", maxFileCount: 1 } })
        .onUploadComplete(async ({ metadata, file }) => {
            // This code RUNS ON YOUR SERVER after upload
            console.log("Upload complete for userId:", "anonymous");
            console.log("file url", file.ufsUrl);
            return { uploadedBy: "anonymous" };
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

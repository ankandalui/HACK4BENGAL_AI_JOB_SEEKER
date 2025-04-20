import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  pdfUploader: f({ pdf: { maxFileSize: "4MB" } })
    .middleware(async () => {
      return { timestamp: Date.now() };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.timestamp, url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

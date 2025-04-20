import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

const f = createUploadthing();

// Initial empty analysis object
const initialAnalysis: Prisma.JsonObject = {
  status: "pending",
  results: [],
};

export const ourFileRouter = {
  resumeUploader: f({
    pdf: { maxFileSize: "4MB" },
  })
    .middleware(async ({ req }) => {
      try {
        // Get session from NextAuth
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
          throw new Error("Unauthorized");
        }

        // Get user from database
        const user = await prisma.user.findUnique({
          where: { email: session.user.email },
        });

        if (!user) throw new Error("User not found");

        return { userId: user.id };
      } catch (error) {
        console.error("Auth error:", error);
        throw new Error("Authentication failed");
      }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      try {
        // Create a new upload record
        const newUpload = await prisma.userUpload.create({
          data: {
            userId: metadata.userId,
            fileUrl: file.url,
            fileKey: file.key,
            fileName: file.name,
            fileType: "pdf",
            fileSize: file.size,
            status: "pending",
            analysis: initialAnalysis as Prisma.InputJsonValue, // Properly typed initial value
          },
          include: {
            user: true,
          },
        });

        console.log("File uploaded successfully:", newUpload.id);

        return {
          uploadedBy: metadata.userId,
          uploadId: newUpload.id,
          fileUrl: file.url,
        };
      } catch (error) {
        console.error("Upload error:", error);
        throw new Error("Failed to save upload to database");
      }
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

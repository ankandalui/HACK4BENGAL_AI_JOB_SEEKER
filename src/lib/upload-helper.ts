import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function updateUploadStatus(
  uploadId: string,
  status: "pending" | "analyzed" | "error",
  analysis?: any
) {
  try {
    const updatedUpload = await prisma.userUpload.update({
      where: { id: uploadId },
      data: {
        status,
        ...(analysis && { analysis }),
      },
    });

    return updatedUpload;
  } catch (error) {
    console.error("Error updating upload status:", error);
    throw new Error("Failed to update upload status");
  }
}

export async function updateUploadAnalysis(
  uploadId: string,
  analysisData: Prisma.JsonObject
) {
  try {
    const updatedUpload = await prisma.userUpload.update({
      where: { id: uploadId },
      data: {
        status: "analyzed",
        analysis: analysisData as Prisma.InputJsonValue,
      },
    });

    return updatedUpload;
  } catch (error) {
    console.error("Error updating analysis:", error);
    throw new Error("Failed to update analysis");
  }
}

export async function getUserUploads(userId: string) {
  try {
    const uploads = await prisma.userUpload.findMany({
      where: { userId },
      orderBy: { uploadedAt: "desc" },
    });

    return uploads;
  } catch (error) {
    console.error("Error fetching user uploads:", error);
    throw new Error("Failed to fetch uploads");
  }
}

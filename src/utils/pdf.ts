"use client";

export async function savePdfLocally(file: File): Promise<string> {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload file");
    }

    const data = await response.json();
    return data.filePath;
  } catch (error) {
    console.error("Error saving PDF:", error);
    throw error;
  }
}

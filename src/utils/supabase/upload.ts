import { createClient } from "./client";

export async function uploadAsset(file: File, folder: "listening" | "reading" | "writing" | "speaking"): Promise<string> {
  const client = createClient();
  
  // Create a unique filename to prevent overrides
  const ext = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;
  const filePath = `${folder}/${fileName}`;

  const { data, error } = await client.storage
    .from("exam-assets")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("Storage upload error:", error.message);
    throw new Error("Faylni yuklashda xatolik yuz berdi: " + error.message);
  }

  // Get public URL
  const { data: pubData } = client.storage.from("exam-assets").getPublicUrl(filePath);
  
  return pubData.publicUrl;
}

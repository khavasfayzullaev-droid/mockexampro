import { createClient } from "./client";

export async function uploadAsset(file: File | Blob, folder: "listening" | "reading" | "writing" | "speaking"): Promise<string> {
  const client = createClient();
  
  // Create a unique filename to prevent overrides
  const originalName = (file as File).name || 'audio.webm';
  const ext = originalName.split('.').pop() || 'bin';
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;
  const filePath = `${folder}/${fileName}`;

  const { data, error } = await client.storage
    .from("exam-assets")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("Storage upload error:", error);
    if (error.message.includes('Row level security')) {
       throw new Error("Siz tizimga kirmagansiz yoki fayl yuklash uchun ruxsatingiz yo'q (RLS xatoligi).");
    }
    if (error.message.includes('Bucket not found') || error.message.includes('not found')) {
       throw new Error("'exam-assets' nomli bucket topilmadi. Supabase SQL orqali bucket ratishni esdan chiqarmadingizmi?");
    }
    throw new Error("Faylni yuklashda xatolik yuz berdi: " + error.message);
  }

  // Get public URL
  const { data: pubData } = client.storage.from("exam-assets").getPublicUrl(filePath);
  
  return pubData.publicUrl;
}

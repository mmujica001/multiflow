import { createClient } from "./supabase";

const BUCKET = "transaction-images";

export async function uploadTransactionImage(
  userId: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<string | null> {
  const supabase = createClient();
  if (!supabase) return null;

  const ext = file.name.split(".").pop() || "jpg";
  const filePath = `${userId}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, file, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("Error uploading image:", error.message);
    return null;
  }

  const { data: publicUrl } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(filePath);

  return publicUrl.publicUrl;
}

export async function deleteTransactionImage(
  imageUrl: string
): Promise<void> {
  const supabase = createClient();
  if (!supabase) return;

  const urlParts = imageUrl.split("/");
  const bucketIndex = urlParts.indexOf(BUCKET);
  if (bucketIndex === -1) return;

  const filePath = urlParts.slice(bucketIndex + 1).join("/");

  await supabase.storage.from(BUCKET).remove([filePath]);
}

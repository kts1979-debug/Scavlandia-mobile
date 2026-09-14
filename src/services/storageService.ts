// src/services/storageService.ts
import { supabase } from "../utils/supabaseConfig";

export async function uploadHuntPhoto(
  photoUri: string,
  huntId: string,
  stopOrder: number,
): Promise<string> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) throw new Error("Must be logged in to upload photos");

  const uid = session.user.id;

  // Convert the local photo URI to a blob using fetch()
  const response = await fetch(photoUri);
  const blob = await response.blob();

  // Build the storage path
  const timestamp = Date.now();
  const fileName = `stop_${stopOrder}_${timestamp}.jpg`;
  const storagePath = `${uid}/${huntId}/${fileName}`;

  // Upload to Supabase Storage
  const { error } = await supabase.storage
    .from("hunt-photos")
    .upload(storagePath, blob, {
      contentType: "image/jpeg",
      upsert: false,
    });

  if (error) throw error;

  // Get public URL
  const { data } = supabase.storage
    .from("hunt-photos")
    .getPublicUrl(storagePath);

  return data.publicUrl;
}

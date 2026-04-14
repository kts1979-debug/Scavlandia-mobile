// src/services/storageService.ts
// Handles uploading photos to Firebase Storage.
// Called from ActiveHuntScreen when a user takes a photo at a stop.

import * as FileSystem from "expo-file-system";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { auth } from "../utils/firebaseConfig";

const storage = getStorage();

// ── Upload a photo to Firebase Storage ──────────────────────────
// photoUri:  the local file path from expo-image-picker (e.g. 'file:///...')
// huntId:    which hunt this photo belongs to
// stopOrder: which stop number (1, 2, 3...)
// Returns:   the public download URL of the uploaded photo
export async function uploadHuntPhoto(
  photoUri: string,
  huntId: string,
  stopOrder: number,
): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error("Must be logged in to upload photos");

  // Step 1: Read the photo file from the device as a blob
  // A 'blob' is just raw file data that can be uploaded
  console.log("Reading photo from device...");
  const photoInfo = await FileSystem.getInfoAsync(photoUri);
  if (!photoInfo.exists) throw new Error("Photo file not found on device");

  // Read the file as base64 then convert to a blob
  const base64 = await FileSystem.readAsStringAsync(photoUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  // Convert base64 string to binary data for upload
  const byteArray = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  const blob = new Blob([byteArray], { type: "image/jpeg" });

  // Step 2: Create the storage path
  // Format: huntPhotos/{userId}/{huntId}/stop_{stopOrder}_{timestamp}.jpg
  const timestamp = Date.now();
  const fileName = `stop_${stopOrder}_${timestamp}.jpg`;
  const storagePath = `huntPhotos/${user.uid}/${huntId}/${fileName}`;

  console.log("Uploading photo to:", storagePath);

  // Step 3: Upload to Firebase Storage
  const storageRef = ref(storage, storagePath);
  await uploadBytes(storageRef, blob, { contentType: "image/jpeg" });

  // Step 4: Get the permanent download URL
  const downloadURL = await getDownloadURL(storageRef);
  console.log("Photo uploaded successfully:", downloadURL);

  return downloadURL;
}

// src/services/storageService.ts
// Handles uploading photos to Firebase Storage.
// Uses fetch() to convert the photo URI to a blob —
// avoids any expo-file-system dependency entirely.

import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { auth } from "../utils/firebaseConfig";

const storage = getStorage();

export async function uploadHuntPhoto(
  photoUri: string,
  huntId: string,
  stopOrder: number,
): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error("Must be logged in to upload photos");

  console.log("Starting photo upload...");

  // Convert the local photo URI to a blob using fetch()
  // This approach works on all Expo versions without any file system API
  const response = await fetch(photoUri);
  const blob = await response.blob();

  // Build the storage path
  const timestamp = Date.now();
  const fileName = `stop_${stopOrder}_${timestamp}.jpg`;
  const storagePath = `huntPhotos/${user.uid}/${huntId}/${fileName}`;

  console.log("Uploading to Firebase Storage:", storagePath);

  // Upload to Firebase Storage
  const storageRef = ref(storage, storagePath);
  await uploadBytes(storageRef, blob, { contentType: "image/jpeg" });

  // Get and return the permanent download URL
  const downloadURL = await getDownloadURL(storageRef);
  console.log("Upload successful:", downloadURL);

  return downloadURL;
}

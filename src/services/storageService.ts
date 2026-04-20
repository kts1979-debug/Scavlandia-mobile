// src/services/storageService.ts
import { getStorage, ref, uploadBytes } from "firebase/storage";
import { auth } from "../utils/firebaseConfig";

const storage = getStorage();

export async function uploadHuntPhoto(
  photoUri: string,
  huntId: string,
  stopOrder: number,
): Promise<string> {
  console.log("🔥 NEW storageService running - stopOrder:", stopOrder);

  const user = auth.currentUser;
  if (!user) throw new Error("Must be logged in to upload photos");

  console.log("Starting photo upload...");

  // Convert the local photo URI to a blob using fetch()
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

  // Build download URL manually with encoded slashes
  const encodedPath = `huntPhotos%2F${user.uid}%2F${huntId}%2F${fileName}`;
  const bucket = "daytripper-prod.firebasestorage.app";

  // Fetch the download token from Firebase Storage metadata
  const metaResponse = await fetch(
    `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodedPath}`,
  );
  const metadata = await metaResponse.json();
  const token = metadata.downloadTokens;

  const downloadURL = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodedPath}?alt=media&token=${token}`;

  console.log("Upload successful:", downloadURL);
  return downloadURL;
}

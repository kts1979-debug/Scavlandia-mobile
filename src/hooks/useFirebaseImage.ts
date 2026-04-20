// src/hooks/useFirebaseImage.ts
// Loads a Firebase Storage image with authentication.
// Firebase Storage URLs require an auth token to access.

import { useEffect, useState } from "react";
import { auth } from "../utils/firebaseConfig";

export function useFirebaseImage(url: string | undefined) {
  const [localUri, setLocalUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!url) {
      setLoading(false);
      return;
    }

    // Firebase Storage download URLs with ?alt=media&token= are publicly
    // accessible if Storage rules allow it — but our rules restrict access.
    // The simplest fix is to fetch with the auth token and use the result.
    const loadImage = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setError(true);
          setLoading(false);
          return;
        }

        const token = await user.getIdToken();
        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Failed to fetch image");

        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        setLocalUri(objectUrl);
      } catch {
        // If authenticated fetch fails try the URL directly
        // (works if Storage rules are permissive enough)
        setLocalUri(url);
      } finally {
        setLoading(false);
      }
    };

    loadImage();
  }, [url]);

  return { localUri, loading, error };
}

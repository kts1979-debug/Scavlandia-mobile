// src/context/AuthContext.tsx
import {
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  updateProfile,
  User,
} from "firebase/auth";
import React, { createContext, useContext, useEffect, useState } from "react";
import { saveUserProfile } from "../services/apiService";
import { initializePurchases } from "../services/purchaseService";
import { auth } from "../utils/firebaseConfig";

// ── Define what the context provides to every screen ─────────────
interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    displayName: string,
  ) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);

      if (firebaseUser) {
        // Save/update profile in backend
        try {
          await saveUserProfile(
            firebaseUser.displayName || firebaseUser.email || "User",
          );
        } catch (err) {
          console.log("Profile save failed (non-critical):", err);
        }

        // Initialize RevenueCat with the user's ID
        // This links purchases to the correct user account
        try {
          initializePurchases(firebaseUser.uid);
          console.log("💰 RevenueCat initialized for user:", firebaseUser.uid);
        } catch (err) {
          console.log("RevenueCat init failed (non-critical):", err);
        }
      } else {
        // User logged out — initialize RevenueCat without a user ID
        try {
          initializePurchases();
        } catch (err) {
          console.log("RevenueCat anonymous init failed (non-critical):", err);
        }
      }
    });

    return unsubscribe;
  }, []);

  const signUp = async (
    email: string,
    password: string,
    displayName: string,
  ) => {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    await updateProfile(userCredential.user, { displayName });
    await saveUserProfile(displayName);
  };

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return context;
}

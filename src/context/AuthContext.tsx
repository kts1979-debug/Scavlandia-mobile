// src/context/AuthContext.tsx
// This file manages login state for the entire app.
// It tracks whether a user is logged in and who they are.
// Any screen can import useAuth() to get this information.

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
import { auth } from "../utils/firebaseConfig";

// ── Define what the context provides to every screen ─────────────
interface AuthContextType {
  user: User | null; // The logged-in user, or null if not logged in
  loading: boolean; // True while checking if user is logged in
  signUp: (
    email: string,
    password: string,
    displayName: string,
  ) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

// ── Create the context ───────────────────────────────────────────
const AuthContext = createContext<AuthContextType | null>(null);

// ── The Provider wraps your entire app and shares auth state ─────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Start true — checking login status

  // ── Listen for login/logout changes ──────────────────────────
  // This runs automatically whenever the user logs in or out.
  // Firebase calls this immediately on app start to restore the previous session.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);

      // If user just logged in, save/update their profile in your backend
      if (firebaseUser) {
        try {
          await saveUserProfile(
            firebaseUser.displayName || firebaseUser.email || "User",
          );
        } catch (err) {
          // Don't crash the app if profile save fails — just log it
          console.log("Profile save failed (non-critical):", err);
        }
      }
    });

    // Clean up the listener when the app closes
    return unsubscribe;
  }, []);

  // ── Sign Up: create a new account ────────────────────────────
  const signUp = async (
    email: string,
    password: string,
    displayName: string,
  ) => {
    // Create the account in Firebase
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );

    // Add the display name to their profile
    await updateProfile(userCredential.user, { displayName });

    // Save their profile to your Firestore database
    await saveUserProfile(displayName);
  };

  // ── Sign In: log into an existing account ────────────────────
  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
    // onAuthStateChanged above will automatically update 'user' state
  };

  // ── Sign Out: log out ─────────────────────────────────────────
  const signOut = async () => {
    await firebaseSignOut(auth);
    // onAuthStateChanged above will automatically set user to null
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── useAuth: the hook screens use to access auth state ───────────
// Usage in any screen: const { user, signIn, signOut } = useAuth();
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return context;
}

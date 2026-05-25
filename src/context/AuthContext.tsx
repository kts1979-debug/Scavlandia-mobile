// src/context/AuthContext.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  OAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithCredential,
  signInWithEmailAndPassword,
  updateProfile,
  User,
} from "firebase/auth";
import React, { createContext, useContext, useEffect, useState } from "react";
import { saveUserProfile } from "../services/apiService";
import { initializePurchases } from "../services/purchaseService";
import { auth } from "../utils/firebaseConfig";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    displayName: string,
  ) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
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
        try {
          await saveUserProfile(
            firebaseUser.displayName || firebaseUser.email || "User",
          );
        } catch (err) {
          console.warn("Profile save failed (non-critical):", err);
        }
        try {
          initializePurchases(firebaseUser.uid);
        } catch (err) {
          console.warn("RevenueCat init failed (non-critical):", err);
        }
      } else {
        try {
          initializePurchases();
        } catch (err) {
          console.warn("RevenueCat anonymous init failed (non-critical):", err);
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
    await AsyncStorage.removeItem("scavlandia_onboarding_complete");
  };

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle = async () => {
    try {
      const { GoogleSignin } =
        await import("@react-native-google-signin/google-signin");
      GoogleSignin.configure({
        webClientId:
          "659464658532-njhck3orvq6fjoi1m5kfc4mbhhrlli1h.apps.googleusercontent.com",
        offlineAccess: true,
      });
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
      await GoogleSignin.signIn();
      const tokens = await GoogleSignin.getTokens();
      const googleCredential = GoogleAuthProvider.credential(tokens.idToken);
      await signInWithCredential(auth, googleCredential);
    } catch (e: any) {
      if (e.code === "SIGN_IN_CANCELLED") {
        // User cancelled — don't throw, just return silently
        return;
      } else if (e.code === "IN_PROGRESS") {
        return;
      } else if (e.code === "PLAY_SERVICES_NOT_AVAILABLE") {
        throw new Error(
          "Google Play Services is not available on this device.",
        );
      } else {
        throw e;
      }
    }
  };

  const signInWithApple = async () => {
    const AppleAuthentication = await import("expo-apple-authentication");

    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    const { identityToken } = credential;
    if (!identityToken)
      throw new Error("Apple Sign In failed — no identity token");

    const provider = new OAuthProvider("apple.com");
    const appleCredential = provider.credential({
      idToken: identityToken,
      rawNonce: undefined,
    });

    const result = await signInWithCredential(auth, appleCredential);

    // Apple only provides name on first sign-in
    if (credential.fullName?.givenName && result.user.displayName === null) {
      const displayName = [
        credential.fullName.givenName,
        credential.fullName.familyName,
      ]
        .filter(Boolean)
        .join(" ");
      await updateProfile(result.user, { displayName });
      await saveUserProfile(displayName);
    }
  };

  const sendPasswordReset = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signUp,
        signIn,
        signInWithGoogle,
        signInWithApple,
        sendPasswordReset,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside an AuthProvider");
  return context;
}

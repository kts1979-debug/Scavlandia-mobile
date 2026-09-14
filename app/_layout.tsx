import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Linking from "expo-linking";
import { router, Stack } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import "react-native-gesture-handler";
import { AuthProvider, useAuth } from "../src/context/AuthContext";
import { COLORS } from "../src/theme";
import { supabase } from "../src/utils/supabaseConfig";

function RootStack() {
  const { loading, user } = useAuth();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const hasNavigated = useRef(false);

  // ── Handle OAuth deep link callback ──────────────────────────
  useEffect(() => {
    // Handle the initial URL if app was opened via deep link
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink(url);
    });

    // Listen for deep links while app is open
    const subscription = Linking.addEventListener("url", ({ url }) => {
      handleDeepLink(url);
    });

    return () => subscription.remove();
  }, []);

  const handleDeepLink = async (url: string) => {
    if (url.includes("auth/callback")) {
      // Extract tokens from the URL and set the session
      const { data, error } = await supabase.auth.getSessionFromUrl({ url });
      if (data?.session) {
        router.replace("/(tabs)");
      }
    }
  };

  // ── Navigate based on auth state ──────────────────────────────
  useEffect(() => {
    if (loading) return;
    if (hasNavigated.current) return;

    const handleNavigation = async () => {
      hasNavigated.current = true;

      if (!user) {
        router.replace("/login");
      } else {
        const hasOnboarded = await AsyncStorage.getItem(
          "scavlandia_onboarding_complete",
        );
        if (!hasOnboarded) {
          router.replace("/onboarding");
        } else {
          router.replace("/(tabs)");
        }
      }
      setCheckingAuth(false);
    };

    handleNavigation();
  }, [loading, user]);

  if (loading || checkingAuth) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: COLORS.primary,
        }}
      >
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="generating" options={{ headerShown: false }} />
      <Stack.Screen name="active-hunt" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
      <Stack.Screen name="final-leaderboard" options={{ headerShown: false }} />
      <Stack.Screen
        name="community-leaderboard"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootStack />
    </AuthProvider>
  );
}

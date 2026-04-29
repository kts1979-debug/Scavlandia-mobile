import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, Stack } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import "react-native-gesture-handler";
import { AuthProvider, useAuth } from "../src/context/AuthContext";
import { COLORS } from "../src/theme";
import "../src/utils/firebaseConfig";

function RootStack() {
  const { loading, user } = useAuth();
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  useEffect(() => {
    const checkFirstLaunch = async () => {
      try {
        if (!loading) {
          if (!user) {
            const hasOnboarded = await AsyncStorage.getItem(
              "scavlandia_onboarding_complete",
            );
            if (!hasOnboarded) {
              router.replace("/onboarding");
            } else {
              router.replace("/login");
            }
          }
          setCheckingOnboarding(false);
        }
      } catch {
        setCheckingOnboarding(false);
      }
    };
    checkFirstLaunch();
  }, [loading, user]);

  if (loading || checkingOnboarding) {
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
      <Stack.Screen name="museum-profile" options={{ headerShown: false }} />
      <Stack.Screen
        name="group-profile"
        options={{ headerShown: true, title: "Your Group" }}
      />
      <Stack.Screen name="generating" options={{ headerShown: false }} />
      <Stack.Screen name="active-hunt" options={{ headerShown: false }} />
      <Stack.Screen name="hunt-complete" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ headerShown: false }} />
      <Stack.Screen name="paywall" options={{ headerShown: false }} />
      <Stack.Screen name="hunt-setup" options={{ headerShown: false }} />
      <Stack.Screen name="final-leaderboard" options={{ headerShown: false }} />
      <Stack.Screen
        name="community-leaderboard"
        options={{ headerShown: false }}
      />
      <Stack.Screen name="hunt-detail" options={{ headerShown: false }} />
      <Stack.Screen name="hunt-type" options={{ headerShown: false }} />
      <Stack.Screen name="safety-warning" options={{ headerShown: false }} />
      <Stack.Screen name="stop-complete" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="micro-hunt" options={{ headerShown: false }} />
      <Stack.Screen name="photo-album" options={{ headerShown: false }} />
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

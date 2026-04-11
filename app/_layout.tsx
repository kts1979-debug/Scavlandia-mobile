// app/_layout.tsx — updated to include AuthProvider
import { Stack } from "expo-router";
import "react-native-gesture-handler";
import { AuthProvider } from "../src/context/AuthContext";
import "../src/utils/firebaseConfig";

export default function RootLayout() {
  return (
    // AuthProvider wraps everything — all screens can now use useAuth()
    <AuthProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="group-profile"
          options={{ headerShown: true, title: "Your Group" }}
        />
        <Stack.Screen name="generating" options={{ headerShown: false }} />
        <Stack.Screen name="active-hunt" options={{ headerShown: false }} />
        <Stack.Screen name="hunt-complete" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ headerShown: false }} />
      </Stack>
    </AuthProvider>
  );
}

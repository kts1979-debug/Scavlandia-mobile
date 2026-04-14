// app/_layout.tsx — add loading state
import { Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import "react-native-gesture-handler";
import { AuthProvider, useAuth } from "../src/context/AuthContext";
import "../src/utils/firebaseConfig";

// Inner component that can access auth context
function RootStack() {
  const { loading } = useAuth();

  // Show spinner while Firebase checks login status
  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#1A5276",
        }}
      >
        <ActivityIndicator size="large" color="#AED6F1" />
      </View>
    );
  }

  return (
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
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootStack />
    </AuthProvider>
  );
}

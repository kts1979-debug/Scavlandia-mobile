// app/_layout.tsx
import { Stack } from "expo-router";
import "react-native-gesture-handler";

export default function RootLayout() {
  return (
    <Stack>
      {/* The tabs live here — this is the main app */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

      {/* These screens slide over the tabs during hunt creation and gameplay */}
      <Stack.Screen
        name="group-profile"
        options={{
          presentation: "modal",
          headerShown: true,
          title: "Your Group",
        }}
      />
      <Stack.Screen name="generating" options={{ headerShown: false }} />
      <Stack.Screen name="active-hunt" options={{ headerShown: false }} />
      <Stack.Screen name="hunt-complete" options={{ headerShown: false }} />
    </Stack>
  );
}

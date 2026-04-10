import { Stack } from "expo-router";
import "react-native-gesture-handler";
import "../src/utils/firebaseConfig";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
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

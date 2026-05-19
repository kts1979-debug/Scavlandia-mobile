import { Stack } from "expo-router";
import SafetyWarningScreen from "../../src/screens/SafetyWarningScreen";

export default function SafetyWarningRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafetyWarningScreen />
    </>
  );
}

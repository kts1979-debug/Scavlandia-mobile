import { Stack } from "expo-router";
import HuntSetupScreen from "../../src/screens/HuntSetupScreen";

export default function HuntSetupRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <HuntSetupScreen />
    </>
  );
}

import { Stack } from "expo-router";
import MicroHuntScreen from "../../src/screens/MicroHuntScreen";

export default function MicroHuntRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <MicroHuntScreen />
    </>
  );
}

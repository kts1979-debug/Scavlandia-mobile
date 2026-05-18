import { Stack } from "expo-router";
import JoinHuntScreen from "../src/screens/JoinHuntScreen";

export default function JoinHuntRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <JoinHuntScreen />
    </>
  );
}

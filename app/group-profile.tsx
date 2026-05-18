import { Stack } from "expo-router";
import GroupProfileScreen from "../src/screens/GroupProfileScreen";

export default function GroupProfileRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <GroupProfileScreen />
    </>
  );
}

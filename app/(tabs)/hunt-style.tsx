import { Stack } from "expo-router";
import HuntStyleScreen from "../../src/screens/HuntStyleScreen";

export default function HuntStyleRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <HuntStyleScreen />
    </>
  );
}

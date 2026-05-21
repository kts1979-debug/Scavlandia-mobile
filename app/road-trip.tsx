import { Stack } from "expo-router";
import RoadTripScreen from "../src/screens/RoadTripScreen";

export default function RoadTripRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <RoadTripScreen />
    </>
  );
}

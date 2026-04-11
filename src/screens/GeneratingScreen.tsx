import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { generateHunt } from "../services/apiService";

const LOADING_MESSAGES = [
  "🗺️  Mapping your city...",
  "📍  Finding the best locations...",
  "🤖  AI is designing your hunt...",
  "✍️   Writing personalized clues...",
  "🎯  Ordering stops for the best route...",
  "✨  Almost ready...",
];

export default function GeneratingScreen() {
  const params = useLocalSearchParams();
  const city = params.city as string;
  const groupProfile = JSON.parse(params.groupProfile as string);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const result = await generateHunt(city, groupProfile);
        router.replace({
          pathname: "/active-hunt",
          params: { hunt: JSON.stringify(result.hunt) },
        });
      } catch (error: any) {
        console.log("=== FULL ERROR DETAILS ===");
        console.log("error.message:", error.message);
        console.log("error.code:", error.code);
        console.log("error.response:", JSON.stringify(error.response?.data));
        console.log("error.response.status:", error.response?.status);
        console.log(
          "error.request:",
          error.request ? "Request was made" : "No request made",
        );
        console.log("error.config url:", error.config?.url);
        console.log(
          "error.config headers:",
          JSON.stringify(error.config?.headers),
        );
        console.log("=========================");

        Alert.alert(
          "Hunt Generation Failed",
          error.response?.data?.error ||
            error.message ||
            "Something went wrong.",
          [{ text: "OK", onPress: () => router.back() }],
        );
      }
    })();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Building your hunt</Text>
        <Text style={styles.city}>{city}</Text>
        <ActivityIndicator
          size="large"
          color="#AED6F1"
          style={styles.spinner}
        />
        <Text style={styles.message}>{LOADING_MESSAGES[messageIndex]}</Text>
        <Text style={styles.note}>This takes about 20–30 seconds</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1A5276" },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  city: { fontSize: 18, color: "#AED6F1", marginBottom: 48 },
  spinner: { marginBottom: 32 },
  message: {
    fontSize: 18,
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 16,
    minHeight: 28,
  },
  note: { fontSize: 14, color: "#7FB3D3", textAlign: "center" },
});

// src/screens/GeneratingScreen.tsx
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import NearbyCitySuggestion from "../components/NearbyCitySuggestion";
import { generateHunt } from "../services/apiService";
import { COLORS, FONTS, SPACING } from "../theme";

const STEPS = [
  { emoji: "🗺️", text: "Mapping your city..." },
  { emoji: "📍", text: "Finding real locations..." },
  { emoji: "🤖", text: "AI is designing your hunt..." },
  { emoji: "✍️", text: "Writing custom clues..." },
  { emoji: "🎯", text: "Ordering stops perfectly..." },
  { emoji: "✨", text: "Almost ready..." },
];

export default function GeneratingScreen() {
  const params = useLocalSearchParams();
  const [city, setCity] = useState(params.city as string);
  const [groupProfile, setGroupProfile] = useState(
    JSON.parse(params.groupProfile as string),
  );
  const [step, setStep] = useState(0);
  const [dots, setDots] = useState("");
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [generating, setGenerating] = useState(true);

  useEffect(() => {
    const stepInterval = setInterval(
      () => setStep((i) => (i + 1) % STEPS.length),
      4000,
    );
    const dotInterval = setInterval(
      () => setDots((d) => (d.length >= 3 ? "" : d + ".")),
      500,
    );
    return () => {
      clearInterval(stepInterval);
      clearInterval(dotInterval);
    };
  }, []);

  const runGeneration = async (huntCity: string, profile: any) => {
    setGenerating(true);
    setShowSuggestion(false);
    try {
      const result = await generateHunt(huntCity, profile);
      router.replace({
        pathname: "/hunt-setup",
        params: { hunt: JSON.stringify(result.hunt) },
      });
    } catch (error: any) {
      setGenerating(false);
      const errorMsg = error.response?.data?.error || "";

      // Check if it's a "too few locations" error
      if (
        errorMsg.includes("Only found") ||
        errorMsg.includes("too few") ||
        errorMsg.includes("not enough")
      ) {
        setShowSuggestion(true);
      } else {
        Alert.alert(
          "Hunt Generation Failed",
          errorMsg || "Something went wrong. Please try again.",
          [{ text: "OK", onPress: () => router.back() }],
        );
      }
    }
  };

  useEffect(() => {
    runGeneration(city, groupProfile);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Nearby city suggestion screen ──────────────────────────────
  if (showSuggestion) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.suggestionContent}>
          <NearbyCitySuggestion
            currentCity={city}
            onSelectCity={(newCity) => {
              setCity(newCity);
              setStep(0);
              runGeneration(newCity, groupProfile);
            }}
            onDismiss={() => router.back()}
          />
        </View>
      </SafeAreaView>
    );
  }

  // ── Generating screen ───────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.bigEmoji}>{STEPS[step].emoji}</Text>
        <Text style={styles.city}>📍 {city}</Text>
        <Text style={styles.title}>Building your hunt{dots}</Text>
        <ActivityIndicator
          size="large"
          color={COLORS.accent}
          style={styles.spinner}
        />
        <Text style={styles.stepText}>{STEPS[step].text}</Text>
        <View style={styles.stepsRow}>
          {STEPS.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === step && styles.dotActive]}
            />
          ))}
        </View>
        <Text style={styles.note}>This takes about 20–30 seconds</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primary },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl,
  },
  bigEmoji: { fontSize: 80, marginBottom: SPACING.md },
  city: {
    fontSize: FONTS.sizes.lg,
    color: "#AED6F1",
    marginBottom: SPACING.xl,
    fontWeight: FONTS.weights.medium,
  },
  title: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.white,
    marginBottom: SPACING.xl,
    textAlign: "center",
  },
  spinner: { marginBottom: SPACING.lg },
  stepText: {
    fontSize: FONTS.sizes.lg,
    color: COLORS.white,
    textAlign: "center",
    marginBottom: SPACING.xl,
    minHeight: 28,
  },
  stepsRow: { flexDirection: "row", gap: 8, marginBottom: SPACING.xl },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  dotActive: { backgroundColor: COLORS.accent, width: 24 },
  note: { fontSize: FONTS.sizes.sm, color: "#7FB3D3" },
  suggestionContent: { flex: 1, justifyContent: "center", padding: SPACING.lg },
});

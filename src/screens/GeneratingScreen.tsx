// src/screens/GeneratingScreen.tsx
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import NearbyCitySuggestion from "../components/NearbyCitySuggestion";
import {
  generateHunt,
  generateRoadTripHunt,
  consumeHunt,
  getPendingHunts,
} from "../services/apiService";
import { hasPremium } from "../services/purchaseService";
import { COLORS, FONTS, SPACING } from "../theme";

const LOGO_ICON = require("../../assets/images/icon_white_1024.png");

// ── Cycling background images ─────────────────────────────────────
const CITY_IMAGES = [
  require("../../assets/images/hunt_bg_1_cliff_city.jpg"),
  require("../../assets/images/hunt_bg_3_friends_nyc.jpg"),
  require("../../assets/images/hunt_bg_4_friends_mountains.jpg"),
  require("../../assets/images/hunt_bg_5_explorer_greece.jpg"),
  require("../../assets/images/hunt_bg_8_friends_overlook.jpg"),
];

const ROAD_TRIP_IMAGES = [
  require("../../assets/images/hunt_bg_6_roadtrip_map_sunset.jpg"),
  require("../../assets/images/hunt_bg_7_roadtrip_map_beach.jpg"),
  require("../../assets/images/hunt_bg_1_cliff_city.jpg"),
  require("../../assets/images/hunt_bg_8_friends_overlook.jpg"),
];

const STEPS = [
  { emoji: "🗺️", text: "Mapping your city..." },
  { emoji: "📍", text: "Finding real locations..." },
  { emoji: "⚙️", text: "Crafting your hunt..." },
  { emoji: "✍️", text: "Writing custom clues..." },
  { emoji: "🎯", text: "Ordering stops perfectly..." },
  { emoji: "✨", text: "Almost ready..." },
];

const ROAD_TRIP_STEPS = [
  { emoji: "🗺️", text: "Mapping your route..." },
  { emoji: "🛣️", text: "Exploring the highway..." },
  { emoji: "📍", text: "Finding hidden gems..." },
  { emoji: "✍️", text: "Writing road trip clues..." },
  { emoji: "🚗", text: "Ordering your stops..." },
  { emoji: "✨", text: "Almost ready to roll..." },
];

export default function GeneratingScreen() {
  const params = useLocalSearchParams();
  const [city, setCity] = useState(params.city as string);
  const [groupProfile] = useState(JSON.parse(params.groupProfile as string));
  const [step, setStep] = useState(0);
  const [dots, setDots] = useState("");
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);

  // Fade animation for image transitions
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const isRoadTrip = groupProfile.huntType === "road-trip";
  const activeSteps = isRoadTrip ? ROAD_TRIP_STEPS : STEPS;
  const activeImages = isRoadTrip ? ROAD_TRIP_IMAGES : CITY_IMAGES;

  // ── Step and dot intervals ────────────────────────────────────
  useEffect(() => {
    const stepInterval = setInterval(
      () => setStep((i) => (i + 1) % activeSteps.length),
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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Image cycling with crossfade ──────────────────────────────
  useEffect(() => {
    const imageInterval = setInterval(() => {
      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }).start(() => {
        // Swap image
        setImageIndex((i) => (i + 1) % activeImages.length);
        // Fade in
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }).start();
      });
    }, 5000);
    return () => clearInterval(imageInterval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const runGeneration = async (huntCity: string, profile: any) => {
    try {
      const grantTypeMap: Record<string, "city" | "micro" | "roadTrip"> = {
        city: "city",
        micro: "micro",
        "road-trip": "roadTrip",
      };
      const grantType = grantTypeMap[profile.huntType] || "city";

      // Pre-flight: check credits before burning API time
      const isPremium = await hasPremium();
      if (!isPremium) {
        try {
          const pending = await getPendingHunts();
          const creditKey: Record<string, keyof typeof pending> = {
            city: "city",
            micro: "micro",
            roadTrip: "roadTrip",
          };
          if ((pending[creditKey[grantType]] ?? 0) < 1) {
            Alert.alert(
              "No Hunt Credits",
              "You don't have any hunts remaining. Purchase one to continue.",
              [{ text: "OK", onPress: () => router.back() }],
            );
            return;
          }
        } catch (preflightErr) {
          // If we can't check, proceed — consume will catch it on the back end
          console.warn("Pre-flight credit check failed:", preflightErr);
        }
      }
      let result;
      if (profile.huntType === "road-trip") {
        result = await generateRoadTripHunt(
          profile.startLocation,
          profile.endLocation,
          profile.stopCount,
          profile.interests,
          profile.tone || profile.clueTheme || "fun and engaging",
          profile.difficulty,
          profile.timeBetweenStops,
          profile.selectedStops,
          profile.totalDurationMinutes,
          profile.totalDistanceMiles,
          profile.unselectedCandidates || [],
          profile.routePolyline || "",
          profile.clueTheme || profile.tone || "fun and engaging",
          profile.huntVibe || "fun and engaging",
        );
      } else {
        result = await generateHunt(huntCity, profile);
      }

      // Consume credit only after successful generation
      if (!isPremium) {
        try {
          await consumeHunt(grantType);
        } catch (consumeErr: any) {
          if (consumeErr.response?.status === 403) {
            // Shouldn't happen here — generation succeeded — but handle gracefully
            console.warn(
              "consumeHunt 403 after successful generation:",
              consumeErr,
            );
          } else {
            console.warn("consumeHunt failed (non-blocking):", consumeErr);
          }
        }
      }

      router.replace({
        pathname: "/hunt-setup",
        params: {
          hunt: JSON.stringify(result.hunt),
          playMode: profile.playMode || "solo",
        },
      });
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || "";
      if (
        errorMsg.includes("Only found") ||
        errorMsg.includes("too few") ||
        errorMsg.includes("not enough")
      ) {
        setShowSuggestion(true);
      } else {
        const isRateLimit = error.response?.status === 429;
        Alert.alert(
          isRateLimit ? "Slow Down!" : "Hunt Generation Failed",
          isRateLimit
            ? "You've generated a lot of hunts recently. Please wait an hour before trying again."
            : (errorMsg || "Something went wrong.") +
                "\n\nIf this keeps happening, wait 1–2 minutes and try again — our AI occasionally needs a moment to recover.",
          [{ text: "OK", onPress: () => router.back() }],
        );
      }
    }
  };

  useEffect(() => {
    runGeneration(city, groupProfile);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Nearby city suggestion screen ─────────────────────────────
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

  // ── Generating screen ──────────────────────────────────────────
  return (
    <View style={styles.container}>
      {/* Cycling background image */}
      <Animated.Image
        source={activeImages[imageIndex]}
        style={[styles.backgroundImage, { opacity: fadeAnim }]}
        resizeMode="cover"
      />

      {/* Dark overlay so text is readable */}
      <View style={styles.overlay} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Top — city and title */}
          <View style={styles.topSection}>
            <Text style={styles.city}>
              {isRoadTrip ? "🚗" : "📍"} {city}
            </Text>
            <Text style={styles.title}>
              {isRoadTrip ? "Planning your road trip" : "Building your hunt"}
              {dots}
            </Text>
          </View>

          {/* Middle — step indicator */}
          <View style={styles.middleSection}>
            <Text style={styles.bigEmoji}>{activeSteps[step].emoji}</Text>
            <ActivityIndicator
              size="large"
              color={COLORS.accent}
              style={styles.spinner}
            />
            <Text style={styles.stepText}>{activeSteps[step].text}</Text>
            <View style={styles.stepsRow}>
              {activeSteps.map((_, i) => (
                <View
                  key={i}
                  style={[styles.dot, i === step && styles.dotActive]}
                />
              ))}
            </View>
            <Text style={styles.note}>
              {isRoadTrip
                ? "Mapping your route and finding stops along the way..."
                : "This can take up to a minute — we're crafting real clues for real places ✨"}
            </Text>
          </View>

          {/* Bottom — logo watermark */}
          <View style={styles.watermark}>
            <Image
              source={LOGO_ICON}
              style={styles.watermarkIcon}
              resizeMode="contain"
            />
            <Text style={styles.watermarkTitle}>Scavlandia</Text>
            <Text style={styles.watermarkTagline}>
              Explore · Discover · Hunt
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primary },
  backgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(30, 60, 100, 0.72)",
  },
  safeArea: { flex: 1 },
  content: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING.xl,
    paddingTop: SPACING.xxl,
    paddingBottom: SPACING.xl,
  },
  topSection: { alignItems: "center", width: "100%" },
  city: {
    fontSize: FONTS.sizes.lg,
    color: "rgba(255,255,255,0.85)",
    marginBottom: SPACING.sm,
    fontWeight: FONTS.weights.medium,
    textAlign: "center",
  },
  title: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.white,
    textAlign: "center",
    lineHeight: 36,
  },
  middleSection: { alignItems: "center", width: "100%" },
  bigEmoji: { fontSize: 72, marginBottom: SPACING.lg },
  spinner: { marginBottom: SPACING.lg },
  stepText: {
    fontSize: FONTS.sizes.lg,
    color: COLORS.white,
    textAlign: "center",
    marginBottom: SPACING.lg,
    minHeight: 28,
  },
  stepsRow: { flexDirection: "row", gap: 8, marginBottom: SPACING.lg },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.35)",
  },
  dotActive: { backgroundColor: COLORS.accent, width: 24 },
  note: {
    fontSize: FONTS.sizes.sm,
    color: "rgba(255,255,255,0.65)",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: SPACING.lg,
  },
  watermark: {
    alignItems: "center",
    opacity: 0.85,
  },
  watermarkIcon: { width: 52, height: 52, marginBottom: 6 },
  watermarkTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.white,
    letterSpacing: 1,
    marginBottom: 2,
  },
  watermarkTagline: {
    fontSize: FONTS.sizes.xs,
    color: "rgba(255,255,255,0.6)",
    letterSpacing: 2,
  },
  suggestionContent: { flex: 1, justifyContent: "center", padding: SPACING.lg },
});

// src/screens/OnboardingScreen.tsx
// First time user onboarding tour shown after email sign-up.
// Text-only slides covering navigation and hunt types.

import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, FONTS, RADIUS, SPACING } from "../theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export const ONBOARDING_KEY = "scavlandia_onboarding_complete";

const SLIDES = [
  {
    id: "1",
    emoji: "🗺️",
    title: "Welcome to Scavlandia!",
    subtitle: "Your personalized scavenger hunt adventure",
    body: "Scavlandia builds custom scavenger hunts just for your group — in any city, any museum, or right around the corner. Every hunt is unique, every clue is written just for you.",
    color: COLORS.primary,
  },
  {
    id: "2",
    emoji: "🏠",
    title: "Home Screen",
    subtitle: "Your adventure hub",
    body: 'The Home tab is where you start every adventure. Tap "Start a Hunt" to choose your hunt type and build your personalized experience. You\'ll also find links to your past hunts (including your photo albums) and profile.',
    color: "#1A6B8A",
  },
  {
    id: "3",
    emoji: "🏙️",
    title: "City Hunt",
    subtitle: "Explore any city in the world",
    body: "City Hunts take you on an adventure through real locations in any city. Tell us your group's interests and we'll build a custom route with unique clues, fun facts, and photo challenges at each stop.",
    color: "#117A65",
  },
  {
    id: "4",
    emoji: "🏛️",
    title: "Museum Hunt",
    subtitle: "Discover art and exhibits",
    body: "Museum Hunts take place inside a museum of your choice. We use riddle-based clues to lead you to specific artworks and exhibits. Perfect for art lovers, families, or anyone who wants a unique museum experience.",
    color: "#6C3483",
  },
  {
    id: "5",
    emoji: "⚡",
    title: "Micro Hunt",
    subtitle: "A quick adventure nearby",
    body: "Micro Hunts are short 1-2 stop adventures within half a mile of your location. Perfect for a quick break, lunch hour, or when you only have 15-30 minutes to spare.",
    color: "#B7950B",
  },
  {
    id: "6",
    emoji: "🏆",
    title: "Scoring & Points",
    subtitle: "Earn points at every stop",
    body: "Earn points by finding locations and completing photo challenges. Use hints wisely — each one costs points. Reveal the answer if you're truly stuck, but it'll cost you 15 points. Compete with friends on the leaderboard!",
    color: "#784212",
  },
  {
    id: "7",
    emoji: "✨",
    title: "You're Ready!",
    subtitle: "Let the adventure begin",
    body: "That's everything you need to know! Start your first hunt and discover what makes your city amazing. Remember — every hunt is unique, so no two adventures are ever the same.",
    color: COLORS.accent,
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setCurrentIndex(index);
  };

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleFinish = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");
    router.replace("/(tabs)");
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");
    router.replace("/(tabs)");
  };

  const isLast = currentIndex === SLIDES.length - 1;
  const slide = SLIDES[currentIndex];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: slide.color }]}>
      {/* Skip button */}
      {!isLast && (
        <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.slide, { backgroundColor: item.color }]}>
            <Text style={styles.slideEmoji}>{item.emoji}</Text>
            <Text style={styles.slideTitle}>{item.title}</Text>
            <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
            <View style={styles.slideBodyContainer}>
              <Text style={styles.slideBody}>{item.body}</Text>
            </View>
          </View>
        )}
      />

      {/* Bottom controls */}
      <View style={styles.bottom}>
        {/* Dot indicators */}
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => {
                flatListRef.current?.scrollToIndex({ index: i });
                setCurrentIndex(i);
              }}
              style={[styles.dot, i === currentIndex && styles.dotActive]}
            />
          ))}
        </View>

        {/* Navigation button */}
        <TouchableOpacity
          style={styles.nextBtn}
          onPress={isLast ? handleFinish : handleNext}
        >
          <Text style={styles.nextBtnText}>
            {isLast ? "Let's Go! 🚀" : "Next →"}
          </Text>
        </TouchableOpacity>

        {/* Slide counter */}
        <Text style={styles.counter}>
          {currentIndex + 1} of {SLIDES.length}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  skipBtn: {
    position: "absolute",
    top: 56,
    right: SPACING.lg,
    zIndex: 10,
    padding: SPACING.sm,
  },
  skipText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.medium,
  },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.xl,
  },
  slideEmoji: { fontSize: 80, marginBottom: SPACING.lg },
  slideTitle: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.white,
    textAlign: "center",
    marginBottom: SPACING.sm,
  },
  slideSubtitle: {
    fontSize: FONTS.sizes.lg,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    marginBottom: SPACING.xl,
    fontWeight: FONTS.weights.medium,
  },
  slideBodyContainer: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    width: "100%",
  },
  slideBody: {
    fontSize: FONTS.sizes.md,
    color: COLORS.white,
    textAlign: "center",
    lineHeight: 26,
  },
  bottom: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
    alignItems: "center",
    gap: SPACING.md,
  },
  dotsRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  dotActive: { backgroundColor: COLORS.white, width: 24 },
  nextBtn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.4)",
    width: "100%",
    alignItems: "center",
  },
  nextBtnText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.heavy,
  },
  counter: { fontSize: FONTS.sizes.sm, color: "rgba(255,255,255,0.5)" },
});

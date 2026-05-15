// src/screens/OnboardingScreen.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
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

const LOGO_ICON = require("../../assets/images/icon_white_1024.png");
const BG_IMAGE = require("../../assets/images/hunt_bg_12_sagrada_familia_bw.jpg");

const SLIDES = [
  {
    id: "1",
    emoji: "🗺️",
    title: "Welcome to Scavlandia!",
    subtitle: "Your personalized scavenger hunt adventure",
    body: "Scavlandia builds custom scavenger hunts just for your group — in any city, on any road trip, or right around the corner. Every hunt is unique, every clue is written just for you.",
  },
  {
    id: "2",
    emoji: "🏠",
    title: "Home Screen",
    subtitle: "Your adventure hub",
    body: 'The Home tab is where you start every adventure. Tap "Start a Hunt" to choose your hunt type and build your personalized experience. You\'ll also find links to your past hunts and photo albums.',
  },
  {
    id: "3",
    emoji: "🏙️",
    title: "City Hunt",
    subtitle: "Explore any city in the world",
    body: "City Hunts take you on an adventure through real locations in any city. Tell us your group's interests and we'll build a custom route with unique clues, fun facts, and photo challenges at each stop.",
  },
  {
    id: "4",
    emoji: "🚗",
    title: "Road Trip Hunt",
    subtitle: "Turn your drive into an adventure",
    body: "Enter your start and end points, then browse potential stops on a live map. Tap the ones that look interesting and we'll write custom road trip clues for each one. Your road trip just got legendary.",
  },
  {
    id: "5",
    emoji: "⚡",
    title: "Micro Hunt",
    subtitle: "A quick adventure nearby",
    body: "Micro Hunts are short 1–2 stop adventures within half a mile of your location. Perfect for a quick break, lunch hour, or when you only have 15–30 minutes to spare.",
  },
  {
    id: "6",
    emoji: "🏆",
    title: "Scoring & Points",
    subtitle: "Earn points at every stop",
    body: "Earn points by finding locations and completing photo challenges. Use hints wisely — each one costs points. Reveal the answer if you're truly stuck, but it'll cost you 15 points. Compete with friends on the leaderboard!",
  },
  {
    id: "7",
    emoji: "📸",
    title: "Photos & Privacy",
    subtitle: "Your photos, your memories",
    body: "Photos you take during hunts are stored securely and used only to create your hunt album. They are never shared publicly or used for any other purpose. Photo albums are available for 90 days after your hunt, then automatically deleted.",
  },
  {
    id: "8",
    emoji: "✨",
    title: "You're Ready!",
    subtitle: "Let the adventure begin",
    body: "That's everything you need to know! Start your first hunt and discover what makes every place amazing. Remember — every hunt is unique, so no two adventures are ever the same.",
  },
];

export default function OnboardingScreen() {
  const params = useLocalSearchParams();
  const fromHome = params.fromHome === "true";

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
    if (fromHome) {
      router.back();
    } else {
      router.replace("/(tabs)");
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");
    if (fromHome) {
      router.back();
    } else {
      router.replace("/(tabs)");
    }
  };

  const isLast = currentIndex === SLIDES.length - 1;
  const isFirst = currentIndex === 0;

  return (
    <View style={styles.container}>
      {/* Persistent B&W background image */}
      <Image
        source={BG_IMAGE}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      {/* Dark overlay — slightly lighter on first slide for logo to pop */}
      <View style={[styles.overlay, isFirst && styles.overlayFirst]} />

      <SafeAreaView style={styles.safeArea}>
        {/* Logo — only on first slide */}
        {isFirst && (
          <View style={styles.logoContainer}>
            <Image
              source={LOGO_ICON}
              style={styles.logoIcon}
              resizeMode="contain"
            />
            <Text style={styles.logoTitle}>Scavlandia</Text>
            <Text style={styles.logoTagline}>EXPLORE · DISCOVER · HUNT</Text>
          </View>
        )}

        {/* Skip button */}
        {!isLast && (
          <TouchableOpacity
            style={[styles.skipBtn, isFirst && styles.skipBtnFirst]}
            onPress={handleSkip}
          >
            <Text style={styles.skipText}>{fromHome ? "✕ Close" : "Skip"}</Text>
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
          style={styles.flatList}
          renderItem={({ item, index }) => (
            <View style={styles.slide}>
              {/* First slide shows logo above, others show emoji */}
              {index !== 0 && (
                <Text style={styles.slideEmoji}>{item.emoji}</Text>
              )}
              <Text
                style={[
                  styles.slideTitle,
                  index === 0 && styles.slideTitleFirst,
                ]}
              >
                {item.title}
              </Text>
              <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
              <View style={styles.slideBodyContainer}>
                <Text style={styles.slideBody}>{item.body}</Text>
              </View>
            </View>
          )}
        />

        {/* Bottom controls */}
        <View style={styles.bottom}>
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

          <TouchableOpacity
            style={styles.nextBtn}
            onPress={isLast ? handleFinish : handleNext}
          >
            <Text style={styles.nextBtnText}>
              {isLast
                ? fromHome
                  ? "Back to Home 🏠"
                  : "Let's Go! 🚀"
                : "Next →"}
            </Text>
          </TouchableOpacity>

          <Text style={styles.counter}>
            {currentIndex + 1} of {SLIDES.length}
          </Text>
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
    backgroundColor: "rgba(25, 50, 85, 0.78)",
  },
  overlayFirst: {
    backgroundColor: "rgba(25, 50, 85, 0.65)",
  },
  safeArea: { flex: 1 },
  logoContainer: {
    alignItems: "center",
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
  },
  logoIcon: { width: 70, height: 70, marginBottom: SPACING.sm },
  logoTitle: {
    fontSize: FONTS.sizes.hero,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.white,
    letterSpacing: 1,
    marginBottom: 4,
  },
  logoTagline: {
    fontSize: FONTS.sizes.xs,
    color: "rgba(255,255,255,0.6)",
    letterSpacing: 3,
    fontWeight: FONTS.weights.medium,
  },
  skipBtn: {
    position: "absolute",
    top: 16,
    right: SPACING.lg,
    zIndex: 10,
    padding: SPACING.sm,
  },
  skipBtnFirst: { top: 56 },
  flatList: { flex: 1 },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.xl,
    paddingTop: SPACING.md,
  },
  slideEmoji: { fontSize: 72, marginBottom: SPACING.lg },
  slideTitle: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.white,
    textAlign: "center",
    marginBottom: SPACING.sm,
  },
  slideTitleFirst: { fontSize: FONTS.sizes.xl },
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
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
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
  dotActive: {
    backgroundColor: COLORS.accent,
    width: 24,
  },
  nextBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    width: "100%",
    alignItems: "center",
  },
  nextBtnText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.heavy,
  },
  counter: {
    fontSize: FONTS.sizes.sm,
    color: "rgba(255,255,255,0.5)",
  },
  skipText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.medium,
  },
});

// src/screens/HuntResultsScreen.tsx
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../components/ui/Button";
import { COLORS, FONTS, RADIUS, SPACING } from "../theme";
import { StarRating, getStarRating } from "./HuntCompleteScreen";
// @ts-ignore
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as StoreReview from "expo-store-review";

const HERO_IMAGES = [
  require("../../assets/images/hunt_bg_4_friends_mountains.jpg"),
  require("../../assets/images/hunt_bg_8_friends_overlook.jpg"),
  require("../../assets/images/hunt_bg_3_friends_nyc.jpg"),
  require("../../assets/images/hunt_bg_1_cliff_city.jpg"),
];

function getHeroImage(huntId: string) {
  let hash = 0;
  for (let i = 0; i < huntId.length; i++) {
    hash = (hash + huntId.charCodeAt(i)) % HERO_IMAGES.length;
  }
  return HERO_IMAGES[hash];
}

export default function HuntResultsScreen() {
  const params = useLocalSearchParams();
  const hunt = JSON.parse(params.hunt as string);
  const totalPoints = parseInt(params.totalPoints as string);
  const completedStops = parseInt(params.completedStops as string);
  const sessionCode = (params.sessionCode as string) || "";
  const stopPhotos = (params.stopPhotos as string) || "{}";
  const hintsUsed = parseInt((params.hintsUsed as string) || "0");
  const answerRevealed = params.answerRevealed === "true";
  const skippedStops: number[] = params.skippedStops
    ? JSON.parse(params.skippedStops as string)
    : [];
  const finalPhotoUrl = (params.finalPhotoUrl as string) || "";
  const teamName = (params.teamName as string) || "";
  const teamAvatar = (params.teamAvatar as string) || "";

  const [showSkippedPrompt, setShowSkippedPrompt] = useState(
    skippedStops.length > 0,
  );

  const stars = getStarRating(hintsUsed, answerRevealed);
  const heroImage = getHeroImage(hunt.huntId || hunt.huntTitle || "default");
  const percentage = Math.round(
    (totalPoints / (hunt.totalPossiblePoints || 1)) * 100,
  );

  useEffect(() => {
    const maybeRequestReview = async () => {
      try {
        const reviewedKey = "scavlandia_review_completed";
        const countKey = "scavlandia_hunts_since_review";
        const alreadyReviewed = await AsyncStorage.getItem(reviewedKey);
        if (alreadyReviewed) return;
        const countStr = await AsyncStorage.getItem(countKey);
        const count = countStr ? parseInt(countStr) : 0;
        const newCount = count + 1;
        await AsyncStorage.setItem(countKey, String(newCount));
        if (newCount % 2 !== 0) return;
        const isAvailable = await StoreReview.isAvailableAsync();
        if (!isAvailable) return;
        setTimeout(async () => {
          await StoreReview.requestReview();
        }, 2000);
      } catch {}
    };
    maybeRequestReview();
  }, []);

  const handleShare = async () => {
    try {
      const cityName = hunt.city?.split(",")[0] || hunt.city;
      const scoreEmoji =
        percentage >= 80 ? "🏆" : percentage >= 60 ? "⭐" : "🎯";
      const diffMap = { easy: "🟢", medium: "🟡", hard: "🔴" } as Record<
        string,
        string
      >;
      const diffEmoji =
        diffMap[hunt.groupProfile?.difficulty || "medium"] || "🟡";
      const starStr = sessionCode
        ? ""
        : `${"★".repeat(stars)}${"☆".repeat(3 - stars)} ${stars}/3 stars\n`;
      await Share.share({
        message:
          `${scoreEmoji} Just crushed a Scavlandia scavenger hunt in ${cityName}!\n\n` +
          `🚩 ${completedStops} stops completed\n` +
          `⭐ ${totalPoints} points earned\n` +
          `💯 ${percentage}% score\n` +
          `${starStr}` +
          `${diffEmoji} ${hunt.groupProfile?.difficulty || "Medium"} difficulty\n\n` +
          `Think you can beat my score? Try Scavlandia! 🗺️`,
        title: `Scavlandia Hunt — ${cityName}`,
      });
    } catch (error) {
      console.warn("Share cancelled:", error);
    }
  };

  const handleReturnToSkippedStop = () => {
    const firstSkippedOrder = skippedStops[0];
    const skippedStopIndex = hunt.stops.findIndex(
      (s: any) => s.order === firstSkippedOrder,
    );
    const completedIndices: number[] = params.completedIndices
      ? JSON.parse(params.completedIndices as string)
      : [];
    router.replace({
      pathname: "/active-hunt",
      params: {
        hunt: params.hunt,
        sessionCode,
        stopPhotos,
        resumeAtStop: String(skippedStopIndex + 1),
        totalPoints: String(totalPoints),
        skippedStops: JSON.stringify(skippedStops),
        completedIndices: JSON.stringify(completedIndices),
        teamName,
        teamAvatar,
      },
    });
  };

  return (
    <View style={styles.container}>
      <Image source={heroImage} style={styles.heroImage} resizeMode="cover" />
      <View style={styles.heroOverlay} />
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroSection}>
            <Text style={styles.trophy}>🏆</Text>
            <Text style={styles.title}>Your Results</Text>
            <Text style={styles.huntName} numberOfLines={2}>
              {hunt.huntTitle}
            </Text>
            <View style={styles.cityBadge}>
              <Text style={styles.cityBadgeText}>
                📍 {hunt.city?.split(",")[0]}
              </Text>
            </View>
          </View>

          <View style={styles.contentCard}>
            {!sessionCode && <StarRating stars={stars} />}

            <View style={styles.statsGrid}>
              {[
                { emoji: "⭐", value: String(totalPoints), label: "Points" },
                { emoji: "🚩", value: String(completedStops), label: "Stops" },
                { emoji: "💯", value: `${percentage}%`, label: "Score" },
              ].map((s, i) => (
                <View key={i} style={styles.statCard}>
                  <Text style={styles.statEmoji}>{s.emoji}</Text>
                  <Text style={styles.statValue}>{s.value}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.message}>
              Amazing work! You explored the city, solved every clue, and
              crushed it. 🎉
            </Text>

            {showSkippedPrompt && (
              <View style={styles.skippedCard}>
                <Text style={styles.skippedCardTitle}>
                  ⏭ You skipped {skippedStops.length} stop
                  {skippedStops.length > 1 ? "s" : ""}
                </Text>
                <Text style={styles.skippedCardDesc}>
                  Would you like to go back and complete{" "}
                  {skippedStops.length > 1 ? "them" : "it"} now?
                </Text>
                <View style={styles.skippedCardBtns}>
                  <TouchableOpacity
                    style={styles.skippedYesBtn}
                    onPress={handleReturnToSkippedStop}
                  >
                    <Text style={styles.skippedYesBtnText}>
                      {"Yes, let's go!"}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.skippedNoBtn}
                    onPress={() => setShowSkippedPrompt(false)}
                  >
                    <Text style={styles.skippedNoBtnText}>No thanks</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <View style={styles.buttonsContainer}>
              <Button
                label="Share Your Results"
                onPress={handleShare}
                variant="accent"
                size="lg"
                emoji="📤"
                style={styles.btn}
              />
              <Button
                label="View Photo Album"
                onPress={() =>
                  router.push({
                    pathname: "/photo-album",
                    params: {
                      hunt: JSON.stringify(hunt),
                      stopPhotos,
                      finalPhotoUrl,
                      teamAvatar,
                      teamName,
                    },
                  })
                }
                variant="secondary"
                size="lg"
                emoji="📸"
                style={styles.btn}
              />
              <Button
                label="Start Another Hunt"
                onPress={() => router.replace("/(tabs)")}
                variant="secondary"
                size="lg"
                emoji="🗺️"
                style={styles.btn}
              />
              {sessionCode ? (
                <Button
                  label="View Final Leaderboard"
                  onPress={() =>
                    router.push({
                      pathname: "/final-leaderboard",
                      params: { sessionCode, myPoints: String(totalPoints) },
                    })
                  }
                  variant="primary"
                  size="lg"
                  emoji="🏆"
                  style={styles.btn}
                />
              ) : null}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primary },
  heroImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
  heroOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(25, 50, 85, 0.45)",
  },
  safeArea: { flex: 1 },
  scroll: { paddingBottom: 100 },
  heroSection: {
    alignItems: "center",
    paddingVertical: SPACING.xl,
    paddingTop: SPACING.xxl,
    paddingHorizontal: SPACING.lg,
    minHeight: 220,
    justifyContent: "center",
  },
  trophy: { fontSize: 56, marginBottom: SPACING.sm },
  title: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.white,
    textAlign: "center",
    marginBottom: 6,
  },
  huntName: {
    fontSize: FONTS.sizes.md,
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    marginBottom: SPACING.sm,
    lineHeight: 22,
  },
  cityBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: RADIUS.round,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
  },
  cityBadgeText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
  },
  contentCard: {
    backgroundColor: "transparent",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
    minHeight: 500,
  },
  statsGrid: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    padding: SPACING.md,
    backgroundColor: "rgba(232, 248, 247, 0.75)",
    borderRadius: RADIUS.lg,
  },
  statEmoji: { fontSize: 24, marginBottom: 4 },
  statValue: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.primary,
  },
  statLabel: { fontSize: FONTS.sizes.xs, color: COLORS.darkGray, marginTop: 2 },
  message: {
    fontSize: FONTS.sizes.md,
    color: COLORS.darkGray,
    textAlign: "center",
    marginBottom: SPACING.lg,
    lineHeight: 22,
    backgroundColor: "rgba(232, 248, 247, 0.75)",
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
  },
  skippedCard: {
    backgroundColor: "rgba(232, 248, 247, 0.75)",
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  skippedCardTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.primary,
    marginBottom: 4,
  },
  skippedCardDesc: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
    marginBottom: SPACING.md,
  },
  skippedCardBtns: { flexDirection: "row", gap: SPACING.sm },
  skippedYesBtn: {
    flex: 1,
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    alignItems: "center",
  },
  skippedYesBtnText: {
    color: COLORS.white,
    fontWeight: FONTS.weights.bold,
    fontSize: FONTS.sizes.sm,
  },
  skippedNoBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: COLORS.midGray,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    alignItems: "center",
  },
  skippedNoBtnText: { color: COLORS.darkGray, fontSize: FONTS.sizes.sm },
  buttonsContainer: {
    gap: SPACING.sm,
    backgroundColor: "rgba(232, 248, 247, 0.75)",
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginTop: SPACING.sm,
  },
  btn: { marginBottom: SPACING.sm },
});

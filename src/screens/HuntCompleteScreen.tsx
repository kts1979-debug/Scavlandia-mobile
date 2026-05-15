// src/screens/HuntCompleteScreen.tsx
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
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

function getStarRating(hintsUsed: number, answerRevealed: boolean): number {
  if (answerRevealed) return 1;
  if (hintsUsed === 0) return 3;
  if (hintsUsed <= 2) return 2;
  return 1;
}

function StarRating({ stars }: { stars: number }) {
  const labels = ["", "You got there!", "Nice work!", "Flawless! 🎉"];
  const subs = [
    "",
    "Keep practicing — you'll nail it next time",
    "Used a couple hints along the way",
    "Solved every clue without any hints!",
  ];
  return (
    <View style={starStyles.container}>
      <View style={starStyles.starsRow}>
        {[1, 2, 3].map((i) => (
          <Text
            key={i}
            style={[starStyles.star, i <= stars && starStyles.starFilled]}
          >
            ★
          </Text>
        ))}
      </View>
      <Text style={starStyles.label}>{labels[stars]}</Text>
      <Text style={starStyles.sub}>{subs[stars]}</Text>
    </View>
  );
}

export default function HuntCompleteScreen() {
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

  const [showSkippedPrompt, setShowSkippedPrompt] = useState(
    skippedStops.length > 0,
  );

  const stars = getStarRating(hintsUsed, answerRevealed);
  const heroImage = getHeroImage(hunt.huntId || hunt.huntTitle || "default");
  const percentage = Math.round(
    (totalPoints / (hunt.totalPossiblePoints || 1)) * 100,
  );

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
      console.log("Share cancelled:", error);
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
      },
    });
  };

  return (
    <View style={styles.container}>
      {/* Hero image */}
      <Image source={heroImage} style={styles.heroImage} resizeMode="cover" />
      <View style={styles.heroOverlay} />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero section */}
          <View style={styles.heroSection}>
            <Text style={styles.trophy}>🏆</Text>
            <Text style={styles.title}>Hunt Complete!</Text>
            <Text style={styles.huntName} numberOfLines={2}>
              {hunt.huntTitle}
            </Text>
            <View style={styles.cityBadge}>
              <Text style={styles.cityBadgeText}>
                📍 {hunt.city?.split(",")[0]}
              </Text>
            </View>
          </View>

          {/* Content card */}
          <View style={styles.contentCard}>
            {/* Stars — solo only */}
            {!sessionCode && <StarRating stars={stars} />}

            {/* Stats */}
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

            {/* Hunt Finale */}
            {hunt.huntFinale && (
              <View style={styles.finaleCard}>
                <Text style={styles.finaleLabel}>🎉 How to End in Style</Text>
                <Text style={styles.finaleText}>{hunt.huntFinale}</Text>
              </View>
            )}

            {/* Skipped stops */}
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
                  params: { hunt: JSON.stringify(hunt), stopPhotos },
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
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const starStyles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginBottom: SPACING.lg,
    paddingBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  starsRow: { flexDirection: "row", gap: 8, marginBottom: SPACING.sm },
  star: { fontSize: 44, color: COLORS.lightGray },
  starFilled: { color: "#F39C12" },
  label: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.primary,
    marginBottom: 4,
  },
  sub: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
    textAlign: "center",
  },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primary },
  heroImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 320,
    width: "100%",
  },
  heroOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 320,
    backgroundColor: "rgba(30, 60, 100, 0.5)",
  },
  safeArea: { flex: 1 },
  scroll: { paddingBottom: 40 },
  heroSection: {
    alignItems: "center",
    height: 260,
    justifyContent: "center",
    paddingHorizontal: SPACING.lg,
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
    backgroundColor: COLORS.white,
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
    backgroundColor: COLORS.offWhite,
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
  },
  finaleCard: {
    backgroundColor: COLORS.accentPale,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent,
  },
  finaleLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.accent,
    fontWeight: FONTS.weights.bold,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
  },
  finaleText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.darkGray,
    lineHeight: 22,
    fontStyle: "italic",
  },
  skippedCard: {
    backgroundColor: COLORS.offWhite,
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
  btn: { marginBottom: SPACING.sm },
});

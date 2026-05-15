// src/screens/HuntCompleteScreen.tsx
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { COLORS, FONTS, RADIUS, SPACING } from "../theme";

// ── Star rating helpers ───────────────────────────────────────────
function getStarRating(hintsUsed: number, answerRevealed: boolean): number {
  if (answerRevealed) return 1;
  if (hintsUsed === 0) return 3;
  if (hintsUsed <= 2) return 2;
  return 1;
}

function StarRating({ stars }: { stars: number }) {
  const labels = ["", "You got there!", "Nice work!", "Flawless! 🎉"];
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
      {stars === 3 && (
        <Text style={starStyles.sub}>Solved every clue with no hints!</Text>
      )}
      {stars === 2 && (
        <Text style={starStyles.sub}>Used a couple hints along the way</Text>
      )}
      {stars === 1 && (
        <Text style={starStyles.sub}>You made it — keep practicing!</Text>
      )}
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

  const handleShare = async () => {
    try {
      const cityName = hunt.city?.split(",")[0] || hunt.city;
      const percentage = Math.round(
        (totalPoints / (hunt.totalPossiblePoints || 1)) * 100,
      );
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
          `Think you can beat my score? Try Scavlandia for your next city adventure! 🗺️`,
        title: `Scavlandia Hunt — ${cityName}`,
      });
    } catch (error) {
      console.log("Share cancelled or failed:", error);
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

  const percentage = Math.round(
    (totalPoints / (hunt.totalPossiblePoints || 1)) * 100,
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.trophy}>🏆</Text>
        <Text style={styles.title}>Hunt Complete!</Text>
        <Text style={styles.huntName}>{hunt.huntTitle}</Text>
        <Badge
          label={hunt.city?.split(",")[0]}
          emoji="📍"
          color={COLORS.primaryLight}
          style={styles.cityBadge}
        />

        {/* Star rating — solo only */}
        {!sessionCode && <StarRating stars={stars} />}

        {/* Stats */}
        <View style={styles.statsGrid}>
          {[
            { emoji: "⭐", value: totalPoints, label: "Points" },
            { emoji: "🚩", value: completedStops, label: "Stops" },
            { emoji: "💯", value: `${percentage}%`, label: "Score" },
          ].map((s, i) => (
            <Card key={i} variant="dark" style={styles.statCard}>
              <Text style={styles.statEmoji}>{s.emoji}</Text>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </Card>
          ))}
        </View>

        <Text style={styles.message}>
          Amazing work! You explored the city, solved every clue, and crushed
          it. 🎉
        </Text>

        {/* Skipped stops prompt */}
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
                <Text style={styles.skippedYesBtnText}>{"Yes, let's go!"}</Text>
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
      </ScrollView>
    </SafeAreaView>
  );
}

const starStyles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginHorizontal: 0,
  },
  starsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: SPACING.sm,
  },
  star: {
    fontSize: 48,
    color: COLORS.midGray,
  },
  starFilled: {
    color: "#F39C12",
  },
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
  scroll: { padding: SPACING.lg, paddingBottom: 40 },
  trophy: {
    fontSize: 72,
    textAlign: "center",
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.white,
    textAlign: "center",
    marginBottom: 8,
  },
  huntName: {
    fontSize: FONTS.sizes.md,
    color: "#AED6F1",
    textAlign: "center",
    marginBottom: 4,
  },
  cityBadge: { alignSelf: "center", marginBottom: SPACING.lg },
  statsGrid: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  statCard: { flex: 1, alignItems: "center", padding: SPACING.md },
  statEmoji: { fontSize: 24, marginBottom: 4 },
  statValue: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.white,
  },
  statLabel: { fontSize: FONTS.sizes.xs, color: "rgba(255,255,255,0.7)" },
  message: {
    fontSize: FONTS.sizes.md,
    color: "#AED6F1",
    textAlign: "center",
    marginBottom: SPACING.lg,
    lineHeight: 22,
  },
  skippedCard: {
    backgroundColor: COLORS.white,
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
  skippedNoBtnText: {
    color: COLORS.darkGray,
    fontSize: FONTS.sizes.sm,
  },
  btn: { marginBottom: SPACING.sm },
});

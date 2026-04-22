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

export default function HuntCompleteScreen() {
  const params = useLocalSearchParams();
  const hunt = JSON.parse(params.hunt as string);
  const totalPoints = parseInt(params.totalPoints as string);
  const completedStops = parseInt(params.completedStops as string);
  const sessionCode = (params.sessionCode as string) || "";
  const stopPhotos = (params.stopPhotos as string) || "{}";

  const skippedStops: number[] = params.skippedStops
    ? JSON.parse(params.skippedStops as string)
    : [];

  const [showSkippedPrompt, setShowSkippedPrompt] = useState(
    skippedStops.length > 0,
  );

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

      await Share.share({
        message:
          `${scoreEmoji} Just crushed a Scavlandia scavenger hunt in ${cityName}!\n\n` +
          `🚩 ${completedStops} stops completed\n` +
          `⭐ ${totalPoints} points earned\n` +
          `💯 ${percentage}% score\n` +
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
    const remainingSkipped = skippedStops.slice(1);
    router.replace({
      pathname: "/active-hunt",
      params: {
        hunt: params.hunt,
        sessionCode,
        stopPhotos,
        resumeAtStop: String(firstSkippedOrder),
        totalPoints: String(totalPoints),
        skippedStops: JSON.stringify(remainingSkipped),
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
                <Text style={styles.skippedYesBtnText}>Yes, let's go!</Text>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primary },
  scroll: { padding: SPACING.lg, alignItems: "center", paddingBottom: 40 },
  trophy: { fontSize: 80, marginTop: SPACING.xl, marginBottom: SPACING.md },
  title: {
    fontSize: FONTS.sizes.hero,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.white,
    marginBottom: 8,
  },
  huntName: {
    fontSize: FONTS.sizes.lg,
    color: "#AED6F1",
    textAlign: "center",
    marginBottom: SPACING.sm,
  },
  cityBadge: { marginBottom: SPACING.lg },
  statsGrid: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
    width: "100%",
  },
  statCard: { flex: 1, alignItems: "center", paddingVertical: SPACING.md },
  statEmoji: { fontSize: 28, marginBottom: 4 },
  statValue: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.gold,
  },
  statLabel: { fontSize: FONTS.sizes.xs, color: "#AED6F1", marginTop: 2 },
  message: {
    fontSize: FONTS.sizes.md,
    color: "#AED6F1",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  skippedCard: {
    backgroundColor: "#FEF9E7",
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1.5,
    borderColor: COLORS.gold,
    width: "100%",
  },
  skippedCardTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.black,
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
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    alignItems: "center",
  },
  skippedYesBtnText: {
    color: COLORS.white,
    fontWeight: FONTS.weights.bold,
    fontSize: FONTS.sizes.md,
  },
  skippedNoBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: COLORS.midGray,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    alignItems: "center",
  },
  skippedNoBtnText: { color: COLORS.darkGray, fontSize: FONTS.sizes.md },
  btn: { width: "100%", marginBottom: SPACING.sm },
});

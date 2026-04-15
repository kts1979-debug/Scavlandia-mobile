// src/screens/HuntCompleteScreen.tsx — Celebration screen with sharing
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  SafeAreaView,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { COLORS, FONTS, SPACING } from "../theme";

export default function HuntCompleteScreen() {
  const params = useLocalSearchParams();
  const hunt = JSON.parse(params.hunt as string);
  const totalPoints = parseInt(params.totalPoints as string);
  const completedStops = parseInt(params.completedStops as string);

  const handleShare = async () => {
    try {
      await Share.share({
        message:
          `🗺️ Just completed a Daytripper hunt in ${hunt.city?.split(",")[0]}! ` +
          `Finished ${completedStops} stops and earned ${totalPoints} points. ` +
          `Try Daytripper for your next adventure!`,
        title: "Daytripper Hunt Complete!",
      });
    } catch (error) {
      console.log("Share error:", error);
    }
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

        <Button
          label="Share Your Results"
          onPress={handleShare}
          variant="accent"
          size="lg"
          emoji="📤"
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
  btn: { width: "100%", marginBottom: SPACING.sm },
});

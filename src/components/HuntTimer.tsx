// src/components/HuntTimer.tsx
// Displays the countdown timer AND estimated hunt duration.
// Changes color when time is running low.

import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { COLORS, FONTS, RADIUS, SPACING } from "../theme";

interface HuntTimerProps {
  display: string; // Countdown e.g. '01:45'
  isWarning: boolean;
  isCritical: boolean;
  estimatedMinutes: number; // Total estimated hunt duration from Claude
  stopsCompleted: number; // How many stops done so far
  totalStops: number; // Total stops in the hunt
}

export default function HuntTimer({
  display,
  isWarning,
  isCritical,
  estimatedMinutes,
  stopsCompleted,
  totalStops,
}: HuntTimerProps) {
  // Color based on urgency
  const timerColor = isCritical
    ? COLORS.danger
    : isWarning
      ? COLORS.gold
      : COLORS.success;

  // Estimate time remaining based on stops completed
  const minutesPerStop = estimatedMinutes / totalStops;
  const stopsRemaining = totalStops - stopsCompleted;
  const estRemaining = Math.round(minutesPerStop * stopsRemaining);

  // Format estimated duration for display
  const formatDuration = (minutes: number) => {
    if (minutes >= 60) {
      const h = Math.floor(minutes / 60);
      const m = minutes % 60;
      return m > 0 ? `${h}h ${m}m` : `${h}h`;
    }
    return `${minutes}m`;
  };

  return (
    <View style={styles.container}>
      {/* Top row — countdown timer */}
      <View style={[styles.timerPill, { backgroundColor: timerColor }]}>
        <Text style={styles.timerEmoji}>
          {isCritical ? "🚨" : isWarning ? "⚠️" : "⏱"}
        </Text>
        <Text style={styles.timerDisplay}>{display}</Text>
      </View>

      {/* Bottom row — estimated duration info */}
      <View style={styles.estimateRow}>
        <View style={styles.estimateItem}>
          <Text style={styles.estimateValue}>
            {formatDuration(estimatedMinutes)}
          </Text>
          <Text style={styles.estimateLabel}>Total est.</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.estimateItem}>
          <Text style={styles.estimateValue}>
            ~{formatDuration(estRemaining)}
          </Text>
          <Text style={styles.estimateLabel}>Remaining</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.estimateItem}>
          <Text style={styles.estimateValue}>{stopsRemaining}</Text>
          <Text style={styles.estimateLabel}>Stops left</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", gap: SPACING.xs },
  timerPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.round,
  },
  timerEmoji: { fontSize: 16 },
  timerDisplay: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.white,
    fontVariant: ["tabular-nums"],
    letterSpacing: 2,
  },
  estimateRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    gap: SPACING.sm,
  },
  estimateItem: { alignItems: "center", minWidth: 52 },
  estimateValue: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
    color: COLORS.white,
  },
  estimateLabel: {
    fontSize: FONTS.sizes.xs,
    color: "rgba(255,255,255,0.65)",
    marginTop: 1,
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
});

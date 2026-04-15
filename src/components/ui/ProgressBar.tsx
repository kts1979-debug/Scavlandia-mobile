// src/components/ui/ProgressBar.tsx
// A reusable progress bar used in the Active Hunt screen to show
// how many stops have been completed out of the total.
// Usage: <ProgressBar current={3} total={10} />

import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { COLORS, FONTS, RADIUS, SPACING } from "../../theme";

interface ProgressBarProps {
  current: number; // Number of stops completed
  total: number; // Total number of stops in the hunt
  showLabel?: boolean; // Whether to show "Stop 3 of 10" text above the bar
  color?: string; // Override the fill color (defaults to accent orange)
}

export default function ProgressBar({
  current,
  total,
  showLabel = true,
  color = COLORS.accent,
}: ProgressBarProps) {
  // Calculate percentage — avoid dividing by zero
  const percentage = total > 0 ? (current / total) * 100 : 0;

  // Change color as hunt progresses
  const fillColor =
    percentage >= 100
      ? COLORS.success // Green when complete
      : percentage >= 60
        ? COLORS.gold // Gold when more than halfway
        : color; // Default orange for early stops

  return (
    <View style={styles.container}>
      {showLabel && (
        <View style={styles.labelRow}>
          <Text style={styles.label}>
            Stop {current} of {total}
          </Text>
          <Text style={styles.percentage}>{Math.round(percentage)}%</Text>
        </View>
      )}

      {/* Track — the gray background bar */}
      <View style={styles.track}>
        {/* Fill — the colored progress indicator */}
        <View
          style={[
            styles.fill,
            {
              width: `${Math.min(percentage, 100)}%`,
              backgroundColor: fillColor,
            },
          ]}
        />

        {/* Animated pulse dot at the leading edge */}
        {percentage > 0 && percentage < 100 && (
          <View
            style={[
              styles.leadDot,
              {
                left: `${Math.min(percentage, 98)}%`,
                backgroundColor: fillColor,
              },
            ]}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: "100%" },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SPACING.xs,
  },
  label: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
    fontWeight: FONTS.weights.medium,
  },
  percentage: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.accent,
    fontWeight: FONTS.weights.bold,
  },
  track: {
    height: 8,
    backgroundColor: COLORS.lightGray,
    borderRadius: RADIUS.round,
    overflow: "hidden",
    position: "relative",
  },
  fill: {
    height: "100%",
    borderRadius: RADIUS.round,
    minWidth: 8, // Ensure a small dot shows even at 1%
  },
  leadDot: {
    position: "absolute",
    top: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.white,
    marginLeft: -8, // Center the dot on the leading edge
  },
});

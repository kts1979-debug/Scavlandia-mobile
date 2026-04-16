// src/components/HintsPanel.tsx
// Shows progressive hints for the current stop.
// Each hint revealed costs points.

import React, { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS, FONTS, RADIUS, SPACING } from "../theme";

interface HintsPanelProps {
  hints: string[]; // Array of 3 hint strings from Claude
  maxHints: number; // Based on difficulty: Hard=1, Medium=2, Easy=3
  onHintUsed: (cost: number) => void; // Deducts points when hint revealed
}

const HINT_COST = 5; // Points deducted per hint used

export default function HintsPanel({
  hints,
  maxHints,
  onHintUsed,
}: HintsPanelProps) {
  const [revealedCount, setRevealedCount] = useState(0);

  // Don't render if no hints available
  if (!hints || hints.length === 0) return null;

  const handleRevealHint = () => {
    if (revealedCount >= maxHints) {
      Alert.alert(
        "No More Hints",
        `You have used all ${maxHints} available hint(s) for this stop.`,
      );
      return;
    }

    Alert.alert(
      "💡 Use a Hint?",
      `This will cost ${HINT_COST} points.\nYou have ${maxHints - revealedCount} hint(s) remaining for this stop.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: `Show Hint ${revealedCount + 1}`,
          onPress: () => {
            setRevealedCount((prev) => prev + 1);
            onHintUsed(HINT_COST);
          },
        },
      ],
    );
  };

  const hintsRemaining = maxHints - revealedCount;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.titleEmoji}>💡</Text>
          <Text style={styles.title}>Hints</Text>
        </View>
        <View style={styles.remainingBadge}>
          <Text style={styles.remainingText}>{hintsRemaining} remaining</Text>
        </View>
      </View>

      {/* Revealed hints */}
      {Array.from({ length: revealedCount }).map((_, i) => (
        <View key={i} style={styles.hintRow}>
          <View style={[styles.hintNumber, { opacity: 1 - i * 0.2 }]}>
            <Text style={styles.hintNumberText}>{i + 1}</Text>
          </View>
          <View style={styles.hintTextContainer}>
            <Text style={styles.hintLabel}>Hint {i + 1}</Text>
            <Text style={styles.hintText}>{hints[i]}</Text>
          </View>
        </View>
      ))}

      {/* Locked hints preview */}
      {Array.from({ length: Math.max(0, maxHints - revealedCount) }).map(
        (_, i) => (
          <View
            key={`locked-${i}`}
            style={[styles.hintRow, styles.hintRowLocked]}
          >
            <View style={[styles.hintNumber, styles.hintNumberLocked]}>
              <Text style={styles.hintNumberText}>{revealedCount + i + 1}</Text>
            </View>
            <View style={styles.hintTextContainer}>
              <Text style={styles.hintLabel}>Hint {revealedCount + i + 1}</Text>
              <Text style={styles.hintTextLocked}>🔒 Locked</Text>
            </View>
          </View>
        ),
      )}

      {/* Reveal button */}
      {hintsRemaining > 0 ? (
        <TouchableOpacity
          style={styles.revealBtn}
          onPress={handleRevealHint}
          activeOpacity={0.85}
        >
          <Text style={styles.revealBtnText}>
            💡 Reveal Hint {revealedCount + 1}
          </Text>
          <View style={styles.costBadge}>
            <Text style={styles.costText}>-{HINT_COST} pts</Text>
          </View>
        </TouchableOpacity>
      ) : (
        <View style={styles.allUsedRow}>
          <Text style={styles.allUsedText}>All hints used for this stop</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.hintLight,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1.5,
    borderColor: COLORS.hint,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  titleEmoji: { fontSize: 18 },
  title: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.hint,
  },
  remainingBadge: {
    backgroundColor: COLORS.hint,
    borderRadius: RADIUS.round,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  remainingText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.white,
    fontWeight: FONTS.weights.bold,
  },
  hintRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
  },
  hintRowLocked: { opacity: 0.5 },
  hintNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.hint,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
    marginTop: 2,
  },
  hintNumberLocked: { backgroundColor: COLORS.midGray },
  hintNumberText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.heavy,
  },
  hintTextContainer: { flex: 1 },
  hintLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.hint,
    fontWeight: FONTS.weights.bold,
    marginBottom: 2,
  },
  hintText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
    lineHeight: 20,
  },
  hintTextLocked: { fontSize: FONTS.sizes.sm, color: COLORS.midGray },
  revealBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.hint,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  revealBtnText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
  },
  costBadge: {
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: RADIUS.round,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  costText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.bold,
  },
  allUsedRow: { alignItems: "center", paddingVertical: SPACING.sm },
  allUsedText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.hint,
    fontStyle: "italic",
  },
});

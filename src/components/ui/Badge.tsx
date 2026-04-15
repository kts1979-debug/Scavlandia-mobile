// src/components/ui/Badge.tsx
// Small pill-shaped label — used for points, difficulty, stop numbers, etc.
// Usage: <Badge label='20 pts' color={COLORS.gold} />

import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { COLORS, FONTS, RADIUS } from "../../theme";

interface BadgeProps {
  label: string;
  color?: string;
  textColor?: string;
  emoji?: string;
}

export default function Badge({
  label,
  color = COLORS.accent,
  textColor = COLORS.white,
  emoji,
}: BadgeProps) {
  return (
    <View style={[styles.badge, { backgroundColor: color }]}>
      <Text style={[styles.text, { color: textColor }]}>
        {emoji ? `${emoji} ${label}` : label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.round,
    alignSelf: "flex-start",
  },
  text: { fontSize: FONTS.sizes.xs, fontWeight: FONTS.weights.bold },
});

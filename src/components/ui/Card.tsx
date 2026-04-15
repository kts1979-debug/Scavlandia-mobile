// src/components/ui/Card.tsx
// A styled card container — wraps content in a rounded white box with a shadow.
// Usage: <Card> <Text>Content here</Text> </Card>

import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { COLORS, RADIUS, SHADOW, SPACING } from "../../theme";

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: "white" | "primary" | "accent" | "dark";
  padding?: number;
}

export default function Card({
  children,
  style,
  variant = "white",
  padding = SPACING.md,
}: CardProps) {
  const bg = {
    white: COLORS.white,
    primary: COLORS.primary,
    accent: COLORS.accentPale,
    dark: COLORS.primaryLight,
  }[variant];

  return (
    <View
      style={[styles.card, { backgroundColor: bg, padding }, SHADOW.sm, style]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: RADIUS.lg },
});

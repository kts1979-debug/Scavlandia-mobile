// src/components/ui/Button.tsx
// A reusable button component used throughout the app.
// Usage: <Button label='Start Hunt' onPress={handlePress} variant='primary' />

import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import { COLORS, FONTS, RADIUS, SHADOW } from "../../theme";

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "accent" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  emoji?: string; // Optional emoji prefix
  style?: ViewStyle;
}

export default function Button({
  label,
  onPress,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  emoji,
  style,
}: ButtonProps) {
  const bgColor = {
    primary: COLORS.primary,
    secondary: COLORS.white,
    accent: COLORS.accent,
    ghost: "transparent",
    danger: COLORS.danger,
  }[variant];

  const textColor = {
    primary: COLORS.white,
    secondary: COLORS.primary,
    accent: COLORS.white,
    ghost: COLORS.primary,
    danger: COLORS.white,
  }[variant];

  const padding = { sm: 10, md: 14, lg: 18 }[size];
  const fontSize = {
    sm: FONTS.sizes.sm,
    md: FONTS.sizes.md,
    lg: FONTS.sizes.lg,
  }[size];
  const borderColor =
    variant === "secondary" || variant === "ghost"
      ? COLORS.primary
      : "transparent";

  return (
    <TouchableOpacity
      style={[
        styles.base,
        { backgroundColor: bgColor, padding, borderColor, borderWidth: 2 },
        variant !== "ghost" && SHADOW.sm,
        (disabled || loading) && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text
          style={[
            styles.label,
            { color: textColor, fontSize, fontWeight: FONTS.weights.bold },
          ]}
        >
          {emoji ? `${emoji}  ${label}` : label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: RADIUS.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  label: { textAlign: "center" },
  disabled: { opacity: 0.5 },
});

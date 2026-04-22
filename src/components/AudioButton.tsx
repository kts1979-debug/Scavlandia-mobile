// src/components/AudioButton.tsx
// Reusable button that reads text aloud using device TTS.
// Shows a speaker icon that animates while speaking.

import * as Speech from "expo-speech";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS, FONTS, RADIUS, SPACING } from "../theme";

interface AudioButtonProps {
  text: string;
  label?: string;
  compact?: boolean; // true = icon only, false = icon + label
}

export default function AudioButton({
  text,
  label = "Read Aloud",
  compact = false,
}: AudioButtonProps) {
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    // Check if speech is available on this device
    Speech.getAvailableVoicesAsync()
      .then((voices) => {
        setSupported(voices.length > 0 || true); // most devices support TTS
      })
      .catch(() => setSupported(true));

    // Stop speaking when component unmounts
    return () => {
      Speech.stop();
    };
  }, []);

  // Stop speaking when text changes (new stop loaded)
  useEffect(() => {
    Speech.stop();
    setSpeaking(false);
  }, [text]);

  const handlePress = async () => {
    if (speaking) {
      await Speech.stop();
      setSpeaking(false);
      return;
    }

    setSpeaking(true);
    Speech.speak(text, {
      language: "en-US",
      pitch: 1.0,
      rate: 0.9, // slightly slower than default for clarity
      onDone: () => setSpeaking(false),
      onError: () => setSpeaking(false),
      onStopped: () => setSpeaking(false),
    });
  };

  if (!supported) return null;

  if (compact) {
    return (
      <TouchableOpacity
        style={[styles.compactBtn, speaking && styles.compactBtnActive]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        {speaking ? (
          <ActivityIndicator size="small" color={COLORS.white} />
        ) : (
          <Text style={styles.compactIcon}>🔊</Text>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.btn, speaking && styles.btnActive]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.btnInner}>
        {speaking ? (
          <ActivityIndicator
            size="small"
            color={speaking ? COLORS.white : COLORS.primary}
          />
        ) : (
          <Text style={styles.icon}>🔊</Text>
        )}
        <Text style={[styles.label, speaking && styles.labelActive]}>
          {speaking ? "Tap to stop" : label}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    backgroundColor: COLORS.white,
  },
  btnActive: { backgroundColor: COLORS.primary },
  btnInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    justifyContent: "center",
  },
  icon: { fontSize: 16 },
  label: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
    fontWeight: FONTS.weights.medium,
  },
  labelActive: { color: COLORS.white },
  compactBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  compactBtnActive: { backgroundColor: COLORS.accent },
  compactIcon: { fontSize: 16 },
});

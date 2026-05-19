// src/screens/JoinHuntScreen.tsx
// Receiver enters a 6-char share code to get a copy of a friend's hunt.

import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { joinHunt } from "../services/apiService";
import { COLORS, FONTS, RADIUS, SPACING } from "../theme";

const HERO_BG = require("../../assets/images/hunt_bg_3_friends_nyc.jpg");

export default function JoinHuntScreen() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handleJoin = async () => {
    const trimmed = code.trim().toUpperCase();
    if (trimmed.length !== 6) {
      Alert.alert("Invalid code", "Please enter the full 6-character code.");
      return;
    }

    setLoading(true);
    try {
      const result = await joinHunt(trimmed);
      const hunt = result.hunt;

      Alert.alert(
        "🎉 Hunt Joined!",
        `You've joined "${hunt.huntTitle}". Ready to start?`,
        [
          {
            text: "Let's go!",
            onPress: () =>
              router.replace({
                pathname: "/safety-warning",
                params: {
                  hunt: JSON.stringify(hunt),
                  sessionCode: "",
                },
              }),
          },
        ],
      );
    } catch (error: any) {
      const msg =
        error.response?.data?.error ||
        "Could not join hunt. Check the code and try again.";
      Alert.alert("Couldn't join", msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (text: string) => {
    const clean = text
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 6);
    setCode(clean);
  };

  return (
    <View style={styles.container}>
      {/* Full screen background */}
      <Image source={HERO_BG} style={styles.bgImage} resizeMode="cover" />
      <View style={styles.overlay} />

      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        {/* Hero section */}
        <View style={styles.heroSection}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Text style={styles.backText}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={styles.heroEmoji}>🤝</Text>
          <Text style={styles.heroTitle}>Join a Hunt</Text>
          <Text style={styles.heroSubtitle}>
            Enter the 6-character code your friend shared with you
          </Text>
        </View>

        {/* White content card */}
        <View style={styles.contentCard}>
          <View style={styles.codeCard}>
            <Text style={styles.cardLabel}>Enter your share code</Text>

            {/* Code boxes */}
            <TouchableOpacity
              style={styles.codeInputContainer}
              onPress={() => inputRef.current?.focus()}
              activeOpacity={1}
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.codeBox,
                    i < code.length && styles.codeBoxFilled,
                    i === code.length && styles.codeBoxActive,
                  ]}
                >
                  <Text style={styles.codeChar}>{code[i] || ""}</Text>
                </View>
              ))}
            </TouchableOpacity>

            {/* Hidden input */}
            <TextInput
              ref={inputRef}
              value={code}
              onChangeText={handleCodeChange}
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={6}
              style={styles.hiddenInput}
              autoFocus
            />

            <TouchableOpacity
              style={[
                styles.joinBtn,
                (code.length !== 6 || loading) && styles.joinBtnDisabled,
              ]}
              onPress={handleJoin}
              disabled={code.length !== 6 || loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Text style={styles.joinBtnText}>Join Hunt →</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.note}>
              {
                "Each share code can only be used once. You'll get your own copy of the hunt to complete independently."
              }
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primary },
  bgImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(25, 50, 85, 0.35)",
  },
  safeArea: { flex: 1 },

  // ── Hero ──────────────────────────────────────────────────────
  heroSection: {
    padding: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
    alignItems: "center",
  },
  backBtn: { alignSelf: "flex-start", marginBottom: SPACING.md },
  backText: {
    color: "rgba(255,255,255,0.75)",
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
  },
  heroEmoji: { fontSize: 56, marginBottom: SPACING.sm },
  heroTitle: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.white,
    marginBottom: 6,
    textAlign: "center",
  },
  heroSubtitle: {
    fontSize: FONTS.sizes.md,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    lineHeight: 22,
  },

  // ── Content card ──────────────────────────────────────────────
  contentCard: {
    flex: 1,
    backgroundColor: "transparent",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: SPACING.xl,
    paddingTop: SPACING.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  cardLabel: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.primary,
    marginBottom: SPACING.lg,
    textAlign: "center",
  },
  // Add this new style:
  codeCard: {
    backgroundColor: "rgba(255, 255, 255, 0.75)",
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    width: "100%",
    alignItems: "center",
    gap: SPACING.lg,
  },

  // ── Code input ────────────────────────────────────────────────
  codeInputContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: SPACING.xl,
  },
  codeBox: {
    width: 44,
    height: 56,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.midGray,
    backgroundColor: "rgba(255,255,255,0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  codeBoxFilled: {
    borderColor: COLORS.primary,
    backgroundColor: "rgba(232, 248, 247, 0.75)",
  },
  codeBoxActive: {
    borderColor: COLORS.accent,
    borderWidth: 2.5,
  },
  codeChar: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.primary,
    letterSpacing: 1,
  },
  hiddenInput: {
    position: "absolute",
    opacity: 0,
    height: 0,
    width: 0,
  },

  // ── Buttons ───────────────────────────────────────────────────
  joinBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    alignItems: "center",
    width: "100%",
    marginBottom: SPACING.md,
  },
  joinBtnDisabled: { backgroundColor: "rgba(255, 255, 255, 0.75)" },
  joinBtnText: {
    color: COLORS.primary,
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.heavy,
  },
  note: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.darkGray,
    textAlign: "center",
    fontStyle: "italic",
    lineHeight: 18,
    paddingHorizontal: SPACING.md,
  },
});

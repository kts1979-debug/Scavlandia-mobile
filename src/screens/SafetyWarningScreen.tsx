// src/screens/SafetyWarningScreen.tsx
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, FONTS, RADIUS, SPACING } from "../theme";

const HERO_BG = require("../../assets/images/hunt_bg_1_cliff_city.jpg");

export default function SafetyWarningScreen() {
  const params = useLocalSearchParams();
  const [agreed, setAgreed] = useState(false);

  const handleContinue = () => {
    if (!agreed) return;
    router.replace({ pathname: "/hunt-intro", params });
  };

  return (
    <View style={styles.container}>
      {/* Full screen background */}
      <Image source={HERO_BG} style={styles.bgImage} resizeMode="cover" />
      <View style={styles.overlay} />

      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        {/* Hero section floating over photo */}
        <View style={styles.heroSection}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Text style={styles.backText}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={styles.heroEmoji}>⚠️</Text>
          <Text style={styles.heroTitle}>Safety First</Text>
          <Text style={styles.heroSubtitle}>
            Please read before starting your adventure
          </Text>
        </View>

        {/* White card sliding up from bottom */}
        <ScrollView
          style={styles.contentCard}
          contentContainerStyle={styles.cardContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Warning cards */}
          {[
            {
              emoji: "🚦",
              title: "Watch for traffic",
              desc: "Always use designated crosswalks and obey traffic signals. Look up from your phone before crossing any road.",
            },
            {
              emoji: "👀",
              title: "Stay aware of your surroundings",
              desc: "Keep your head up and stay alert. Avoid using your phone while walking near traffic or in crowded areas.",
            },
            {
              emoji: "🛤️",
              title: "Adjust your path for safety",
              desc: "If a suggested route feels unsafe, take an alternative path. Your safety is more important than any clue.",
            },
            {
              emoji: "👥",
              title: "Stay with your group",
              desc: "Keep your group together, especially in unfamiliar areas. Let someone know your planned route.",
            },
            {
              emoji: "🏛️",
              title: "Respect private property",
              desc: "Stay on public property. Never trespass or enter restricted areas to complete a stop.",
            },
          ].map((item) => (
            <View key={item.title} style={styles.warningCard}>
              <Text style={styles.warningEmoji}>{item.emoji}</Text>
              <View style={styles.warningText}>
                <Text style={styles.warningTitle}>{item.title}</Text>
                <Text style={styles.warningDesc}>{item.desc}</Text>
              </View>
            </View>
          ))}

          {/* Agreement checkbox */}
          <TouchableOpacity
            style={[styles.checkRow, agreed && styles.checkRowChecked]}
            onPress={() => setAgreed((prev) => !prev)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
              {agreed && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkLabel}>
              I have read and understand these safety guidelines and agree to
              hunt responsibly
            </Text>
          </TouchableOpacity>

          {/* Continue button */}
          <TouchableOpacity
            style={[styles.continueBtn, !agreed && styles.continueBtnDisabled]}
            onPress={handleContinue}
            disabled={!agreed}
          >
            <Text
              style={[
                styles.continueBtnText,
                !agreed && styles.continueBtnTextDisabled,
              ]}
            >
              I Understand — Start My Hunt 🚀
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backLinkBtn}
            onPress={() => router.back()}
          >
            <Text style={styles.backLinkText}>← Go Back</Text>
          </TouchableOpacity>
        </ScrollView>
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
    backgroundColor: "rgba(25, 50, 85, 0.55)",
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
  heroEmoji: { fontSize: 52, marginBottom: SPACING.sm },
  heroTitle: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.white,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: FONTS.sizes.sm,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
  },

  // ── Content card ──────────────────────────────────────────────
  contentCard: {
    flex: 1,
    backgroundColor: "transparent",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  cardContent: { padding: SPACING.lg, paddingBottom: 48 },

  // ── Hunt intro ────────────────────────────────────────────────
  introCard: {
    backgroundColor: "rgba(60, 137, 214, 0.75)", // ← was COLORS.primary (solid)
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  introLabel: {
    fontSize: FONTS.sizes.xs,
    color: "rgba(255,255,255,0.6)",
    fontWeight: FONTS.weights.bold,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
  },
  introText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.white,
    lineHeight: 24,
    fontStyle: "italic",
  },

  // ── Warning cards ─────────────────────────────────────────────
  warningCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACING.md,
    backgroundColor: "rgba(255, 255, 255, 0.75)", // ← was rgba(255,255,255,0.85)
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent,
  },
  warningEmoji: { fontSize: 28, flexShrink: 0, marginTop: 2 },
  warningText: { flex: 1 },
  warningTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.black,
    marginBottom: 4,
  },
  warningDesc: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
    lineHeight: 20,
  },

  // ── Agreement ─────────────────────────────────────────────────
  checkRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACING.md,
    backgroundColor: "rgba(255, 255, 255, 0.75)", // ← was rgba(255,255,255,0.85)
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.midGray,
  },
  checkRowChecked: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accentPale,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.midGray,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  checkmark: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: FONTS.weights.heavy,
  },
  checkLabel: {
    flex: 1,
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
    lineHeight: 20,
  },

  // ── Buttons ───────────────────────────────────────────────────
  continueBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  continueBtnDisabled: { backgroundColor: COLORS.lightGray },
  continueBtnText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.heavy,
  },
  continueBtnTextDisabled: { color: COLORS.midGray },
  backLinkBtn: { alignItems: "center", padding: SPACING.md },
  backLinkText: {
    color: COLORS.accent,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.medium,
  },
});

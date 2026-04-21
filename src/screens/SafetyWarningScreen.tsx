// src/screens/SafetyWarningScreen.tsx
// Safety warning shown before every hunt launches.
// User must tap "I Understand" to proceed to the first clue.

import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, FONTS, RADIUS, SPACING } from "../theme";

export default function SafetyWarningScreen() {
  const params = useLocalSearchParams();
  const [agreed, setAgreed] = useState(false);

  const handleContinue = () => {
    if (!agreed) return;
    router.replace({
      pathname: "/active-hunt",
      params,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>⚠️</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>Safety First</Text>
        <Text style={styles.subtitle}>
          Please read before starting your adventure
        </Text>

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
            emoji: "🌙",
            title: "Be mindful of the time",
            desc: "Avoid isolated areas after dark. Plan to complete your hunt during daylight hours when possible.",
          },
          {
            emoji: "📱",
            title: "Keep your phone charged",
            desc: "Make sure you have enough battery to complete the hunt. Bring a portable charger if needed.",
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
          style={styles.checkRow}
          onPress={() => setAgreed((prev) => !prev)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
            {agreed && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkLabel}>
            I have read and understand these safety guidelines and agree to hunt
            responsibly
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

        {/* Back option */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>← Go Back</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.offWhite },
  scroll: { padding: SPACING.lg, paddingBottom: 40 },
  iconContainer: { alignItems: "center", marginBottom: SPACING.md },
  icon: { fontSize: 64 },
  title: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.primary,
    textAlign: "center",
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.darkGray,
    textAlign: "center",
    marginBottom: SPACING.xl,
    lineHeight: 22,
  },
  warningCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACING.md,
    backgroundColor: COLORS.white,
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
  checkRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.midGray,
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
  backBtn: { alignItems: "center", padding: SPACING.md },
  backBtnText: {
    color: COLORS.accent,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.medium,
  },
});

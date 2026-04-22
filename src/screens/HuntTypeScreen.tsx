// src/screens/HuntTypeScreen.tsx
import { router } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../components/ui/Button";
import { COLORS, FONTS, RADIUS, SHADOW, SPACING } from "../theme";

export default function HuntTypeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={styles.title}>{"Welcome to\nScavlandia! 🗺️"}</Text>
        <Text style={styles.subtitle}>
          Choose your adventure type to get started
        </Text>

        {/* City Hunt */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push("/group-profile")}
          activeOpacity={0.85}
        >
          <Text style={styles.cardEmoji}>🏙️</Text>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>City Hunt</Text>
            <Text style={styles.cardDesc}>
              Explore a city with personalized clues at real locations. Perfect
              for any group in any city.
            </Text>
            <View style={styles.tagRow}>
              {["Outdoors", "GPS tracking", "Any city", "6–12 stops"].map(
                (tag) => (
                  <View key={tag} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ),
              )}
            </View>
          </View>
          <Text style={styles.cardArrow}>›</Text>
        </TouchableOpacity>

        {/* Museum Hunt */}
        <TouchableOpacity
          style={[styles.card, styles.cardMuseum]}
          onPress={() => router.push("/museum-profile")}
          activeOpacity={0.85}
        >
          <Text style={styles.cardEmoji}>🏛️</Text>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Museum Hunt</Text>
            <Text style={styles.cardDesc}>
              Discover artworks and exhibits inside a museum with riddle-based
              clues. Ticket purchase required.
            </Text>
            <View style={styles.tagRow}>
              {["Indoors", "Art & exhibits", "Any museum", "No GPS needed"].map(
                (tag) => (
                  <View key={tag} style={[styles.tag, styles.tagMuseum]}>
                    <Text style={[styles.tagText, styles.tagTextMuseum]}>
                      {tag}
                    </Text>
                  </View>
                ),
              )}
            </View>
          </View>
          <Text style={styles.cardArrow}>›</Text>
        </TouchableOpacity>

        {/* Micro Hunt */}
        <TouchableOpacity
          style={[styles.card, styles.cardMicro]}
          onPress={() => router.push("/micro-hunt")}
          activeOpacity={0.85}
        >
          <Text style={styles.cardEmoji}>⚡</Text>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Micro Hunt</Text>
            <Text style={styles.cardDesc}>
              A quick 1–2 stop adventure built around where you are right now.
              No setup needed — just go!
            </Text>
            <View style={styles.tagRow}>
              {["Nearby spots", "10–20 min", "No setup", "Quick fun"].map(
                (tag) => (
                  <View key={tag} style={[styles.tag, styles.tagMicro]}>
                    <Text style={[styles.tagText, styles.tagTextMicro]}>
                      {tag}
                    </Text>
                  </View>
                ),
              )}
            </View>
          </View>
          <Text style={styles.cardArrow}>›</Text>
        </TouchableOpacity>

        {/* Back */}
        <Button
          label="Back to Home"
          onPress={() => router.back()}
          variant="ghost"
          size="md"
          style={styles.backBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primary },
  content: { padding: SPACING.lg, justifyContent: "center", paddingBottom: 40 },
  title: {
    fontSize: FONTS.sizes.hero,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.white,
    marginBottom: SPACING.sm,
    lineHeight: 44,
  },
  subtitle: {
    fontSize: FONTS.sizes.md,
    color: "#AED6F1",
    marginBottom: SPACING.xl,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACING.md,
    ...SHADOW.lg,
  },
  cardMuseum: {
    backgroundColor: "#EBF5FB",
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  cardMicro: {
    backgroundColor: "#FEF9E7",
    borderWidth: 2,
    borderColor: COLORS.gold,
  },
  cardEmoji: { fontSize: 40, marginTop: 4 },
  cardText: { flex: 1 },
  cardTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.primary,
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  tag: {
    backgroundColor: COLORS.lightGray,
    borderRadius: RADIUS.round,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagMuseum: { backgroundColor: COLORS.accentPale },
  tagMicro: {
    backgroundColor: "#FEF9E7",
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  tagText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.darkGray,
    fontWeight: FONTS.weights.medium,
  },
  tagTextMuseum: { color: COLORS.accent },
  tagTextMicro: { color: "#B7950B" },
  cardArrow: {
    fontSize: FONTS.sizes.xxl,
    color: COLORS.midGray,
    alignSelf: "center",
  },
  backBtn: { marginTop: SPACING.sm },
});

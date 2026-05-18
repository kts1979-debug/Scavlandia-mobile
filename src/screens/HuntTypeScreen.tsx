// src/screens/HuntTypeScreen.tsx
import { router } from "expo-router";
import React from "react";
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

export default function HuntTypeScreen() {
  return (
    <View style={styles.container}>
      <Image source={HERO_BG} style={styles.heroBg} resizeMode="cover" />
      <View style={styles.overlay} />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.heroSection}>
            <Text style={styles.title}>{"Choose Your\nAdventure 🗺️"}</Text>
            <Text style={styles.subtitle}>
              Pick the type of hunt that fits your group
            </Text>
          </View>

          {/* Cards */}
          <View style={styles.cardsContainer}>
            {/* City Hunt */}
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                router.push({
                  pathname: "/hunt-style",
                  params: { huntType: "city" },
                })
              }
              activeOpacity={0.85}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardEmoji}>🏙️</Text>
                <View style={styles.cardHeaderText}>
                  <Text style={styles.cardTitle}>City Hunt</Text>
                  <Text style={styles.cardSub}>Any city worldwide</Text>
                </View>
                <Text style={styles.cardArrow}>›</Text>
              </View>
              <Text style={styles.cardDesc}>
                Explore a city with personalized clues at real locations.
                Perfect for any group in any city worldwide.
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
            </TouchableOpacity>

            {/* Road Trip */}
            <TouchableOpacity
              style={[styles.card, styles.cardRoadTrip]}
              onPress={() => router.push("/road-trip")}
              activeOpacity={0.85}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardEmoji}>🚗</Text>
                <View style={styles.cardHeaderText}>
                  <Text style={styles.cardTitle}>Road Trip Hunt</Text>
                  <Text style={styles.cardSub}>
                    Turn your drive into adventure
                  </Text>
                </View>
                <Text style={styles.cardArrow}>›</Text>
              </View>
              <Text style={styles.cardDesc}>
                {
                  "Enter your start and end points and we'll find roadside attractions, scenic overlooks, and hidden gems along the way."
                }
              </Text>
              <View style={styles.tagRow}>
                {[
                  "Driving route",
                  "2–12 stops",
                  "Google Maps",
                  "Roadside gems",
                ].map((tag) => (
                  <View key={tag} style={[styles.tag, styles.tagRoadTrip]}>
                    <Text style={[styles.tagText, styles.tagTextRoadTrip]}>
                      {tag}
                    </Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>

            {/* Micro Hunt */}
            <TouchableOpacity
              style={[styles.card, styles.cardMicro]}
              onPress={() =>
                router.push({
                  pathname: "/hunt-style",
                  params: { huntType: "micro" },
                })
              }
              activeOpacity={0.85}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardEmoji}>⚡</Text>
                <View style={styles.cardHeaderText}>
                  <Text style={styles.cardTitle}>Micro Hunt</Text>
                  <Text style={styles.cardSub}>Quick adventure nearby</Text>
                </View>
                <Text style={styles.cardArrow}>›</Text>
              </View>
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
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => router.back()}
            >
              <Text style={styles.backBtnText}>← Back to Home</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primary },
  heroBg: {
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
  scroll: { padding: SPACING.lg, paddingBottom: 40 },
  heroSection: { marginBottom: SPACING.xl, paddingTop: SPACING.lg },
  title: {
    fontSize: FONTS.sizes.hero,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.white,
    marginBottom: SPACING.sm,
    lineHeight: 44,
  },
  subtitle: {
    fontSize: FONTS.sizes.md,
    color: "rgba(255,255,255,0.75)",
  },
  cardsContainer: { gap: SPACING.md },
  card: {
    backgroundColor: "rgba(255,255,255,0.65)",
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
  },
  cardRoadTrip: {
    backgroundColor: "rgba(255,255,255,0.65)",
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  cardMicro: {
    backgroundColor: "rgba(255,255,255,0.65)",
    borderWidth: 2,
    borderColor: COLORS.purple,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  cardEmoji: { fontSize: 36 },
  cardHeaderText: { flex: 1 },
  cardTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.primary,
  },
  cardSub: { fontSize: FONTS.sizes.xs, color: COLORS.darkGray, marginTop: 2 },
  cardArrow: { fontSize: FONTS.sizes.xxl, color: COLORS.midGray },
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
  tagRoadTrip: {
    backgroundColor: COLORS.accentPale,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  tagMicro: {
    backgroundColor: COLORS.purplePale,
    borderWidth: 1,
    borderColor: COLORS.purple,
  },
  tagText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.darkGray,
    fontWeight: FONTS.weights.medium,
  },
  tagTextRoadTrip: { color: COLORS.accent },
  tagTextMicro: { color: COLORS.purple },
  backBtn: { alignItems: "center", padding: SPACING.md },
  backBtnText: { color: "rgba(255,255,255,0.7)", fontSize: FONTS.sizes.md },
});

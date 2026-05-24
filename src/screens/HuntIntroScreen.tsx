// src/screens/HuntIntroScreen.tsx
import { router, useLocalSearchParams } from "expo-router";
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

const HERO_IMAGES = [
  require("../../assets/images/hunt_bg_1_cliff_city.jpg"),
  require("../../assets/images/hunt_bg_3_friends_nyc.jpg"),
  require("../../assets/images/hunt_bg_4_friends_mountains.jpg"),
  require("../../assets/images/hunt_bg_5_explorer_greece.jpg"),
];

export default function HuntIntroScreen() {
  const params = useLocalSearchParams();

  let hunt: any = {};
  try {
    hunt = JSON.parse(params.hunt as string);
  } catch {}

  const huntIntroduction =
    hunt.huntIntroduction || "Your adventure is about to begin!";
  const huntTitle = hunt.huntTitle || "Your Hunt";
  const city = hunt.city?.split(",")[0] || "";

  // Pick a hero image based on hunt id
  const heroIndex = hunt.huntId
    ? hunt.huntId.charCodeAt(0) % HERO_IMAGES.length
    : 0;

  const handleStart = () => {
    router.replace({ pathname: "/active-hunt", params });
  };

  return (
    <View style={styles.container}>
      <Image
        source={HERO_IMAGES[heroIndex]}
        style={styles.bgImage}
        resizeMode="cover"
      />
      <View style={styles.overlay} />
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <View style={styles.heroSection}>
          <Text style={styles.heroEmoji}>🗺️</Text>
          <Text style={styles.heroTitle}>{huntTitle}</Text>
          {city ? (
            <View style={styles.cityBadge}>
              <Text style={styles.cityBadgeText}>📍 {city}</Text>
            </View>
          ) : null}
        </View>
        <ScrollView
          style={styles.contentCard}
          contentContainerStyle={styles.cardContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.introCard}>
            <Text style={styles.introLabel}>🎯 Your Adventure Begins</Text>
            <Text style={styles.introText}>{huntIntroduction}</Text>
          </View>

          <View style={styles.tipsCard}>
            {[
              { emoji: "📍", text: "Follow the clues to each stop" },
              { emoji: "📸", text: "Take photos to complete each stop" },
              { emoji: "🧠", text: "Answer trivia to earn bonus points" },
              { emoji: "⏭️", text: "Skip or swap stops if needed" },
            ].map((tip) => (
              <View key={tip.text} style={styles.tipRow}>
                <Text style={styles.tipEmoji}>{tip.emoji}</Text>
                <Text style={styles.tipText}>{tip.text}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.startBtn} onPress={handleStart}>
            <Text style={styles.startBtnText}>🚀 Start Hunt</Text>
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
  heroSection: {
    alignItems: "center",
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  heroEmoji: { fontSize: 56, marginBottom: SPACING.sm },
  heroTitle: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.white,
    textAlign: "center",
    marginBottom: SPACING.sm,
  },
  cityBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: RADIUS.round,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
  },
  cityBadgeText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
  },
  contentCard: {
    flex: 1,
    backgroundColor: "transparent",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  cardContent: { padding: SPACING.lg, paddingBottom: 48 },
  introCard: {
    backgroundColor: "rgba(60, 137, 214, 0.75)",
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  introLabel: {
    fontSize: FONTS.sizes.xs,
    color: "rgba(255,255,255,0.7)",
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
  tipsCard: {
    backgroundColor: "rgba(255,255,255,0.75)",
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  tipEmoji: { fontSize: 22, width: 30 },
  tipText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.darkGray,
    flex: 1,
  },
  startBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: "center",
  },
  startBtnText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.heavy,
  },
});

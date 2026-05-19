// src/screens/MicroHuntScreen.tsx
import * as Location from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Card from "../components/ui/Card";
import { generateMicroHunt } from "../services/apiService";
import {
  COLORS,
  DIFFICULTY,
  FONTS,
  RADIUS,
  SPACING,
  SPECIALTY_HUNTS,
} from "../theme";
import { canGenerateHunt } from "../services/purchaseService";

const HERO_BG = require("../../assets/images/hunt_bg_8_friends_overlook.jpg");

type Phase = "intro" | "locating" | "generating" | "error";

const INTERESTS = [
  { label: "Food & Drink", emoji: "🍽️" },
  { label: "Foodie", emoji: "🍕" },
  { label: "Bar Crawl", emoji: "🍺" },
  { label: "History", emoji: "🏛️" },
  { label: "Art", emoji: "🎨" },
  { label: "Nature", emoji: "🌿" },
  { label: "Science", emoji: "🔬" },
  { label: "Music", emoji: "🎵" },
  { label: "Architecture", emoji: "🏗️" },
  { label: "Games", emoji: "🎮" },
  { label: "Sports", emoji: "⚽" },
  { label: "Hidden Gems", emoji: "💎" },
  { label: "Street Art", emoji: "🖌️" },
  { label: "Photography", emoji: "📷" },
  { label: "True Crime", emoji: "🔪" },
  { label: "Ghosts", emoji: "👻" },
  { label: "Film & TV", emoji: "🎬" },
  { label: "Shopping", emoji: "🛍️" },
];

const RANDOM_INTERESTS = [
  "Food & Drink",
  "History",
  "Art",
  "Nature",
  "Music",
  "Architecture",
  "Games",
  "Sports",
  "Hidden Gems",
  "Street Art",
  "Photography",
];

export default function MicroHuntScreen() {
  const params = useLocalSearchParams();
  const huntStyle = (params.huntStyle as string) || "personalized";
  const incomingSpecialtyKey = (params.specialtyKey as string) || "";

  const [phase, setPhase] = useState<Phase>("intro");
  const [error, setError] = useState<string | null>(null);
  const [stopCount, setStopCount] = useState(2);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "easy",
  );
  const [interests, setInterests] = useState<string[]>([]);
  const [playMode, setPlayMode] = useState<"solo" | "compete">("solo");

  const isSpecialty = huntStyle === "specialty";

  const toggleInterest = (label: string) => {
    setInterests((prev) =>
      prev.includes(label) ? prev.filter((i) => i !== label) : [...prev, label],
    );
  };

  const handleRandomize = () => {
    const shuffled = [...RANDOM_INTERESTS].sort(() => Math.random() - 0.5);
    setInterests(shuffled.slice(0, Math.floor(Math.random() * 3) + 3));
  };

  const handleStart = async () => {
    try {
      setPhase("locating");
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError("Location permission is required for micro hunts.");
        setPhase("error");
        return;
      }
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setPhase("generating");

      const finalInterests = isSpecialty
        ? []
        : interests.length > 0
          ? interests
          : [...RANDOM_INTERESTS].sort(() => Math.random() - 0.5).slice(0, 4);

      const selectedSpecialty = incomingSpecialtyKey
        ? SPECIALTY_HUNTS[incomingSpecialtyKey as keyof typeof SPECIALTY_HUNTS]
        : null;

      const canGenerate = await canGenerateHunt("micro");
      if (!canGenerate) {
        setPhase("intro");
        router.push({
          pathname: "/paywall",
          params: {
            huntType: "micro",
            nextRoute: "/micro-hunt",
            nextParams: JSON.stringify({}),
          },
        });
        return;
      }

      // Niche interest warning
      if (!isSpecialty && interests.length > 0 && interests.length <= 2) {
        const nicheInterests = [
          "True Crime",
          "Ghosts",
          "Film & TV",
          "Street Art",
          "Architecture",
          "Music",
        ];
        const selectedNiche = interests.filter((i) =>
          nicheInterests.includes(i),
        );
        if (selectedNiche.length === interests.length) {
          setPhase("intro");
          const proceed = await new Promise<boolean>((resolve) => {
            Alert.alert(
              "Limited Spots Nearby",
              `We may find fewer stops for "${interests.join(" & ")}" in your immediate area.\n\nAdding more interests like History, Art, or Hidden Gems will give you a richer hunt.`,
              [
                {
                  text: "Add More Interests",
                  style: "cancel",
                  onPress: () => resolve(false),
                },
                { text: "Generate Anyway", onPress: () => resolve(true) },
              ],
            );
          });
          if (!proceed) return;
          setPhase("generating");
        }
      }

      const hunt = await generateMicroHunt(
        location.coords.latitude,
        location.coords.longitude,
        stopCount,
        difficulty,
        selectedSpecialty?.huntVibe || "fun and educational",
        selectedSpecialty?.clueTheme || "fun and educational",
        finalInterests,
      );

      router.replace({
        pathname: "/hunt-setup",
        params: { hunt: JSON.stringify(hunt), playMode },
      });
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          "Could not generate a micro hunt. Please try again.",
      );
      setPhase("error");
    }
  };

  const SectionHeader = ({
    emoji,
    title,
  }: {
    emoji: string;
    title: string;
  }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionEmoji}>{emoji}</Text>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  // ── Loading / error states ─────────────────────────────────────
  if (phase === "locating" || phase === "generating") {
    return (
      <View style={styles.container}>
        <Image source={HERO_BG} style={styles.heroBg} resizeMode="cover" />
        <View style={styles.overlay} />
        <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              padding: SPACING.xl,
            }}
          >
            <Text style={{ fontSize: 72, marginBottom: SPACING.md }}>
              {phase === "locating" ? "📍" : "⚡"}
            </Text>
            <ActivityIndicator
              size="large"
              color={COLORS.accent}
              style={{ marginBottom: SPACING.lg }}
            />
            <Text
              style={{
                fontSize: FONTS.sizes.xxl,
                fontWeight: FONTS.weights.heavy,
                color: COLORS.white,
                textAlign: "center",
                marginBottom: SPACING.sm,
              }}
            >
              {phase === "locating"
                ? "Finding Your Location"
                : "Building Your Hunt"}
            </Text>
            <Text
              style={{
                fontSize: FONTS.sizes.md,
                color: "rgba(255,255,255,0.75)",
                textAlign: "center",
                marginBottom: SPACING.xl,
                lineHeight: 24,
              }}
            >
              {phase === "locating"
                ? "We need your location to find nearby spots..."
                : "Crafting personalized clues for spots near you..."}
            </Text>
            <Text
              style={{
                fontSize: FONTS.sizes.sm,
                color: "rgba(255,255,255,0.5)",
                textAlign: "center",
                fontStyle: "italic",
              }}
            >
              This can take up to a minute ✨
            </Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (phase === "error") {
    return (
      <View style={styles.container}>
        <Image source={HERO_BG} style={styles.heroBg} resizeMode="cover" />
        <View style={styles.overlay} />
        <SafeAreaView style={[styles.safeArea, styles.centeredSafeArea]}>
          <Text style={styles.loadingEmoji}>⚠️</Text>
          <Text style={styles.loadingTitle}>Something went wrong</Text>
          <Text style={styles.loadingSubtitle}>{error}</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => {
              setPhase("intro");
              setError(null);
            }}
          >
            <Text style={styles.retryBtnText}>Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.backBtn2}
            onPress={() => router.back()}
          >
            <Text style={styles.backBtn2Text}>← Go Back</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    );
  }

  // ── Intro state ────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <Image source={HERO_BG} style={styles.heroBg} resizeMode="cover" />
      <View style={styles.overlay} />

      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        {/* Hero header */}
        <View style={styles.heroSection}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backRow}
          >
            <Text style={styles.backText}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={styles.heroTitle}>
            {isSpecialty && incomingSpecialtyKey
              ? `${SPECIALTY_HUNTS[incomingSpecialtyKey as keyof typeof SPECIALTY_HUNTS]?.emoji} Micro Hunt`
              : "⚡ Micro Hunt"}
          </Text>
          <Text style={styles.heroSub}>
            A quick adventure built around where you are right now
          </Text>
        </View>

        {/* White card */}
        <ScrollView
          style={styles.card}
          contentContainerStyle={styles.cardContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Stop count */}
          <Card style={styles.section}>
            <SectionHeader emoji="🚩" title="How many stops?" />
            <Text style={styles.hint}>More stops = longer adventure</Text>
            <View style={styles.stopCountRow}>
              <TouchableOpacity
                style={styles.stopCountBtn}
                onPress={() => setStopCount((p) => Math.max(1, p - 1))}
              >
                <Text style={styles.stopCountBtnText}>−</Text>
              </TouchableOpacity>
              <View style={styles.stopCountDisplay}>
                <Text style={styles.stopCountValue}>{stopCount}</Text>
                <Text style={styles.stopCountLabel}>stops</Text>
              </View>
              <TouchableOpacity
                style={styles.stopCountBtn}
                onPress={() => setStopCount((p) => Math.min(3, p + 1))}
              >
                <Text style={styles.stopCountBtnText}>+</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.stopCountEstimate}>
              ⏱ Estimated time: {stopCount * 10}–{stopCount * 15} minutes
            </Text>
          </Card>

          {/* Play mode */}
          <Card style={styles.section}>
            <SectionHeader emoji="🏁" title="How are you playing?" />
            <Text style={styles.hint}>
              Solo hunts include a shareable code. Competing hunts join a live
              leaderboard.
            </Text>
            <View style={styles.modeRow}>
              <TouchableOpacity
                style={[
                  styles.modeBtn,
                  playMode === "solo" && styles.modeBtnActive,
                ]}
                onPress={() => setPlayMode("solo")}
              >
                <Text style={styles.modeEmoji}>🧍</Text>
                <Text
                  style={[
                    styles.modeLabel,
                    playMode === "solo" && styles.modeLabelActive,
                  ]}
                >
                  Solo / Group
                </Text>
                <Text
                  style={[
                    styles.modeSub,
                    playMode === "solo" && styles.modeSubActive,
                  ]}
                >
                  Share hunt with a friend
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modeBtn,
                  playMode === "compete" && styles.modeBtnActive,
                ]}
                onPress={() => setPlayMode("compete")}
              >
                <Text style={styles.modeEmoji}>🏆</Text>
                <Text
                  style={[
                    styles.modeLabel,
                    playMode === "compete" && styles.modeLabelActive,
                  ]}
                >
                  Compete
                </Text>
                <Text
                  style={[
                    styles.modeSub,
                    playMode === "compete" && styles.modeSubActive,
                  ]}
                >
                  Live leaderboard
                </Text>
              </TouchableOpacity>
            </View>
            {playMode === "compete" && (
              <View style={styles.competingNote}>
                <Text style={styles.competingNoteText}>
                  {
                    "🌍 Everyone generates their own unique hunt wherever they are — scores combine on a live leaderboard."
                  }
                </Text>
              </View>
            )}
          </Card>

          {/* Interests — personalized only */}
          {!isSpecialty && (
            <Card style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <SectionHeader emoji="❤️" title="What do you love?" />
                <View style={styles.optionalRow}>
                  <Text style={styles.optionalLabel}>Optional</Text>
                  <TouchableOpacity
                    style={styles.randomBtn}
                    onPress={handleRandomize}
                  >
                    <Text style={styles.randomBtnText}>🎲 Randomize</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.hint}>
                Pick what fits — or tap Randomize to let us choose
              </Text>
              {interests.length > 0 && (
                <TouchableOpacity
                  style={styles.clearBtn}
                  onPress={() => setInterests([])}
                >
                  <Text style={styles.clearBtnText}>✕ Clear selections</Text>
                </TouchableOpacity>
              )}
              <View style={styles.chipGrid}>
                {INTERESTS.map(({ label, emoji }) => {
                  const selected = interests.includes(label);
                  return (
                    <TouchableOpacity
                      key={label}
                      style={[styles.chip, selected && styles.chipSelected]}
                      onPress={() => toggleInterest(label)}
                    >
                      <Text style={styles.chipEmoji}>{emoji}</Text>
                      <Text
                        style={[
                          styles.chipText,
                          selected && styles.chipTextSelected,
                        ]}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Card>
          )}

          {/* Difficulty */}
          <Card style={styles.section}>
            <SectionHeader emoji="🎯" title="Difficulty" />
            <Text style={styles.hint}>
              Affects clue complexity and timer length
            </Text>
            <View style={styles.difficultyRow}>
              {(["easy", "medium", "hard"] as const).map((level) => {
                const d = DIFFICULTY[level];
                const selected = difficulty === level;
                return (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.diffBtn,
                      selected && {
                        backgroundColor: d.color,
                        borderColor: d.color,
                      },
                    ]}
                    onPress={() => setDifficulty(level)}
                  >
                    <Text style={styles.diffEmoji}>{d.emoji}</Text>
                    <Text
                      style={[
                        styles.diffLabel,
                        selected && styles.diffLabelSelected,
                      ]}
                    >
                      {d.label}
                    </Text>
                    <Text
                      style={[
                        styles.diffSub,
                        selected && styles.diffLabelSelected,
                      ]}
                    >
                      {d.description}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Card>

          <TouchableOpacity style={styles.startBtn} onPress={handleStart}>
            <Text style={styles.startBtnText}>⚡ Build My Micro Hunt</Text>
          </TouchableOpacity>
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
    backgroundColor: "rgba(25, 50, 85, 0.72)",
  },
  safeArea: { flex: 1 },
  centeredSafeArea: {
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl,
  },
  heroSection: { padding: SPACING.lg, paddingBottom: SPACING.xl },
  backRow: { marginBottom: SPACING.sm },
  backText: {
    color: "rgba(255,255,255,0.75)",
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
  },
  heroTitle: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.white,
    marginBottom: 4,
  },
  heroSub: { fontSize: FONTS.sizes.md, color: "rgba(255,255,255,0.75)" },
  card: {
    flex: 1,
    backgroundColor: "transparent",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  cardContent: { padding: SPACING.md, paddingBottom: 100 },
  section: {
    marginBottom: SPACING.md,
    backgroundColor: "rgba(255, 255, 255, 0.75)",
    borderRadius: RADIUS.lg,
  },
  sectionHeader: { flexDirection: "row", alignItems: "center" },
  sectionEmoji: { fontSize: 22, marginRight: 8 },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.primary,
  },
  hint: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
    marginBottom: SPACING.sm,
  },
  modeRow: { flexDirection: "row", gap: SPACING.sm },
  modeBtn: {
    flex: 1,
    alignItems: "center",
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.midGray,
    backgroundColor: COLORS.offWhite,
  },
  modeBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  modeEmoji: { fontSize: 28, marginBottom: 6 },
  modeLabel: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.black,
    marginBottom: 2,
    textAlign: "center",
  },
  modeLabelActive: { color: COLORS.white },
  modeSub: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.darkGray,
    textAlign: "center",
  },
  modeSubActive: { color: "rgba(255,255,255,0.7)" },
  competingNote: {
    backgroundColor: COLORS.accentPale,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginTop: SPACING.sm,
  },
  competingNoteText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.accent,
    lineHeight: 20,
  },
  chipGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.round,
    borderWidth: 1.5,
    borderColor: COLORS.midGray,
    backgroundColor: COLORS.offWhite,
    gap: 4,
  },
  chipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipEmoji: { fontSize: 14 },
  chipText: { fontSize: FONTS.sizes.sm, color: COLORS.darkGray },
  chipTextSelected: { color: COLORS.white, fontWeight: FONTS.weights.bold },
  difficultyRow: { flexDirection: "row", gap: 8 },
  diffBtn: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.midGray,
    backgroundColor: COLORS.offWhite,
  },
  diffEmoji: { fontSize: 22, marginBottom: 4 },
  diffLabel: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
    color: COLORS.black,
    marginBottom: 2,
    textAlign: "center",
  },
  diffLabelSelected: { color: COLORS.white },
  diffSub: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.darkGray,
    textAlign: "center",
  },
  stopCountRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.xl,
    marginBottom: SPACING.md,
  },
  stopCountBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  stopCountBtnText: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: FONTS.weights.heavy,
    lineHeight: 32,
  },
  stopCountDisplay: { alignItems: "center", minWidth: 80 },
  stopCountValue: {
    fontSize: 48,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.primary,
    lineHeight: 52,
  },
  stopCountLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
    marginTop: 2,
  },
  stopCountEstimate: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
    textAlign: "center",
    fontStyle: "italic",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.sm,
    flexWrap: "wrap",
    gap: SPACING.xs,
  },
  optionalRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    flexShrink: 1,
  },
  optionalLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.midGray,
    fontStyle: "italic",
  },
  randomBtn: {
    backgroundColor: COLORS.accentPale,
    borderRadius: RADIUS.round,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  randomBtnText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.accent,
    fontWeight: FONTS.weights.bold,
  },
  clearBtn: { alignSelf: "flex-start", marginBottom: SPACING.sm },
  clearBtnText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.danger,
    fontWeight: FONTS.weights.medium,
  },
  startBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: "center",
    marginTop: SPACING.md,
    marginBottom: 20,
  },
  startBtnText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.heavy,
  },
  loadingEmoji: { fontSize: 64, marginBottom: SPACING.sm },
  loadingTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.white,
    textAlign: "center",
    marginBottom: SPACING.sm,
  },
  loadingSubtitle: {
    fontSize: FONTS.sizes.md,
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
    marginBottom: SPACING.xl,
  },
  retryBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.sm,
  },
  retryBtnText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.heavy,
  },
  backBtn2: { padding: SPACING.md },
  backBtn2Text: { color: "rgba(255,255,255,0.7)", fontSize: FONTS.sizes.md },
});

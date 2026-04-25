// src/screens/MicroHuntScreen.tsx
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Card from "../components/ui/Card";
import { generateMicroHunt } from "../services/apiService";
import { COLORS, DIFFICULTY, FONTS, RADIUS, SPACING, THEMES } from "../theme";
import { canGenerateHunt } from "../services/purchaseService";

type Phase = "intro" | "locating" | "generating" | "error";

const INTERESTS = [
  { label: "Food & Drink", emoji: "🍕" },
  { label: "Beer & Bars", emoji: "🍺" },
  { label: "History", emoji: "🏛️" },
  { label: "Art", emoji: "🎨" },
  { label: "Sports", emoji: "⚽" },
  { label: "Nature", emoji: "🌿" },
  { label: "Music", emoji: "🎵" },
  { label: "Architecture", emoji: "🏗️" },
  { label: "Games", emoji: "🎮" },
  { label: "Shopping", emoji: "🛍️" },
  { label: "True Crime", emoji: "🔪" },
  { label: "Ghosts", emoji: "👻" },
  { label: "Street Art", emoji: "🖌️" },
  { label: "Hidden Gems", emoji: "💎" },
  { label: "Photography", emoji: "📷" },
  { label: "Film & TV", emoji: "🎬" },
];

const TONES = [
  { label: "Educational", emoji: "📚" },
  { label: "Silly & Fun", emoji: "😂" },
  { label: "Competitive", emoji: "🏆" },
  { label: "Relaxed", emoji: "😌" },
  { label: "Exercise-Focused", emoji: "🏃" },
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

const RANDOM_TONES = [
  "Educational",
  "Silly & Fun",
  "Competitive",
  "Relaxed",
  "Exercise-Focused",
];

export default function MicroHuntScreen() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [error, setError] = useState<string | null>(null);
  const [stopCount, setStopCount] = useState(2);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "easy",
  );
  const [theme, setTheme] = useState("adventure");
  const [tone, setTone] = useState("");
  const [interests, setInterests] = useState<string[]>([]);

  const toggleInterest = (label: string) => {
    setInterests((prev) =>
      prev.includes(label) ? prev.filter((i) => i !== label) : [...prev, label],
    );
  };

  const handleRandomize = () => {
    const shuffled = [...RANDOM_INTERESTS].sort(() => Math.random() - 0.5);
    const count = Math.floor(Math.random() * 3) + 3;
    setInterests(shuffled.slice(0, count));
    setTone(RANDOM_TONES[Math.floor(Math.random() * RANDOM_TONES.length)]);
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

      const finalInterests =
        interests.length > 0
          ? interests
          : [...RANDOM_INTERESTS].sort(() => Math.random() - 0.5).slice(0, 4);

      const finalTone =
        tone || RANDOM_TONES[Math.floor(Math.random() * RANDOM_TONES.length)];

      console.log(
        "📍 Starting micro hunt at:",
        location.coords.latitude,
        location.coords.longitude,
      );

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

      const hunt = await generateMicroHunt(
        location.coords.latitude,
        location.coords.longitude,
        stopCount,
        difficulty,
        theme,
        finalTone,
        finalInterests,
      );

      router.replace({
        pathname: "/safety-warning",
        params: { hunt: JSON.stringify(hunt), sessionCode: "" },
      });
    } catch (err: any) {
      console.error("Micro hunt error:", err.message);
      console.error("Micro hunt error detail:", err.response?.data);
      console.error("Micro hunt error status:", err.response?.status);
      console.error(
        "Micro hunt full error:",
        JSON.stringify(err.response?.data),
      );
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

  // ── Locating / Generating states ───────────────────────────────
  if (phase === "locating" || phase === "generating") {
    return (
      <SafeAreaView style={[styles.container, styles.containerDark]}>
        <View style={styles.centered}>
          <Text style={styles.loadingEmoji}>
            {phase === "locating" ? "📍" : "⚡"}
          </Text>
          <ActivityIndicator
            size="large"
            color={COLORS.accent}
            style={{ marginVertical: SPACING.lg }}
          />
          <Text style={styles.loadingTitle}>
            {phase === "locating"
              ? "Finding your location..."
              : "Building your micro hunt..."}
          </Text>
          <Text style={styles.loadingSubtitle}>
            {phase === "locating"
              ? "We need your location to find nearby spots"
              : "Crafting clues for spots near you"}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Error state ────────────────────────────────────────────────
  if (phase === "error") {
    return (
      <SafeAreaView style={[styles.container, styles.containerDark]}>
        <View style={styles.centered}>
          <Text style={styles.loadingEmoji}>⚠️</Text>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorDesc}>{error}</Text>
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
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Text style={styles.backBtnText}>← Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Intro state ────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>⚡ Micro Hunt</Text>
        <Text style={styles.pageSubtitle}>
          {"A quick adventure built around where you are right now"}
        </Text>

        {/* Stop count */}
        <Card style={styles.section}>
          <SectionHeader emoji="🚩" title="How many stops?" />
          <Text style={styles.hint}>More stops = longer adventure</Text>
          <View style={styles.stopCountRow}>
            <TouchableOpacity
              style={styles.stopCountBtn}
              onPress={() => setStopCount((prev) => Math.max(1, prev - 1))}
            >
              <Text style={styles.stopCountBtnText}>−</Text>
            </TouchableOpacity>
            <View style={styles.stopCountDisplay}>
              <Text style={styles.stopCountValue}>{stopCount}</Text>
              <Text style={styles.stopCountLabel}>stops</Text>
            </View>
            <TouchableOpacity
              style={styles.stopCountBtn}
              onPress={() => setStopCount((prev) => Math.min(2, prev + 1))}
            >
              <Text style={styles.stopCountBtnText}>+</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.stopCountEstimate}>
            ⏱ Estimated time: {stopCount * 10}–{stopCount * 15} minutes
          </Text>
        </Card>

        {/* Interests */}
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
              onPress={() => {
                setInterests([]);
                setTone("");
              }}
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

        {/* Tone / Vibe */}
        <Card style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <SectionHeader emoji="🎭" title="What vibe?" />
            <Text style={styles.optionalLabel}>Optional</Text>
          </View>
          <Text style={styles.hint}>Leave blank for a surprise</Text>
          {TONES.map(({ label, emoji }) => {
            const isSelected = tone === label;
            return (
              <TouchableOpacity
                key={label}
                style={[styles.optionRow, isSelected && styles.optionSelected]}
                onPress={() => setTone(isSelected ? "" : label)}
              >
                <Text style={styles.optionEmoji}>{emoji}</Text>
                <Text
                  style={[
                    styles.optionText,
                    isSelected && styles.optionTextSelected,
                  ]}
                >
                  {label}
                </Text>
                {isSelected && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
            );
          })}
        </Card>

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

        {/* Theme */}
        <Card style={styles.section}>
          <SectionHeader emoji="🎨" title="Hunt Theme" />
          <Text style={styles.hint}>Sets the personality of your clues</Text>
          <View style={styles.chipGrid}>
            {Object.entries(THEMES).map(([key, t]) => {
              const selected = theme === key;
              return (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.chip,
                    selected && {
                      backgroundColor: t.color,
                      borderColor: t.color,
                    },
                  ]}
                  onPress={() => setTheme(key)}
                >
                  <Text style={styles.chipEmoji}>{t.emoji}</Text>
                  <Text
                    style={[
                      styles.chipText,
                      selected && styles.chipTextSelected,
                    ]}
                  >
                    {t.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* Start button */}
        <TouchableOpacity style={styles.startBtn} onPress={handleStart}>
          <Text style={styles.startBtnText}>⚡ Build My Micro Hunt</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.offWhite },
  containerDark: { backgroundColor: COLORS.primary },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.xl,
  },
  scroll: { padding: SPACING.md, paddingBottom: 40 },
  pageTitle: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.primary,
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.darkGray,
    marginBottom: SPACING.lg,
  },
  section: { marginBottom: SPACING.md },
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
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  optionalRow: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
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
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.midGray,
    marginBottom: 8,
    gap: 10,
  },
  optionSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionEmoji: { fontSize: 18 },
  optionText: { flex: 1, fontSize: FONTS.sizes.md, color: COLORS.black },
  optionTextSelected: { color: COLORS.white, fontWeight: FONTS.weights.bold },
  checkmark: { fontSize: 18, color: COLORS.accent },
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
  startBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: "center",
    marginTop: SPACING.md,
    marginBottom: 40,
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
  },
  errorTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.white,
    marginBottom: SPACING.sm,
  },
  errorDesc: {
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
  backBtn: { padding: SPACING.md },
  backBtnText: { color: "rgba(255,255,255,0.7)", fontSize: FONTS.sizes.md },
});

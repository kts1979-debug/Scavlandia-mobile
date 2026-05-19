// src/screens/GroupProfileScreen.tsx
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CityPicker from "../components/CityPicker";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import {
  COLORS,
  DIFFICULTY,
  FONTS,
  RADIUS,
  SPACING,
  SPECIALTY_HUNTS,
} from "../theme";
import { canGenerateHunt } from "../services/purchaseService";

const HERO_BG = require("../../assets/images/hunt_bg_3_friends_nyc.jpg");

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

const MOBILITY = [
  { label: "Walking only", emoji: "🚶" },
  { label: "Can take transit", emoji: "🚌" },
  { label: "Wheelchair accessible", emoji: "♿" },
  { label: "Mix of walking & driving", emoji: "🚗" },
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

export default function GroupProfileScreen() {
  const params = useLocalSearchParams();
  const huntStyle = (params.huntStyle as string) || "personalized";
  const incomingSpecialtyKey = (params.specialtyKey as string) || "";

  const [city, setCity] = useState("");
  const [ages, setAges] = useState("30");
  const [interests, setInterests] = useState<string[]>([]);
  const [specialtyHunt, setSpecialtyHunt] = useState(incomingSpecialtyKey);
  const [playMode, setPlayMode] = useState<"solo" | "compete">("solo");
  const [mobility, setMobility] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "medium",
  );
  const [stopCount, setStopCount] = useState(9);

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

  const handleGenerate = async () => {
    if (!city.trim())
      return Alert.alert("Missing info", "Please enter a city name");
    if (!mobility)
      return Alert.alert("Missing info", "Please select a mobility option");

    const nicheInterests = [
      "True Crime",
      "Ghosts",
      "Film & TV",
      "Street Art",
      "Architecture",
      "Music",
    ];
    const selectedNiche = interests.filter((i) => nicheInterests.includes(i));
    const hasOnlyNiche =
      interests.length > 0 &&
      interests.length <= 2 &&
      selectedNiche.length === interests.length;

    if (hasOnlyNiche && !isSpecialty) {
      const proceed = await new Promise<boolean>((resolve) => {
        Alert.alert(
          "Limited Spots Available",
          `We may find fewer stops for "${interests.join(" & ")}" alone in some cities.\n\nAdding more interests like History, Art, or Hidden Gems will give you a richer hunt.`,
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
    }

    const finalInterests = isSpecialty
      ? []
      : interests.length > 0
        ? interests
        : [...RANDOM_INTERESTS].sort(() => Math.random() - 0.5).slice(0, 4);

    const selectedSpecialty = specialtyHunt
      ? SPECIALTY_HUNTS[specialtyHunt as keyof typeof SPECIALTY_HUNTS]
      : null;

    const groupProfile = {
      ages: parseInt(ages) || 30,
      interests: finalInterests,
      specialtyHunt: specialtyHunt || null,
      specialtyLabel: selectedSpecialty?.label || null,
      specialtySpotFocus: selectedSpecialty?.spotFocus || null,
      clueTheme: selectedSpecialty?.clueTheme || "fun and educational",
      huntVibe: selectedSpecialty?.huntVibe || "fun and educational",
      tone: selectedSpecialty?.clueTheme || "fun and educational",
      mobility,
      difficulty,
      stopCount,
      playMode,
    };

    const canGenerate = await canGenerateHunt("city");
    if (!canGenerate) {
      router.push({
        pathname: "/paywall",
        params: {
          huntType: "city",
          nextRoute: "/generating",
          nextParams: JSON.stringify({
            city: city.trim(),
            groupProfile: JSON.stringify(groupProfile),
          }),
        },
      });
      return;
    }

    router.push({
      pathname: "/generating",
      params: { city: city.trim(), groupProfile: JSON.stringify(groupProfile) },
    });
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

  const heroTitle =
    isSpecialty && specialtyHunt
      ? `${SPECIALTY_HUNTS[specialtyHunt as keyof typeof SPECIALTY_HUNTS]?.emoji} ${SPECIALTY_HUNTS[specialtyHunt as keyof typeof SPECIALTY_HUNTS]?.label}`
      : "🏙️ City Adventure";

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
          <Text style={styles.heroTitle}>{heroTitle}</Text>
          <Text style={styles.heroSub}>
            {"Tell us about your group and we'll do the rest"}
          </Text>
        </View>

        {/* White card */}
        <ScrollView
          style={styles.card}
          contentContainerStyle={styles.cardContent}
          showsVerticalScrollIndicator={false}
        >
          {/* City */}
          <Card style={styles.section}>
            <SectionHeader emoji="📍" title="Where are you?" />
            <CityPicker value={city} onChange={setCity} />
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

          {/* Group details */}
          <Card style={styles.section}>
            <SectionHeader emoji="👥" title="About your group" />
            <Text style={styles.fieldLabel}>Average age</Text>
            <TextInput
              style={styles.input}
              value={ages}
              onChangeText={setAges}
              keyboardType="numeric"
              maxLength={2}
              placeholder="30"
              placeholderTextColor={COLORS.midGray}
            />
          </Card>

          {/* Stop Count */}
          <Card style={styles.section}>
            <SectionHeader emoji="🚩" title="How many stops?" />
            <Text style={styles.hint}>More stops = longer adventure</Text>
            <View style={styles.stopCountRow}>
              <TouchableOpacity
                style={styles.stopCountBtn}
                onPress={() => setStopCount((p) => Math.max(6, p - 1))}
              >
                <Text style={styles.stopCountBtnText}>−</Text>
              </TouchableOpacity>
              <View style={styles.stopCountDisplay}>
                <Text style={styles.stopCountValue}>{stopCount}</Text>
                <Text style={styles.stopCountLabel}>stops</Text>
              </View>
              <TouchableOpacity
                style={styles.stopCountBtn}
                onPress={() => setStopCount((p) => Math.min(12, p + 1))}
              >
                <Text style={styles.stopCountBtnText}>+</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.stopCountEstimate}>
              ⏱ Estimated time: {Math.round(stopCount * 12)}–
              {Math.round(stopCount * 18)} minutes
            </Text>
          </Card>

          {/* Interests */}
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

          {/* Specialty selector */}
          {isSpecialty && !incomingSpecialtyKey && (
            <Card style={styles.section}>
              <SectionHeader emoji="⭐" title="Choose Specialty" />
              <View style={styles.specialtyGrid}>
                {Object.entries(SPECIALTY_HUNTS).map(([key, s]) => {
                  const selected = specialtyHunt === key;
                  return (
                    <TouchableOpacity
                      key={key}
                      style={[
                        styles.specialtyCard,
                        selected && {
                          backgroundColor: s.color,
                          borderColor: s.color,
                        },
                      ]}
                      onPress={() => setSpecialtyHunt(selected ? "" : key)}
                    >
                      <Text style={styles.specialtyEmoji}>{s.emoji}</Text>
                      <View style={styles.specialtyContent}>
                        <Text
                          style={[
                            styles.specialtyLabel,
                            selected && styles.specialtyLabelSelected,
                          ]}
                        >
                          {s.label}
                        </Text>
                        <Text
                          style={[
                            styles.specialtyDesc,
                            selected && styles.specialtyDescSelected,
                          ]}
                          numberOfLines={1}
                        >
                          {s.description}
                        </Text>
                      </View>
                      {selected && <Text style={styles.checkmark}>✓</Text>}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Card>
          )}

          {/* Mobility */}
          <Card style={styles.section}>
            <SectionHeader emoji="♿" title="Mobility?" />
            {MOBILITY.map(({ label, emoji }) => (
              <TouchableOpacity
                key={label}
                style={[
                  styles.optionRow,
                  mobility === label && styles.optionSelected,
                ]}
                onPress={() => setMobility(label)}
              >
                <Text style={styles.optionEmoji}>{emoji}</Text>
                <Text
                  style={[
                    styles.optionText,
                    mobility === label && styles.optionTextSelected,
                  ]}
                >
                  {label}
                </Text>
                {mobility === label && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
            ))}
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

          <Button
            label="Build My Hunt"
            onPress={handleGenerate}
            variant="accent"
            size="lg"
            emoji="⚙️"
            style={styles.generateBtn}
          />
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

  // ── Hero ──────────────────────────────────────────────────────
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

  // ── Card ──────────────────────────────────────────────────────
  card: {
    flex: 1,
    backgroundColor: "transparent", // ← was 0.65
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  cardContent: { padding: SPACING.md, paddingBottom: 100 }, // ← no paddingTop
  section: {
    marginBottom: SPACING.md,
    backgroundColor: "rgba(255, 255, 255, 0.75)",
    borderRadius: RADIUS.lg,
  },

  // ── Section headers ───────────────────────────────────────────
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
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
  fieldLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
    marginBottom: 6,
    fontWeight: FONTS.weights.medium,
  },
  input: {
    borderWidth: 1.5,
    borderColor: COLORS.midGray,
    borderRadius: RADIUS.md,
    padding: 12,
    fontSize: FONTS.sizes.md,
    color: COLORS.black,
    backgroundColor: COLORS.offWhite,
  },

  // ── Play mode ─────────────────────────────────────────────────
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

  // ── Stop count ────────────────────────────────────────────────
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

  // ── Interests ─────────────────────────────────────────────────
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

  // ── Specialty ─────────────────────────────────────────────────
  specialtyGrid: { gap: 8 },
  specialtyCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.midGray,
    backgroundColor: COLORS.offWhite,
    gap: 10,
  },
  specialtyEmoji: { fontSize: 24 },
  specialtyContent: { flex: 1 },
  specialtyLabel: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.black,
  },
  specialtyLabelSelected: { color: COLORS.white },
  specialtyDesc: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.darkGray,
    marginTop: 2,
  },
  specialtyDescSelected: { color: "rgba(255,255,255,0.85)" },

  // ── Mobility ──────────────────────────────────────────────────
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.darkGray,
    marginBottom: 8,
    gap: 10,
    backgroundColor: "rgba(232, 248, 247, 0.75)",
  },
  optionSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionEmoji: { fontSize: 18 },
  optionText: { flex: 1, fontSize: FONTS.sizes.md, color: COLORS.black },
  optionTextSelected: { color: COLORS.white, fontWeight: FONTS.weights.bold },
  checkmark: { fontSize: 18, color: COLORS.white },

  // ── Difficulty ────────────────────────────────────────────────
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

  generateBtn: { marginTop: SPACING.md, marginBottom: 20 },
});

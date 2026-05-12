// src/screens/GroupProfileScreen.tsx
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
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
import { COLORS, DIFFICULTY, FONTS, RADIUS, SPACING, VIBES } from "../theme";
import { canGenerateHunt } from "../services/purchaseService";

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

const RANDOM_VIBES = Object.keys(VIBES);

export default function GroupProfileScreen() {
  const [city, setCity] = useState("");
  const [ages, setAges] = useState("30");
  const [interests, setInterests] = useState<string[]>([]);
  const [vibe, setVibe] = useState("");
  const [mobility, setMobility] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "medium",
  );
  const [stopCount, setStopCount] = useState(9);

  const toggleInterest = (label: string) => {
    setInterests((prev) =>
      prev.includes(label) ? prev.filter((i) => i !== label) : [...prev, label],
    );
  };

  const handleRandomize = () => {
    const shuffled = [...RANDOM_INTERESTS].sort(() => Math.random() - 0.5);
    const count = Math.floor(Math.random() * 3) + 3;
    setInterests(shuffled.slice(0, count));
    setVibe(RANDOM_VIBES[Math.floor(Math.random() * RANDOM_VIBES.length)]);
  };

  const handleGenerate = async () => {
    if (!city.trim())
      return Alert.alert("Missing info", "Please enter a city name");
    if (!mobility)
      return Alert.alert("Missing info", "Please select a mobility option");

    const finalInterests =
      interests.length > 0
        ? interests
        : [...RANDOM_INTERESTS].sort(() => Math.random() - 0.5).slice(0, 4);

    const finalVibe =
      vibe || RANDOM_VIBES[Math.floor(Math.random() * RANDOM_VIBES.length)];

    const selectedVibe = VIBES[finalVibe as keyof typeof VIBES];

    const groupProfile = {
      ages: parseInt(ages) || 30,
      interests: finalInterests,
      vibe: finalVibe,
      vibeLabel: selectedVibe?.label || finalVibe,
      clueTheme: selectedVibe?.clueTheme || "fun and engaging",
      huntVibe: selectedVibe?.huntVibe || "fun and engaging",
      theme: finalVibe, // keep for backend compatibility
      tone: selectedVibe?.clueTheme || "fun and engaging", // keep for backend compatibility
      mobility,
      difficulty,
      stopCount,
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
      params: {
        city: city.trim(),
        groupProfile: JSON.stringify(groupProfile),
      },
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>🏙️ City Adventure</Text>
        <Text style={styles.pageSubtitle}>
          {"Tell us about your group and we'll do the rest"}
        </Text>

        {/* City */}
        <Card style={styles.section}>
          <SectionHeader emoji="📍" title="Where are you?" />
          <CityPicker value={city} onChange={setCity} />
        </Card>

        {/* Group details — average age only */}
        <Card style={styles.section}>
          <SectionHeader emoji="👥" title="About your group" />
          <View style={styles.row}>
            <View style={styles.halfField}>
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
            </View>
          </View>
        </Card>

        {/* Stop Count */}
        <Card style={styles.section}>
          <SectionHeader emoji="🚩" title="How many stops?" />
          <Text style={styles.hint}>More stops = longer adventure</Text>
          <View style={styles.stopCountRow}>
            <TouchableOpacity
              style={styles.stopCountBtn}
              onPress={() => setStopCount((prev) => Math.max(6, prev - 1))}
            >
              <Text style={styles.stopCountBtnText}>−</Text>
            </TouchableOpacity>
            <View style={styles.stopCountDisplay}>
              <Text style={styles.stopCountValue}>{stopCount}</Text>
              <Text style={styles.stopCountLabel}>stops</Text>
            </View>
            <TouchableOpacity
              style={styles.stopCountBtn}
              onPress={() => setStopCount((prev) => Math.min(12, prev + 1))}
            >
              <Text style={styles.stopCountBtnText}>+</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.stopDots}>
            {Array.from({ length: 12 - 6 + 1 }, (_, i) => i + 6).map((n) => (
              <TouchableOpacity
                key={n}
                onPress={() => setStopCount(n)}
                style={[
                  styles.stopDot,
                  n <= stopCount && styles.stopDotFilled,
                  n === stopCount && styles.stopDotActive,
                ]}
              >
                {n === stopCount && (
                  <Text style={styles.stopDotNumber}>{n}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.stopCountEstimate}>
            ⏱ Estimated time: {Math.round(stopCount * 12)}–
            {Math.round(stopCount * 18)} minutes
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

        {/* Vibe — unified vibe & theme */}
        <Card style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <SectionHeader emoji="🎭" title="Choose your vibe" />
            <Text style={styles.optionalLabel}>Optional</Text>
          </View>
          <Text style={styles.hint}>
            Sets the tone and theme of your entire hunt
          </Text>
          <View style={styles.chipGrid}>
            {Object.entries(VIBES).map(([key, v]) => {
              const selected = vibe === key;
              return (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.vibeChip,
                    selected && {
                      backgroundColor: v.color,
                      borderColor: v.color,
                    },
                  ]}
                  onPress={() => setVibe(selected ? "" : key)}
                >
                  <Text style={styles.chipEmoji}>{v.emoji}</Text>
                  <View style={styles.vibeChipContent}>
                    <Text
                      style={[
                        styles.vibeChipLabel,
                        selected && styles.chipTextSelected,
                      ]}
                    >
                      {v.label}
                    </Text>
                    <Text
                      style={[
                        styles.vibeChipDesc,
                        selected && styles.vibeChipDescSelected,
                      ]}
                      numberOfLines={1}
                    >
                      {v.description}
                    </Text>
                  </View>
                  {selected && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

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

        {/* Generate button */}
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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.offWhite },
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
  row: { flexDirection: "row", gap: SPACING.md },
  halfField: { flex: 1 },
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
  vibeChip: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    padding: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.midGray,
    backgroundColor: COLORS.offWhite,
    gap: 10,
    marginBottom: 8,
  },
  vibeChipContent: { flex: 1 },
  vibeChipLabel: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.black,
  },
  vibeChipDesc: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.darkGray,
    marginTop: 2,
  },
  vibeChipDescSelected: { color: "rgba(255,255,255,0.8)" },
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
  checkmark: { fontSize: 18, color: COLORS.white },
  generateBtn: { marginTop: SPACING.md, marginBottom: 40 },
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
  stopDots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginBottom: SPACING.sm,
  },
  stopDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: COLORS.midGray,
    backgroundColor: COLORS.offWhite,
    justifyContent: "center",
    alignItems: "center",
  },
  stopDotFilled: {
    backgroundColor: COLORS.accentPale,
    borderColor: COLORS.accent,
  },
  stopDotActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  stopDotNumber: {
    color: COLORS.white,
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.heavy,
  },
  stopCountEstimate: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
    textAlign: "center",
    fontStyle: "italic",
  },
});

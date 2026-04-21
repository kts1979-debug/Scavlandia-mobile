// src/screens/MuseumProfileScreen.tsx
// Streamlined group profile for museum hunts.
// Skips interests and mobility — not relevant indoors.

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
import MuseumPicker from "../components/MuseumPicker";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { COLORS, DIFFICULTY, FONTS, RADIUS, SPACING } from "../theme";

const TONES = [
  { label: "Educational", emoji: "📚" },
  { label: "Silly & Fun", emoji: "😂" },
  { label: "Competitive", emoji: "🏆" },
  { label: "Relaxed", emoji: "😌" },
];

const RANDOM_TONES = ["Educational", "Silly & Fun", "Competitive", "Relaxed"];

export default function MuseumProfileScreen() {
  const [ages, setAges] = useState("30");
  const [groupSize, setGroupSize] = useState("4");
  const [tone, setTone] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "medium",
  );
  const [stopCount, setStopCount] = useState(8);
  const [selectedMuseum, setSelectedMuseum] = useState<any>(null);

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

  const handleGenerate = () => {
    if (!selectedMuseum) {
      return Alert.alert("Missing info", "Please select a museum first");
    }

    const finalTone =
      tone || RANDOM_TONES[Math.floor(Math.random() * RANDOM_TONES.length)];

    router.push({
      pathname: "/generating",
      params: {
        city: selectedMuseum.name,
        groupProfile: JSON.stringify({
          ages: parseInt(ages) || 30,
          groupSize: parseInt(groupSize) || 4,
          interests: ["Art", "History", "Architecture"],
          tone: finalTone,
          mobility: "Walking only",
          difficulty,
          theme: "mystery",
          stopCount,
          huntType: "museum",
          museum: {
            name: selectedMuseum.name,
            address: selectedMuseum.address,
            lat: selectedMuseum.lat,
            lng: selectedMuseum.lng,
          },
        }),
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Text style={styles.backText}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={styles.pageTitle}>🏛️ Museum Hunt</Text>
          <Text style={styles.pageSubtitle}>
            <Text>
              {
                "Find a museum and we'll build an art-based scavenger hunt inside it"
              }
            </Text>
          </Text>
        </View>

        {/* Museum selection */}
        <Card style={styles.section}>
          <SectionHeader emoji="🏛️" title="Select a Museum" />
          <Text style={styles.hint}>Search nearby or type any museum name</Text>
          <MuseumPicker onSelect={(museum) => setSelectedMuseum(museum)} />
          {selectedMuseum && (
            <View style={styles.selectedBanner}>
              <Text style={styles.selectedName}>✅ {selectedMuseum.name}</Text>
              <Text style={styles.selectedAddress}>
                {selectedMuseum.address}
              </Text>
            </View>
          )}
        </Card>

        {/* Group details */}
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
            <View style={styles.halfField}>
              <Text style={styles.fieldLabel}>Group size</Text>
              <TextInput
                style={styles.input}
                value={groupSize}
                onChangeText={setGroupSize}
                keyboardType="numeric"
                maxLength={2}
                placeholder="4"
                placeholderTextColor={COLORS.midGray}
              />
            </View>
          </View>
        </Card>

        {/* Stop count */}
        <Card style={styles.section}>
          <SectionHeader emoji="🚩" title="How many stops?" />
          <Text style={styles.hint}>
            Each stop is a different artwork or exhibit
          </Text>
          <View style={styles.stopCountRow}>
            <TouchableOpacity
              style={styles.stopCountBtn}
              onPress={() => setStopCount((prev) => Math.max(6, prev - 1))}
            >
              <Text style={styles.stopCountBtnText}>−</Text>
            </TouchableOpacity>
            <View style={styles.stopCountDisplay}>
              <Text style={styles.stopCountValue}>{stopCount}</Text>
              <Text style={styles.stopCountLabel}>artworks</Text>
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
        </Card>

        {/* Vibe */}
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
            Affects how cryptic the artwork clues are
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

        {/* Ticket reminder */}
        <View style={styles.ticketReminder}>
          <Text style={styles.ticketEmoji}>🎫</Text>
          <Text style={styles.ticketText}>
            Remember to purchase museum admission tickets before starting your
            hunt!
          </Text>
        </View>

        <Button
          label="Build Museum Hunt"
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
  header: { marginBottom: SPACING.lg },
  backBtn: { marginBottom: SPACING.sm },
  backText: {
    color: COLORS.accent,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
  },
  pageTitle: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.primary,
    marginBottom: 6,
  },
  pageSubtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.darkGray,
    lineHeight: 22,
  },
  section: { marginBottom: SPACING.md },
  sectionHeader: { flexDirection: "row", alignItems: "center" },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
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
    marginTop: 4,
  },
  optionalLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.midGray,
    fontStyle: "italic",
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
  selectedBanner: {
    backgroundColor: COLORS.lgreen,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginTop: SPACING.sm,
  },
  selectedName: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.success,
  },
  selectedAddress: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
    marginTop: 2,
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
  ticketReminder: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    backgroundColor: COLORS.lyellow,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  ticketEmoji: { fontSize: 28 },
  ticketText: {
    flex: 1,
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
    lineHeight: 20,
  },
  generateBtn: { marginTop: SPACING.sm, marginBottom: 40 },
});

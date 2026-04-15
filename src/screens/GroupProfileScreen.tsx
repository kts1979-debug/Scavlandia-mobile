// src/screens/GroupProfileScreen.tsx — Playful redesign
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { COLORS, FONTS, RADIUS, SPACING } from "../theme";

const INTERESTS = [
  { label: "Food & Drink", emoji: "🍕" },
  { label: "History", emoji: "🏛️" },
  { label: "Art", emoji: "🎨" },
  { label: "Sports", emoji: "⚽" },
  { label: "Nature", emoji: "🌿" },
  { label: "Music", emoji: "🎵" },
  { label: "Architecture", emoji: "🏗️" },
  { label: "Games", emoji: "🎮" },
  { label: "Shopping", emoji: "🛍️" },
  { label: "Birds", emoji: "🦅" },
];
const TONES = [
  { label: "Educational", emoji: "📚" },
  { label: "Silly & Fun", emoji: "😂" },
  { label: "Competitive", emoji: "🏆" },
  { label: "Relaxed", emoji: "😌" },
  { label: "Exercise-Focused", emoji: "🏃" },
];
const MOBILITY = [
  { label: "Walking only", emoji: "🚶" },
  { label: "Can take transit", emoji: "🚌" },
  { label: "Wheelchair accessible", emoji: "♿" },
  { label: "Mix of walking & driving", emoji: "🚗" },
];

export default function GroupProfileScreen() {
  const [city, setCity] = useState("");
  const [ages, setAges] = useState("30");
  const [groupSize, setGroupSize] = useState("4");
  const [interests, setInterests] = useState<string[]>([]);
  const [tone, setTone] = useState("");
  const [mobility, setMobility] = useState("");

  const toggleInterest = (label: string) => {
    setInterests((prev) =>
      prev.includes(label) ? prev.filter((i) => i !== label) : [...prev, label],
    );
  };

  const handleGenerate = () => {
    if (!city.trim())
      return Alert.alert("Missing info", "Please enter a city name");
    if (interests.length === 0)
      return Alert.alert("Missing info", "Please select at least one interest");
    if (!tone) return Alert.alert("Missing info", "Please select a vibe");
    if (!mobility)
      return Alert.alert("Missing info", "Please select a mobility option");
    router.push({
      pathname: "/generating",
      params: {
        city: city.trim(),
        groupProfile: JSON.stringify({
          ages: parseInt(ages) || 30,
          groupSize: parseInt(groupSize) || 4,
          interests,
          tone,
          mobility,
        }),
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
        <Text style={styles.pageTitle}>Build Your Hunt</Text>
        <Text style={styles.pageSubtitle}>
          Tell us about your group and we'll do the rest
        </Text>

        <Card style={styles.section}>
          <SectionHeader emoji="📍" title="Where are you?" />
          <TextInput
            style={styles.input}
            value={city}
            onChangeText={setCity}
            placeholder="e.g. Seattle, WA"
            placeholderTextColor={COLORS.midGray}
          />
        </Card>

        <Card style={styles.section}>
          <SectionHeader emoji="👥" title="About your group" />
          <View style={styles.row}>
            <View style={styles.halfField}>
              <Text style={styles.fieldLabel}>Average age</Text>
              <TextInput
                style={[styles.input, styles.smallInput]}
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
                style={[styles.input, styles.smallInput]}
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

        <Card style={styles.section}>
          <SectionHeader emoji="❤️" title="What do you love?" />
          <Text style={styles.hint}>Pick everything that fits</Text>
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

        <Card style={styles.section}>
          <SectionHeader emoji="🎭" title="What vibe?" />
          {TONES.map(({ label, emoji }) => (
            <TouchableOpacity
              key={label}
              style={[
                styles.optionRow,
                tone === label && styles.optionSelected,
              ]}
              onPress={() => setTone(label)}
            >
              <Text style={styles.optionEmoji}>{emoji}</Text>
              <Text
                style={[
                  styles.optionText,
                  tone === label && styles.optionTextSelected,
                ]}
              >
                {label}
              </Text>
              {tone === label && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
          ))}
        </Card>

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

        <Button
          label="Generate My Hunt"
          onPress={handleGenerate}
          variant="accent"
          size="lg"
          emoji="🤖"
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
  smallInput: {},
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
  generateBtn: { marginTop: SPACING.md, marginBottom: 40 },
});

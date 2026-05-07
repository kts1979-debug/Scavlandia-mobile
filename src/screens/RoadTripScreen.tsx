// src/screens/RoadTripScreen.tsx
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, FONTS, RADIUS, SPACING } from "../theme";

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
  { label: "Fun & Silly", emoji: "😄" },
  { label: "Educational", emoji: "🎓" },
  { label: "Competitive", emoji: "🏆" },
  { label: "Relaxed", emoji: "😌" },
  { label: "Adventurous", emoji: "🧗" },
];

const DIFFICULTIES = [
  { label: "Easy", desc: "Simple clues, great for families" },
  { label: "Medium", desc: "Some wordplay and misdirection" },
  { label: "Hard", desc: "Cryptic riddles, lateral thinking" },
];

const STOP_COUNTS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

const TIME_OPTIONS = [
  { label: "30 min", value: 30 },
  { label: "45 min", value: 45 },
  { label: "1 hr", value: 60 },
  { label: "1h 15m", value: 75 },
  { label: "1h 30m", value: 90 },
  { label: "1h 45m", value: 105 },
  { label: "2 hrs", value: 120 },
  { label: "2h 15m", value: 135 },
  { label: "2h 30m", value: 150 },
  { label: "2h 45m", value: 165 },
  { label: "3 hrs", value: 180 },
];

export default function RoadTripScreen() {
  const [startLocation, setStartLocation] = useState("");
  const [endLocation, setEndLocation] = useState("");
  const [stopCount, setStopCount] = useState(4);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedTone, setSelectedTone] = useState("Fun & Silly");
  const [difficulty, setDifficulty] = useState("Medium");
  const [timeBetweenStops, setTimeBetweenStops] = useState(60);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const toggleInterest = (label: string) => {
    setSelectedInterests((prev) =>
      prev.includes(label) ? prev.filter((i) => i !== label) : [...prev, label],
    );
  };

  const handleUseCurrentLocation = async () => {
    setLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Please allow location access to use your current location.",
        );
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      const geocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (geocode.length > 0) {
        const g = geocode[0];
        const address = [g.streetNumber, g.street, g.city, g.region]
          .filter(Boolean)
          .join(", ");
        setStartLocation(address);
      }
    } catch {
      Alert.alert(
        "Error",
        "Could not get your location. Please enter it manually.",
      );
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleGenerate = () => {
    if (!startLocation.trim()) {
      Alert.alert("Missing start", "Please enter your starting location.");
      return;
    }
    if (!endLocation.trim()) {
      Alert.alert("Missing destination", "Please enter your destination.");
      return;
    }
    if (selectedInterests.length === 0) {
      Alert.alert(
        "Pick some interests",
        "Select at least one interest to personalize your stops.",
      );
      return;
    }

    router.push({
      pathname: "/generating",
      params: {
        city: `${startLocation} to ${endLocation}`,
        groupProfile: JSON.stringify({
          huntType: "road-trip",
          startLocation: startLocation.trim(),
          endLocation: endLocation.trim(),
          stopCount,
          interests: selectedInterests,
          tone: selectedTone,
          difficulty: difficulty.toLowerCase(),
          timeBetweenStops,
          // Required fields for generating screen compatibility
          ages: 30,
          groupSize: 2,
          mobility: "walking",
        }),
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Text style={styles.backBtnText}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>🚗 Road Trip Hunt</Text>
          <Text style={styles.subtitle}>
            {"Enter your route and we'll find amazing stops along the way"}
          </Text>
        </View>

        {/* Start Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 Starting Point</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Seattle, WA or 123 Main St"
            placeholderTextColor={COLORS.midGray}
            value={startLocation}
            onChangeText={setStartLocation}
          />
          <TouchableOpacity
            style={styles.locationBtn}
            onPress={handleUseCurrentLocation}
            disabled={loadingLocation}
          >
            {loadingLocation ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Text style={styles.locationBtnText}>
                📱 Use My Current Location
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* End Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏁 Destination</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Portland, OR or a specific address"
            placeholderTextColor={COLORS.midGray}
            value={endLocation}
            onChangeText={setEndLocation}
          />
        </View>

        {/* Stop count */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚩 Number of Stops</Text>
          <Text style={styles.sectionSubtitle}>
            How many stops along the way?
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.pillRow}
          >
            {STOP_COUNTS.map((count) => (
              <TouchableOpacity
                key={count}
                style={[styles.pill, stopCount === count && styles.pillActive]}
                onPress={() => setStopCount(count)}
              >
                <Text
                  style={[
                    styles.pillText,
                    stopCount === count && styles.pillTextActive,
                  ]}
                >
                  {count}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {/* Tip based on time between stops */}
          <Text style={styles.stopTip}>
            💡 At{" "}
            {timeBetweenStops >= 60
              ? `${timeBetweenStops / 60}hr`
              : `${timeBetweenStops}min`}{" "}
            between stops: {stopCount} stops works best for a ~
            {Math.round((stopCount * timeBetweenStops) / 60)}hr drive
          </Text>
        </View>

        {/* Time Between Stops */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⏱️ Time Between Stops</Text>
          <Text style={styles.sectionSubtitle}>
            Approximate drive time between each stop
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.pillRow}
          >
            {TIME_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.pill,
                  timeBetweenStops === opt.value && styles.pillActive,
                ]}
                onPress={() => setTimeBetweenStops(opt.value)}
              >
                <Text
                  style={[
                    styles.pillText,
                    timeBetweenStops === opt.value && styles.pillTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Interests */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 Interests</Text>
          <Text style={styles.sectionSubtitle}>
            What kind of stops do you want?
          </Text>
          <View style={styles.interestGrid}>
            {INTERESTS.map((interest) => {
              const selected = selectedInterests.includes(interest.label);
              return (
                <TouchableOpacity
                  key={interest.label}
                  style={[
                    styles.interestChip,
                    selected && styles.interestChipActive,
                  ]}
                  onPress={() => toggleInterest(interest.label)}
                >
                  <Text style={styles.interestEmoji}>{interest.emoji}</Text>
                  <Text
                    style={[
                      styles.interestLabel,
                      selected && styles.interestLabelActive,
                    ]}
                  >
                    {interest.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Tone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎭 Vibe</Text>
          <Text style={styles.sectionSubtitle}>
            {"What's the mood of your trip?"}
          </Text>
          <View style={styles.toneGrid}>
            {TONES.map((tone) => (
              <TouchableOpacity
                key={tone.label}
                style={[
                  styles.toneChip,
                  selectedTone === tone.label && styles.toneChipActive,
                ]}
                onPress={() => setSelectedTone(tone.label)}
              >
                <Text style={styles.toneEmoji}>{tone.emoji}</Text>
                <Text
                  style={[
                    styles.toneLabel,
                    selectedTone === tone.label && styles.toneLabelActive,
                  ]}
                >
                  {tone.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Difficulty */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🧩 Clue Difficulty</Text>
          {DIFFICULTIES.map((d) => (
            <TouchableOpacity
              key={d.label}
              style={[
                styles.difficultyCard,
                difficulty === d.label && styles.difficultyCardActive,
              ]}
              onPress={() => setDifficulty(d.label)}
            >
              <View style={styles.difficultyLeft}>
                <Text
                  style={[
                    styles.difficultyLabel,
                    difficulty === d.label && styles.difficultyLabelActive,
                  ]}
                >
                  {d.label}
                </Text>
                <Text style={styles.difficultyDesc}>{d.desc}</Text>
              </View>
              {difficulty === d.label && (
                <Text style={styles.difficultyCheck}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Generate Button */}
        <TouchableOpacity style={styles.generateBtn} onPress={handleGenerate}>
          <Text style={styles.generateBtnText}>🚗 Build My Road Trip Hunt</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.offWhite },
  scroll: { padding: SPACING.md },
  header: { marginBottom: SPACING.lg },
  backBtn: { marginBottom: SPACING.sm },
  backBtnText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.primary,
    fontWeight: FONTS.weights.bold,
  },
  title: {
    fontSize: FONTS.sizes.hero,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.darkGray,
    lineHeight: 22,
  },
  section: { marginBottom: SPACING.lg },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.primary,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.lightGray,
    padding: SPACING.md,
    fontSize: FONTS.sizes.md,
    color: COLORS.black,
    marginBottom: SPACING.sm,
  },
  locationBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    alignItems: "center",
  },
  locationBtnText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
  },
  pillRow: { flexDirection: "row" },
  pill: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.round,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    borderWidth: 1.5,
    borderColor: COLORS.lightGray,
  },
  pillActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  pillText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
    fontWeight: FONTS.weights.medium,
  },
  pillTextActive: { color: COLORS.white },
  interestGrid: { flexDirection: "row", flexWrap: "wrap", gap: SPACING.sm },
  interestChip: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderWidth: 1.5,
    borderColor: COLORS.lightGray,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  interestChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  interestEmoji: { fontSize: 16 },
  interestLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
    fontWeight: FONTS.weights.medium,
  },
  interestLabelActive: { color: COLORS.white },
  toneGrid: { flexDirection: "row", flexWrap: "wrap", gap: SPACING.sm },
  toneChip: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1.5,
    borderColor: COLORS.lightGray,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minWidth: "45%",
  },
  toneChipActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  toneEmoji: { fontSize: 20 },
  toneLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
    fontWeight: FONTS.weights.medium,
  },
  toneLabelActive: { color: COLORS.white },
  difficultyCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1.5,
    borderColor: COLORS.lightGray,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  difficultyCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: "#EBF5FB",
  },
  difficultyLeft: { flex: 1 },
  difficultyLabel: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.black,
    marginBottom: 2,
  },
  difficultyLabelActive: { color: COLORS.primary },
  difficultyDesc: { fontSize: FONTS.sizes.xs, color: COLORS.darkGray },
  difficultyCheck: {
    fontSize: FONTS.sizes.xl,
    color: COLORS.primary,
    fontWeight: FONTS.weights.heavy,
  },
  generateBtn: {
    backgroundColor: "#27AE60",
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: "center",
    marginTop: SPACING.md,
  },
  generateBtnText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.heavy,
  },
  stopTip: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.darkGray,
    marginTop: SPACING.sm,
    fontStyle: "italic",
  },
});

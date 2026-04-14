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

const INTERESTS = [
  "Food & Drink",
  "History",
  "Art",
  "Sports",
  "Nature",
  "Music",
  "Architecture",
  "Games",
  "Shopping",
  "Birds",
];
const TONES = [
  "Educational",
  "Silly & Fun",
  "Competitive",
  "Relaxed",
  "Exercise-Focused",
];
const MOBILITY = [
  "Walking only",
  "Can take transit",
  "Wheelchair accessible needed",
  "Mix of walking & driving",
];

export default function GroupProfileScreen() {
  const [city, setCity] = useState("");
  const [ages, setAges] = useState("30");
  const [groupSize, setGroupSize] = useState("4");
  const [interests, setInterests] = useState<string[]>([]);
  const [tone, setTone] = useState("");
  const [mobility, setMobility] = useState("");

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest],
    );
  };

  const handleGenerate = () => {
    // Validate city
    if (!city.trim())
      return Alert.alert("Missing info", "Please enter a city name");
    if (city.trim().length < 2)
      return Alert.alert("Invalid city", "Please enter a valid city name");

    // Validate ages
    const parsedAge = parseInt(ages);
    if (isNaN(parsedAge) || parsedAge < 1 || parsedAge > 100)
      return Alert.alert(
        "Invalid age",
        "Please enter an age between 1 and 100",
      );

    // Validate group size
    const parsedSize = parseInt(groupSize);
    if (isNaN(parsedSize) || parsedSize < 1 || parsedSize > 100)
      return Alert.alert(
        "Invalid group size",
        "Please enter a group size between 1 and 100",
      );

    // Validate interests, tone, mobility
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
          ages: parsedAge,
          groupSize: parsedSize,
          interests,
          tone,
          mobility,
        }),
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Tell us about your group</Text>
        <Text style={styles.subtitle}>
          The more you share, the better your hunt
        </Text>

        <View style={styles.section}>
          <Text style={styles.label}>📍 What city are you in?</Text>
          <TextInput
            style={styles.input}
            value={city}
            onChangeText={setCity}
            placeholder="e.g. Seattle, WA"
            placeholderTextColor="#BDC3C7"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>🎂 Average age of your group</Text>
          <TextInput
            style={[styles.input, styles.smallInput]}
            value={ages}
            onChangeText={setAges}
            keyboardType="numeric"
            maxLength={2}
            placeholder="30"
            placeholderTextColor="#BDC3C7"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>👥 How many people?</Text>
          <TextInput
            style={[styles.input, styles.smallInput]}
            value={groupSize}
            onChangeText={setGroupSize}
            keyboardType="numeric"
            maxLength={2}
            placeholder="4"
            placeholderTextColor="#BDC3C7"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>
            ❤️ What does your group love? (pick all that apply)
          </Text>
          <View style={styles.chipContainer}>
            {INTERESTS.map((interest) => (
              <TouchableOpacity
                key={interest}
                style={[
                  styles.chip,
                  interests.includes(interest) && styles.chipSelected,
                ]}
                onPress={() => toggleInterest(interest)}
              >
                <Text
                  style={[
                    styles.chipText,
                    interests.includes(interest) && styles.chipTextSelected,
                  ]}
                >
                  {interest}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>🎭 What vibe are you going for?</Text>
          {TONES.map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.optionRow, tone === t && styles.optionSelected]}
              onPress={() => setTone(t)}
            >
              <Text
                style={[
                  styles.optionText,
                  tone === t && styles.optionTextSelected,
                ]}
              >
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>♿ Any mobility considerations?</Text>
          {MOBILITY.map((m) => (
            <TouchableOpacity
              key={m}
              style={[
                styles.optionRow,
                mobility === m && styles.optionSelected,
              ]}
              onPress={() => setMobility(m)}
            >
              <Text
                style={[
                  styles.optionText,
                  mobility === m && styles.optionTextSelected,
                ]}
              >
                {m}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.generateButton}
          onPress={handleGenerate}
        >
          <Text style={styles.generateButtonText}>🤖 Generate My Hunt</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  scroll: { padding: 20 },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1A5276",
    marginBottom: 6,
  },
  subtitle: { fontSize: 15, color: "#5D6D7E", marginBottom: 24 },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A5276",
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D5D8DC",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#2C3E50",
  },
  smallInput: { width: 100 },
  chipContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#D5D8DC",
    backgroundColor: "#F8F9FA",
  },
  chipSelected: { backgroundColor: "#1A5276", borderColor: "#1A5276" },
  chipText: { fontSize: 14, color: "#5D6D7E" },
  chipTextSelected: { color: "#FFFFFF", fontWeight: "600" },
  optionRow: {
    padding: 14,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#D5D8DC",
    marginBottom: 8,
  },
  optionSelected: { backgroundColor: "#1A5276", borderColor: "#1A5276" },
  optionText: { fontSize: 15, color: "#2C3E50" },
  optionTextSelected: { color: "#FFFFFF", fontWeight: "600" },
  generateButton: {
    backgroundColor: "#2E86C1",
    borderRadius: 14,
    padding: 18,
    alignItems: "center",
    marginVertical: 20,
  },
  generateButtonText: { color: "#FFFFFF", fontSize: 18, fontWeight: "bold" },
});

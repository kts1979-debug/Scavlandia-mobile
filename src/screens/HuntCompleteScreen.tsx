import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function HuntCompleteScreen() {
  const params = useLocalSearchParams();
  const hunt = JSON.parse(params.hunt as string);
  const totalPoints = parseInt(params.totalPoints as string);
  const completedStops = parseInt(params.completedStops as string);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.emoji}>🏆</Text>
        <Text style={styles.title}>Hunt Complete!</Text>
        <Text style={styles.huntName}>{hunt.huntTitle}</Text>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{totalPoints}</Text>
            <Text style={styles.statLabel}>Points</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{completedStops}</Text>
            <Text style={styles.statLabel}>Stops</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{hunt.city?.split(",")[0]}</Text>
            <Text style={styles.statLabel}>City</Text>
          </View>
        </View>

        <Text style={styles.message}>
          Amazing job! You explored the city and completed all your stops.
        </Text>

        <TouchableOpacity
          style={styles.newHuntButton}
          onPress={() => router.replace("/(tabs)")}
        >
          <Text style={styles.newHuntText}>🗺️ Start Another Hunt</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1A5276" },
  scroll: { padding: 30, alignItems: "center" },
  emoji: { fontSize: 72, marginTop: 40, marginBottom: 16 },
  title: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  huntName: {
    fontSize: 16,
    color: "#AED6F1",
    textAlign: "center",
    marginBottom: 32,
  },
  statsRow: { flexDirection: "row", gap: 24, marginBottom: 32 },
  stat: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: 20,
    minWidth: 80,
  },
  statValue: { fontSize: 26, fontWeight: "bold", color: "#F39C12" },
  statLabel: { fontSize: 13, color: "#AED6F1", marginTop: 4 },
  message: {
    fontSize: 16,
    color: "#AED6F1",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 40,
  },
  newHuntButton: {
    backgroundColor: "#F39C12",
    borderRadius: 14,
    padding: 18,
    alignItems: "center",
    width: "100%",
  },
  newHuntText: { color: "#FFFFFF", fontSize: 17, fontWeight: "bold" },
});

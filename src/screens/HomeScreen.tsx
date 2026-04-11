import { router } from "expo-router";
import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../context/AuthContext";

export default function HomeScreen() {
  const { user } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.appName}>Daytripper</Text>
          {user ? (
            <Text style={styles.greeting}>
              Welcome back, {user.displayName || "Explorer"}! 👋
            </Text>
          ) : (
            <Text style={styles.tagline}>AI-powered city adventures</Text>
          )}
        </View>

        <View style={styles.heroCard}>
          <Text style={styles.heroEmoji}>🗺️</Text>
          <Text style={styles.heroTitle}>Ready for an adventure?</Text>
          <Text style={styles.heroText}>
            Tell us about your group and we'll build a personalized scavenger
            hunt in any city — powered by AI.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How it works</Text>
          {[
            { icon: "👥", text: "Tell us about your group" },
            { icon: "📍", text: "Pick your city" },
            { icon: "🤖", text: "AI builds your custom hunt" },
            { icon: "🏆", text: "Explore, complete stops, earn points" },
          ].map((step, i) => (
            <View key={i} style={styles.stepRow}>
              <Text style={styles.stepIcon}>{step.icon}</Text>
              <Text style={styles.stepText}>{step.text}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.startButton}
          onPress={() => router.push("/group-profile")}
        >
          <Text style={styles.startButtonText}>🚀 Start a Hunt</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  scroll: { padding: 20 },
  header: { alignItems: "center", paddingVertical: 30 },
  appName: { fontSize: 36, fontWeight: "bold", color: "#1A5276" },
  tagline: { fontSize: 16, color: "#5D6D7E", marginTop: 4 },
  heroCard: {
    backgroundColor: "#1A5276",
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    alignItems: "center",
  },
  greeting: { fontSize: 15, color: "#2E86C1", marginTop: 4, fontWeight: "500" },
  heroEmoji: { fontSize: 48, marginBottom: 12 },
  heroTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
    textAlign: "center",
  },
  heroText: {
    fontSize: 15,
    color: "#AED6F1",
    textAlign: "center",
    lineHeight: 22,
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A5276",
    marginBottom: 16,
  },
  stepRow: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  stepIcon: { fontSize: 24, marginRight: 12 },
  stepText: { fontSize: 15, color: "#5D6D7E", flex: 1 },
  startButton: {
    backgroundColor: "#2E86C1",
    borderRadius: 14,
    padding: 18,
    alignItems: "center",
    marginBottom: 30,
  },
  startButtonText: { color: "#FFFFFF", fontSize: 18, fontWeight: "bold" },
});

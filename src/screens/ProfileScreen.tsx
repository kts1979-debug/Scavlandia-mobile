import React from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>👤</Text>
        <Text style={styles.title}>Your Profile</Text>
        <Text style={styles.subtitle}>
          Sign in to save hunts and track your points.
        </Text>
        <Text style={styles.note}>Authentication is added in Phase 6.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emoji: { fontSize: 60, marginBottom: 16 },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1A5276",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#5D6D7E",
    textAlign: "center",
    marginBottom: 12,
  },
  note: { fontSize: 14, color: "#95A5A6", textAlign: "center" },
});

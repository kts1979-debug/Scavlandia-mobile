import React from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";

export default function HistoryScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>📋</Text>
        <Text style={styles.title}>Past Hunts</Text>
        <Text style={styles.subtitle}>
          Your completed hunts will appear here.
        </Text>
        <Text style={styles.note}>
          Complete your first hunt to see it here!
        </Text>
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

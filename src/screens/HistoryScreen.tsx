// src/screens/HistoryScreen.tsx
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { getUserHunts } from "../services/apiService";

// ── Type for a hunt summary (less data than a full hunt) ──────────
interface HuntSummary {
  huntId: string;
  huntTitle: string;
  city: string;
  stopCount: number;
  totalPoints: number;
  createdAt: any;
}

export default function HistoryScreen() {
  const { user, loading: authLoading } = useAuth();
  const [hunts, setHunts] = useState<HuntSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load hunts when user is confirmed logged in
  const loadHunts = useCallback(async () => {
    if (!user) return;
    try {
      setError(null);
      const data = await getUserHunts();
      setHunts(data.hunts || []);
    } catch (err: any) {
      setError("Could not load your hunts. Pull down to try again.");
      console.error("Error loading hunts:", err.message);
    }
  }, [user]);

  useEffect(() => {
    if (user && !authLoading) {
      setLoading(true);
      loadHunts().finally(() => setLoading(false));
    }
  }, [user, authLoading]);

  // Pull-to-refresh handler
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadHunts();
    setRefreshing(false);
  };

  // Format date from Firestore timestamp
  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Unknown date";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // ── Not logged in ────────────────────────────────────────────
  if (!authLoading && !user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.emoji}>📋</Text>
          <Text style={styles.title}>Your Hunt History</Text>
          <Text style={styles.subtitle}>Sign in to see your past hunts.</Text>
          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Loading ──────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#1A5276" />
          <Text style={styles.loadingText}>Loading your hunts...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Error state ──────────────────────────────────────────────
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.emoji}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadHunts}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Empty state ──────────────────────────────────────────────
  if (hunts.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.emoji}>🗺️</Text>
          <Text style={styles.title}>No hunts yet!</Text>
          <Text style={styles.subtitle}>
            Generate your first hunt from the Home tab.
          </Text>
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => router.push("/(tabs)")}
          >
            <Text style={styles.startButtonText}>Start a Hunt</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Hunt list ────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Your Hunts</Text>
        <Text style={styles.listCount}>{hunts.length} total</Text>
      </View>
      <FlatList
        data={hunts}
        keyExtractor={(item) => item.huntId}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.huntCard}
            onPress={() => {
              // Navigate to a hunt detail view (you can expand this later)
              router.push({
                pathname: "/hunt-detail",
                params: { huntId: item.huntId },
              });
            }}
          >
            <View style={styles.huntCardTop}>
              <Text style={styles.huntCity}>📍 {item.city}</Text>
              <Text style={styles.huntDate}>{formatDate(item.createdAt)}</Text>
            </View>
            <Text style={styles.huntTitle} numberOfLines={2}>
              {item.huntTitle}
            </Text>
            <View style={styles.huntCardBottom}>
              <Text style={styles.huntMeta}>🚩 {item.stopCount} stops</Text>
              <Text style={styles.huntMeta}>
                ⭐ {item.totalPoints} pts possible
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emoji: { fontSize: 60, marginBottom: 16 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1A5276",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#5D6D7E",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  loadingText: { fontSize: 15, color: "#5D6D7E", marginTop: 12 },
  errorText: {
    fontSize: 15,
    color: "#E74C3C",
    textAlign: "center",
    marginBottom: 16,
  },
  signInButton: {
    backgroundColor: "#1A5276",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    width: "100%",
  },
  signInButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
  startButton: {
    backgroundColor: "#2E86C1",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    width: "100%",
  },
  startButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
  retryButton: {
    backgroundColor: "#2E86C1",
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
  },
  retryText: { color: "#FFFFFF", fontSize: 15, fontWeight: "bold" },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E8E8",
  },
  listTitle: { fontSize: 20, fontWeight: "bold", color: "#1A5276" },
  listCount: { fontSize: 14, color: "#5D6D7E" },
  list: { padding: 16, gap: 12 },
  huntCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  huntCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  huntCity: { fontSize: 13, color: "#2E86C1", fontWeight: "600" },
  huntDate: { fontSize: 13, color: "#95A5A6" },
  huntTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 12,
    lineHeight: 22,
  },
  huntCardBottom: { flexDirection: "row", gap: 16 },
  huntMeta: { fontSize: 13, color: "#5D6D7E" },
});

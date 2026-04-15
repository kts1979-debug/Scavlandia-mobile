// src/screens/HistoryScreen.tsx — Playful redesign
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { useAuth } from "../context/AuthContext";
import { getUserHunts } from "../services/apiService";
import { COLORS, FONTS, RADIUS, SHADOW, SPACING } from "../theme";

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

  const loadHunts = useCallback(async () => {
    if (!user) return;
    try {
      setError(null);
      const data = await getUserHunts();
      setHunts(data.hunts || []);
    } catch (err: any) {
      setError("Could not load your hunts. Pull down to try again.");
    }
  }, [user]);

  useEffect(() => {
    if (user && !authLoading) {
      setLoading(true);
      loadHunts().finally(() => setLoading(false));
    }
  }, [user, authLoading]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadHunts();
    setRefreshing(false);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Not logged in
  if (!authLoading && !user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.stateEmoji}>🔐</Text>
          <Text style={styles.stateTitle}>Sign In to See Your Hunts</Text>
          <Text style={styles.stateSubtitle}>
            Your completed adventures will appear here.
          </Text>
          <Button
            label="Sign In"
            onPress={() => router.push("/login")}
            variant="accent"
            size="lg"
            emoji="🚀"
            style={styles.stateBtn}
          />
        </View>
      </SafeAreaView>
    );
  }

  // Loading
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.accent} />
          <Text style={styles.loadingText}>Loading your adventures...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.stateEmoji}>⚠️</Text>
          <Text style={styles.stateTitle}>Something went wrong</Text>
          <Text style={styles.stateSubtitle}>{error}</Text>
          <Button
            label="Try Again"
            onPress={loadHunts}
            variant="accent"
            size="md"
            style={styles.stateBtn}
          />
        </View>
      </SafeAreaView>
    );
  }

  // Empty
  if (hunts.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.stateEmoji}>🗺️</Text>
          <Text style={styles.stateTitle}>No adventures yet!</Text>
          <Text style={styles.stateSubtitle}>
            Generate your first hunt and it will show up here.
          </Text>
          <Button
            label="Start a Hunt"
            onPress={() => router.push("/(tabs)")}
            variant="accent"
            size="lg"
            emoji="🚀"
            style={styles.stateBtn}
          />
        </View>
      </SafeAreaView>
    );
  }

  // Hunt list
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Your Adventures</Text>
          <Text style={styles.headerSub}>
            {hunts.length} hunt{hunts.length !== 1 ? "s" : ""} completed
          </Text>
        </View>
        <Badge label="History" emoji="📋" color={COLORS.accent} />
      </View>

      <FlatList
        data={hunts}
        keyExtractor={(item) => item.huntId}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.accent}
          />
        }
        renderItem={({ item, index }) => (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() =>
              router.push({
                pathname: "/hunt-detail",
                params: { huntId: item.huntId },
              })
            }
          >
            <Card style={styles.huntCard}>
              {/* Top row */}
              <View style={styles.cardTop}>
                <Badge
                  label={item.city?.split(",")[0] || item.city}
                  emoji="📍"
                  color={COLORS.accentPale}
                  textColor={COLORS.accent}
                />
                <Text style={styles.cardDate}>
                  {formatDate(item.createdAt)}
                </Text>
              </View>

              {/* Hunt title */}
              <Text style={styles.cardTitle} numberOfLines={2}>
                {item.huntTitle}
              </Text>

              {/* Bottom stats */}
              <View style={styles.cardBottom}>
                <View style={styles.statPill}>
                  <Text style={styles.statPillText}>
                    🚩 {item.stopCount} stops
                  </Text>
                </View>
                <View style={styles.statPill}>
                  <Text style={styles.statPillText}>
                    ⭐ {item.totalPoints} pts
                  </Text>
                </View>
                <Text style={styles.cardArrow}>›</Text>
              </View>
            </Card>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.offWhite },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.xl,
  },
  stateEmoji: { fontSize: 64, marginBottom: SPACING.md },
  stateTitle: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.primary,
    textAlign: "center",
    marginBottom: SPACING.sm,
  },
  stateSubtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.darkGray,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  stateBtn: { width: "100%" },
  loadingText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.darkGray,
    marginTop: SPACING.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    backgroundColor: COLORS.white,
  },
  headerTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.primary,
  },
  headerSub: { fontSize: FONTS.sizes.sm, color: COLORS.darkGray, marginTop: 2 },
  list: { padding: SPACING.md, gap: SPACING.sm, paddingBottom: 40 },
  huntCard: { ...SHADOW.sm },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  cardDate: { fontSize: FONTS.sizes.xs, color: COLORS.midGray },
  cardTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.black,
    marginBottom: SPACING.sm,
    lineHeight: 24,
  },
  cardBottom: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
  statPill: {
    backgroundColor: COLORS.lightGray,
    borderRadius: RADIUS.round,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statPillText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.darkGray,
    fontWeight: FONTS.weights.medium,
  },
  cardArrow: {
    marginLeft: "auto",
    fontSize: FONTS.sizes.xxl,
    color: COLORS.midGray,
  },
});

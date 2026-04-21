// src/screens/HuntDetailScreen.tsx
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getHunt } from "../services/apiService";
import { COLORS, FONTS, RADIUS, SHADOW, SPACING } from "../theme";

export default function HuntDetailScreen() {
  const { huntId } = useLocalSearchParams();
  const [hunt, setHunt] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHunt();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadHunt = async () => {
    try {
      setLoading(true);
      const data = await getHunt(huntId as string);
      setHunt(data);
    } catch {
      setError("Could not load this hunt. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp._seconds
      ? new Date(timestamp._seconds * 1000)
      : new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleDownloadPhoto = async (url: string, locationName: string) => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Please allow photo library access in settings.",
        );
        return;
      }
      await MediaLibrary.saveToLibraryAsync(url);
      Alert.alert(
        "✅ Saved!",
        `Photo of ${locationName} saved to your camera roll.`,
      );
    } catch {
      // Fall back to sharing if save fails
      try {
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(url);
        } else {
          Alert.alert("Error", "Could not save photo. Please try again.");
        }
      } catch {
        Alert.alert("Error", "Could not save or share photo.");
      }
    }
  };

  // ── Loading ────────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.accent} />
          <Text style={styles.loadingText}>Loading your adventure...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Error ──────────────────────────────────────────────────────
  if (error || !hunt) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.errorEmoji}>⚠️</Text>
          <Text style={styles.errorText}>{error || "Hunt not found"}</Text>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Text style={styles.backBtnText}>← Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isMuseumHunt = !!hunt.isMuseumHunt;
  const hasPhotos = hunt.stopPhotos && Object.keys(hunt.stopPhotos).length > 0;

  // ── Main render ────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerBack}
        >
          <Text style={styles.headerBackText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerLabel}>
          {isMuseumHunt ? "🏛️ Museum Hunt" : "🏙️ City Hunt"}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Hunt title card */}
        <View style={styles.titleCard}>
          <Text style={styles.huntTitle}>{hunt.huntTitle}</Text>
          <Text style={styles.huntCity}>📍 {hunt.city}</Text>
          <Text style={styles.huntDate}>{formatDate(hunt.createdAt)}</Text>

          {/* Stats row */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{hunt.stops?.length || 0}</Text>
              <Text style={styles.statLabel}>Stops</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>
                {hunt.totalPossiblePoints || 0}
              </Text>
              <Text style={styles.statLabel}>Points</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>
                {hunt.estimatedDurationMinutes || 0}m
              </Text>
              <Text style={styles.statLabel}>Est. Time</Text>
            </View>
          </View>
        </View>

        {/* Hunt description */}
        {hunt.huntDescription && (
          <View style={styles.descCard}>
            <Text style={styles.descText}>{hunt.huntDescription}</Text>
          </View>
        )}

        {/* Photos note if no photos saved */}
        {!hasPhotos && (
          <View style={styles.noPhotosNote}>
            <Text style={styles.noPhotosText}>
              📷 Photos are saved for hunts completed after the latest update
            </Text>
          </View>
        )}

        {/* Stops list */}
        <Text style={styles.sectionTitle}>
          {isMuseumHunt ? "🎨 Artworks" : "📍 Stops"}
        </Text>

        {hunt.stops?.map((stop: any) => {
          const photoUrl = hunt.stopPhotos?.[String(stop.order)];
          return (
            <View key={stop.order} style={styles.stopCard}>
              {/* Stop header */}
              <View style={styles.stopHeader}>
                <View style={styles.stopBadge}>
                  <Text style={styles.stopBadgeText}>{stop.order}</Text>
                </View>
                <View style={styles.stopHeaderText}>
                  <Text style={styles.stopName}>{stop.locationName}</Text>
                  <Text style={styles.stopAddress} numberOfLines={1}>
                    {stop.address}
                  </Text>
                </View>
                <View style={styles.stopPoints}>
                  <Text style={styles.stopPointsText}>
                    ⭐ {stop.pointValue}
                  </Text>
                </View>
              </View>

              {/* Photo — shown if available */}
              {photoUrl && (
                <View style={styles.photoContainer}>
                  <Image
                    source={{ uri: photoUrl }}
                    style={styles.stopPhoto}
                    resizeMode="cover"
                    onError={() =>
                      console.log("Photo load error for stop", stop.order)
                    }
                  />
                  <TouchableOpacity
                    style={styles.downloadPhotoBtn}
                    onPress={() =>
                      handleDownloadPhoto(photoUrl, stop.locationName)
                    }
                  >
                    <Text style={styles.downloadPhotoBtnText}>
                      ⬇️ Save Photo
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Gallery room for museum hunts */}
              {isMuseumHunt && stop.galleryOrRoom && (
                <View style={styles.galleryRow}>
                  <Text style={styles.galleryText}>
                    🗺️ {stop.galleryOrRoom}
                  </Text>
                </View>
              )}

              {/* Clue */}
              <View style={styles.clueBox}>
                <Text style={styles.clueLabel}>🔍 Clue</Text>
                <Text style={styles.clueText}>{stop.clue}</Text>
              </View>

              {/* Fun fact */}
              {stop.funFact && (
                <View style={styles.factBox}>
                  <Text style={styles.factLabel}>💡 Fun Fact</Text>
                  <Text style={styles.factText}>{stop.funFact}</Text>
                </View>
              )}
            </View>
          );
        })}

        {/* Bottom note — no relaunch */}
        <View style={styles.noRelaunchNote}>
          <Text style={styles.noRelaunchText}>
            🔒 Past hunts are view-only and cannot be relaunched
          </Text>
        </View>

        <TouchableOpacity
          style={styles.startNewBtn}
          onPress={() => router.push("/hunt-type")}
        >
          <Text style={styles.startNewBtnText}>🚀 Start a New Hunt</Text>
        </TouchableOpacity>
      </ScrollView>
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
  loadingText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.darkGray,
    marginTop: SPACING.md,
  },
  errorEmoji: { fontSize: 48, marginBottom: SPACING.md },
  errorText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.darkGray,
    textAlign: "center",
    marginBottom: SPACING.lg,
  },
  backBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  backBtnText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING.md,
    backgroundColor: COLORS.primary,
  },
  headerBack: { padding: SPACING.sm },
  headerBackText: {
    color: COLORS.accent,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
  },
  headerLabel: {
    fontSize: FONTS.sizes.sm,
    color: "#AED6F1",
    fontWeight: FONTS.weights.medium,
  },
  scroll: { padding: SPACING.md, paddingBottom: 60 },
  titleCard: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  huntTitle: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.white,
    marginBottom: 6,
    lineHeight: 30,
  },
  huntCity: { fontSize: FONTS.sizes.md, color: "#AED6F1", marginBottom: 4 },
  huntDate: {
    fontSize: FONTS.sizes.sm,
    color: "rgba(255,255,255,0.5)",
    marginBottom: SPACING.lg,
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  statBox: { flex: 1, alignItems: "center" },
  statValue: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.white,
  },
  statLabel: {
    fontSize: FONTS.sizes.xs,
    color: "rgba(255,255,255,0.6)",
    marginTop: 2,
  },
  statDivider: { width: 1, backgroundColor: "rgba(255,255,255,0.2)" },
  descCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOW.sm,
  },
  descText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.darkGray,
    lineHeight: 22,
    fontStyle: "italic",
  },
  noPhotosNote: {
    backgroundColor: COLORS.lightGray,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
    alignItems: "center",
  },
  noPhotosText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.darkGray,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  stopCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOW.sm,
  },
  stopHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  stopBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.accent,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  stopBadgeText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.heavy,
  },
  stopHeaderText: { flex: 1 },
  stopName: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.black,
    marginBottom: 2,
  },
  stopAddress: { fontSize: FONTS.sizes.xs, color: COLORS.darkGray },
  stopPoints: {
    backgroundColor: COLORS.accentPale,
    borderRadius: RADIUS.round,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  stopPointsText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.accent,
    fontWeight: FONTS.weights.bold,
  },
  photoContainer: {
    marginBottom: SPACING.sm,
    borderRadius: RADIUS.md,
    overflow: "hidden",
  },
  stopPhoto: { width: "100%", height: 200 },
  downloadPhotoBtn: {
    backgroundColor: COLORS.primary,
    padding: SPACING.sm,
    alignItems: "center",
  },
  downloadPhotoBtnText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
  },
  galleryRow: {
    backgroundColor: "#EBF5FB",
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  galleryText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
    fontWeight: FONTS.weights.medium,
  },
  clueBox: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  clueLabel: {
    fontSize: FONTS.sizes.xs,
    color: "#AED6F1",
    fontWeight: FONTS.weights.bold,
    marginBottom: 4,
  },
  clueText: { fontSize: FONTS.sizes.sm, color: COLORS.white, lineHeight: 20 },
  factBox: {
    backgroundColor: COLORS.lgreen,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
  },
  factLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.success,
    fontWeight: FONTS.weights.bold,
    marginBottom: 4,
  },
  factText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
    lineHeight: 20,
  },
  noRelaunchNote: {
    backgroundColor: COLORS.lightGray,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    alignItems: "center",
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  noRelaunchText: { fontSize: FONTS.sizes.xs, color: COLORS.darkGray },
  startNewBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: "center",
    marginBottom: 20,
  },
  startNewBtnText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.heavy,
  },
});

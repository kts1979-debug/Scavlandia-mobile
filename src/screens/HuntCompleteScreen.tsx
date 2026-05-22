// src/screens/HuntCompleteScreen.tsx
import { router, useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../components/ui/Button";
import { COLORS, FONTS, RADIUS, SPACING } from "../theme";
// @ts-ignore
import * as StoreReview from "expo-store-review";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState, useEffect, useRef } from "react";
import * as ImagePicker from "expo-image-picker";
import { completeHunt } from "../services/apiService";
import { uploadHuntPhoto } from "../services/storageService";

const HERO_IMAGES = [
  require("../../assets/images/hunt_bg_4_friends_mountains.jpg"),
  require("../../assets/images/hunt_bg_8_friends_overlook.jpg"),
  require("../../assets/images/hunt_bg_3_friends_nyc.jpg"),
  require("../../assets/images/hunt_bg_1_cliff_city.jpg"),
];

function getHeroImage(huntId: string) {
  let hash = 0;
  for (let i = 0; i < huntId.length; i++) {
    hash = (hash + huntId.charCodeAt(i)) % HERO_IMAGES.length;
  }
  return HERO_IMAGES[hash];
}

function getStarRating(hintsUsed: number, answerRevealed: boolean): number {
  if (answerRevealed) return 1;
  if (hintsUsed === 0) return 3;
  if (hintsUsed <= 2) return 2;
  return 1;
}

function StarRating({ stars }: { stars: number }) {
  const labels = ["", "You got there!", "Nice work!", "Flawless! 🎉"];
  const subs = [
    "",
    "Keep practicing — you'll nail it next time",
    "Used a couple hints along the way",
    "Solved every clue without any hints!",
  ];
  return (
    <View style={starStyles.container}>
      <View style={starStyles.starsRow}>
        {[1, 2, 3].map((i) => (
          <Text
            key={i}
            style={[starStyles.star, i <= stars && starStyles.starFilled]}
          >
            ★
          </Text>
        ))}
      </View>
      <Text style={starStyles.label}>{labels[stars]}</Text>
      <Text style={starStyles.sub}>{subs[stars]}</Text>
    </View>
  );
}

export default function HuntCompleteScreen() {
  const params = useLocalSearchParams();
  const hunt = JSON.parse(params.hunt as string);
  const totalPoints = parseInt(params.totalPoints as string);
  const completedStops = parseInt(params.completedStops as string);
  const sessionCode = (params.sessionCode as string) || "";
  const stopPhotos = (params.stopPhotos as string) || "{}";
  const hintsUsed = parseInt((params.hintsUsed as string) || "0");
  const answerRevealed = params.answerRevealed === "true";
  const teamName = (params.teamName as string) || "";
  const teamAvatar = (params.teamAvatar as string) || "";
  const skippedStops: number[] = params.skippedStops
    ? JSON.parse(params.skippedStops as string)
    : [];

  const [showSkippedPrompt, setShowSkippedPrompt] = useState(
    skippedStops.length > 0,
  );
  const [finalPhoto, setFinalPhoto] = useState<string | null>(null);
  const [huntEnded, setHuntEnded] = useState(false);
  const [ending, setEnding] = useState(false);
  const hasCompleted = useRef(false);

  useEffect(() => {
    const maybeRequestReview = async () => {
      try {
        const reviewedKey = "scavlandia_review_completed";
        const countKey = "scavlandia_hunts_since_review";

        // If user already reviewed, stop entirely
        const alreadyReviewed = await AsyncStorage.getItem(reviewedKey);
        if (alreadyReviewed) return;

        // Increment hunt count
        const countStr = await AsyncStorage.getItem(countKey);
        const count = countStr ? parseInt(countStr) : 0;
        const newCount = count + 1;
        await AsyncStorage.setItem(countKey, String(newCount));

        // Show review prompt every 2 hunts until reviewed
        if (newCount % 2 !== 0) return;

        const isAvailable = await StoreReview.isAvailableAsync();
        if (!isAvailable) return;

        setTimeout(async () => {
          await StoreReview.requestReview();
        }, 2000);
      } catch {
        // Non-critical, ignore
      }
    };
    maybeRequestReview();
  }, []);

  const stars = getStarRating(hintsUsed, answerRevealed);
  const heroImage = getHeroImage(hunt.huntId || hunt.huntTitle || "default");
  const percentage = Math.round(
    (totalPoints / (hunt.totalPossiblePoints || 1)) * 100,
  );

  const handleShare = async () => {
    try {
      const cityName = hunt.city?.split(",")[0] || hunt.city;
      const scoreEmoji =
        percentage >= 80 ? "🏆" : percentage >= 60 ? "⭐" : "🎯";
      const diffMap = { easy: "🟢", medium: "🟡", hard: "🔴" } as Record<
        string,
        string
      >;
      const diffEmoji =
        diffMap[hunt.groupProfile?.difficulty || "medium"] || "🟡";
      const starStr = sessionCode
        ? ""
        : `${"★".repeat(stars)}${"☆".repeat(3 - stars)} ${stars}/3 stars\n`;
      await Share.share({
        message:
          `${scoreEmoji} Just crushed a Scavlandia scavenger hunt in ${cityName}!\n\n` +
          `🚩 ${completedStops} stops completed\n` +
          `⭐ ${totalPoints} points earned\n` +
          `💯 ${percentage}% score\n` +
          `${starStr}` +
          `${diffEmoji} ${hunt.groupProfile?.difficulty || "Medium"} difficulty\n\n` +
          `Think you can beat my score? Try Scavlandia! 🗺️`,
        title: `Scavlandia Hunt — ${cityName}`,
      });
    } catch (error) {
      console.log("Share cancelled:", error);
    }
  };

  const handleReturnToSkippedStop = () => {
    const firstSkippedOrder = skippedStops[0];
    const skippedStopIndex = hunt.stops.findIndex(
      (s: any) => s.order === firstSkippedOrder,
    );
    const completedIndices: number[] = params.completedIndices
      ? JSON.parse(params.completedIndices as string)
      : [];
    router.replace({
      pathname: "/active-hunt",
      params: {
        hunt: params.hunt,
        sessionCode,
        stopPhotos,
        resumeAtStop: String(skippedStopIndex + 1),
        totalPoints: String(totalPoints),
        skippedStops: JSON.stringify(skippedStops),
        completedIndices: JSON.stringify(completedIndices),
      },
    });
  };

  const handlePickFinalPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please allow photo library access.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setFinalPhoto(result.assets[0].uri);
    }
  };

  const handleTakeFinalPhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please allow camera access.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setFinalPhoto(result.assets[0].uri);
    }
  };

  const handleEndHunt = async () => {
    if (hasCompleted.current) return;
    hasCompleted.current = true;
    setEnding(true);
    try {
      let finalPhotoUrl: string | undefined;

      // Upload final photo if one was taken
      if (finalPhoto) {
        try {
          finalPhotoUrl = await uploadHuntPhoto(finalPhoto, hunt.huntId, 999);
        } catch (uploadErr) {
          console.warn("Final photo upload failed (non-blocking):", uploadErr);
        }
      }

      // Mark hunt complete in backend
      const visitedPlaceIds =
        hunt.stops?.map((s: any) => s.placeId).filter(Boolean) || [];

      await completeHunt(
        hunt.huntId,
        visitedPlaceIds,
        finalPhotoUrl,
        totalPoints,
        completedStops,
      );

      setHuntEnded(true);
    } catch (err) {
      console.warn("End hunt failed (non-blocking):", err);
      setHuntEnded(true); // still proceed even if backend call fails
    } finally {
      setEnding(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Full-screen hero image — was only 320px tall */}
      <Image source={heroImage} style={styles.heroImage} resizeMode="cover" />
      <View style={styles.heroOverlay} />

      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero section */}
          <View style={styles.heroSection}>
            <Text style={styles.trophy}>🏆</Text>
            <Text style={styles.title}>Hunt Complete!</Text>
            <Text style={styles.huntName} numberOfLines={2}>
              {hunt.huntTitle}
            </Text>
            <View style={styles.cityBadge}>
              <Text style={styles.cityBadgeText}>
                📍 {hunt.city?.split(",")[0]}
              </Text>
            </View>
          </View>

          {/* Content card */}
          <View style={styles.contentCard}>
            {/* Stars — solo only */}
            {!sessionCode && <StarRating stars={stars} />}

            {/* Stats */}
            <View style={styles.statsGrid}>
              {[
                { emoji: "⭐", value: String(totalPoints), label: "Points" },
                { emoji: "🚩", value: String(completedStops), label: "Stops" },
                { emoji: "💯", value: `${percentage}%`, label: "Score" },
              ].map((s, i) => (
                <View key={i} style={styles.statCard}>
                  <Text style={styles.statEmoji}>{s.emoji}</Text>
                  <Text style={styles.statValue}>{s.value}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.message}>
              Amazing work! You explored the city, solved every clue, and
              crushed it. 🎉
            </Text>

            {/* Hunt Finale */}
            {hunt.huntFinale && (
              <View style={styles.finaleCard}>
                <Text style={styles.finaleLabel}>🎉 How to End in Style</Text>
                <Text style={styles.finaleText}>{hunt.huntFinale}</Text>
              </View>
            )}

            {/* Final photo + end hunt */}
            {!huntEnded ? (
              <View style={styles.finalPhotoCard}>
                <Text style={styles.finalPhotoTitle}>📸 Final Group Photo</Text>
                <Text style={styles.finalPhotoDesc}>
                  {
                    "Capture your team's victory moment! This will be saved to your hunt album."
                  }
                </Text>
                {finalPhoto && (
                  <Image
                    source={{ uri: finalPhoto }}
                    style={styles.finalPhotoPreview}
                    resizeMode="cover"
                  />
                )}
                <View style={styles.finalPhotoBtns}>
                  <TouchableOpacity
                    style={styles.photoBtn}
                    onPress={handleTakeFinalPhoto}
                  >
                    <Text style={styles.photoBtnText}>📷 Take Photo</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.photoBtn}
                    onPress={handlePickFinalPhoto}
                  >
                    <Text style={styles.photoBtnText}>🖼️ Choose Photo</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={[
                    styles.endHuntBtn,
                    ending && styles.endHuntBtnDisabled,
                  ]}
                  onPress={handleEndHunt}
                  disabled={ending}
                >
                  {ending ? (
                    <ActivityIndicator color={COLORS.white} />
                  ) : (
                    <Text style={styles.endHuntBtnText}>
                      🏁 {finalPhoto ? "Submit Photo & End Hunt" : "End Hunt"}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.huntEndedBadge}>
                <Text style={styles.huntEndedText}>
                  ✅ Hunt Officially Ended!
                </Text>
              </View>
            )}

            {/* Skipped stops */}
            {showSkippedPrompt && (
              <View style={styles.skippedCard}>
                <Text style={styles.skippedCardTitle}>
                  ⏭ You skipped {skippedStops.length} stop
                  {skippedStops.length > 1 ? "s" : ""}
                </Text>
                <Text style={styles.skippedCardDesc}>
                  Would you like to go back and complete{" "}
                  {skippedStops.length > 1 ? "them" : "it"} now?
                </Text>
                <View style={styles.skippedCardBtns}>
                  <TouchableOpacity
                    style={styles.skippedYesBtn}
                    onPress={handleReturnToSkippedStop}
                  >
                    <Text style={styles.skippedYesBtnText}>
                      {"Yes, let's go!"}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.skippedNoBtn}
                    onPress={() => setShowSkippedPrompt(false)}
                  >
                    <Text style={styles.skippedNoBtnText}>No thanks</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <View style={styles.buttonsContainer}>
              <Button
                label="Share Your Results"
                onPress={handleShare}
                variant="accent"
                size="lg"
                emoji="📤"
                style={styles.btn}
              />
              <Button
                label="View Photo Album"
                onPress={() =>
                  router.push({
                    pathname: "/photo-album",
                    params: {
                      hunt: JSON.stringify(hunt),
                      stopPhotos,
                      finalPhotoUrl:
                        finalPhoto || (hunt as any).finalPhotoUrl || "",
                      teamAvatar,
                      teamName,
                    },
                  })
                }
                variant="secondary"
                size="lg"
                emoji="📸"
                style={styles.btn}
              />
              <Button
                label="Start Another Hunt"
                onPress={() => router.replace("/(tabs)")}
                variant="secondary"
                size="lg"
                emoji="🗺️"
                style={styles.btn}
              />
              {sessionCode ? (
                <Button
                  label="View Final Leaderboard"
                  onPress={() =>
                    router.push({
                      pathname: "/final-leaderboard",
                      params: { sessionCode, myPoints: String(totalPoints) },
                    })
                  }
                  variant="primary"
                  size="lg"
                  emoji="🏆"
                  style={styles.btn}
                />
              ) : null}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const starStyles = StyleSheet.create({
  // In starStyles:
  container: {
    alignItems: "center",
    marginBottom: SPACING.lg,
    paddingBottom: SPACING.lg,
    padding: SPACING.lg,
    backgroundColor: "rgba(232, 248, 247, 0.75)",
    borderRadius: RADIUS.lg,
    borderBottomWidth: 0, // ← remove the divider line, card bg handles separation now
  },
  starsRow: { flexDirection: "row", gap: 8, marginBottom: SPACING.sm },
  star: { fontSize: 44, color: COLORS.lightGray },
  starFilled: { color: "#F39C12" },
  label: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.primary,
    marginBottom: 4,
  },
  sub: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
    textAlign: "center",
  },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primary },

  // ← Full screen image, was only 320px tall
  heroImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
  heroOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(25, 50, 85, 0.45)", // ← unified, was 30,60,100
  },

  safeArea: { flex: 1 },
  scroll: { paddingBottom: 100 },

  buttonsContainer: {
    gap: SPACING.sm,
    backgroundColor: "rgba(232, 248, 247, 0.75)",
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginTop: SPACING.sm,
  },

  // ── Hero section ──────────────────────────────────────────────
  heroSection: {
    alignItems: "center",
    paddingVertical: SPACING.xl,
    paddingTop: SPACING.xxl,
    paddingHorizontal: SPACING.lg,
    minHeight: 260,
    justifyContent: "center",
  },
  trophy: { fontSize: 56, marginBottom: SPACING.sm },
  title: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.white,
    textAlign: "center",
    marginBottom: 6,
  },
  huntName: {
    fontSize: FONTS.sizes.md,
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    marginBottom: SPACING.sm,
    lineHeight: 22,
  },
  cityBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: RADIUS.round,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
  },
  cityBadgeText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
  },

  // ── Content card ──────────────────────────────────────────────
  contentCard: {
    backgroundColor: "transparent", // ← was 0.65
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
    minHeight: 500,
  },

  // ── Stats ─────────────────────────────────────────────────────
  statsGrid: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    padding: SPACING.md,
    backgroundColor: "rgba(232, 248, 247, 0.75)", // ← was 0.6
    borderRadius: RADIUS.lg,
  },
  statEmoji: { fontSize: 24, marginBottom: 4 },
  statValue: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.primary,
  },
  statLabel: { fontSize: FONTS.sizes.xs, color: COLORS.darkGray, marginTop: 2 },

  // Change the message style:
  message: {
    fontSize: FONTS.sizes.md,
    color: COLORS.darkGray,
    textAlign: "center",
    marginBottom: SPACING.lg,
    lineHeight: 22,
    backgroundColor: "rgba(232, 248, 247, 0.75)",
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
  },

  // ── Finale card ───────────────────────────────────────────────
  finaleCard: {
    backgroundColor: "rgba(232, 248, 247, 0.75)", // ← was 0.6
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent,
  },
  finaleLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.hint,
    fontWeight: FONTS.weights.bold,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
  },
  finaleText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.darkGray,
    lineHeight: 22,
    fontStyle: "italic",
  },

  // ── Skipped card ──────────────────────────────────────────────
  skippedCard: {
    backgroundColor: "rgba(232, 248, 247, 0.75)",
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  skippedCardTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.primary,
    marginBottom: 4,
  },
  skippedCardDesc: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
    marginBottom: SPACING.md,
  },
  skippedCardBtns: { flexDirection: "row", gap: SPACING.sm },
  skippedYesBtn: {
    flex: 1,
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    alignItems: "center",
  },
  skippedYesBtnText: {
    color: COLORS.white,
    fontWeight: FONTS.weights.bold,
    fontSize: FONTS.sizes.sm,
  },
  skippedNoBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: COLORS.midGray,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    alignItems: "center",
  },
  skippedNoBtnText: { color: COLORS.darkGray, fontSize: FONTS.sizes.sm },
  btn: { marginBottom: SPACING.sm },
  finalPhotoCard: {
    backgroundColor: "rgba(232, 248, 247, 0.75)",
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  finalPhotoTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.primary,
    marginBottom: 4,
  },
  finalPhotoDesc: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  finalPhotoPreview: {
    width: "100%",
    height: 200,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
  },
  finalPhotoBtns: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  photoBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    alignItems: "center",
  },
  photoBtnText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
  },
  endHuntBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: "center",
  },
  endHuntBtnDisabled: { opacity: 0.6 },
  endHuntBtnText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.heavy,
  },
  huntEndedBadge: {
    backgroundColor: "rgba(90, 203, 166, 0.75)",
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: "center",
    marginBottom: SPACING.md,
    borderWidth: 1.5,
    borderColor: COLORS.accent,
  },
  huntEndedText: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.white,
  },
});

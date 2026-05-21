// src/screens/StopCompleteScreen.tsx
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Clipboard,
  ActivityIndicator,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, FONTS, RADIUS, SPACING } from "../theme";
import { generateShareCode } from "../services/apiService";

const STOP_HERO_IMAGES = [
  require("../../assets/images/hunt_bg_9_couple_positano.jpg"),
  require("../../assets/images/hunt_bg_2_couple_cobblestone.jpg"),
  require("../../assets/images/hunt_bg_5_explorer_greece.jpg"),
  require("../../assets/images/hunt_bg_8_friends_overlook.jpg"),
];

function getStopHeroImage(stopOrder: number) {
  return STOP_HERO_IMAGES[(stopOrder - 1) % STOP_HERO_IMAGES.length];
}

export default function StopCompleteScreen() {
  const params = useLocalSearchParams();

  const stopName = params.stopName as string;
  const stopOrder = parseInt(params.stopOrder as string);
  const totalStops = parseInt(params.totalStops as string);
  const pointsEarned = parseInt(params.pointsEarned as string);
  const totalPoints = parseInt(params.totalPoints as string);
  const hunt = params.hunt as string;
  const sessionCode = (params.sessionCode as string) || "";
  const stopPhotos = (params.stopPhotos as string) || "{}";
  const wasSkipped = params.wasSkipped === "true";
  const swapsUsed = (params.swapsUsed as string) || "0";
  const skippedStops: number[] = params.skippedStops
    ? JSON.parse(params.skippedStops as string)
    : [];
  const completedIndices: number[] = params.completedIndices
    ? JSON.parse(params.completedIndices as string)
    : [];

  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [shareCode, setShareCode] = useState<string | null>(null);
  const [generatingCode, setGeneratingCode] = useState(false);

  const huntData = JSON.parse(hunt);
  const huntId = huntData.huntId;
  const heroImage = getStopHeroImage(stopOrder);

  const handleShareHunt = async () => {
    setShareModalVisible(true);
    if (shareCode) return;
    setGeneratingCode(true);
    try {
      const code = await generateShareCode(huntId);
      setShareCode(code);
    } catch {
      Alert.alert("Error", "Could not generate share code. Try again.");
      setShareModalVisible(false);
    } finally {
      setGeneratingCode(false);
    }
  };

  const allStopIndices = huntData.stops.map((_: any, i: number) => i);
  const isHuntComplete = allStopIndices.every(
    (i: number) =>
      completedIndices.includes(i) ||
      skippedStops.includes(huntData.stops[i].order),
  );
  const isLastStop = stopOrder >= totalStops || isHuntComplete;
  const remainingSkipped = skippedStops.filter(
    (order: number) =>
      !completedIndices.some((i: number) => huntData.stops[i]?.order === order),
  );
  const hasMoreSkipped = remainingSkipped.length > 0 && !isHuntComplete;

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(120)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1.15,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleContinue = () => {
    router.replace({
      pathname: "/active-hunt",
      params: {
        hunt,
        sessionCode,
        stopPhotos,
        resumeAtStop: String(stopOrder + 1),
        totalPoints: String(totalPoints),
        skippedStops: JSON.stringify(skippedStops),
        swapsUsed,
        completedIndices: JSON.stringify(completedIndices),
      },
    });
  };

  const handleQuit = () => {
    router.replace({
      pathname: "/hunt-complete",
      params: {
        hunt,
        totalPoints: String(totalPoints),
        completedStops: String(completedIndices.length),
        sessionCode,
        stopPhotos,
        quitEarly: isHuntComplete ? "false" : "true",
        skippedStops: JSON.stringify(skippedStops),
        swapsUsed,
      },
    });
  };

  const handleViewLeaderboard = () => {
    router.replace({
      pathname: "/active-hunt",
      params: {
        hunt,
        sessionCode,
        stopPhotos,
        resumeAtStop: String(stopOrder + 1),
        totalPoints: String(totalPoints),
        skippedStops: JSON.stringify(skippedStops),
        swapsUsed,
        completedIndices: JSON.stringify(completedIndices),
        showLeaderboard: "true",
      },
    });
  };

  return (
    <View style={styles.container}>
      <Image source={heroImage} style={styles.heroImage} resizeMode="cover" />
      <View style={styles.heroOverlay} />

      <SafeAreaView style={styles.safeArea}>
        {/* Hero section with badge */}
        <View style={styles.heroContent}>
          <Animated.View
            style={[
              styles.badgeContainer,
              { transform: [{ scale: scaleAnim }] },
            ]}
          >
            <View style={styles.badge}>
              <Text style={styles.badgeEmoji}>
                {wasSkipped ? "⏭" : isHuntComplete ? "🏆" : "✅"}
              </Text>
            </View>
            <View style={styles.confettiRow}>
              {["🎉", "⭐", "🎊", "✨", "🎉"].map((e, i) => (
                <Text key={i} style={styles.confetti}>
                  {e}
                </Text>
              ))}
            </View>
            <Text style={styles.congrats}>
              {wasSkipped
                ? "Stop Skipped"
                : isHuntComplete
                  ? "Hunt Complete!"
                  : "Stop Complete!"}
            </Text>
            <Text style={styles.stopNameHero} numberOfLines={2}>
              {stopName}
            </Text>
          </Animated.View>
        </View>

        {/* Sliding card */}
        <Animated.View
          style={[
            styles.contentCard,
            { transform: [{ translateY: slideAnim }], opacity: fadeAnim },
          ]}
        >
          {!wasSkipped && (
            <Text style={styles.progress}>
              Stop {stopOrder} of {totalStops} completed
            </Text>
          )}
          {wasSkipped && (
            <Text style={styles.skippedNote}>
              {hasMoreSkipped
                ? `You still have ${remainingSkipped.length} skipped stop${remainingSkipped.length !== 1 ? "s" : ""} to complete`
                : "You can complete this stop at the end of the hunt"}
            </Text>
          )}

          <Animated.View
            style={[styles.pointsCard, { transform: [{ scale: bounceAnim }] }]}
          >
            <View style={styles.pointsRow}>
              <View style={styles.pointsBox}>
                <Text style={styles.pointsValue}>+{pointsEarned}</Text>
                <Text style={styles.pointsLabel}>Points earned</Text>
              </View>
              <View style={styles.pointsDivider} />
              <View style={styles.pointsBox}>
                <Text style={styles.pointsTotal}>{totalPoints}</Text>
                <Text style={styles.pointsLabel}>Total points</Text>
              </View>
            </View>
          </Animated.View>

          {!isLastStop && (
            <View style={styles.nextCard}>
              <Text style={styles.nextLabel}>Up next</Text>
              <Text style={styles.nextText}>
                Stop {stopOrder + 1} of {totalStops} awaits...
              </Text>
            </View>
          )}

          <View style={styles.buttons}>
            {isLastStop ? (
              skippedStops.length > 0 ? (
                <View style={styles.skippedPrompt}>
                  <Text style={styles.skippedPromptTitle}>
                    ⏭ You skipped {skippedStops.length} stop
                    {skippedStops.length > 1 ? "s" : ""}
                  </Text>
                  <Text style={styles.skippedPromptDesc}>
                    Would you like to complete{" "}
                    {skippedStops.length > 1 ? "them" : "it"} before seeing your
                    results?
                  </Text>
                  <TouchableOpacity
                    style={styles.continueBtn}
                    onPress={() => {
                      const firstSkippedOrder = skippedStops[0];
                      const skippedStopIndex = huntData.stops.findIndex(
                        (s: any) => s.order === firstSkippedOrder,
                      );
                      router.replace({
                        pathname: "/active-hunt",
                        params: {
                          hunt,
                          sessionCode,
                          stopPhotos,
                          resumeAtStop: String(skippedStopIndex + 1),
                          totalPoints: String(totalPoints),
                          skippedStops: JSON.stringify(skippedStops),
                          swapsUsed,
                          completedIndices: JSON.stringify(completedIndices),
                        },
                      });
                    }}
                  >
                    <Text style={styles.continueBtnText}>
                      ✅ Complete Skipped Stop
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.quitBtn} onPress={handleQuit}>
                    <Text style={styles.quitBtnText}>
                      Skip — See My Results 🏆
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.continueBtn}
                  onPress={handleQuit}
                >
                  <Text style={styles.continueBtnText}>🏆 See My Results</Text>
                </TouchableOpacity>
              )
            ) : (
              <>
                <TouchableOpacity
                  style={styles.continueBtn}
                  onPress={handleContinue}
                >
                  <Text style={styles.continueBtnText}>Next Stop →</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.linkBtn}
                  onPress={handleShareHunt}
                >
                  <Text style={styles.linkBtnText}>🔗 Share This Hunt</Text>
                </TouchableOpacity>
                {sessionCode ? (
                  <TouchableOpacity
                    style={styles.linkBtn}
                    onPress={handleViewLeaderboard}
                  >
                    <Text style={styles.linkBtnText}>🏆 View Leaderboard</Text>
                  </TouchableOpacity>
                ) : null}
                <TouchableOpacity
                  style={styles.quitBtn}
                  onPress={() => {
                    Alert.alert(
                      "Quit Hunt?",
                      `You've completed ${stopOrder} of ${totalStops} stops and earned ${totalPoints} points.\n\nYour photos and progress will be saved.`,
                      [
                        { text: "Keep Going!", style: "cancel" },
                        {
                          text: "End Hunt",
                          style: "destructive",
                          onPress: handleQuit,
                        },
                      ],
                    );
                  }}
                >
                  <Text style={styles.quitBtnText}>End Hunt Early</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </Animated.View>
      </SafeAreaView>

      {/* Share Hunt Modal */}
      <Modal
        visible={shareModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setShareModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.shareModal}>
            <Text style={styles.shareModalTitle}>🔗 Share This Hunt</Text>
            <Text style={styles.shareModalSubtitle}>
              Give this code to a friend to get their own copy of your hunt.
            </Text>
            {generatingCode ? (
              <ActivityIndicator
                size="large"
                color={COLORS.accent}
                style={{ marginVertical: 24 }}
              />
            ) : (
              <>
                <View style={styles.shareCodeBox}>
                  <Text style={styles.shareCodeText}>{shareCode}</Text>
                </View>
                <TouchableOpacity
                  style={styles.copyBtn}
                  onPress={() => {
                    Clipboard.setString(shareCode || "");
                    Alert.alert("Copied!", "Share code copied to clipboard.");
                  }}
                >
                  <Text style={styles.copyBtnText}>📋 Copy Code</Text>
                </TouchableOpacity>
              </>
            )}
            <Text style={styles.shareModalNote}>
              Each code can only be used once by one person.
            </Text>
            <TouchableOpacity
              style={styles.shareModalClose}
              onPress={() => setShareModalVisible(false)}
            >
              <Text style={styles.shareModalCloseText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primary },
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
    backgroundColor: "rgba(25, 50, 85, 0.45)", // ← unified with HomeScreen
  },
  safeArea: { flex: 1, justifyContent: "space-between" },

  // ── Hero ──────────────────────────────────────────────────────
  heroContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SPACING.xl,
  },
  badgeContainer: { alignItems: "center" },
  badge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.accent,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  badgeEmoji: { fontSize: 48 },
  confettiRow: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  confetti: { fontSize: 20 },
  congrats: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.white,
    textAlign: "center",
    marginBottom: 6,
  },
  stopNameHero: {
    fontSize: FONTS.sizes.md,
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    lineHeight: 22,
  },

  // ── Content card ──────────────────────────────────────────────
  contentCard: {
    backgroundColor: "transparent", // ← was 0.65
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  progress: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
    textAlign: "center",
    marginBottom: SPACING.md,
  },
  skippedNote: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
    textAlign: "center",
    marginBottom: SPACING.md,
    fontStyle: "italic",
  },

  // ── Points card ───────────────────────────────────────────────
  pointsCard: {
    backgroundColor: "rgba(232, 248, 247, 0.75)", // ← was 0.6
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  pointsRow: { flexDirection: "row", alignItems: "center" },
  pointsBox: { flex: 1, alignItems: "center" },
  pointsDivider: { width: 1, height: 40, backgroundColor: COLORS.lightGray },
  pointsValue: {
    fontSize: FONTS.sizes.hero,
    fontWeight: FONTS.weights.heavy,
    color: "#F39C12",
  },
  pointsTotal: {
    fontSize: FONTS.sizes.hero,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.primary,
  },
  pointsLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.darkGray,
    marginTop: 4,
  },

  // ── Next card ─────────────────────────────────────────────────
  nextCard: {
    backgroundColor: "rgba(232, 248, 247, 0.75)", // ← was 0.6
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    alignItems: "center",
  },
  nextLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.accent,
    fontWeight: FONTS.weights.bold,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  nextText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.primary,
    fontWeight: FONTS.weights.medium,
  },

  // ── Buttons ───────────────────────────────────────────────────
  buttons: {
    gap: SPACING.sm,
    backgroundColor: "rgba(232, 248, 247, 0.75)",
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
  },
  continueBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: "center",
  },
  continueBtnText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.heavy,
  },
  linkBtn: { padding: SPACING.sm, alignItems: "center" },
  linkBtnText: {
    color: COLORS.primary,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
  },
  quitBtn: {
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: COLORS.midGray,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  quitBtnText: { color: COLORS.darkGray, fontSize: FONTS.sizes.md },
  skippedPrompt: { gap: SPACING.sm },
  skippedPromptTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.primary,
    textAlign: "center",
  },
  skippedPromptDesc: {
    fontSize: FONTS.sizes.md,
    color: COLORS.darkGray,
    textAlign: "center",
    marginBottom: SPACING.sm,
  },

  // ── Share modal ───────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  shareModal: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: SPACING.xl,
    paddingBottom: 40,
    alignItems: "center",
  },
  shareModalTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  shareModalSubtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  shareCodeBox: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.md,
    width: "100%",
    alignItems: "center",
  },
  shareCodeText: {
    fontSize: 42,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.white,
    letterSpacing: 8,
  },
  copyBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.md,
  },
  copyBtnText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
  },
  shareModalNote: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.midGray,
    textAlign: "center",
    fontStyle: "italic",
    marginBottom: SPACING.lg,
  },
  shareModalClose: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xl,
  },
  shareModalCloseText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.primary,
    fontWeight: FONTS.weights.bold,
  },
});

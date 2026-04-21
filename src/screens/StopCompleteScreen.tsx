// src/screens/StopCompleteScreen.tsx
// Shown after each stop is completed.
// Celebrates the completion and asks if user wants
// to continue to the next stop or quit the hunt.

import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Alert,
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, FONTS, RADIUS, SPACING } from "../theme";

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
  const isLastStop = stopOrder >= totalStops;

  // ── Animations ─────────────────────────────────────────────────
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Sequence: pop in badge → fade in content → bounce points
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
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
      },
    });
  };

  const handleQuit = () => {
    router.replace({
      pathname: "/hunt-complete",
      params: {
        hunt,
        totalPoints: String(totalPoints),
        completedStops: String(stopOrder),
        sessionCode,
        stopPhotos,
        quitEarly: "true",
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Celebration badge */}
        <Animated.View
          style={[styles.badgeContainer, { transform: [{ scale: scaleAnim }] }]}
        >
          <View style={styles.badge}>
            <Text style={styles.badgeEmoji}>{isLastStop ? "🏆" : "✅"}</Text>
          </View>
          <View style={styles.confettiRow}>
            {["🎉", "⭐", "🎊", "✨", "🎉"].map((e, i) => (
              <Text key={i} style={styles.confetti}>
                {e}
              </Text>
            ))}
          </View>
        </Animated.View>

        {/* Main message */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={styles.congrats}>
            {isLastStop ? "Hunt Complete!" : "Stop Complete!"}
          </Text>
          <Text style={styles.stopName} numberOfLines={2}>
            {stopName}
          </Text>
          <Text style={styles.progress}>
            Stop {stopOrder} of {totalStops} completed
          </Text>
        </Animated.View>

        {/* Points earned */}
        <Animated.View
          style={[
            styles.pointsCard,
            { transform: [{ scale: bounceAnim }], opacity: fadeAnim },
          ]}
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

        {/* Next stop teaser */}
        {!isLastStop && (
          <Animated.View style={[styles.nextCard, { opacity: fadeAnim }]}>
            <Text style={styles.nextLabel}>Up next</Text>
            <Text style={styles.nextText}>
              Stop {stopOrder + 1} of {totalStops} awaits...
            </Text>
          </Animated.View>
        )}

        {/* Action buttons */}
        <Animated.View style={[styles.buttons, { opacity: fadeAnim }]}>
          {isLastStop ? (
            // Last stop — only show see results
            <TouchableOpacity style={styles.continueBtn} onPress={handleQuit}>
              <Text style={styles.continueBtnText}>🏆 See My Results</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                style={styles.continueBtn}
                onPress={handleContinue}
              >
                <Text style={styles.continueBtnText}>Next Stop →</Text>
              </TouchableOpacity>

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
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primary },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.xl,
  },
  badgeContainer: { alignItems: "center", marginBottom: SPACING.lg },
  badge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.accent,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  badgeEmoji: { fontSize: 52 },
  confettiRow: { flexDirection: "row", gap: SPACING.sm },
  confetti: { fontSize: 20 },
  congrats: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.white,
    textAlign: "center",
    marginBottom: SPACING.sm,
  },
  stopName: {
    fontSize: FONTS.sizes.lg,
    color: "#AED6F1",
    textAlign: "center",
    marginBottom: SPACING.sm,
    lineHeight: 24,
  },
  progress: {
    fontSize: FONTS.sizes.sm,
    color: "rgba(255,255,255,0.5)",
    textAlign: "center",
    marginBottom: SPACING.xl,
  },
  pointsCard: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    width: "100%",
    marginBottom: SPACING.lg,
  },
  pointsRow: { flexDirection: "row", alignItems: "center" },
  pointsBox: { flex: 1, alignItems: "center" },
  pointsDivider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  pointsValue: {
    fontSize: FONTS.sizes.hero,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.gold,
  },
  pointsTotal: {
    fontSize: FONTS.sizes.hero,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.white,
  },
  pointsLabel: {
    fontSize: FONTS.sizes.xs,
    color: "rgba(255,255,255,0.6)",
    marginTop: 4,
  },
  nextCard: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    width: "100%",
    marginBottom: SPACING.xl,
    alignItems: "center",
  },
  nextLabel: {
    fontSize: FONTS.sizes.xs,
    color: "rgba(255,255,255,0.5)",
    fontWeight: FONTS.weights.bold,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  nextText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.white,
    fontWeight: FONTS.weights.medium,
  },
  buttons: { width: "100%", gap: SPACING.sm },
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
  quitBtn: {
    backgroundColor: "transparent",
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.2)",
  },
  quitBtnText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.medium,
  },
});

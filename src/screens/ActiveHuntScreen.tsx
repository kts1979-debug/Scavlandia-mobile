import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useState } from "react";
import HintsPanel from "../components/HintsPanel";
import HuntTimer from "../components/HuntTimer";
import LiveLeaderboard from "../components/LiveLeaderboard";
import ProgressBar from "../components/ui/ProgressBar";
import { useHuntTimer } from "../hooks/useHuntTimer";
import { Hunt, HuntStop, submitStop } from "../services/apiService";
import {
  updateAllTimeStats,
  updateSessionScore,
} from "../services/leaderboardService";
import { uploadHuntPhoto } from "../services/storageService";
import { COLORS, RADIUS, SPACING } from "../theme";

import {
  Alert,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import HuntMap from "../components/HuntMap";
import { useLocation } from "../hooks/useLocation";

export default function ActiveHuntScreen() {
  // ── Params ─────────────────────────────────────────────────────────
  const params = useLocalSearchParams();
  const hunt: Hunt = JSON.parse(params.hunt as string);
  const sessionCode = (params.sessionCode as string) || "";

  // ── State ──────────────────────────────────────────────────────────
  const [activeStopIndex, setActiveStopIndex] = useState(0);
  const [completedIndices, setCompletedIndices] = useState<number[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [atLocation, setAtLocation] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hintDeductions, setHintDeductions] = useState(0);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // ── Difficulty & timer ─────────────────────────────────────────────
  const difficulty = hunt.groupProfile?.difficulty || "medium";
  const timerMinutes = difficulty === "hard" ? 120 : null; // Only Amazing Race has a timer
  const maxHints = difficulty === "hard" ? 2 : 3; // Amazing Race gets 2, others get 3

  const timer = useHuntTimer(
    timerMinutes ?? 999, // 999 minutes = effectively no timer
    () => {
      // Only show time's up alert for Amazing Race
      if (difficulty === "hard") {
        Alert.alert(
          "⏱ Time's Up!",
          `Your Amazing Race has ended! You completed ${completedIndices.length} of ${hunt.stops.length} stops and earned ${totalPoints} points.`,
          [
            {
              text: "See Results",
              onPress: () =>
                router.replace({
                  pathname: "/hunt-complete",
                  params: {
                    hunt: JSON.stringify(hunt),
                    totalPoints: String(totalPoints),
                    completedStops: String(completedIndices.length),
                    sessionCode,
                  },
                }),
            },
          ],
        );
      }
    },
  );

  const activeStop: HuntStop = hunt.stops[activeStopIndex];

  // ── Location ───────────────────────────────────────────────────────
  const handleArrival = useCallback(() => {
    setAtLocation(true);
    Alert.alert(
      "📍 You made it!",
      `You've arrived at ${activeStop.locationName}! Complete the task to earn ${activeStop.pointValue} points.`,
    );
  }, [activeStop]);

  const { userLocation, distanceToStop } = useLocation(
    activeStop,
    handleArrival,
  );

  // ── Photo ──────────────────────────────────────────────────────────
  const handleTakePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Camera needed",
        "Please allow camera access in your phone settings.",
      );
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality: 0.7,
      allowsEditing: true,
      aspect: [4, 3],
    });
    if (!result.canceled && result.assets[0]) {
      await handleSubmitStop(result.assets[0].uri);
    }
  };

  // ── Submit stop ────────────────────────────────────────────────────
  const handleSubmitStop = async (photoUri: string) => {
    setSubmitting(true);
    try {
      // Upload photo
      console.log("Uploading photo...");
      const photoUrl = await uploadHuntPhoto(
        photoUri,
        hunt.huntId,
        activeStop.order,
      );
      console.log("Photo uploaded, submitting stop...");

      // Save to backend
      await submitStop(
        hunt.huntId,
        activeStop.order,
        photoUrl,
        activeStop.pointValue,
      );

      // Calculate new totals
      const newTotalPoints = totalPoints + activeStop.pointValue;
      const newCompletedList = [...completedIndices, activeStopIndex];

      // Update state
      setCompletedIndices(newCompletedList);
      setTotalPoints(newTotalPoints);

      // Update session leaderboard if in a session
      if (sessionCode) {
        updateSessionScore(
          sessionCode,
          activeStop.pointValue,
          newCompletedList.length,
          hunt.city,
        ).catch((err) =>
          console.warn("Session score update failed:", err.message),
        );
      }

      // Check if hunt is complete
      if (activeStopIndex >= hunt.stops.length - 1) {
        timer.stop();

        // Update all-time stats
        updateAllTimeStats(newTotalPoints, hunt.city, hunt.huntTitle).catch(
          (err) => console.warn("All-time stats update failed:", err.message),
        );

        router.replace({
          pathname: "/hunt-complete",
          params: {
            hunt: JSON.stringify(hunt),
            totalPoints: String(newTotalPoints),
            completedStops: String(newCompletedList.length),
            sessionCode,
          },
        });
        return;
      }

      // Move to next stop
      setActiveStopIndex((i) => i + 1);
      setAtLocation(false);
      setHintDeductions(0);
    } catch (error: any) {
      console.error("Submit stop error:", error.message);
      Alert.alert(
        "Upload Failed",
        "Could not upload your photo. Please check your internet connection and try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ── Manual arrival ─────────────────────────────────────────────────
  const handleManualArrival = () => {
    Alert.alert("Confirm arrival", `Are you at ${activeStop.locationName}?`, [
      { text: "Not yet", style: "cancel" },
      { text: "Yes, I am here!", onPress: () => setAtLocation(true) },
    ]);
  };

  // ── Share ──────────────────────────────────────────────────────────
  const handleShare = async () => {
    try {
      const cityName = hunt.city?.split(",")[0] || hunt.city;
      await Share.share({
        message:
          `🗺️ I'm on a Daytripper scavenger hunt in ${cityName}!\n\n` +
          `✅ Completed ${completedIndices.length} of ${hunt.stops.length} stops\n` +
          `⭐ Earned ${totalPoints} points so far\n\n` +
          `Join me on my next adventure — try Daytripper! 🚀`,
        title: `Daytripper Hunt in ${cityName}`,
      });
    } catch (error) {
      console.log("Share cancelled:", error);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.huntTitle} numberOfLines={1}>
            {hunt.huntTitle}
          </Text>
          <View style={styles.headerRight}>
            <Text style={styles.points}>
              ⭐ {totalPoints - hintDeductions} pts
            </Text>
            {/* Leaderboard toggle — only shown in a session */}
            {sessionCode ? (
              <TouchableOpacity
                style={styles.shareBtn}
                onPress={() => setShowLeaderboard(!showLeaderboard)}
              >
                <Text style={styles.shareBtnText}>🏆</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
              <Text style={styles.shareBtnText}>📤</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Timer section — only shown for Amazing Race difficulty */}
{difficulty === 'hard' && (
  <View style={styles.timerSection}>
    <HuntTimer
      display={timer.display}
      isWarning={timer.isWarning}
      isCritical={timer.isCritical}
      estimatedMinutes={120}
      stopsCompleted={completedIndices.length}
      totalStops={hunt.stops.length}
    />
  </View>
)}

      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <ProgressBar
          current={completedIndices.length}
          total={hunt.stops.length}
          showLabel={true}
        />
      </View>

      {/* Live leaderboard panel */}
      {sessionCode && showLeaderboard && (
        <View style={styles.leaderboardPanel}>
          <LiveLeaderboard sessionCode={sessionCode} />
        </View>
      )}

      {/* Clue / Map toggle */}
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggle, !showMap && styles.toggleActive]}
          onPress={() => setShowMap(false)}
        >
          <Text
            style={[styles.toggleText, !showMap && styles.toggleTextActive]}
          >
            📋 Clue
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggle, showMap && styles.toggleActive]}
          onPress={() => setShowMap(true)}
        >
          <Text style={[styles.toggleText, showMap && styles.toggleTextActive]}>
            🗺️ Map
          </Text>
        </TouchableOpacity>
      </View>

      {/* Map view */}
      {showMap && (
        <View style={styles.mapContainer}>
          <HuntMap
            stops={hunt.stops}
            activeStopIndex={activeStopIndex}
            completedStopIndices={completedIndices}
            userLocation={userLocation}
          />
        </View>
      )}

      {/* Clue view */}
      {!showMap && (
        <ScrollView style={styles.clueContainer}>
          {/* Clue card */}
          <View style={styles.clueCard}>
            <Text style={styles.clueLabel}>🔍 Your Clue</Text>
            <Text style={styles.clueText}>{activeStop.clue}</Text>
          </View>

          {/* Hints */}
          {activeStop.hints && activeStop.hints.length > 0 && (
            <HintsPanel
              hints={activeStop.hints}
              maxHints={maxHints}
              onHintUsed={(cost) => setHintDeductions((prev) => prev + cost)}
            />
          )}

          {/* Distance */}
          {distanceToStop !== null && !atLocation && (
            <View style={styles.distanceCard}>
              <Text style={styles.distanceText}>📡 {distanceToStop}m away</Text>
            </View>
          )}

          {/* Task card — shown after arrival */}
          {atLocation && (
            <View style={styles.taskCard}>
              <Text style={styles.taskLabel}>🎯 Your Task</Text>
              <Text style={styles.taskText}>{activeStop.task}</Text>
              <Text style={styles.funFactLabel}>💡 Fun Fact</Text>
              <Text style={styles.funFactText}>{activeStop.funFact}</Text>
              <TouchableOpacity
                style={styles.photoButton}
                onPress={handleTakePhoto}
                disabled={submitting}
              >
                <Text style={styles.photoButtonText}>
                  {submitting
                    ? "⬆️  Uploading photo..."
                    : "📸  Take Photo to Complete"}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Manual arrival button */}
          {!atLocation && (
            <TouchableOpacity
              style={styles.arrivalButton}
              onPress={handleManualArrival}
            >
              <Text style={styles.arrivalButtonText}>
                {"📍  I'm at this location!"}
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  header: { backgroundColor: COLORS.primary },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  huntTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    flex: 1,
    marginRight: 12,
  },
  headerRight: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
  points: { fontSize: 16, color: "#F39C12", fontWeight: "bold" },
  shareBtn: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: RADIUS.round,
    width: 34,
    height: 34,
    justifyContent: "center",
    alignItems: "center",
  },
  shareBtnText: { fontSize: 16 },
  timerSection: {
    alignItems: "center",
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.white,
  },
  leaderboardPanel: { margin: SPACING.sm },
  toggleRow: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#D5D8DC",
  },
  toggle: { flex: 1, padding: 12, alignItems: "center" },
  toggleActive: { borderBottomWidth: 3, borderBottomColor: "#1A5276" },
  toggleText: { fontSize: 15, color: "#95A5A6" },
  toggleTextActive: { color: "#1A5276", fontWeight: "bold" },
  mapContainer: { flex: 1 },
  clueContainer: { flex: 1, padding: 16 },
  clueCard: {
    backgroundColor: "#1A5276",
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
  },
  clueLabel: {
    fontSize: 13,
    color: "#AED6F1",
    marginBottom: 8,
    fontWeight: "600",
  },
  clueText: { fontSize: 17, color: "#FFFFFF", lineHeight: 26 },
  distanceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    alignItems: "center",
  },
  distanceText: { fontSize: 15, color: "#5D6D7E" },
  taskCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
  },
  taskLabel: {
    fontSize: 13,
    color: "#2E86C1",
    marginBottom: 8,
    fontWeight: "600",
  },
  taskText: {
    fontSize: 16,
    color: "#2C3E50",
    marginBottom: 16,
    lineHeight: 24,
  },
  funFactLabel: {
    fontSize: 13,
    color: "#27AE60",
    marginBottom: 6,
    fontWeight: "600",
  },
  funFactText: {
    fontSize: 14,
    color: "#5D6D7E",
    lineHeight: 22,
    marginBottom: 20,
  },
  photoButton: {
    backgroundColor: "#27AE60",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
  },
  photoButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
  arrivalButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#2E86C1",
    padding: 14,
    alignItems: "center",
    marginBottom: 20,
  },
  arrivalButtonText: { color: "#2E86C1", fontSize: 15, fontWeight: "600" },
});

import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useState } from "react";
import HintsPanel from "../components/HintsPanel";
import HuntTimer from "../components/HuntTimer";
import ProgressBar from "../components/ui/ProgressBar";
import { useHuntTimer } from "../hooks/useHuntTimer";
import { uploadHuntPhoto } from "../services/storageService";
import { COLORS, SPACING } from "../theme";

import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import HuntMap from "../components/HuntMap";
import { useLocation } from "../hooks/useLocation";
import { Hunt, HuntStop, submitStop } from "../services/apiService";

export default function ActiveHuntScreen() {
  const params = useLocalSearchParams();
  const hunt: Hunt = JSON.parse(params.hunt as string);

  const [activeStopIndex, setActiveStopIndex] = useState(0);
  const [completedIndices, setCompletedIndices] = useState<number[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [atLocation, setAtLocation] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hintDeductions, setHintDeductions] = useState(0);

  // Use difficulty-based timer if available, otherwise fall back to Claude's estimate
  // Difficulty settings — used for both timer and hints
  const difficulty = hunt.groupProfile?.difficulty || "medium";
  const diffSettings = { easy: 180, medium: 120, hard: 90 };
  const timerMinutes =
    diffSettings[difficulty as keyof typeof diffSettings] ||
    hunt.estimatedDurationMinutes ||
    120;
  const maxHints =
    { easy: 3, medium: 2, hard: 1 }[difficulty as keyof typeof diffSettings] ??
    2;

  const timer = useHuntTimer(timerMinutes, () => {
    Alert.alert(
      "⏱ Time's Up!",
      `Your hunt has ended. You completed ${completedIndices.length} of ${hunt.stops.length} stops and earned ${totalPoints} points.`,
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
              },
            }),
        },
      ],
    );
  });

  const activeStop: HuntStop = hunt.stops[activeStopIndex];

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
      mediaTypes: ImagePicker.MediaType.Images,
      quality: 0.7,
      allowsEditing: true,
      aspect: [4, 3],
    });
    if (!result.canceled && result.assets[0]) {
      await handleSubmitStop(result.assets[0].uri);
    }
  };

  const handleSubmitStop = async (photoUri: string) => {
    setSubmitting(true);
    try {
      // Step 1: Upload the photo to Firebase Storage
      // This replaces the local file path with a real URL
      console.log("Uploading photo...");
      const photoUrl = await uploadHuntPhoto(
        photoUri,
        hunt.huntId,
        activeStop.order,
      );
      console.log("Photo uploaded, submitting stop...");

      // Step 2: Submit the stop to your backend with the real photo URL
      await submitStop(
        hunt.huntId,
        activeStop.order,
        photoUrl,
        activeStop.pointValue,
      );

      // Step 3: Update local state
      setCompletedIndices((prev) => [...prev, activeStopIndex]);
      setTotalPoints((prev) => prev + activeStop.pointValue);

      // Step 4: Check if the hunt is complete
      if (activeStopIndex >= hunt.stops.length - 1) {
        timer.stop();
        router.replace({
          pathname: "/hunt-complete",
          params: {
            hunt: JSON.stringify(hunt),
            totalPoints: String(totalPoints + activeStop.pointValue),
            completedStops: String(completedIndices.length + 1),
          },
        });
        return;
      }

      // Step 5: Move to the next stop
      setActiveStopIndex((i) => i + 1);
      setAtLocation(false);
      // Reset hints for next stop — hints are per stop not per hunt
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

  const handleManualArrival = () => {
    Alert.alert("Confirm arrival", `Are you at ${activeStop.locationName}?`, [
      { text: "Not yet", style: "cancel" },
      { text: "Yes, I am here!", onPress: () => setAtLocation(true) },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.huntTitle} numberOfLines={1}>
            {hunt.huntTitle}
          </Text>
          <Text style={styles.points}>
            ⭐ {totalPoints - hintDeductions} pts
          </Text>
        </View>

        {/* Timer section */}
        <View style={styles.timerSection}>
          <HuntTimer
            display={timer.display}
            isWarning={timer.isWarning}
            isCritical={timer.isCritical}
            estimatedMinutes={timerMinutes}
            stopsCompleted={completedIndices.length}
            totalStops={hunt.stops.length}
          />
        </View>
      </View>

      <View
        style={{
          paddingHorizontal: 16,
          paddingVertical: 8,
          backgroundColor: COLORS.white,
        }}
      >
        <ProgressBar
          current={completedIndices.length}
          total={hunt.stops.length}
          showLabel={true}
        />
      </View>

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

      {!showMap && (
        <ScrollView style={styles.clueContainer}>
          <View style={styles.clueCard}>
            <Text style={styles.clueLabel}>🔍 Your Clue</Text>
            <Text style={styles.clueText}>{activeStop.clue}</Text>
          </View>

          {/* Hints panel — shown below the clue */}
          {activeStop.hints && activeStop.hints.length > 0 && (
            <HintsPanel
              hints={activeStop.hints}
              maxHints={maxHints}
              onHintUsed={(cost) => setHintDeductions((prev) => prev + cost)}
            />
          )}

          {distanceToStop !== null && !atLocation && (
            <View style={styles.distanceCard}>
              <Text style={styles.distanceText}>📡 {distanceToStop}m away</Text>
            </View>
          )}

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

          {!atLocation && (
            <TouchableOpacity
              style={styles.arrivalButton}
              onPress={handleManualArrival}
            >
              <Text style={styles.arrivalButtonText}>
                📍 I'm at this location
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
  header: {
    backgroundColor: COLORS.primary,
  },
  huntTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    flex: 1,
    marginRight: 12,
  },
  points: { fontSize: 16, color: "#F39C12", fontWeight: "bold" },
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
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  timerSection: {
    alignItems: "center",
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
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

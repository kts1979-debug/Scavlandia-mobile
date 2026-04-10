import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
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
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
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
      await submitStop(
        hunt.huntId,
        activeStop.order,
        photoUri,
        activeStop.pointValue,
      );
      setCompletedIndices((prev) => [...prev, activeStopIndex]);
      setTotalPoints((prev) => prev + activeStop.pointValue);

      if (activeStopIndex >= hunt.stops.length - 1) {
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
      setActiveStopIndex((i) => i + 1);
      setAtLocation(false);
    } catch (error) {
      Alert.alert("Error", "Could not save your progress. Please try again.");
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
      <View style={styles.header}>
        <Text style={styles.huntTitle} numberOfLines={1}>
          {hunt.huntTitle}
        </Text>
        <Text style={styles.points}>⭐ {totalPoints} pts</Text>
      </View>

      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${(completedIndices.length / hunt.stops.length) * 100}%`,
            },
          ]}
        />
      </View>
      <Text style={styles.progressText}>
        Stop {activeStopIndex + 1} of {hunt.stops.length}
      </Text>

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
                  {submitting ? "Saving..." : "📸  Take Photo to Complete"}
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#1A5276",
  },
  huntTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    flex: 1,
    marginRight: 12,
  },
  points: { fontSize: 16, color: "#F39C12", fontWeight: "bold" },
  progressBar: { height: 4, backgroundColor: "#D5D8DC", width: "100%" },
  progressFill: { height: 4, backgroundColor: "#27AE60" },
  progressText: {
    textAlign: "center",
    fontSize: 13,
    color: "#5D6D7E",
    paddingVertical: 6,
  },
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

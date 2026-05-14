// src/screens/AddStopScreen.tsx
// Shown during an active road trip hunt — lets user add an unselected
// candidate stop to their hunt. Shows map with remaining candidates.

import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, {
  Marker,
  Polyline,
  PROVIDER_DEFAULT,
  PROVIDER_GOOGLE,
} from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import { addStopToHunt } from "../services/apiService";
import { COLORS, FONTS, RADIUS, SPACING } from "../theme";

function decodePolyline(
  encoded: string,
): { latitude: number; longitude: number }[] {
  const points: { latitude: number; longitude: number }[] = [];
  let index = 0,
    lat = 0,
    lng = 0;
  while (index < encoded.length) {
    let b: number,
      shift = 0,
      result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;
    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;
    points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
  }
  return points;
}

export default function AddStopScreen() {
  const params = useLocalSearchParams();
  const hunt = JSON.parse(params.hunt as string);
  const completedIndices: number[] = params.completedIndices
    ? JSON.parse(params.completedIndices as string)
    : [];
  const totalPoints = parseInt(params.totalPoints as string) || 0;
  const sessionCode = (params.sessionCode as string) || "";
  const stopPhotos = (params.stopPhotos as string) || "{}";
  const skippedStops = params.skippedStops
    ? JSON.parse(params.skippedStops as string)
    : [];
  const swapsUsed = (params.swapsUsed as string) || "0";

  // Get unselected candidates and polyline from hunt
  const unselectedCandidates: any[] = hunt.unselectedCandidates || [];
  const routePolylineRaw: string = hunt.routePolyline || "";
  const routePolyline = routePolylineRaw
    ? decodePolyline(routePolylineRaw)
    : [];

  const addsUsed = hunt.addsUsed || 0;
  const addsRemaining = 6 - addsUsed;

  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [adding, setAdding] = useState(false);
  const [markerReady] = useState(true);

  // Filter out completed stops and stops already in the hunt
  const existingPlaceIds = new Set(hunt.stops.map((s: any) => s.placeId));
  const completedPlaceIds = new Set(
    completedIndices.map((i: number) => hunt.stops[i]?.placeId).filter(Boolean),
  );

  const availableCandidates = unselectedCandidates.filter(
    (c) =>
      !existingPlaceIds.has(c.placeId) && !completedPlaceIds.has(c.placeId),
  );

  const getMapRegion = () => {
    if (routePolyline.length === 0) {
      if (availableCandidates.length === 0) return undefined;
      return {
        latitude: availableCandidates[0].lat,
        longitude: availableCandidates[0].lng,
        latitudeDelta: 5,
        longitudeDelta: 5,
      };
    }
    const lats = routePolyline.map((p) => p.latitude);
    const lngs = routePolyline.map((p) => p.longitude);
    return {
      latitude: (Math.min(...lats) + Math.max(...lats)) / 2,
      longitude: (Math.min(...lngs) + Math.max(...lngs)) / 2,
      latitudeDelta: (Math.max(...lats) - Math.min(...lats)) * 1.3,
      longitudeDelta: (Math.max(...lngs) - Math.min(...lngs)) * 1.3,
    };
  };

  const handleAddStop = async () => {
    if (!selectedCandidate) return;
    if (addsRemaining <= 0) {
      Alert.alert("Maximum reached", "You can only add 6 stops to a hunt.");
      return;
    }

    setAdding(true);
    try {
      const result = await addStopToHunt(hunt.huntId, selectedCandidate);

      // Update hunt object with new stops
      const updatedHunt = {
        ...hunt,
        stops: result.updatedStops,
        unselectedCandidates: (hunt.unselectedCandidates || []).filter(
          (c: any) => c.placeId !== selectedCandidate.placeId,
        ),
        addsUsed: result.addsUsed,
      };

      Alert.alert(
        "✅ Stop Added!",
        `${selectedCandidate.name} has been added to your hunt in route order.`,
        [
          {
            text: "Continue Hunt",
            onPress: () =>
              router.replace({
                pathname: "/active-hunt",
                params: {
                  hunt: JSON.stringify(updatedHunt),
                  sessionCode,
                  stopPhotos,
                  resumeAtStop: String(completedIndices.length + 1),
                  totalPoints: String(totalPoints),
                  skippedStops: JSON.stringify(skippedStops),
                  swapsUsed,
                  completedIndices: JSON.stringify(completedIndices),
                },
              }),
          },
        ],
      );
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.error || "Could not add stop. Please try again.",
      );
    } finally {
      setAdding(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>➕ Add a Stop</Text>
          <Text style={styles.headerSub}>
            {addsRemaining} add{addsRemaining !== 1 ? "s" : ""} remaining
          </Text>
        </View>
        <View
          style={[styles.badge, addsRemaining === 0 && styles.badgeDisabled]}
        >
          <Text style={styles.badgeText}>{addsRemaining} left</Text>
        </View>
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        {availableCandidates.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🗺️</Text>
            <Text style={styles.emptyTitle}>No stops available</Text>
            <Text style={styles.emptySub}>
              All candidate stops have been added to your hunt already.
            </Text>
          </View>
        ) : routePolyline.length > 0 || availableCandidates.length > 0 ? (
          <MapView
            provider={
              Platform.OS === "android" ? PROVIDER_GOOGLE : PROVIDER_DEFAULT
            }
            style={styles.map}
            initialRegion={getMapRegion()}
            showsUserLocation={false}
          >
            {/* Route polyline */}
            {routePolyline.length > 0 && (
              <Polyline
                coordinates={routePolyline}
                strokeColor={COLORS.primary}
                strokeWidth={3}
                strokeColors={undefined}
              />
            )}

            {/* Existing hunt stops — shown as small grey markers */}
            {hunt.stops.map((stop: any, i: number) => {
              const isCompleted = completedIndices.includes(i);
              return (
                <Marker
                  key={`existing-${stop.placeId || i}`}
                  coordinate={{ latitude: stop.lat, longitude: stop.lng }}
                >
                  <View
                    style={[
                      styles.existingMarker,
                      isCompleted && styles.existingMarkerDone,
                    ]}
                  >
                    <Text style={styles.existingMarkerText}>
                      {isCompleted ? "✓" : String(stop.order)}
                    </Text>
                  </View>
                </Marker>
              );
            })}

            {/* Available candidates — tappable */}
            {markerReady &&
              availableCandidates.map((candidate) => {
                const isSelected =
                  selectedCandidate?.placeId === candidate.placeId;
                return (
                  <Marker
                    key={candidate.placeId}
                    coordinate={{
                      latitude: candidate.lat,
                      longitude: candidate.lng,
                    }}
                    onPress={() =>
                      setSelectedCandidate(isSelected ? null : candidate)
                    }
                  >
                    <View
                      style={[
                        styles.candidateMarker,
                        isSelected && styles.candidateMarkerSelected,
                      ]}
                    >
                      <Text style={styles.candidateMarkerText}>
                        {candidate.emoji}
                      </Text>
                    </View>
                  </Marker>
                );
              })}
          </MapView>
        ) : (
          <View style={styles.mapLoading}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        )}
      </View>

      {/* Bottom panel */}
      <View style={styles.bottomPanel}>
        {selectedCandidate ? (
          <View style={styles.selectedInfo}>
            <View style={styles.selectedInfoLeft}>
              <Text style={styles.selectedEmoji}>
                {selectedCandidate.emoji}
              </Text>
              <View style={styles.selectedText}>
                <Text style={styles.selectedName} numberOfLines={1}>
                  {selectedCandidate.name}
                </Text>
                <Text style={styles.selectedCategory}>
                  {selectedCandidate.category} ·{" "}
                  {selectedCandidate.distanceMiles}mi along route
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => setSelectedCandidate(null)}>
              <Text style={styles.deselect}>✕</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles.hintText}>
            {availableCandidates.length > 0
              ? "Tap a stop on the map to select it"
              : "No more stops available to add"}
          </Text>
        )}

        <TouchableOpacity
          style={[
            styles.addBtn,
            (!selectedCandidate || adding || addsRemaining <= 0) &&
              styles.addBtnDisabled,
          ]}
          onPress={handleAddStop}
          disabled={!selectedCandidate || adding || addsRemaining <= 0}
        >
          {adding ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Text style={styles.addBtnText}>
              {selectedCandidate
                ? `➕ Add ${selectedCandidate.name}`
                : "Select a stop to add"}
            </Text>
          )}
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          A new clue will be generated for the added stop and inserted in route
          order.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.offWhite },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: SPACING.md,
    backgroundColor: COLORS.primary,
  },
  backText: {
    color: COLORS.accent,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
  },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.white,
  },
  headerSub: { fontSize: FONTS.sizes.xs, color: "#AED6F1", marginTop: 2 },
  badge: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.round,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
  },
  badgeDisabled: { backgroundColor: COLORS.midGray },
  badgeText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.bold,
  },
  mapContainer: { flex: 1 },
  map: { flex: 1 },
  mapLoading: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl,
  },
  emptyEmoji: { fontSize: 64, marginBottom: SPACING.md },
  emptyTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  emptySub: {
    fontSize: FONTS.sizes.md,
    color: COLORS.darkGray,
    textAlign: "center",
  },
  existingMarker: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.midGray,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  existingMarkerDone: { backgroundColor: COLORS.success },
  existingMarkerText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: FONTS.weights.heavy,
  },
  candidateMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.lightGray,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  candidateMarkerSelected: {
    borderColor: COLORS.accent,
    borderWidth: 3,
    backgroundColor: "#FFF3E0",
  },
  candidateMarkerText: { fontSize: 20 },
  bottomPanel: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  hintText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
    textAlign: "center",
    marginBottom: SPACING.sm,
  },
  selectedInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFF3E0",
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  selectedInfoLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    flex: 1,
  },
  selectedEmoji: { fontSize: 28 },
  selectedText: { flex: 1 },
  selectedName: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.black,
  },
  selectedCategory: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.darkGray,
    marginTop: 2,
  },
  deselect: {
    fontSize: FONTS.sizes.md,
    color: COLORS.midGray,
    padding: SPACING.xs,
  },
  addBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: "center",
    marginBottom: SPACING.xs,
  },
  addBtnDisabled: { backgroundColor: COLORS.midGray },
  addBtnText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.heavy,
  },
  disclaimer: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.darkGray,
    textAlign: "center",
    fontStyle: "italic",
  },
});

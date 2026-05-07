// src/screens/RoadTripScreen.tsx
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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
import { getRoadTripCandidates } from "../services/apiService";
import { COLORS, FONTS, RADIUS, SPACING } from "../theme";

const INTERESTS = [
  { label: "Food & Drink", emoji: "🍕" },
  { label: "Beer & Bars", emoji: "🍺" },
  { label: "History", emoji: "🏛️" },
  { label: "Art", emoji: "🎨" },
  { label: "Sports", emoji: "⚽" },
  { label: "Nature", emoji: "🌿" },
  { label: "Music", emoji: "🎵" },
  { label: "Architecture", emoji: "🏗️" },
  { label: "Games", emoji: "🎮" },
  { label: "Shopping", emoji: "🛍️" },
  { label: "True Crime", emoji: "🔪" },
  { label: "Ghosts", emoji: "👻" },
  { label: "Street Art", emoji: "🖌️" },
  { label: "Hidden Gems", emoji: "💎" },
  { label: "Photography", emoji: "📷" },
  { label: "Film & TV", emoji: "🎬" },
];

const TONES = [
  { label: "Fun & Silly", emoji: "😄" },
  { label: "Educational", emoji: "🎓" },
  { label: "Competitive", emoji: "🏆" },
  { label: "Relaxed", emoji: "😌" },
  { label: "Adventurous", emoji: "🧗" },
];

const DIFFICULTIES = [
  { label: "Easy", desc: "Simple clues, great for families" },
  { label: "Medium", desc: "Some wordplay and misdirection" },
  { label: "Hard", desc: "Cryptic riddles, lateral thinking" },
];

function decodePolyline(
  encoded: string,
): { latitude: number; longitude: number }[] {
  const points: { latitude: number; longitude: number }[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let b: number;
    let shift = 0;
    let result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
  }
  return points;
}

export default function RoadTripScreen() {
  // ── Step 1 state ──────────────────────────────────────────────
  const [step, setStep] = useState<1 | 2>(1);
  const [startLocation, setStartLocation] = useState("");
  const [endLocation, setEndLocation] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedTone, setSelectedTone] = useState("Fun & Silly");
  const [difficulty, setDifficulty] = useState("Medium");
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [loadingCandidates, setLoadingCandidates] = useState(false);

  // ── Step 2 state ──────────────────────────────────────────────
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedStops, setSelectedStops] = useState<any[]>([]);

  const [markerDelay, setMarkerDelay] = useState(false);
  const [routePolyline, setRoutePolyline] = useState<
    { latitude: number; longitude: number }[]
  >([]);
  const [routeInfo, setRouteInfo] = useState<{
    startName: string;
    endName: string;
    totalDistanceMiles: number;
    totalDurationMinutes: number;
  } | null>(null);

  const toggleInterest = (label: string) => {
    setSelectedInterests((prev) =>
      prev.includes(label) ? prev.filter((i) => i !== label) : [...prev, label],
    );
  };

  const toggleStop = (candidate: any) => {
    setSelectedStops((prev) => {
      const exists = prev.find((s) => s.placeId === candidate.placeId);
      if (exists) return prev.filter((s) => s.placeId !== candidate.placeId);
      if (prev.length >= 12) {
        Alert.alert("Maximum stops", "You can select up to 12 stops.");
        return prev;
      }
      return [...prev, candidate];
    });
  };

  const handleUseCurrentLocation = async () => {
    setLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Please allow location access.");
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      const geocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      if (geocode.length > 0) {
        const g = geocode[0];
        const address = [g.streetNumber, g.street, g.city, g.region]
          .filter(Boolean)
          .join(", ");
        setStartLocation(address);
      }
    } catch {
      Alert.alert(
        "Error",
        "Could not get your location. Please enter it manually.",
      );
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleFindStops = async () => {
    if (!startLocation.trim()) {
      Alert.alert("Missing start", "Please enter your starting location.");
      return;
    }
    if (!endLocation.trim()) {
      Alert.alert("Missing destination", "Please enter your destination.");
      return;
    }
    if (selectedInterests.length === 0) {
      Alert.alert(
        "Pick some interests",
        "Select at least one interest to find stops.",
      );
      return;
    }

    setLoadingCandidates(true);
    try {
      const data = await getRoadTripCandidates(
        startLocation.trim(),
        endLocation.trim(),
        selectedInterests,
      );

      setCandidates(data.candidates || []);
      setRoutePolyline(decodePolyline(data.routePolyline || ""));
      setRouteInfo({
        startName: data.startName,
        endName: data.endName,
        totalDistanceMiles: data.totalDistanceMiles,
        totalDurationMinutes: data.totalDurationMinutes,
      });

      setStep(2);
      setTimeout(() => setMarkerDelay(true), 1000);
    } catch (error: any) {
      Alert.alert(
        "Could not find route",
        error.response?.data?.error ||
          "Please check your locations and try again.",
      );
    } finally {
      setLoadingCandidates(false);
    }
  };

  const handleGenerate = () => {
    if (selectedStops.length < 2) {
      Alert.alert(
        "Select stops",
        "Please select at least 2 stops for your hunt.",
      );
      return;
    }

    const sortedStops = [...selectedStops].sort(
      (a, b) => a.routeFraction - b.routeFraction,
    );

    router.push({
      pathname: "/generating",
      params: {
        city: `${routeInfo?.startName} to ${routeInfo?.endName}`,
        groupProfile: JSON.stringify({
          huntType: "road-trip",
          startLocation: startLocation.trim(),
          endLocation: endLocation.trim(),
          selectedStops: sortedStops,
          stopCount: sortedStops.length,
          interests: selectedInterests,
          tone: selectedTone,
          difficulty: difficulty.toLowerCase(),
          timeBetweenStops: 60,
          ages: 30,
          groupSize: 2,
          mobility: "walking",
          totalDurationMinutes: routeInfo?.totalDurationMinutes || 0,
          totalDistanceMiles: routeInfo?.totalDistanceMiles || 0,
        }),
      },
    });
  };

  const getMapRegion = () => {
    if (routePolyline.length === 0) return undefined;
    const lats = routePolyline.map((p) => p.latitude);
    const lngs = routePolyline.map((p) => p.longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: (maxLat - minLat) * 1.3,
      longitudeDelta: (maxLng - minLng) * 1.3,
    };
  };

  // ── STEP 1 ────────────────────────────────────────────────────
  if (step === 1) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backBtn}
            >
              <Text style={styles.backBtnText}>‹ Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>🚗 Road Trip Hunt</Text>
            <Text style={styles.subtitle}>
              Enter your route and interests to find stops along the way
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📍 Starting Point</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Seattle, WA"
              placeholderTextColor={COLORS.midGray}
              value={startLocation}
              onChangeText={setStartLocation}
            />
            <TouchableOpacity
              style={styles.locationBtn}
              onPress={handleUseCurrentLocation}
              disabled={loadingLocation}
            >
              {loadingLocation ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Text style={styles.locationBtnText}>
                  📱 Use My Current Location
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏁 Destination</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Portland, OR"
              placeholderTextColor={COLORS.midGray}
              value={endLocation}
              onChangeText={setEndLocation}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎯 Interests</Text>
            <Text style={styles.sectionSubtitle}>
              What kind of stops do you want to find?
            </Text>
            <View style={styles.interestGrid}>
              {INTERESTS.map((interest) => {
                const selected = selectedInterests.includes(interest.label);
                return (
                  <TouchableOpacity
                    key={interest.label}
                    style={[
                      styles.interestChip,
                      selected && styles.interestChipActive,
                    ]}
                    onPress={() => toggleInterest(interest.label)}
                  >
                    <Text style={styles.interestEmoji}>{interest.emoji}</Text>
                    <Text
                      style={[
                        styles.interestLabel,
                        selected && styles.interestLabelActive,
                      ]}
                    >
                      {interest.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎭 Vibe</Text>
            <View style={styles.toneGrid}>
              {TONES.map((tone) => (
                <TouchableOpacity
                  key={tone.label}
                  style={[
                    styles.toneChip,
                    selectedTone === tone.label && styles.toneChipActive,
                  ]}
                  onPress={() => setSelectedTone(tone.label)}
                >
                  <Text style={styles.toneEmoji}>{tone.emoji}</Text>
                  <Text
                    style={[
                      styles.toneLabel,
                      selectedTone === tone.label && styles.toneLabelActive,
                    ]}
                  >
                    {tone.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🧩 Clue Difficulty</Text>
            {DIFFICULTIES.map((d) => (
              <TouchableOpacity
                key={d.label}
                style={[
                  styles.difficultyCard,
                  difficulty === d.label && styles.difficultyCardActive,
                ]}
                onPress={() => setDifficulty(d.label)}
              >
                <View style={styles.difficultyLeft}>
                  <Text
                    style={[
                      styles.difficultyLabel,
                      difficulty === d.label && styles.difficultyLabelActive,
                    ]}
                  >
                    {d.label}
                  </Text>
                  <Text style={styles.difficultyDesc}>{d.desc}</Text>
                </View>
                {difficulty === d.label && (
                  <Text style={styles.difficultyCheck}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[
              styles.generateBtn,
              loadingCandidates && styles.generateBtnDisabled,
            ]}
            onPress={handleFindStops}
            disabled={loadingCandidates}
          >
            {loadingCandidates ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Text style={styles.generateBtnText}>
                🗺️ Find Stops Along My Route
              </Text>
            )}
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── STEP 2 ────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.step2Header}>
        <TouchableOpacity
          onPress={() => {
            setStep(1);
            setSelectedStops([]);

            setMarkerDelay(false);
          }}
        >
          <Text style={styles.backBtnText}>‹ Back</Text>
        </TouchableOpacity>
        <View style={styles.step2HeaderCenter}>
          <Text style={styles.step2Title}>Pick Your Stops</Text>
          <Text style={styles.step2Subtitle}>
            {routeInfo?.totalDistanceMiles}mi ·{" "}
            {Math.round((routeInfo?.totalDurationMinutes || 0) / 60)}hr drive
          </Text>
        </View>
        <View style={styles.step2Badge}>
          <Text style={styles.step2BadgeText}>
            {selectedStops.length} selected
          </Text>
        </View>
      </View>

      {/* Map — only render once polyline is ready */}
      <View style={styles.mapContainer}>
        {routePolyline.length > 0 ? (
          <MapView
            provider={
              Platform.OS === "android" ? PROVIDER_GOOGLE : PROVIDER_DEFAULT
            }
            style={styles.map}
            initialRegion={getMapRegion()}
            showsUserLocation={false}
          >
            <Polyline
              coordinates={routePolyline}
              strokeColor={COLORS.primary}
              strokeWidth={3}
            />

            {/* Render markers after short delay */}
            {markerDelay &&
              candidates.map((candidate) => {
                const isSelected = selectedStops.find(
                  (s) => s.placeId === candidate.placeId,
                );
                return (
                  <Marker
                    key={candidate.placeId}
                    coordinate={{
                      latitude: candidate.lat,
                      longitude: candidate.lng,
                    }}
                    onPress={() => toggleStop(candidate)}
                  >
                    <View
                      style={[
                        styles.emojiMarker,
                        isSelected && styles.emojiMarkerSelected,
                      ]}
                    >
                      <Text style={styles.emojiMarkerText}>
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
            <Text style={styles.mapLoadingText}>Loading your route...</Text>
          </View>
        )}
      </View>

      {/* Bottom panel */}
      <View style={styles.bottomPanel}>
        <Text style={styles.bottomPanelTitle}>
          {selectedStops.length === 0
            ? "Tap stops on the map to select them"
            : `${selectedStops.length} stop${selectedStops.length !== 1 ? "s" : ""} selected (min 2)`}
        </Text>

        {selectedStops.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.selectedPills}
          >
            {[...selectedStops]
              .sort((a, b) => a.routeFraction - b.routeFraction)
              .map((stop) => (
                <TouchableOpacity
                  key={stop.placeId}
                  style={styles.stopPill}
                  onPress={() => toggleStop(stop)}
                >
                  <Text style={styles.stopPillEmoji}>{stop.emoji}</Text>
                  <Text style={styles.stopPillText} numberOfLines={1}>
                    {stop.category}
                  </Text>
                  <Text style={styles.stopPillRemove}>✕</Text>
                </TouchableOpacity>
              ))}
          </ScrollView>
        )}

        <TouchableOpacity
          style={[
            styles.generateBtn,
            selectedStops.length < 2 && styles.generateBtnDisabled,
          ]}
          onPress={handleGenerate}
          disabled={selectedStops.length < 2}
        >
          <Text style={styles.generateBtnText}>
            {selectedStops.length < 2
              ? `Select ${2 - selectedStops.length} more stop${2 - selectedStops.length !== 1 ? "s" : ""}`
              : `🚗 Build Hunt with ${selectedStops.length} Stops`}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.offWhite },
  scroll: { padding: SPACING.md },
  header: { marginBottom: SPACING.lg },
  backBtn: { marginBottom: SPACING.sm },
  backBtnText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.primary,
    fontWeight: FONTS.weights.bold,
  },
  title: {
    fontSize: FONTS.sizes.hero,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.darkGray,
    lineHeight: 22,
  },
  section: { marginBottom: SPACING.lg },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.primary,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.lightGray,
    padding: SPACING.md,
    fontSize: FONTS.sizes.md,
    color: COLORS.black,
    marginBottom: SPACING.sm,
  },
  locationBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    alignItems: "center",
  },
  locationBtnText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
  },
  interestGrid: { flexDirection: "row", flexWrap: "wrap", gap: SPACING.sm },
  interestChip: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderWidth: 1.5,
    borderColor: COLORS.lightGray,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  interestChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  interestEmoji: { fontSize: 16 },
  interestLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
    fontWeight: FONTS.weights.medium,
  },
  interestLabelActive: { color: COLORS.white },
  toneGrid: { flexDirection: "row", flexWrap: "wrap", gap: SPACING.sm },
  toneChip: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1.5,
    borderColor: COLORS.lightGray,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minWidth: "45%",
  },
  toneChipActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  toneEmoji: { fontSize: 20 },
  toneLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
    fontWeight: FONTS.weights.medium,
  },
  toneLabelActive: { color: COLORS.white },
  difficultyCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1.5,
    borderColor: COLORS.lightGray,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  difficultyCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: "#EBF5FB",
  },
  difficultyLeft: { flex: 1 },
  difficultyLabel: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.black,
    marginBottom: 2,
  },
  difficultyLabelActive: { color: COLORS.primary },
  difficultyDesc: { fontSize: FONTS.sizes.xs, color: COLORS.darkGray },
  difficultyCheck: {
    fontSize: FONTS.sizes.xl,
    color: COLORS.primary,
    fontWeight: FONTS.weights.heavy,
  },
  generateBtn: {
    backgroundColor: "#27AE60",
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: "center",
    marginTop: SPACING.md,
  },
  generateBtnDisabled: { backgroundColor: COLORS.midGray },
  generateBtnText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.heavy,
  },
  step2Header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  step2HeaderCenter: { flex: 1, alignItems: "center" },
  step2Title: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.primary,
  },
  step2Subtitle: { fontSize: FONTS.sizes.xs, color: COLORS.darkGray },
  step2Badge: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.round,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
  },
  step2BadgeText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.bold,
  },
  mapContainer: { flex: 1 },
  map: { flex: 1 },
  mapLoading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
  },
  mapLoadingText: {
    marginTop: SPACING.md,
    fontSize: FONTS.sizes.md,
    color: COLORS.darkGray,
  },
  emojiMarker: {
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
  emojiMarkerSelected: {
    borderColor: "#27AE60",
    borderWidth: 3,
    backgroundColor: "#EAFAF1",
  },
  emojiMarkerText: { fontSize: 20 },
  bottomPanel: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  bottomPanelTitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
    textAlign: "center",
    marginBottom: SPACING.sm,
  },
  selectedPills: { flexDirection: "row", marginBottom: SPACING.sm },
  stopPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EAFAF1",
    borderRadius: RADIUS.round,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: "#27AE60",
    gap: 4,
  },
  stopPillEmoji: { fontSize: 14 },
  stopPillText: {
    fontSize: FONTS.sizes.xs,
    color: "#1E8449",
    fontWeight: FONTS.weights.medium,
    maxWidth: 80,
  },
  stopPillRemove: { fontSize: FONTS.sizes.xs, color: COLORS.midGray },
});

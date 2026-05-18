// src/screens/RoadTripScreen.tsx
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
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
  { label: "Food & Drink", emoji: "🍽️" },
  { label: "Foodie", emoji: "🍕" },
  { label: "Bar Crawl", emoji: "🍺" },
  { label: "History", emoji: "🏛️" },
  { label: "Art", emoji: "🎨" },
  { label: "Nature", emoji: "🌿" },
  { label: "Science", emoji: "🔬" },
  { label: "Music", emoji: "🎵" },
  { label: "Architecture", emoji: "🏗️" },
  { label: "Games", emoji: "🎮" },
  { label: "Sports", emoji: "⚽" },
  { label: "Hidden Gems", emoji: "💎" },
  { label: "Street Art", emoji: "🖌️" },
  { label: "Photography", emoji: "📷" },
  { label: "True Crime", emoji: "🔪" },
  { label: "Ghosts", emoji: "👻" },
  { label: "Film & TV", emoji: "🎬" },
  { label: "Shopping", emoji: "🛍️" },
];

const HERO_BG = require("../../assets/images/hunt_bg_6_roadtrip_map_sunset.jpg");

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
  const [step, setStep] = useState<1 | 2>(1);
  const [startLocation, setStartLocation] = useState("");
  const [endLocation, setEndLocation] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState("Medium");
  const RANDOM_INTERESTS_LIST = [
    "Food & Drink",
    "History",
    "Art",
    "Nature",
    "Music",
    "Architecture",
    "Sports",
    "Hidden Gems",
    "Street Art",
    "Photography",
  ];

  const handleRandomize = () => {
    const shuffled = [...RANDOM_INTERESTS_LIST].sort(() => Math.random() - 0.5);
    setSelectedInterests(shuffled.slice(0, Math.floor(Math.random() * 3) + 3));
  };
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [searching, setSearching] = useState(false);

  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedStops, setSelectedStops] = useState<any[]>([]);
  const [markerDelay, setMarkerDelay] = useState(false);
  const [routePolyline, setRoutePolyline] = useState<
    { latitude: number; longitude: number }[]
  >([]);
  const [routePolylineRaw, setRoutePolylineRaw] = useState("");
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
    setSearching(true);
    try {
      const data = await getRoadTripCandidates(
        startLocation.trim(),
        endLocation.trim(),
        selectedInterests,
      );

      setCandidates(data.candidates || []);
      setRoutePolyline(decodePolyline(data.routePolyline || ""));
      setRoutePolylineRaw(data.routePolyline || "");
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
      setSearching(false);
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
    const unselectedCandidates = candidates.filter(
      (c) => !selectedStops.find((s) => s.placeId === c.placeId),
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
          specialtyHunt: null,
          specialtyLabel: null,
          specialtySpotFocus: null,
          difficulty: difficulty.toLowerCase(),
          timeBetweenStops: 60,
          ages: 30,
          mobility: "walking",
          totalDurationMinutes: routeInfo?.totalDurationMinutes || 0,
          totalDistanceMiles: routeInfo?.totalDistanceMiles || 0,
          unselectedCandidates,
          routePolyline: routePolylineRaw,
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
      <View style={styles.container}>
        <Image source={HERO_BG} style={styles.heroBg} resizeMode="cover" />
        <View style={styles.heroOverlay} />
        <SafeAreaView style={styles.safeArea}>
          {/* Hero section */}
          <View style={styles.heroSection}>
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

          {/* White card */}
          <ScrollView
            style={styles.card}
            contentContainerStyle={styles.cardScroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Starting point */}
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

            {/* Destination */}
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

            {/* Interests */}
            <View style={styles.section}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionTitle}>🎯 Interests</Text>
                <TouchableOpacity
                  style={styles.randomBtn}
                  onPress={handleRandomize}
                >
                  <Text style={styles.randomBtnText}>🎲 Randomize</Text>
                </TouchableOpacity>
              </View>
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

            {/* Difficulty */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🧩 Clue Difficulty</Text>
              <View style={styles.difficultyRow}>
                {DIFFICULTIES.map((d) => {
                  const selected = difficulty === d.label;
                  const colors: Record<string, string> = {
                    Easy: "#27AE60",
                    Medium: "#F39C12",
                    Hard: "#C0392B",
                  };
                  const emojis: Record<string, string> = {
                    Easy: "🟢",
                    Medium: "🟡",
                    Hard: "🔴",
                  };
                  return (
                    <TouchableOpacity
                      key={d.label}
                      style={[
                        styles.diffBtn,
                        selected && {
                          backgroundColor: colors[d.label],
                          borderColor: colors[d.label],
                        },
                      ]}
                      onPress={() => setDifficulty(d.label)}
                    >
                      <Text style={styles.diffEmoji}>{emojis[d.label]}</Text>
                      <Text
                        style={[
                          styles.diffLabel,
                          selected && styles.diffLabelSelected,
                        ]}
                      >
                        {d.label}
                      </Text>
                      <Text
                        style={[
                          styles.diffDesc,
                          selected && styles.diffLabelSelected,
                        ]}
                      >
                        {d.desc}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
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
      </View>
    );
  }

  // ── Searching screen ──────────────────────────────────────────
  if (searching) {
    return (
      <View style={styles.container}>
        <Image source={HERO_BG} style={styles.heroBg} resizeMode="cover" />
        <View style={styles.heroOverlay} />
        <SafeAreaView style={styles.safeArea}>
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              padding: SPACING.xl,
            }}
          >
            <Text style={{ fontSize: 72, marginBottom: SPACING.md }}>🛣️</Text>
            <ActivityIndicator
              size="large"
              color={COLORS.accent}
              style={{ marginBottom: SPACING.lg }}
            />
            <Text
              style={{
                fontSize: FONTS.sizes.xxl,
                fontWeight: FONTS.weights.heavy,
                color: COLORS.white,
                textAlign: "center",
                marginBottom: SPACING.sm,
              }}
            >
              Mapping Your Route
            </Text>
            <Text
              style={{
                fontSize: FONTS.sizes.md,
                color: "rgba(255,255,255,0.75)",
                textAlign: "center",
                marginBottom: SPACING.xl,
                lineHeight: 24,
              }}
            >
              {`Searching for great stops between\n${startLocation} and ${endLocation}...`}
            </Text>
            <Text
              style={{
                fontSize: FONTS.sizes.sm,
                color: "rgba(255,255,255,0.5)",
                textAlign: "center",
                fontStyle: "italic",
              }}
            >
              This can take up to 30 seconds ✨
            </Text>
          </View>
        </SafeAreaView>
      </View>
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
          <Text style={styles.step2BackText}>‹ Back</Text>
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
  container: { flex: 1, backgroundColor: COLORS.primary },
  heroBg: {
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
    backgroundColor: "rgba(25, 50, 85, 0.55)",
  },
  safeArea: { flex: 1 },

  // ── Hero ──────────────────────────────────────────────────────
  heroSection: { padding: SPACING.lg, paddingBottom: SPACING.xl },
  backBtn: { marginBottom: SPACING.sm },
  backBtnText: {
    color: "rgba(255,255,255,0.75)", // ← fixed: was COLORS.primary (dark on dark)
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
  },
  title: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.white, // ← fixed: was COLORS.primary
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONTS.sizes.md,
    color: "rgba(255,255,255,0.75)",
    lineHeight: 22,
  },

  // ── White card ────────────────────────────────────────────────
  card: {
    flex: 1,
    backgroundColor: "transparent", // ← fixed: was accentPale tint
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  cardScroll: { padding: SPACING.md, paddingBottom: 40 },

  section: {
    marginBottom: SPACING.lg,
    backgroundColor: "rgba(255, 255, 255, 0.75)",
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.primary, // ← stays primary since it's now inside white cards
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
    marginBottom: SPACING.sm,
  },
  sectionTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
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
  randomBtn: {
    backgroundColor: COLORS.accentPale,
    borderRadius: RADIUS.round,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  randomBtnText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.accent,
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
  difficultyRow: { flexDirection: "row", gap: 8 },
  diffBtn: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.midGray,
    backgroundColor: COLORS.white,
  },
  diffEmoji: { fontSize: 22, marginBottom: 4 },
  diffLabel: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
    color: COLORS.black,
    marginBottom: 2,
    textAlign: "center",
  },
  diffLabelSelected: { color: COLORS.white },
  diffDesc: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.darkGray,
    textAlign: "center",
  },
  generateBtn: {
    backgroundColor: COLORS.accent,
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

  // ── Step 2 ────────────────────────────────────────────────────
  step2Header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  step2BackText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.primary,
    fontWeight: FONTS.weights.bold,
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
    backgroundColor: "#E8F8F7",
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

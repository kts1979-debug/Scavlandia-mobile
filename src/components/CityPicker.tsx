// src/components/CityPicker.tsx
// Lets users set their hunt city by typing, using GPS,
// or selecting from nearby cities.

import * as Location from "expo-location";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS, FONTS, RADIUS, SPACING } from "../theme";

interface CityPickerProps {
  value: string;
  onChange: (city: string) => void;
}

// Well-known cities to suggest when GPS is used
const NEARBY_RADIUS_KM = 200;

export default function CityPicker({ value, onChange }: CityPickerProps) {
  const [detecting, setDetecting] = useState(false);
  const [nearbyCities, setNearbyCities] = useState<string[]>([]);
  const [showNearby, setShowNearby] = useState(false);
  const [mode, setMode] = useState<"type" | "gps" | "nearby">("type");

  // ── Detect city via GPS ───────────────────────────────────────
  const handleGPS = async () => {
    setDetecting(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Location needed",
          "Please allow location access to use GPS city detection.",
        );
        setDetecting(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      // Reverse geocode to get city name
      const geocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (geocode.length > 0) {
        const place = geocode[0];
        const city = place.city || place.subregion || place.region || "";
        const region = place.region || place.country || "";
        const fullCity = region ? `${city}, ${region}` : city;

        if (fullCity.trim()) {
          onChange(fullCity);
          setMode("gps");

          // Also fetch nearby cities
          await fetchNearbyCities(
            location.coords.latitude,
            location.coords.longitude,
            geocode,
          );
        } else {
          Alert.alert(
            "Could not detect city",
            "Please type your city manually.",
          );
        }
      }
    } catch (err) {
      Alert.alert(
        "GPS Error",
        "Could not detect your location. Please type your city manually.",
      );
    } finally {
      setDetecting(false);
    }
  };

  // ── Build nearby city suggestions from reverse geocode ────────
  const fetchNearbyCities = async (
    lat: number,
    lng: number,
    geocode: Location.LocationGeocodedAddress[],
  ) => {
    try {
      // Get a broader area and suggest nearby known cities
      const suggestions: string[] = [];
      const place = geocode[0];

      // Add current city
      if (place.city)
        suggestions.push(
          place.region ? `${place.city}, ${place.region}` : place.city,
        );

      // Add nearby points using offset coordinates
      const offsets = [
        { lat: lat + 0.5, lng: lng },
        { lat: lat - 0.5, lng: lng },
        { lat: lat, lng: lng + 0.5 },
        { lat: lat, lng: lng - 0.5 },
        { lat: lat + 1.0, lng: lng + 0.5 },
        { lat: lat - 1.0, lng: lng - 0.5 },
      ];

      for (const offset of offsets) {
        const nearby = await Location.reverseGeocodeAsync({
          latitude: offset.lat,
          longitude: offset.lng,
        });
        if (nearby.length > 0 && nearby[0].city) {
          const nearbyCity = nearby[0].region
            ? `${nearby[0].city}, ${nearby[0].region}`
            : nearby[0].city;
          if (!suggestions.includes(nearbyCity)) {
            suggestions.push(nearbyCity);
          }
        }
        if (suggestions.length >= 6) break;
      }

      setNearbyCities(suggestions.slice(0, 6));
      if (suggestions.length > 1) setShowNearby(true);
    } catch {
      // Nearby city fetch is non-critical — ignore errors
    }
  };

  return (
    <View style={styles.container}>
      {/* Mode selector */}
      <View style={styles.modeRow}>
        <TouchableOpacity
          style={[styles.modeBtn, mode === "type" && styles.modeBtnActive]}
          onPress={() => {
            setMode("type");
            setShowNearby(false);
          }}
        >
          <Text
            style={[
              styles.modeBtnText,
              mode === "type" && styles.modeBtnTextActive,
            ]}
          >
            ✏️ Type
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeBtn, mode === "gps" && styles.modeBtnActive]}
          onPress={handleGPS}
          disabled={detecting}
        >
          {detecting ? (
            <ActivityIndicator size="small" color={COLORS.accent} />
          ) : (
            <Text
              style={[
                styles.modeBtnText,
                mode === "gps" && styles.modeBtnTextActive,
              ]}
            >
              📍 Use GPS
            </Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeBtn, mode === "nearby" && styles.modeBtnActive]}
          onPress={() => {
            if (nearbyCities.length === 0) {
              Alert.alert(
                "Use GPS first",
                'Tap "Use GPS" to detect your location and see nearby cities.',
              );
              return;
            }
            setMode("nearby");
            setShowNearby(true);
          }}
        >
          <Text
            style={[
              styles.modeBtnText,
              mode === "nearby" && styles.modeBtnTextActive,
            ]}
          >
            🗺️ Nearby
          </Text>
        </TouchableOpacity>
      </View>

      {/* Text input */}
      {mode !== "nearby" && (
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChange}
          placeholder="e.g. Seattle, WA"
          placeholderTextColor={COLORS.midGray}
          autoCorrect={false}
        />
      )}

      {/* GPS detected city display */}
      {mode === "gps" && value && (
        <View style={styles.detectedRow}>
          <Text style={styles.detectedEmoji}>📍</Text>
          <Text style={styles.detectedText}>{value}</Text>
          <TouchableOpacity
            onPress={() => {
              setMode("type");
            }}
          >
            <Text style={styles.changeText}>Change</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Nearby cities list */}
      {showNearby && nearbyCities.length > 0 && (
        <View style={styles.nearbyContainer}>
          <Text style={styles.nearbyTitle}>
            {mode === "nearby"
              ? "🗺️ Select a nearby city"
              : "📍 Or try a nearby city"}
          </Text>
          <View style={styles.nearbyGrid}>
            {nearbyCities.map((city) => (
              <TouchableOpacity
                key={city}
                style={[
                  styles.nearbyChip,
                  value === city && styles.nearbyChipSelected,
                ]}
                onPress={() => {
                  onChange(city);
                  setShowNearby(false);
                  setMode("nearby");
                }}
              >
                <Text
                  style={[
                    styles.nearbyChipText,
                    value === city && styles.nearbyChipTextSelected,
                  ]}
                >
                  {city}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: SPACING.sm },
  modeRow: { flexDirection: "row", gap: SPACING.sm },
  modeBtn: {
    flex: 1,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.midGray,
    alignItems: "center",
    backgroundColor: COLORS.offWhite,
  },
  modeBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  modeBtnText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
    fontWeight: FONTS.weights.medium,
  },
  modeBtnTextActive: { color: COLORS.white, fontWeight: FONTS.weights.bold },
  input: {
    borderWidth: 1.5,
    borderColor: COLORS.midGray,
    borderRadius: RADIUS.md,
    padding: 12,
    fontSize: FONTS.sizes.md,
    color: COLORS.black,
    backgroundColor: COLORS.offWhite,
  },
  detectedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    backgroundColor: COLORS.lgreen,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
  },
  detectedEmoji: { fontSize: 18 },
  detectedText: {
    flex: 1,
    fontSize: FONTS.sizes.md,
    color: COLORS.black,
    fontWeight: FONTS.weights.medium,
  },
  changeText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.accent,
    fontWeight: FONTS.weights.bold,
  },
  nearbyContainer: {
    backgroundColor: COLORS.lgray,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
  },
  nearbyTitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
    fontWeight: FONTS.weights.bold,
    marginBottom: SPACING.sm,
  },
  nearbyGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  nearbyChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.round,
    borderWidth: 1.5,
    borderColor: COLORS.midGray,
    backgroundColor: COLORS.white,
  },
  nearbyChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  nearbyChipText: { fontSize: FONTS.sizes.sm, color: COLORS.darkGray },
  nearbyChipTextSelected: {
    color: COLORS.white,
    fontWeight: FONTS.weights.bold,
  },
});

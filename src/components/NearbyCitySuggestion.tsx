// src/components/NearbyCitySuggestion.tsx
// Shown when a city has too few locations.
// Suggests nearby cities the user can switch to.

import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getNearbyCities } from "../services/apiService";
import { COLORS, FONTS, RADIUS, SPACING } from "../theme";

interface NearbyCitySuggestionProps {
  currentCity: string;
  onSelectCity: (city: string) => void;
  onDismiss: () => void;
}

export default function NearbyCitySuggestion({
  currentCity,
  onSelectCity,
  onDismiss,
}: NearbyCitySuggestionProps) {
  const [loading, setLoading] = useState(true);
  const [nearbyCities, setNearbyCities] = useState<string[]>([]);

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    console.log("Fetching suggestions for:", currentCity);
    try {
      // Try to get current location for better suggestions
      const { status } = await Location.getForegroundPermissionsAsync();
      console.log("Location permission status:", status);
      let lat = 0;
      let lng = 0;

      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        lat = location.coords.latitude;
        lng = location.coords.longitude;
      } else {
        // Geocode the current city to get coordinates
        const geocode = await Location.geocodeAsync(currentCity);
        if (geocode.length > 0) {
          lat = geocode[0].latitude;
          lng = geocode[0].longitude;
        }
      }

      if (lat !== 0 && lng !== 0) {
        const cities = await getNearbyCities(lat, lng, currentCity);
        setNearbyCities(cities);
      }
    } catch (err) {
      console.warn("Could not fetch nearby cities:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.emoji}>🗺️</Text>
        <View style={styles.headerText}>
          <Text style={styles.title}>
            Not enough locations in {currentCity}
          </Text>
          <Text style={styles.subtitle}>
            Try a nearby city with more places to explore
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color={COLORS.accent} />
          <Text style={styles.loadingText}>Finding nearby cities...</Text>
        </View>
      ) : nearbyCities.length > 0 ? (
        <>
          <Text style={styles.suggestLabel}>Suggested cities nearby:</Text>
          <View style={styles.cityGrid}>
            {nearbyCities.map((city) => (
              <TouchableOpacity
                key={city}
                style={styles.cityChip}
                onPress={() => onSelectCity(city)}
              >
                <Text style={styles.cityChipEmoji}>📍</Text>
                <Text style={styles.cityChipText}>{city}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      ) : (
        <Text style={styles.noSuggestText}>
          No nearby cities found. Try a larger city.
        </Text>
      )}

      <TouchableOpacity style={styles.dismissBtn} onPress={onDismiss}>
        <Text style={styles.dismissText}>Try a different city</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1.5,
    borderColor: COLORS.midGray,
  },
  header: { flexDirection: "row", gap: SPACING.sm, marginBottom: SPACING.md },
  emoji: { fontSize: 32 },
  headerText: { flex: 1 },
  title: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.black,
    marginBottom: 2,
  },
  subtitle: { fontSize: FONTS.sizes.sm, color: COLORS.darkGray },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  loadingText: { fontSize: FONTS.sizes.sm, color: COLORS.darkGray },
  suggestLabel: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
    color: COLORS.darkGray,
    marginBottom: SPACING.sm,
  },
  cityGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: SPACING.md,
  },
  cityChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.round,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: COLORS.gold,
    ...{
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 2,
      elevation: 2,
    },
  },
  cityChipEmoji: { fontSize: 14 },
  cityChipText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
    color: COLORS.primary,
  },
  noSuggestText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
    marginBottom: SPACING.md,
    fontStyle: "italic",
  },
  dismissBtn: { alignItems: "center", padding: SPACING.sm },
  dismissText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.accent,
    fontWeight: FONTS.weights.bold,
  },
});

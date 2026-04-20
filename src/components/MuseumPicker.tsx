// src/components/MuseumPicker.tsx
// Lets users find a museum nearby or type one manually.

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
import { getNearbyMuseums } from "../services/apiService";
import { COLORS, FONTS, RADIUS, SHADOW, SPACING } from "../theme";

interface Museum {
  name: string;
  address: string;
  placeId: string;
  rating: number | null;
  lat: number;
  lng: number;
  isOpen: boolean | null;
}

interface MuseumPickerProps {
  onSelect: (museum: Museum) => void;
}

export default function MuseumPicker({ onSelect }: MuseumPickerProps) {
  const [mode, setMode] = useState<"search" | "type">("search");
  const [loading, setLoading] = useState(false);
  const [museums, setMuseums] = useState<Museum[]>([]);
  const [manualName, setManualName] = useState("");
  const [manualAddress, setManualAddress] = useState("");
  const [selected, setSelected] = useState<Museum | null>(null);

  const handleSearchNearby = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Location needed",
          "Please allow location access to find nearby museums.",
        );
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const results = await getNearbyMuseums(
        location.coords.latitude,
        location.coords.longitude,
      );
      setMuseums(results);

      if (results.length === 0) {
        Alert.alert(
          "No museums found",
          "No museums found within 10km. Try typing a museum name instead.",
        );
        setMode("type");
      }
    } catch {
      Alert.alert(
        "Error",
        "Could not search for museums. Please try typing a name instead.",
      );
      setMode("type");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMuseum = (museum: Museum) => {
    setSelected(museum);
    onSelect(museum);
  };

  const handleManualSubmit = () => {
    if (!manualName.trim()) {
      Alert.alert("Missing info", "Please enter a museum name");
      return;
    }
    const museum: Museum = {
      name: manualName.trim(),
      address: manualAddress.trim() || manualName.trim(),
      placeId: "manual",
      rating: null,
      lat: 0,
      lng: 0,
      isOpen: null,
    };
    handleSelectMuseum(museum);
  };

  return (
    <View style={styles.container}>
      {/* Mode tabs */}
      <View style={styles.modeTabs}>
        <TouchableOpacity
          style={[styles.modeTab, mode === "search" && styles.modeTabActive]}
          onPress={() => setMode("search")}
        >
          <Text
            style={[
              styles.modeTabText,
              mode === "search" && styles.modeTabTextActive,
            ]}
          >
            📍 Search Nearby
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeTab, mode === "type" && styles.modeTabActive]}
          onPress={() => setMode("type")}
        >
          <Text
            style={[
              styles.modeTabText,
              mode === "type" && styles.modeTabTextActive,
            ]}
          >
            ✏️ Type Name
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search nearby */}
      {mode === "search" && (
        <View>
          {museums.length === 0 ? (
            <TouchableOpacity
              style={styles.searchBtn}
              onPress={handleSearchNearby}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.searchBtnText}>
                  🔍 Find Museums Near Me
                </Text>
              )}
            </TouchableOpacity>
          ) : (
            <View style={styles.museumList}>
              <Text style={styles.listTitle}>
                {museums.length} museums found nearby
              </Text>
              {museums.map((museum) => (
                <TouchableOpacity
                  key={museum.placeId}
                  style={[
                    styles.museumCard,
                    selected?.placeId === museum.placeId &&
                      styles.museumCardSelected,
                  ]}
                  onPress={() => handleSelectMuseum(museum)}
                >
                  <View style={styles.museumCardTop}>
                    <Text style={styles.museumName} numberOfLines={1}>
                      🏛️ {museum.name}
                    </Text>
                    {museum.isOpen === true && (
                      <View style={styles.openBadge}>
                        <Text style={styles.openBadgeText}>Open</Text>
                      </View>
                    )}
                    {museum.isOpen === false && (
                      <View style={styles.closedBadge}>
                        <Text style={styles.closedBadgeText}>Closed</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.museumAddress} numberOfLines={1}>
                    📍 {museum.address}
                  </Text>
                  {museum.rating && (
                    <Text style={styles.museumRating}>
                      ⭐ {museum.rating} rating
                    </Text>
                  )}
                  {selected?.placeId === museum.placeId && (
                    <Text style={styles.selectedTick}>✓ Selected</Text>
                  )}
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={styles.refreshBtn}
                onPress={() => {
                  setMuseums([]);
                  setSelected(null);
                }}
              >
                <Text style={styles.refreshBtnText}>Search again</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Type manually */}
      {mode === "type" && (
        <View style={styles.manualForm}>
          <Text style={styles.inputLabel}>Museum Name</Text>
          <TextInput
            style={styles.input}
            value={manualName}
            onChangeText={setManualName}
            placeholder="e.g. The Metropolitan Museum of Art"
            placeholderTextColor={COLORS.midGray}
          />
          <Text style={styles.inputLabel}>City (optional)</Text>
          <TextInput
            style={styles.input}
            value={manualAddress}
            onChangeText={setManualAddress}
            placeholder="e.g. New York, NY"
            placeholderTextColor={COLORS.midGray}
          />
          <TouchableOpacity
            style={styles.searchBtn}
            onPress={handleManualSubmit}
          >
            <Text style={styles.searchBtnText}>✓ Use This Museum</Text>
          </TouchableOpacity>
          {selected && mode === "type" && (
            <View style={styles.selectedBanner}>
              <Text style={styles.selectedBannerText}>
                ✅ Selected: {selected.name}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: SPACING.sm },
  modeTabs: {
    flexDirection: "row",
    borderRadius: RADIUS.md,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: COLORS.midGray,
  },
  modeTab: {
    flex: 1,
    padding: SPACING.sm,
    alignItems: "center",
    backgroundColor: COLORS.offWhite,
  },
  modeTabActive: { backgroundColor: COLORS.primary },
  modeTabText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
    fontWeight: FONTS.weights.medium,
  },
  modeTabTextActive: { color: COLORS.white, fontWeight: FONTS.weights.bold },
  searchBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: "center",
  },
  searchBtnText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
  },
  museumList: { gap: SPACING.sm },
  listTitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
    fontWeight: FONTS.weights.medium,
  },
  museumCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1.5,
    borderColor: COLORS.midGray,
    ...SHADOW.sm,
  },
  museumCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: "#EBF5FB",
  },
  museumCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  museumName: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.black,
    flex: 1,
  },
  openBadge: {
    backgroundColor: COLORS.success,
    borderRadius: RADIUS.round,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  openBadgeText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.bold,
  },
  closedBadge: {
    backgroundColor: COLORS.danger,
    borderRadius: RADIUS.round,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  closedBadgeText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.bold,
  },
  museumAddress: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
    marginBottom: 2,
  },
  museumRating: { fontSize: FONTS.sizes.xs, color: COLORS.gold },
  selectedTick: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
    fontWeight: FONTS.weights.bold,
    marginTop: 4,
  },
  refreshBtn: { alignItems: "center", padding: SPACING.sm },
  refreshBtnText: {
    color: COLORS.accent,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
  },
  manualForm: { gap: SPACING.sm },
  inputLabel: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
    color: COLORS.primary,
  },
  input: {
    borderWidth: 1.5,
    borderColor: COLORS.midGray,
    borderRadius: RADIUS.md,
    padding: 12,
    fontSize: FONTS.sizes.md,
    color: COLORS.black,
    backgroundColor: COLORS.offWhite,
  },
  selectedBanner: {
    backgroundColor: COLORS.lgreen,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    alignItems: "center",
  },
  selectedBannerText: {
    color: COLORS.lgreen,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
  },
});

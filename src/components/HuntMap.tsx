// src/components/HuntMap.tsx
import React, { useEffect, useState } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { HuntStop } from "../services/apiService";

interface HuntMapProps {
  stops: HuntStop[];
  activeStopIndex: number;
  completedStopIndices: number[];
  userLocation: { latitude: number; longitude: number } | null;
}

export default function HuntMap({
  stops,
  activeStopIndex,
  completedStopIndices,
  userLocation,
}: HuntMapProps) {
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMapReady(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const getMarkerColor = (index: number): string => {
    if (completedStopIndices.includes(index)) return "#27AE60";
    if (index === activeStopIndex) return "#F39C12";
    return "#95A5A6";
  };

  const getMarkerLabel = (index: number): string => {
    if (completedStopIndices.includes(index)) return "✓";
    if (index === activeStopIndex) return `${index + 1}`;
    return "?";
  };

  const activeStop = stops[activeStopIndex];

  // Validate all coordinates before rendering
  const validStops = stops.filter(
    (s) =>
      s &&
      typeof s.lat === "number" &&
      typeof s.lng === "number" &&
      !isNaN(s.lat) &&
      !isNaN(s.lng),
  );

  if (!activeStop || !activeStop.lat || !activeStop.lng || mapError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorEmoji}>🗺️</Text>
        <Text style={styles.errorText}>Map unavailable</Text>
        <Text style={styles.errorSub}>Continue using the clue view</Text>
      </View>
    );
  }

  if (!mapReady) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingEmoji}>🗺️</Text>
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  const initialRegion = {
    latitude: activeStop.lat,
    longitude: activeStop.lng,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  };

  // Dynamically import MapView to prevent crash on load
  try {
    const MapView = require("react-native-maps").default;
    const {
      Marker,
      Circle,
      PROVIDER_GOOGLE,
      PROVIDER_DEFAULT,
    } = require("react-native-maps");

    return (
      <View style={styles.container}>
        <MapView
          provider={
            Platform.OS === "android" ? PROVIDER_GOOGLE : PROVIDER_DEFAULT
          }
          style={styles.map}
          initialRegion={initialRegion}
          showsUserLocation={true}
          showsMyLocationButton={true}
          showsCompass={true}
          onMapReady={() => console.log("✅ Map ready")}
        >
          {validStops.map((stop, index) => (
            <Marker
              key={`stop-${index}`}
              coordinate={{ latitude: stop.lat, longitude: stop.lng }}
              title={
                completedStopIndices.includes(index) ||
                index === activeStopIndex
                  ? stop.locationName
                  : `Stop ${index + 1}`
              }
              description={index === activeStopIndex ? stop.clue : ""}
            >
              <View
                style={[
                  styles.marker,
                  { backgroundColor: getMarkerColor(index) },
                ]}
              >
                <Text style={styles.markerText}>{getMarkerLabel(index)}</Text>
              </View>
            </Marker>
          ))}

          <Circle
            center={{ latitude: activeStop.lat, longitude: activeStop.lng }}
            radius={50}
            fillColor="rgba(243, 156, 18, 0.15)"
            strokeColor="rgba(243, 156, 18, 0.5)"
            strokeWidth={2}
          />
        </MapView>
      </View>
    );
  } catch (err) {
    console.error("Map render error:", err);
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorEmoji}>🗺️</Text>
        <Text style={styles.errorText}>Map could not load</Text>
        <Text style={styles.errorSub}>Continue using the clue view</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  marker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    elevation: 5,
  },
  markerText: { color: "#FFFFFF", fontWeight: "bold", fontSize: 12 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
  },
  loadingEmoji: { fontSize: 48, marginBottom: 12 },
  loadingText: { fontSize: 16, color: "#5D6D7E" },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
  },
  errorEmoji: { fontSize: 48, marginBottom: 12 },
  errorText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 8,
  },
  errorSub: { fontSize: 14, color: "#95A5A6" },
});

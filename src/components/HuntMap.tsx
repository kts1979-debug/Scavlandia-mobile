// src/components/HuntMap.tsx
import React, { useEffect, useState } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import MapView, {
  Circle,
  Marker,
  PROVIDER_DEFAULT,
  PROVIDER_GOOGLE,
} from "react-native-maps";
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

  // Delay map render on Android to allow Google Maps SDK to initialize
  useEffect(() => {
    if (Platform.OS === "android") {
      const timer = setTimeout(() => setMapReady(true), 300);
      return () => clearTimeout(timer);
    } else {
      setMapReady(true);
    }
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

  if (!activeStop) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorEmoji}>🗺️</Text>
        <Text style={styles.errorText}>Map unavailable</Text>
      </View>
    );
  }

  const initialRegion = {
    latitude: activeStop.lat || stops[0]?.lat || 47.6062,
    longitude: activeStop.lng || stops[0]?.lng || -122.3321,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  };

  if (!mapReady) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingEmoji}>🗺️</Text>
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

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
        onError={(e) => console.warn("Map error:", e.nativeEvent)}
      >
        {stops.map((stop, index) => (
          <Marker
            key={`stop-${index}`}
            coordinate={{ latitude: stop.lat, longitude: stop.lng }}
            title={
              completedStopIndices.includes(index) || index === activeStopIndex
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

        {activeStop && (
          <Circle
            center={{ latitude: activeStop.lat, longitude: activeStop.lng }}
            radius={50}
            fillColor="rgba(243, 156, 18, 0.15)"
            strokeColor="rgba(243, 156, 18, 0.5)"
            strokeWidth={2}
          />
        )}
      </MapView>
    </View>
  );
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
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
  errorText: { fontSize: 18, fontWeight: "bold", color: "#2C3E50" },
});

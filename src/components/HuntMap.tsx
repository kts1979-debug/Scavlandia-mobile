// src/components/HuntMap.tsx
// Displays an interactive Google Map with all hunt stop markers.
// Shows the user's current location as a blue dot.
// Markers change color based on stop status: gold=active, green=completed, gray=future

import React from "react";
import { StyleSheet, Text, View } from "react-native";
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { HuntStop } from "../services/apiService";

interface HuntMapProps {
  stops: HuntStop[]; // All stops in the hunt
  activeStopIndex: number; // Which stop user is currently on (0, 1, 2...)
  completedStopIndices: number[]; // Which stops are done
  userLocation: { latitude: number; longitude: number } | null;
}

export default function HuntMap({
  stops,
  activeStopIndex,
  completedStopIndices,
  userLocation,
}: HuntMapProps) {
  // Determine marker color based on stop status
  const getMarkerColor = (index: number): string => {
    if (completedStopIndices.includes(index)) return "#27AE60"; // Green = done
    if (index === activeStopIndex) return "#F39C12"; // Gold = active
    return "#95A5A6"; // Gray = future
  };

  // Determine what label to show on the marker
  const getMarkerLabel = (index: number): string => {
    if (completedStopIndices.includes(index)) return "✓";
    if (index === activeStopIndex) return `${index + 1}`;
    return "?"; // Future stops are hidden to preserve mystery
  };

  // Center map on the active stop
  const activeStop = stops[activeStopIndex];
  const initialRegion = {
    latitude: activeStop?.lat || stops[0]?.lat || 47.6062,
    longitude: activeStop?.lng || stops[0]?.lng || -122.3321,
    latitudeDelta: 0.02, // Controls zoom level (smaller = more zoomed in)
    longitudeDelta: 0.02,
  };

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={true} // Blue dot for user position
        showsMyLocationButton={true} // Button to re-center on user
        showsCompass={true}
      >
        {/* Draw a marker for each stop */}
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
            pinColor={getMarkerColor(index)}
          >
            {/* Custom numbered marker */}
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

        {/* Draw a 50m arrival circle around the active stop */}
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
});

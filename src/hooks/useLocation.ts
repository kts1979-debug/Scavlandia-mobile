// src/hooks/useLocation.ts
// Tracks the user's GPS position and detects arrival at hunt stops.
// Import this in any screen that needs location: import { useLocation } from '../hooks/useLocation'

import * as Location from "expo-location";
import { useEffect, useRef, useState } from "react";
import { HuntStop } from "../services/apiService";
import { config } from "../utils/config";

interface LocationCoords {
  latitude: number;
  longitude: number;
}

// ── Distance calculator ──────────────────────────────────────────
// Uses the Haversine formula to calculate distance between two GPS points.
// Returns the distance in METERS.
// You don't need to understand the math — just know it works accurately.
function getDistanceMeters(
  point1: LocationCoords,
  point2: LocationCoords,
): number {
  const R = 6371000; // Earth's radius in meters
  const lat1 = (point1.latitude * Math.PI) / 180;
  const lat2 = (point2.latitude * Math.PI) / 180;
  const dLat = ((point2.latitude - point1.latitude) * Math.PI) / 180;
  const dLon = ((point2.longitude - point1.longitude) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// ── The main hook ────────────────────────────────────────────────
export function useLocation(
  activeStop: HuntStop | null,
  onArrival: () => void,
) {
  const [userLocation, setUserLocation] = useState<LocationCoords | null>(null);
  const [locationPermission, setPermission] = useState<boolean>(false);
  const [distanceToStop, setDistanceToStop] = useState<number | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const arrivedRef = useRef(false); // Prevents triggering arrival multiple times

  // Request GPS permission when the hook first loads
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationError("Location permission is required to play Scavlandia.");
        return;
      }
      setPermission(true);
    })();
  }, []);

  // Start watching GPS when permission is granted
  useEffect(() => {
    if (!locationPermission) return;

    let subscription: Location.LocationSubscription;

    (async () => {
      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: config.LOCATION_UPDATE_INTERVAL,
          distanceInterval: 5, // Update every 5 meters of movement
        },
        (location) => {
          const coords = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };
          setUserLocation(coords);

          // Check distance to active stop
          if (activeStop) {
            const stopCoords = {
              latitude: activeStop.lat,
              longitude: activeStop.lng,
            };
            const distance = getDistanceMeters(coords, stopCoords);
            setDistanceToStop(Math.round(distance));

            // Trigger arrival if within radius and haven't already triggered
            if (
              distance <= config.ARRIVAL_RADIUS_METERS &&
              !arrivedRef.current
            ) {
              arrivedRef.current = true;
              onArrival();
            }
          }
        },
      );
    })();

    // Reset arrival flag when the active stop changes
    arrivedRef.current = false;

    // Clean up GPS subscription when component unmounts
    return () => {
      subscription?.remove();
    };
  }, [locationPermission, activeStop]);

  return { userLocation, locationPermission, distanceToStop, locationError };
}

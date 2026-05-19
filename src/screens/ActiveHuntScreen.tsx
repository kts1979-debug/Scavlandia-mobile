// src/screens/ActiveHuntScreen.tsx
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import AudioButton from "../components/AudioButton";
import HintsPanel from "../components/HintsPanel";
import HuntTimer from "../components/HuntTimer";
import LiveLeaderboard from "../components/LiveLeaderboard";
import ProgressBar from "../components/ui/ProgressBar";
import TriviaChallenge from "../components/TriviaChallenge";
import { useHuntTimer } from "../hooks/useHuntTimer";
import {
  Hunt,
  HuntStop,
  clearActiveHuntState,
  saveActiveHuntState,
  saveHuntPhotos,
  submitStop,
  completeHunt,
} from "../services/apiService";
import {
  updateAllTimeStats,
  updateSessionScore,
} from "../services/leaderboardService";
import { uploadHuntPhoto } from "../services/storageService";
import { COLORS, FONTS, RADIUS, SPACING } from "../theme";

import {
  Alert,
  Image,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import HuntMap from "../components/HuntMap";
import { useLocation } from "../hooks/useLocation";

const HUNT_HEADER_BG = require("../../assets/images/hunt_bg_2_couple_cobblestone.jpg");

export default function ActiveHuntScreen() {
  // ── Params ─────────────────────────────────────────────────────────
  const params = useLocalSearchParams();
  const hunt: Hunt = JSON.parse(params.hunt as string);
  const sessionCode = (params.sessionCode as string) || "";
  const isMicroHunt = !!(hunt as any).isMicroHunt;
  const MAX_SWAPS = isMicroHunt ? 1 : 2;

  const resumeAtStop = params.resumeAtStop
    ? parseInt(params.resumeAtStop as string) - 1
    : 0;

  const restoredPhotos: Record<string, string> = params.stopPhotos
    ? JSON.parse(params.stopPhotos as string)
    : {};

  const restoredSkipped: number[] = params.skippedStops
    ? JSON.parse(params.skippedStops as string)
    : [];

  const restoredCompleted: number[] = params.completedIndices
    ? JSON.parse(params.completedIndices as string)
    : Array.from({ length: resumeAtStop }, (_, i) => i).filter(
        (i) => !restoredSkipped.includes(hunt.stops[i]?.order),
      );

  // ── State ──────────────────────────────────────────────────────────
  const [activeStopIndex] = useState(resumeAtStop);
  const [completedIndices, setCompletedIndices] =
    useState<number[]>(restoredCompleted);
  const [totalPoints, setTotalPoints] = useState(
    params.totalPoints ? parseInt(params.totalPoints as string) : 0,
  );
  const [atLocation, setAtLocation] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hintDeductions, setHintDeductions] = useState(0);
  const [showLeaderboard, setShowLeaderboard] = useState(
    params.showLeaderboard === "true",
  );
  const [answerRevealed, setAnswerRevealed] = useState(false);
  const [answerDeductions, setAnswerDeductions] = useState(0);
  const [stopPhotos, setStopPhotos] =
    useState<Record<string, string>>(restoredPhotos);
  const [localPhotos, setLocalPhotos] =
    useState<Record<string, string>>(restoredPhotos);
  const [skippedStops, setSkippedStops] = useState<number[]>(restoredSkipped);
  const [swapsUsed, setSwapsUsed] = useState(
    params.swapsUsed ? parseInt(params.swapsUsed as string) : 0,
  );
  const [triviaCompleted, setTriviaCompleted] = useState(false);
  const [triviaBonus, setTriviaBonus] = useState(0);

  // ── Debug log on mount only ────────────────────────────────────────
  useEffect(() => {
    console.log(
      "  stop orders:",
      hunt.stops.map((s: any) => s.order),
    );
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Museum / Road Trip mode ────────────────────────────────────────
  const isMuseumHunt = !!(hunt as any).isMuseumHunt;
  const isRoadTripHunt = !!(hunt as any).isRoadTripHunt;

  const handleGetDirections = () => {
    const stop = activeStop;
    const lat = stop.mapLat || stop.lat;
    const lng = stop.mapLng || stop.lng;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    Linking.openURL(url).catch(() =>
      Alert.alert("Error", "Could not open Google Maps."),
    );
  };

  // ── Difficulty & timer ─────────────────────────────────────────────
  const difficulty = hunt.groupProfile?.difficulty || "medium";
  const timerMinutes = difficulty === "hard" ? 120 : null;
  const maxHints = difficulty === "hard" ? 2 : 3;

  const timer = useHuntTimer(timerMinutes ?? 999, () => {
    if (difficulty === "hard") {
      Alert.alert(
        "⏱ Time's Up!",
        `Your Amazing Race has ended! You completed ${completedIndices.length} of ${hunt.stops.length} stops and earned ${totalPoints} points.`,
        [
          {
            text: "See Results",
            onPress: () =>
              router.replace({
                pathname: "/hunt-complete",
                params: {
                  hunt: JSON.stringify(hunt),
                  totalPoints: String(totalPoints),
                  completedStops: String(completedIndices.length),
                  sessionCode,
                  stopPhotos: JSON.stringify(localPhotos),
                  skippedStops: JSON.stringify(skippedStops),
                  completedIndices: JSON.stringify(completedIndices),
                  hintsUsed: String(Math.round(hintDeductions / 5)),
                  answerRevealed: String(answerRevealed),
                },
              }),
          },
        ],
      );
    }
  });

  const activeStop: HuntStop = hunt.stops[activeStopIndex];

  // ── Save state for resume ──────────────────────────────────────────
  const saveState = useCallback(() => {
    saveActiveHuntState(
      hunt.huntId,
      activeStopIndex,
      completedIndices,
      totalPoints,
      stopPhotos,
      skippedStops,
      swapsUsed,
    ).catch((err) => console.warn("Save state failed:", err.message));
  }, [
    hunt.huntId,
    activeStopIndex,
    completedIndices,
    totalPoints,
    stopPhotos,
    skippedStops,
    swapsUsed,
  ]);

  useEffect(() => {
    saveState();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (completedIndices.length > 0 || skippedStops.length > 0) {
      saveState();
    }
  }, [completedIndices.length, skippedStops.length]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setTriviaCompleted(false);
    setTriviaBonus(0);
  }, [activeStopIndex]);

  // ── Location ───────────────────────────────────────────────────────
  const handleArrival = useCallback(() => {
    setAtLocation(true);
    Alert.alert(
      "📍 You made it!",
      `You've arrived at ${activeStop.locationName}! Complete the task to earn ${activeStop.pointValue} points.`,
    );
  }, [activeStop]);

  const { userLocation, distanceToStop } = useLocation(
    activeStop,
    handleArrival,
  );

  // ── Share hunt (social) ────────────────────────────────────────────
  const handleShare = async () => {
    try {
      const cityName = hunt.city?.split(",")[0] || hunt.city;
      await Share.share({
        message:
          `🗺️ I'm on a Scavlandia scavenger hunt in ${cityName}!\n\n` +
          `✅ Completed ${completedIndices.length} of ${hunt.stops.length} stops\n` +
          `⭐ Earned ${totalPoints} points so far\n\n` +
          `Join me on my next adventure — try Scavlandia! 🚀`,
        title: `Scavlandia Hunt in ${cityName}`,
      });
    } catch (error) {
      console.log("Share cancelled:", error);
    }
  };

  // ── Photo ──────────────────────────────────────────────────────────
  const handleTakePhoto = async () => {
    Alert.alert(
      "📸 Add Photo",
      "Take or choose a photo to complete this stop.\n\n📋 Photos are stored securely, used only for your hunt album, and automatically deleted after 90 days. Photo upload is optional.",
      [
        { text: "⏭ Skip Photo", onPress: () => handleSkipPhoto() },
        { text: "📷 Take Photo", onPress: () => launchCamera() },
        { text: "🖼️ Library", onPress: () => launchLibrary() },
      ],
    );
  };

  const handleSkipPhoto = async () => {
    setSubmitting(true);
    try {
      const newTotalPoints =
        totalPoints + activeStop.pointValue - answerDeductions + triviaBonus;
      const newCompletedList = [...completedIndices, activeStopIndex];
      const newSkippedList = skippedStops.filter(
        (order: number) => order !== activeStop.order,
      );
      setSkippedStops(newSkippedList);
      setCompletedIndices(newCompletedList);
      setTotalPoints(newTotalPoints);

      const allStopIndices = hunt.stops.map((_: any, i: number) => i);
      const isLastStop = allStopIndices.every(
        (i: number) =>
          newCompletedList.includes(i) ||
          newSkippedList.includes(hunt.stops[i].order),
      );

      if (isLastStop) {
        timer.stop();
        clearActiveHuntState(hunt.huntId).catch((err: any) =>
          console.warn("Clear state failed:", err.message),
        );
        updateAllTimeStats(newTotalPoints, hunt.city, hunt.huntTitle).catch(
          (err: any) =>
            console.warn("All-time stats update failed:", err.message),
        );
        saveHuntPhotos(hunt.huntId, localPhotos).catch((err: any) =>
          console.warn("Save photos failed:", err.message),
        );
        const visitedPlaceIds = hunt.stops
          .map((s: any) => s.placeId)
          .filter(Boolean);
        if (visitedPlaceIds.length > 0) {
          completeHunt(hunt.huntId, visitedPlaceIds).catch((err: any) =>
            console.warn("Save visited locations failed:", err.message),
          );
        }
        router.replace({
          pathname: "/hunt-complete",
          params: {
            hunt: JSON.stringify(hunt),
            totalPoints: String(newTotalPoints - hintDeductions),
            completedStops: String(newCompletedList.length),
            sessionCode,
            stopPhotos: JSON.stringify(localPhotos),
            skippedStops: JSON.stringify(newSkippedList),
            completedIndices: JSON.stringify(newCompletedList),
            hintsUsed: String(Math.round(hintDeductions / 5)),
            answerRevealed: String(answerRevealed),
          },
        });
        return;
      }

      router.replace({
        pathname: "/stop-complete",
        params: {
          stopName: activeStop.locationName,
          stopOrder: String(activeStop.order),
          totalStops: String(hunt.stops.length),
          pointsEarned: String(
            activeStop.pointValue - answerDeductions + triviaBonus,
          ),
          totalPoints: String(newTotalPoints - hintDeductions),
          hunt: JSON.stringify(hunt),
          sessionCode,
          stopPhotos: JSON.stringify(localPhotos),
          swapsUsed: String(swapsUsed),
          completedIndices: JSON.stringify(newCompletedList),
          skippedStops: JSON.stringify(newSkippedList),
        },
      });
    } catch (error: any) {
      console.error("Skip photo error:", error.message);
      Alert.alert("Error", "Could not complete this stop. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const launchCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Camera needed",
        "Please allow camera access in your phone settings.",
      );
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality: 0.7,
      allowsEditing: false,
      exif: false,
    });
    if (!result.canceled && result.assets[0]) {
      await handleSubmitStop(result.assets[0].uri);
    }
  };

  const launchLibrary = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Photo library needed",
        "Please allow photo library access in your phone settings.",
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
      allowsEditing: false,
      exif: false,
    });
    if (!result.canceled && result.assets[0]) {
      await handleSubmitStop(result.assets[0].uri);
    }
  };

  // ── Submit stop ────────────────────────────────────────────────────
  const handleSubmitStop = async (photoUri: string) => {
    setSubmitting(true);
    try {
      const updatedLocalPhotos = {
        ...localPhotos,
        [String(activeStop.order)]: photoUri,
      };
      setLocalPhotos(updatedLocalPhotos);

      const photoUrl = await uploadHuntPhoto(
        photoUri,
        hunt.huntId,
        activeStop.order,
      );

      const updatedPhotos = {
        ...stopPhotos,
        [String(activeStop.order)]: photoUrl,
      };
      setStopPhotos(updatedPhotos);

      await submitStop(
        hunt.huntId,
        activeStop.order,
        photoUrl,
        activeStop.pointValue,
      );

      const newTotalPoints =
        totalPoints + activeStop.pointValue - answerDeductions + triviaBonus;
      const newCompletedList = [...completedIndices, activeStopIndex];
      const newSkippedList = skippedStops.filter(
        (order: number) => order !== activeStop.order,
      );
      setSkippedStops(newSkippedList);
      setCompletedIndices(newCompletedList);
      setTotalPoints(newTotalPoints);

      if (sessionCode) {
        updateSessionScore(
          sessionCode,
          activeStop.pointValue,
          newCompletedList.length,
          hunt.city,
        ).catch((err) =>
          console.warn("Session score update failed:", err.message),
        );
      }

      const allStopIndices = hunt.stops.map((_: any, i: number) => i);
      const isLastStop = allStopIndices.every(
        (i: number) =>
          newCompletedList.includes(i) ||
          newSkippedList.includes(hunt.stops[i].order),
      );

      if (isLastStop) {
        timer.stop();
        clearActiveHuntState(hunt.huntId).catch((err: any) =>
          console.warn("Clear state failed:", err.message),
        );
        updateAllTimeStats(newTotalPoints, hunt.city, hunt.huntTitle).catch(
          (err: any) =>
            console.warn("All-time stats update failed:", err.message),
        );
        saveHuntPhotos(hunt.huntId, {
          ...localPhotos,
          ...updatedLocalPhotos,
        }).catch((err: any) =>
          console.warn("Save photos failed:", err.message),
        );
        const visitedPlaceIds = hunt.stops
          .map((s: any) => s.placeId)
          .filter(Boolean);
        if (visitedPlaceIds.length > 0) {
          completeHunt(hunt.huntId, visitedPlaceIds).catch((err: any) =>
            console.warn("Save visited locations failed:", err.message),
          );
        }
        router.replace({
          pathname: "/hunt-complete",
          params: {
            hunt: JSON.stringify(hunt),
            totalPoints: String(newTotalPoints - hintDeductions),
            completedStops: String(newCompletedList.length),
            sessionCode,
            stopPhotos: JSON.stringify({
              ...localPhotos,
              ...updatedLocalPhotos,
            }),
            skippedStops: JSON.stringify(newSkippedList),
            completedIndices: JSON.stringify(newCompletedList),
            hintsUsed: String(Math.round(hintDeductions / 5)),
            answerRevealed: String(answerRevealed),
          },
        });
        return;
      }

      router.replace({
        pathname: "/stop-complete",
        params: {
          stopName: activeStop.locationName,
          stopOrder: String(activeStop.order),
          totalStops: String(hunt.stops.length),
          pointsEarned: String(
            activeStop.pointValue - answerDeductions + triviaBonus,
          ),
          totalPoints: String(newTotalPoints - hintDeductions),
          hunt: JSON.stringify(hunt),
          sessionCode,
          stopPhotos: JSON.stringify({ ...localPhotos, ...updatedLocalPhotos }),
          swapsUsed: String(swapsUsed),
          completedIndices: JSON.stringify(newCompletedList),
          skippedStops: JSON.stringify(newSkippedList),
        },
      });
    } catch (error: any) {
      console.error("Submit stop error:", error.message);
      Alert.alert(
        "Upload Failed",
        "Could not upload your photo. Please check your internet connection and try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ── Skip stop ──────────────────────────────────────────────────────
  const handleSkipStop = () => {
    Alert.alert(
      "Skip Stop",
      `You won't earn points for ${activeStop.locationName} if you skip it.\n\nYou can come back to it later.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Skip",
          onPress: async () => {
            const updatedSkipped = [...skippedStops, activeStop.order];
            setSkippedStops(updatedSkipped);

            const allStopIndices = hunt.stops.map((_: any, i: number) => i);
            const huntComplete = allStopIndices.every(
              (i: number) =>
                completedIndices.includes(i) ||
                updatedSkipped.includes(hunt.stops[i].order),
            );

            if (huntComplete) {
              timer.stop();
              try {
                clearActiveHuntState(hunt.huntId);
              } catch (err: any) {
                console.warn("Clear state failed:", err.message);
              }
              updateAllTimeStats(totalPoints, hunt.city, hunt.huntTitle).catch(
                (err) =>
                  console.warn("All-time stats update failed:", err.message),
              );
              saveHuntPhotos(hunt.huntId, stopPhotos).catch((err) =>
                console.warn("Save photos failed:", err.message),
              );
              const visitedPlaceIds = hunt.stops
                .map((s: any) => s.placeId)
                .filter(Boolean);
              if (visitedPlaceIds.length > 0) {
                completeHunt(hunt.huntId, visitedPlaceIds).catch((err) =>
                  console.warn("Save visited locations failed:", err.message),
                );
              }
              router.replace({
                pathname: "/hunt-complete",
                params: {
                  hunt: JSON.stringify(hunt),
                  totalPoints: String(totalPoints),
                  completedStops: String(completedIndices.length),
                  sessionCode,
                  stopPhotos: JSON.stringify(localPhotos),
                  skippedStops: JSON.stringify(updatedSkipped),
                  completedIndices: JSON.stringify(completedIndices),
                  hintsUsed: String(Math.round(hintDeductions / 5)),
                  answerRevealed: String(answerRevealed),
                },
              });
              return;
            }

            router.replace({
              pathname: "/stop-complete",
              params: {
                stopName: activeStop.locationName,
                stopOrder: String(activeStop.order),
                totalStops: String(hunt.stops.length),
                pointsEarned: "0",
                totalPoints: String(totalPoints - hintDeductions),
                hunt: JSON.stringify(hunt),
                sessionCode,
                stopPhotos: JSON.stringify(localPhotos),
                swapsUsed: String(swapsUsed),
                completedIndices: JSON.stringify(completedIndices),
                skippedStops: JSON.stringify(updatedSkipped),
              },
            });
          },
        },
      ],
    );
  };

  // ── Distance helper ────────────────────────────────────────────────
  const getDistance = (
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number => {
    const R = 6371000;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  // ── Swap stop ──────────────────────────────────────────────────────
  const handleSwapStop = () => {
    if (swapsUsed >= MAX_SWAPS) {
      Alert.alert(
        "No Swaps Left",
        `You have used all ${MAX_SWAPS} swaps for this hunt.`,
      );
      return;
    }

    const reserveStops = (hunt as any).reserveStops || [];
    if (reserveStops.length === 0) {
      Alert.alert(
        "No Swaps Available",
        "There are no alternative stops available for this hunt.",
      );
      return;
    }

    const swapsRemaining = MAX_SWAPS - swapsUsed;

    Alert.alert(
      "🔄 Swap This Stop?",
      `Replace ${activeStop.locationName} with a different location?\n\nYou have ${swapsRemaining} swap${swapsRemaining > 1 ? "s" : ""} remaining.`,
      [
        { text: "Keep This Stop", style: "cancel" },
        {
          text: "Swap It",
          onPress: () => {
            const refLat = userLocation?.latitude ?? activeStop.lat;
            const refLng = userLocation?.longitude ?? activeStop.lng;
            const nextStop = hunt.stops[activeStopIndex + 1];

            const scoredReserves = reserveStops.map((reserve: any) => {
              const distFromRef = getDistance(
                refLat,
                refLng,
                reserve.lat,
                reserve.lng,
              );
              let routeScore = distFromRef;
              if (nextStop) {
                const distToNext = getDistance(
                  reserve.lat,
                  reserve.lng,
                  nextStop.lat,
                  nextStop.lng,
                );
                routeScore = distFromRef + distToNext;
              }
              return { ...reserve, _routeScore: routeScore };
            });

            scoredReserves.sort(
              (a: any, b: any) => a._routeScore - b._routeScore,
            );
            const bestReserve = scoredReserves[0];
            const remainingReserves = reserveStops.filter(
              (r: any) => r.locationName !== bestReserve.locationName,
            );

            const updatedStops = [...hunt.stops];
            updatedStops[activeStopIndex] = {
              ...bestReserve,
              order: activeStop.order,
              _routeScore: undefined,
            };

            const updatedHunt = {
              ...(hunt as any),
              stops: updatedStops,
              reserveStops: remainingReserves,
            };

            const newSwapsUsed = swapsUsed + 1;
            setSwapsUsed(newSwapsUsed);

            Alert.alert(
              "✅ Stop Swapped!",
              "Your stop has been replaced with a nearby alternative. Your new clue is waiting!",
              [
                {
                  text: "OK",
                  onPress: () =>
                    router.replace({
                      pathname: "/active-hunt",
                      params: {
                        hunt: JSON.stringify(updatedHunt),
                        sessionCode,
                        stopPhotos: JSON.stringify(localPhotos),
                        resumeAtStop: String(activeStop.order),
                        totalPoints: String(totalPoints),
                        skippedStops: JSON.stringify(skippedStops),
                        swapsUsed: String(newSwapsUsed),
                        completedIndices: JSON.stringify(completedIndices),
                      },
                    }),
                },
              ],
            );
          },
        },
      ],
    );
  };

  // ── Manual arrival ─────────────────────────────────────────────────
  const handleManualArrival = () => {
    Alert.alert("Confirm arrival", `Are you at ${activeStop.locationName}?`, [
      { text: "Not yet", style: "cancel" },
      { text: "Yes, I am here!", onPress: () => setAtLocation(true) },
    ]);
  };

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={HUNT_HEADER_BG}
          style={styles.headerBg}
          resizeMode="cover"
        />
        <View style={styles.headerBgOverlay} />
        <View style={styles.headerTop}>
          <Text style={styles.huntTitle} numberOfLines={1}>
            {isMuseumHunt ? "🏛️ " : ""}
            {hunt.huntTitle}
          </Text>
          <View style={styles.headerRight}>
            <Text style={styles.points}>
              ⭐ {totalPoints - hintDeductions - answerDeductions + triviaBonus}{" "}
              pts
            </Text>
            {sessionCode ? (
              <TouchableOpacity
                style={styles.shareBtn}
                onPress={() => setShowLeaderboard(!showLeaderboard)}
              >
                <Text style={styles.shareBtnText}>🏆</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
              <Text style={styles.shareBtnText}>📤</Text>
            </TouchableOpacity>
          </View>
        </View>

        {difficulty === "hard" && (
          <View style={styles.timerSection}>
            <HuntTimer
              display={timer.display}
              isWarning={timer.isWarning}
              isCritical={timer.isCritical}
              estimatedMinutes={120}
              stopsCompleted={completedIndices.length}
              totalStops={hunt.stops.length}
            />
          </View>
        )}

        {isMuseumHunt && (
          <View style={styles.museumBanner}>
            <Text style={styles.museumBannerText}>
              🏛️ {(hunt as any).museumName || "Museum Hunt"} — Indoor Hunt
            </Text>
          </View>
        )}
      </View>

      {isRoadTripHunt && (
        <View style={styles.museumBanner}>
          <Text style={styles.museumBannerText}>
            🚗 {(hunt as any).startLocation} → {(hunt as any).endLocation}
          </Text>
        </View>
      )}

      <View style={styles.progressContainer}>
        <ProgressBar
          current={Math.min(completedIndices.length + 1, hunt.stops.length)}
          total={hunt.stops.length}
          showLabel={true}
        />
      </View>

      {sessionCode && showLeaderboard && (
        <View style={styles.leaderboardPanel}>
          <LiveLeaderboard sessionCode={sessionCode} />
        </View>
      )}

      {/* Clue / Map toggle */}
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggle, !showMap && styles.toggleActive]}
          onPress={() => setShowMap(false)}
        >
          <Text
            style={[styles.toggleText, !showMap && styles.toggleTextActive]}
          >
            📋 Clue
          </Text>
        </TouchableOpacity>
        {!isMuseumHunt && (
          <TouchableOpacity
            style={[styles.toggle, showMap && styles.toggleActive]}
            onPress={() => setShowMap(true)}
          >
            <Text
              style={[styles.toggleText, showMap && styles.toggleTextActive]}
            >
              🗺️ Map
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {showMap && !isMuseumHunt && (
        <View style={styles.mapContainer}>
          <HuntMap
            stops={hunt.stops}
            activeStopIndex={activeStopIndex}
            completedStopIndices={completedIndices}
            userLocation={userLocation}
          />
        </View>
      )}

      {!showMap && (
        <ScrollView style={styles.clueContainer}>
          {/* Clue card */}
          <View style={styles.clueCard}>
            {(activeStop as any).interestCategory && (
              <View style={styles.interestBadge}>
                <Text style={styles.interestBadgeText}>
                  {(activeStop as any).interestCategory}
                </Text>
              </View>
            )}
            <View style={styles.clueLabelRow}>
              <Text style={styles.clueLabel}>🔍 Your Clue</Text>
              <AudioButton
                text={activeStop.clue}
                label="Read clue"
                compact={true}
              />
            </View>
            <Text style={styles.clueText}>{activeStop.clue}</Text>
            {isRoadTripHunt && (activeStop as any).driveTimeFromPrevious && (
              <Text style={styles.driveTimeText}>
                🚗 ~{(activeStop as any).driveTimeFromPrevious} from previous
                stop
              </Text>
            )}
          </View>

          {/* Gallery location — museum hunts only */}
          {isMuseumHunt && !atLocation && (activeStop as any).galleryOrRoom && (
            <View style={styles.galleryCard}>
              <Text style={styles.galleryLabel}>🗺️ Find it in</Text>
              <Text style={styles.galleryText}>
                {(activeStop as any).galleryOrRoom}
              </Text>
            </View>
          )}

          {/* Answer reveal */}
          {!atLocation && (
            <View style={styles.answerSection}>
              {answerRevealed ? (
                <View style={styles.answerRevealed}>
                  <Text style={styles.answerRevealedLabel}>
                    {isMuseumHunt ? "🎨 Artwork Answer" : "📍 Location Answer"}
                  </Text>
                  {activeStop.photoUrl && (
                    <Image
                      source={{ uri: activeStop.photoUrl }}
                      style={styles.answerPhoto}
                      resizeMode="cover"
                      onError={() => console.log("Answer photo failed to load")}
                    />
                  )}
                  <Text style={styles.answerRevealedName}>
                    {activeStop.locationName}
                  </Text>
                  <Text style={styles.answerRevealedAddress}>
                    {activeStop.address}
                  </Text>
                  <Text style={styles.answerPenaltyNote}>
                    -{answerDeductions} pts deducted
                  </Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.showAnswerBtn}
                  onPress={() => {
                    Alert.alert(
                      "🔓 Reveal Answer?",
                      `This will show you the ${isMuseumHunt ? "artwork name" : "location name"} and deduct 15 points.\n\nAre you sure?`,
                      [
                        { text: "Keep trying", style: "cancel" },
                        {
                          text: "Show me the answer",
                          style: "destructive",
                          onPress: () => {
                            setAnswerRevealed(true);
                            setAnswerDeductions((prev) => prev + 15);
                          },
                        },
                      ],
                    );
                  }}
                >
                  <Text style={styles.showAnswerBtnText}>
                    🔓 Show Answer (-15 pts)
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Hints */}
          {activeStop.hints && activeStop.hints.length > 0 && (
            <HintsPanel
              key={`hints-stop-${activeStop.order}`}
              hints={activeStop.hints}
              maxHints={maxHints}
              onHintUsed={(cost) => setHintDeductions((prev) => prev + cost)}
            />
          )}

          {/* Distance */}
          {distanceToStop !== null && !atLocation && !isMuseumHunt && (
            <View style={styles.distanceCard}>
              <Text style={styles.distanceText}>📡 {distanceToStop}m away</Text>
            </View>
          )}

          {/* Task card */}
          {atLocation && (
            <View style={styles.taskCard}>
              <View style={styles.clueLabelRow}>
                <Text style={styles.taskLabel}>
                  {isMuseumHunt ? "🎨 Your Task" : "🎯 Your Task"}
                </Text>
                <AudioButton
                  text={activeStop.task}
                  label="Read task"
                  compact={true}
                />
              </View>
              <Text style={styles.taskText}>{activeStop.task}</Text>
              <Text style={styles.funFactLabel}>
                💡{" "}
                {(activeStop as any).interestCategory
                  ? `${(activeStop as any).interestCategory} Fact`
                  : "Fun Fact"}
              </Text>
              <Text style={styles.funFactText}>{activeStop.funFact}</Text>

              {activeStop.trivia && !triviaCompleted && (
                <TriviaChallenge
                  question={activeStop.trivia.question}
                  options={activeStop.trivia.options}
                  answerIndex={activeStop.trivia.answerIndex}
                  funFact={activeStop.trivia.funFact}
                  onCorrect={() => {
                    setTriviaBonus((prev) => prev + 10);
                    setTriviaCompleted(true);
                  }}
                  onWrong={() => {
                    setTriviaBonus((prev) => prev - 5);
                    setTriviaCompleted(true);
                  }}
                  onSkip={() => setTriviaCompleted(true)}
                />
              )}

              {(!activeStop.trivia || triviaCompleted) && (
                <TouchableOpacity
                  style={styles.photoButton}
                  onPress={handleTakePhoto}
                  disabled={submitting}
                >
                  <Text style={styles.photoButtonText}>
                    {submitting
                      ? "⬆️  Uploading photo..."
                      : isMuseumHunt
                        ? "📸  Photograph the Artwork"
                        : "📸  Add Photo (optional)"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Directions — road trip only */}
          {isRoadTripHunt && !atLocation && (
            <TouchableOpacity
              style={styles.directionsBtn}
              onPress={handleGetDirections}
            >
              <Text style={styles.directionsBtnText}>
                🗺️ Get Driving Directions
              </Text>
            </TouchableOpacity>
          )}

          {/* Skip / Swap / Add Stop row */}
          {!atLocation && (
            <View style={styles.skipSwapRow}>
              <TouchableOpacity style={styles.skipBtn} onPress={handleSkipStop}>
                <Text style={styles.skipBtnText}>⏭ Skip</Text>
              </TouchableOpacity>
              {isRoadTripHunt ? (
                <TouchableOpacity
                  style={[
                    styles.swapBtn,
                    (hunt as any).addsUsed >= 6 && styles.swapBtnDisabled,
                  ]}
                  onPress={() =>
                    router.push({
                      pathname: "/add-stop",
                      params: {
                        hunt: JSON.stringify(hunt),
                        completedIndices: JSON.stringify(completedIndices),
                        activeStopIndex: String(activeStopIndex),
                        totalPoints: String(totalPoints),
                        sessionCode,
                        stopPhotos: JSON.stringify(localPhotos),
                        skippedStops: JSON.stringify(skippedStops),
                        swapsUsed: String(swapsUsed),
                      },
                    })
                  }
                  disabled={(hunt as any).addsUsed >= 6}
                >
                  <Text
                    style={[
                      styles.swapBtnText,
                      (hunt as any).addsUsed >= 6 && styles.swapBtnTextDisabled,
                    ]}
                  >
                    ➕ Add Stop ({6 - ((hunt as any).addsUsed || 0)} left)
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.swapBtn,
                    swapsUsed >= MAX_SWAPS && styles.swapBtnDisabled,
                  ]}
                  onPress={handleSwapStop}
                  disabled={swapsUsed >= MAX_SWAPS}
                >
                  <Text
                    style={[
                      styles.swapBtnText,
                      swapsUsed >= MAX_SWAPS && styles.swapBtnTextDisabled,
                    ]}
                  >
                    🔄 Swap ({MAX_SWAPS - swapsUsed} left)
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Manual arrival */}
          {!atLocation && (
            <TouchableOpacity
              style={styles.arrivalButton}
              onPress={handleManualArrival}
            >
              <Text style={styles.arrivalButtonText}>
                {isMuseumHunt
                  ? "🎨  I found the artwork!"
                  : isRoadTripHunt
                    ? "🚗  I've arrived at this stop!"
                    : "📍  I'm at this location!"}
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.offWhite },
  header: { backgroundColor: "transparent", overflow: "hidden" },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  huntTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    flex: 1,
    marginRight: 12,
  },
  headerRight: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
  points: { fontSize: 16, color: "#F39C12", fontWeight: "bold" },
  shareBtn: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: RADIUS.round,
    width: 34,
    height: 34,
    justifyContent: "center",
    alignItems: "center",
  },
  shareBtnText: { fontSize: 16 },
  timerSection: {
    alignItems: "center",
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  museumBanner: {
    backgroundColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  museumBannerText: {
    color: "#b3d9f5",
    fontSize: FONTS.sizes.sm,
    fontStyle: "italic",
    textAlign: "center",
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.white,
  },
  leaderboardPanel: { margin: SPACING.sm },
  toggleRow: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#D5D8DC",
  },
  toggle: { flex: 1, padding: 12, alignItems: "center" },
  toggleActive: { borderBottomWidth: 3, borderBottomColor: "#3c89d6" },
  toggleText: { fontSize: 15, color: "#BDC3C7" },
  toggleTextActive: { color: "#3c89d6", fontWeight: "bold" },
  mapContainer: { flex: 1 },
  clueContainer: { flex: 1, padding: 16 },
  clueCard: {
    backgroundColor: "#3c89d6",
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
  },
  clueLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  clueLabel: { fontSize: 13, color: "#b3d9f5", fontWeight: "600" },
  clueText: { fontSize: 17, color: "#FFFFFF", lineHeight: 26 },
  galleryCard: {
    backgroundColor: "#e8f4fd",
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  galleryLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.primary,
    fontWeight: FONTS.weights.bold,
    marginBottom: 4,
  },
  galleryText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.black,
    fontWeight: FONTS.weights.medium,
  },
  distanceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    alignItems: "center",
  },
  distanceText: { fontSize: 15, color: "#5D6D7E" },
  taskCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
  },
  taskLabel: { fontSize: 13, color: "#3c89d6", fontWeight: "600" },
  taskText: {
    fontSize: 16,
    color: "#2C3E50",
    marginBottom: 16,
    lineHeight: 24,
  },
  funFactLabel: {
    fontSize: 13,
    color: "#27AE60",
    marginBottom: 6,
    fontWeight: "600",
  },
  funFactText: {
    fontSize: 14,
    color: "#5D6D7E",
    lineHeight: 22,
    marginBottom: 20,
  },
  photoButton: {
    backgroundColor: "#27AE60",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
  },
  photoButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
  skipSwapRow: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  skipBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: COLORS.midGray,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    alignItems: "center",
    backgroundColor: COLORS.white,
  },
  skipBtnText: {
    color: COLORS.darkGray,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
  },
  swapBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    alignItems: "center",
    backgroundColor: COLORS.white,
  },
  swapBtnDisabled: { borderColor: COLORS.midGray },
  swapBtnText: {
    color: COLORS.primary,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
  },
  swapBtnTextDisabled: { color: COLORS.midGray },
  arrivalButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#3c89d6",
    padding: 14,
    alignItems: "center",
    marginBottom: 20,
  },
  arrivalButtonText: { color: "#3c89d6", fontSize: 15, fontWeight: "600" },
  answerSection: { marginBottom: SPACING.sm },
  showAnswerBtn: {
    borderWidth: 1.5,
    borderColor: COLORS.danger,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    alignItems: "center",
    backgroundColor: COLORS.lred,
  },
  showAnswerBtnText: {
    color: COLORS.danger,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
  },
  answerRevealed: {
    backgroundColor: COLORS.lred,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.danger,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  answerRevealedLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.danger,
    fontWeight: FONTS.weights.bold,
    marginBottom: 4,
  },
  answerRevealedName: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.black,
    marginBottom: 2,
  },
  answerRevealedAddress: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
    marginBottom: SPACING.sm,
  },
  answerPenaltyNote: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.danger,
    fontStyle: "italic",
  },
  answerPhoto: {
    width: "100%",
    height: 180,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
    marginTop: SPACING.xs,
  },
  directionsBtn: {
    backgroundColor: "#27AE60",
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  directionsBtnText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
  },
  driveTimeText: {
    fontSize: FONTS.sizes.xs,
    color: "#b3d9f5",
    marginTop: 8,
    fontStyle: "italic",
  },
  interestBadge: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.round,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    marginBottom: SPACING.xs,
  },
  interestBadgeText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.bold,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  headerBg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
  headerBgOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(25, 50, 85, 0.75)",
  },
});

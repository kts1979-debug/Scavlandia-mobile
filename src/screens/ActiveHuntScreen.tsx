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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import HuntMap from "../components/HuntMap";
import { useLocation } from "../hooks/useLocation";

// ── Constants ──────────────────────────────────────────────────────
const MAX_SWAPS = 2;

export default function ActiveHuntScreen() {
  // ── Params ─────────────────────────────────────────────────────────
  const params = useLocalSearchParams();
  const hunt: Hunt = JSON.parse(params.hunt as string);
  const sessionCode = (params.sessionCode as string) || "";

  const resumeAtStop = params.resumeAtStop
    ? parseInt(params.resumeAtStop as string) - 1
    : 0;

  const restoredPhotos: Record<string, string> = params.stopPhotos
    ? JSON.parse(params.stopPhotos as string)
    : {};

  const restoredSkipped: number[] = params.skippedStops
    ? JSON.parse(params.skippedStops as string)
    : [];

  const initialCompleted = Array.from({ length: resumeAtStop }, (_, i) => i);

  // ── Museum mode ────────────────────────────────────────────────────
  const isMuseumHunt = !!(hunt as any).isMuseumHunt;

  // ── State ──────────────────────────────────────────────────────────
  const [activeStopIndex] = useState(resumeAtStop);
  const [completedIndices, setCompletedIndices] =
    useState<number[]>(initialCompleted);
  const [totalPoints, setTotalPoints] = useState(
    params.totalPoints ? parseInt(params.totalPoints as string) : 0,
  );
  const [atLocation, setAtLocation] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hintDeductions, setHintDeductions] = useState(0);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [answerRevealed, setAnswerRevealed] = useState(false);
  const [answerDeductions, setAnswerDeductions] = useState(0);
  const [stopPhotos, setStopPhotos] = useState<Record<string, string>>({});
  const [localPhotos, setLocalPhotos] =
    useState<Record<string, string>>(restoredPhotos);
  const [skippedStops, setSkippedStops] = useState<number[]>(restoredSkipped);
  const [swapsUsed, setSwapsUsed] = useState(
    params.swapsUsed ? parseInt(params.swapsUsed as string) : 0,
  );
  const [triviaCompleted, setTriviaCompleted] = useState(false);
  const [triviaBonus, setTriviaBonus] = useState(0);

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

  // Save state whenever progress changes
  useEffect(() => {
    if (completedIndices.length > 0 || skippedStops.length > 0) {
      saveState();
    }
  }, [completedIndices.length, skippedStops.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset trivia state when stop changes
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

  // ── Photo ──────────────────────────────────────────────────────────
  const handleTakePhoto = async () => {
    Alert.alert("📸 Add Photo", "How would you like to add your photo?", [
      { text: "Cancel", style: "cancel" },
      { text: "📷 Take Photo", onPress: () => launchCamera() },
      { text: "🖼️ Choose from Library", onPress: () => launchLibrary() },
    ]);
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
      console.log("Uploading photo...");

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
      console.log("Photo uploaded, submitting stop...");

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

      // Include trivia bonus in points calculation
      const newTotalPoints =
        totalPoints + activeStop.pointValue - answerDeductions + triviaBonus;
      const newCompletedList = [...completedIndices, activeStopIndex];

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

      const isLastStop = activeStopIndex >= hunt.stops.length - 1;

      if (isLastStop) {
        timer.stop();
        updateAllTimeStats(newTotalPoints, hunt.city, hunt.huntTitle).catch(
          (err) => console.warn("All-time stats update failed:", err.message),
        );
        saveHuntPhotos(hunt.huntId, updatedPhotos).catch((err) =>
          console.warn("Save photos failed:", err.message),
        );
        clearActiveHuntState(hunt.huntId).catch((err) =>
          console.warn("Clear state failed:", err.message),
        );

        // Save visited locations for novel hunt insurance
        const visitedPlaceIds = hunt.stops
          .map((s: any) => s.placeId)
          .filter(Boolean);
        if (visitedPlaceIds.length > 0) {
          completeHunt(hunt.huntId, visitedPlaceIds).catch((err) =>
            console.warn("Save visited locations failed:", err.message),
          );
        }
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
          stopPhotos: JSON.stringify(updatedLocalPhotos),
          skippedStops: JSON.stringify(skippedStops),
          swapsUsed: String(swapsUsed),
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
      "⏭ Skip This Stop?",
      `You won't earn points for ${activeStop.locationName} if you skip it.\n\nYou can come back to it at the end of the hunt.`,
      [
        { text: "Keep Trying", style: "cancel" },
        {
          text: "Skip Stop",
          style: "destructive",
          onPress: () => {
            const updatedSkipped = [...skippedStops, activeStop.order];
            setSkippedStops(updatedSkipped);
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
                skippedStops: JSON.stringify(updatedSkipped),
                swapsUsed: String(swapsUsed),
                wasSkipped: "true",
              },
            });
          },
        },
      ],
    );
  };

  // ── Swap stop ──────────────────────────────────────────────────────
  const handleSwapStop = () => {
    if (swapsUsed >= MAX_SWAPS) {
      Alert.alert("No Swaps Left", "You have used all 2 swaps for this hunt.");
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
            const newStop = reserveStops[swapsUsed];
            const updatedStops = [...hunt.stops];
            updatedStops[activeStopIndex] = {
              ...newStop,
              order: activeStop.order,
            };

            const updatedHunt = {
              ...(hunt as any),
              stops: updatedStops,
              reserveStops: reserveStops.slice(swapsUsed + 1),
            };

            const newSwapsUsed = swapsUsed + 1;
            setSwapsUsed(newSwapsUsed);

            Alert.alert(
              "✅ Stop Swapped!",
              "This stop has been replaced with a new location. Your new clue is waiting!",
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

  // ── Share ──────────────────────────────────────────────────────────
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

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
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

        {/* Timer — only shown for Amazing Race */}
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

        {/* Museum banner */}
        {isMuseumHunt && (
          <View style={styles.museumBanner}>
            <Text style={styles.museumBannerText}>
              🏛️ {(hunt as any).museumName || "Museum Hunt"} — Indoor Hunt
            </Text>
          </View>
        )}
      </View>

      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <ProgressBar
          current={Math.min(completedIndices.length + 1, hunt.stops.length)}
          total={hunt.stops.length}
          showLabel={true}
        />
      </View>

      {/* Live leaderboard panel */}
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

      {/* Map view */}
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

      {/* Clue view */}
      {!showMap && (
        <ScrollView style={styles.clueContainer}>
          {/* Clue card */}
          <View style={styles.clueCard}>
            <View style={styles.clueLabelRow}>
              <Text style={styles.clueLabel}>🔍 Your Clue</Text>
              <AudioButton
                text={activeStop.clue}
                label="Read clue"
                compact={true}
              />
            </View>
            <Text style={styles.clueText}>{activeStop.clue}</Text>
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

          {/* Distance — hidden for museum hunts */}
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
              <Text style={styles.funFactLabel}>💡 Fun Fact</Text>
              <Text style={styles.funFactText}>{activeStop.funFact}</Text>

              {/* Trivia challenge — shown before photo if trivia exists */}
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

              {/* Photo button — only shown after trivia or if no trivia */}
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
                        : "📸  Add Photo to Complete"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Skip and swap buttons — shown before arrival */}
          {!atLocation && (
            <View style={styles.skipSwapRow}>
              <TouchableOpacity style={styles.skipBtn} onPress={handleSkipStop}>
                <Text style={styles.skipBtnText}>⏭ Skip</Text>
              </TouchableOpacity>
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
            </View>
          )}

          {/* Manual arrival button */}
          {!atLocation && (
            <TouchableOpacity
              style={styles.arrivalButton}
              onPress={handleManualArrival}
            >
              <Text style={styles.arrivalButtonText}>
                {isMuseumHunt
                  ? "🎨  I found the artwork!"
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
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  header: { backgroundColor: COLORS.primary },
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
    color: "#AED6F1",
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
  toggleActive: { borderBottomWidth: 3, borderBottomColor: "#1A5276" },
  toggleText: { fontSize: 15, color: "#95A5A6" },
  toggleTextActive: { color: "#1A5276", fontWeight: "bold" },
  mapContainer: { flex: 1 },
  clueContainer: { flex: 1, padding: 16 },
  clueCard: {
    backgroundColor: "#1A5276",
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
  clueLabel: { fontSize: 13, color: "#AED6F1", fontWeight: "600" },
  clueText: { fontSize: 17, color: "#FFFFFF", lineHeight: 26 },
  galleryCard: {
    backgroundColor: "#EBF5FB",
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
  taskLabel: { fontSize: 13, color: "#2E86C1", fontWeight: "600" },
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
    borderColor: "#2E86C1",
    padding: 14,
    alignItems: "center",
    marginBottom: 20,
  },
  arrivalButtonText: { color: "#2E86C1", fontSize: 15, fontWeight: "600" },
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
});

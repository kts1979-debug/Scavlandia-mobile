// src/screens/HuntSetupScreen.tsx
// Shown before a hunt starts — lets users choose solo/team mode
// and create or join a leaderboard session.

import * as Clipboard from "expo-clipboard";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { createSession, joinSession } from "../services/leaderboardService";
import { COLORS, FONTS, RADIUS, SPACING } from "../theme";

export default function HuntSetupScreen() {
  const params = useLocalSearchParams();
  const hunt = JSON.parse(params.hunt as string);

  const [mode, setMode] = useState<"solo" | "session">("solo");
  const [sessionAction, setAction] = useState<"create" | "join">("create");
  const [isTeam, setIsTeam] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleStartHunt = async (sessionCode?: string) => {
    router.replace({
      pathname: "/safety-warning",
      params: {
        hunt: JSON.stringify(hunt),
        sessionCode: sessionCode || "",
      },
    });
  };

  const handleSolo = () => {
    handleStartHunt();
  };

  const handleCreateSession = async () => {
    if (isTeam && !teamName.trim()) {
      return Alert.alert("Missing info", "Please enter a team name");
    }
    setLoading(true);
    try {
      const result = await createSession(
        hunt.huntTitle,
        hunt.city,
        isTeam,
        teamName.trim() || undefined,
      );

      // Show the code with share options
      showSessionCode(result.sessionCode);
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.error || "Failed to create session",
      );
    } finally {
      setLoading(false);
    }
  };

  const showSessionCode = (sessionCode: string) => {
    Alert.alert(
      "🎉 Session Created!",
      `Your session code is:\n\n${sessionCode}\n\nShare this with friends — they can hunt in any city and still compete with you!`,
      [
        {
          text: "📋 Copy Code",
          onPress: async () => {
            // Copy to clipboard
            await Clipboard.setStringAsync(sessionCode);
            Alert.alert(
              "✅ Copied!",
              "Code copied to clipboard. Paste it anywhere to share.",
              [
                {
                  text: "Start Hunt",
                  onPress: () => handleStartHunt(sessionCode),
                },
              ],
            );
          },
        },
        {
          text: "📤 Share Code",
          onPress: async () => {
            await Share.share({
              message:
                `🗺️ Join my Scavlandia scavenger hunt!\n\n` +
                `Use session code: ${sessionCode}\n\n` +
                `Open Scavlandia, start a hunt in any city, ` +
                `tap "Compete" and enter this code to join my leaderboard. Let's see who wins! 🏆`,
              title: "Join my Scavlandia Hunt!",
            });
          },
        },
        {
          text: "Start Hunt",
          onPress: () => handleStartHunt(sessionCode),
        },
      ],
    );
  };

  const handleJoinSession = async () => {
    if (!joinCode.trim()) {
      return Alert.alert("Missing info", "Please enter a session code");
    }
    if (isTeam && !teamName.trim()) {
      return Alert.alert("Missing info", "Please enter a team name");
    }
    setLoading(true);
    try {
      const result = await joinSession(
        joinCode.trim().toUpperCase(),
        hunt.city,
        isTeam,
        teamName.trim() || undefined,
      );
      Alert.alert(
        "✅ Joined Session!",
        `You joined: ${result.huntTitle || "Scavlandia Hunt"}`,
        [
          {
            text: "Start Hunt",
            onPress: () => handleStartHunt(joinCode.trim().toUpperCase()),
          },
        ],
      );
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.error ||
          "Session not found. Check the code and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={styles.emoji}>🏁</Text>
        <Text style={styles.title}>Ready to Hunt?</Text>
        <Text style={styles.huntName} numberOfLines={2}>
          {hunt.huntTitle}
        </Text>
        <Text style={styles.city}>📍 {hunt.city}</Text>

        {/* Solo vs Session */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>How are you playing?</Text>
          <View style={styles.modeRow}>
            <TouchableOpacity
              style={[styles.modeBtn, mode === "solo" && styles.modeBtnActive]}
              onPress={() => setMode("solo")}
            >
              <Text style={styles.modeEmoji}>🧍</Text>
              <Text
                style={[
                  styles.modeLabel,
                  mode === "solo" && styles.modeLabelActive,
                ]}
              >
                Solo
              </Text>
              <Text
                style={[
                  styles.modeSub,
                  mode === "solo" && styles.modeSubActive,
                ]}
              >
                Just you
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modeBtn,
                mode === "session" && styles.modeBtnActive,
              ]}
              onPress={() => setMode("session")}
            >
              <Text style={styles.modeEmoji}>👥</Text>
              <Text
                style={[
                  styles.modeLabel,
                  mode === "session" && styles.modeLabelActive,
                ]}
              >
                Compete
              </Text>
              <Text
                style={[
                  styles.modeSub,
                  mode === "session" && styles.modeSubActive,
                ]}
              >
                With friends
              </Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Session options */}
        {mode === "session" && (
          <>
            {/* Individual vs Team */}
            <Card style={styles.section}>
              <Text style={styles.sectionTitle}>Individual or team?</Text>
              <View style={styles.modeRow}>
                <TouchableOpacity
                  style={[styles.modeBtn, !isTeam && styles.modeBtnActive]}
                  onPress={() => setIsTeam(false)}
                >
                  <Text style={styles.modeEmoji}>🏅</Text>
                  <Text
                    style={[
                      styles.modeLabel,
                      !isTeam && styles.modeLabelActive,
                    ]}
                  >
                    Individual
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modeBtn, isTeam && styles.modeBtnActive]}
                  onPress={() => setIsTeam(true)}
                >
                  <Text style={styles.modeEmoji}>🏆</Text>
                  <Text
                    style={[styles.modeLabel, isTeam && styles.modeLabelActive]}
                  >
                    Team
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Team name input */}
              {isTeam && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Team Name</Text>
                  <TextInput
                    style={styles.input}
                    value={teamName}
                    onChangeText={setTeamName}
                    placeholder="e.g. Team Rocket"
                    placeholderTextColor={COLORS.midGray}
                    maxLength={20}
                  />
                </View>
              )}
            </Card>

            {/* Create or Join */}
            <Card style={styles.section}>
              <Text style={styles.sectionTitle}>Create or join a session?</Text>
              <View style={styles.modeRow}>
                <TouchableOpacity
                  style={[
                    styles.modeBtn,
                    sessionAction === "create" && styles.modeBtnActive,
                  ]}
                  onPress={() => setAction("create")}
                >
                  <Text style={styles.modeEmoji}>➕</Text>
                  <Text
                    style={[
                      styles.modeLabel,
                      sessionAction === "create" && styles.modeLabelActive,
                    ]}
                  >
                    Create
                  </Text>
                  <Text
                    style={[
                      styles.modeSub,
                      sessionAction === "create" && styles.modeSubActive,
                    ]}
                  >
                    Get a code
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modeBtn,
                    sessionAction === "join" && styles.modeBtnActive,
                  ]}
                  onPress={() => setAction("join")}
                >
                  <Text style={styles.modeEmoji}>🔗</Text>
                  <Text
                    style={[
                      styles.modeLabel,
                      sessionAction === "join" && styles.modeLabelActive,
                    ]}
                  >
                    Join
                  </Text>
                  <Text
                    style={[
                      styles.modeSub,
                      sessionAction === "join" && styles.modeSubActive,
                    ]}
                  >
                    Enter a code
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Join code input */}
              {sessionAction === "join" && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Session Code</Text>
                  <TextInput
                    style={[styles.input, styles.codeInput]}
                    value={joinCode}
                    onChangeText={(text) => setJoinCode(text.toUpperCase())}
                    placeholder="e.g. HNT4X2"
                    placeholderTextColor={COLORS.midGray}
                    maxLength={6}
                    autoCapitalize="characters"
                  />
                </View>
              )}
            </Card>
          </>
        )}

        {/* Action buttons */}
        {mode === "solo" ? (
          <Button
            label="Start Hunt"
            onPress={handleSolo}
            variant="accent"
            size="lg"
            emoji="🚀"
            style={styles.startBtn}
          />
        ) : sessionAction === "create" ? (
          <Button
            label="Create Session & Start"
            onPress={handleCreateSession}
            variant="accent"
            size="lg"
            emoji="➕"
            loading={loading}
            style={styles.startBtn}
          />
        ) : (
          <Button
            label="Join Session & Start"
            onPress={handleJoinSession}
            variant="accent"
            size="lg"
            emoji="🔗"
            loading={loading}
            style={styles.startBtn}
          />
        )}

        {/* Skip to solo */}
        {mode === "session" && (
          <Button
            label="Skip — Play Solo Instead"
            onPress={handleSolo}
            variant="ghost"
            size="md"
            style={styles.skipBtn}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primary },
  scroll: { padding: SPACING.lg, paddingBottom: 40 },
  emoji: {
    fontSize: 64,
    textAlign: "center",
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.white,
    textAlign: "center",
    marginBottom: 8,
  },
  huntName: {
    fontSize: FONTS.sizes.md,
    color: "#AED6F1",
    textAlign: "center",
    marginBottom: 4,
  },
  city: {
    fontSize: FONTS.sizes.sm,
    color: "#AED6F1",
    textAlign: "center",
    marginBottom: SPACING.xl,
  },
  section: { marginBottom: SPACING.md },
  sectionTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  modeRow: { flexDirection: "row", gap: SPACING.sm },
  modeBtn: {
    flex: 1,
    alignItems: "center",
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.midGray,
    backgroundColor: COLORS.offWhite,
  },
  modeBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  modeEmoji: { fontSize: 28, marginBottom: 6 },
  modeLabel: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.black,
    marginBottom: 2,
  },
  modeLabelActive: { color: COLORS.white },
  modeSub: { fontSize: FONTS.sizes.xs, color: COLORS.darkGray },
  modeSubActive: { color: "rgba(255,255,255,0.7)" },
  inputGroup: { marginTop: SPACING.md },
  inputLabel: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
    color: COLORS.primary,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1.5,
    borderColor: COLORS.midGray,
    borderRadius: RADIUS.md,
    padding: 14,
    fontSize: FONTS.sizes.md,
    color: COLORS.black,
    backgroundColor: COLORS.offWhite,
  },
  codeInput: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.heavy,
    textAlign: "center",
    letterSpacing: 6,
  },
  startBtn: { marginTop: SPACING.md },
  skipBtn: { marginTop: SPACING.sm },
});

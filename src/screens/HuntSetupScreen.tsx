// src/screens/HuntSetupScreen.tsx
import * as Clipboard from "expo-clipboard";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
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
import { generateShareCode } from "../services/apiService";
import { COLORS, FONTS, RADIUS, SPACING } from "../theme";

const HERO_BG = require("../../assets/images/hunt_bg_4_friends_mountains.jpg");

export default function HuntSetupScreen() {
  const params = useLocalSearchParams();
  const hunt = JSON.parse(params.hunt as string);
  const playMode = (params.playMode as string) || "solo";
  const isSolo = playMode === "solo";

  const [sessionAction, setAction] = useState<"create" | "join">("create");
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [shareCode, setShareCode] = useState<string | null>(null);
  const [loadingShareCode, setLoadingShareCode] = useState(false);

  const handleStartHunt = async (sessionCode?: string) => {
    router.replace({
      pathname: "/safety-warning",
      params: { hunt: JSON.stringify(hunt), sessionCode: sessionCode || "" },
    });
  };

  const handleGenerateShareCode = async () => {
    setLoadingShareCode(true);
    try {
      const code = await generateShareCode(hunt.huntId);
      setShareCode(code);
    } catch {
      Alert.alert(
        "Error",
        "Could not generate share code. You can still start your hunt.",
      );
    } finally {
      setLoadingShareCode(false);
    }
  };

  const handleCreateSession = async () => {
    setLoading(true);
    try {
      const result = await createSession(
        hunt.huntTitle,
        hunt.city,
        false,
        undefined,
      );
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
            await Clipboard.setStringAsync(sessionCode);
            Alert.alert("✅ Copied!", "Code copied to clipboard.", [
              {
                text: "Start Hunt",
                onPress: () => handleStartHunt(sessionCode),
              },
            ]);
          },
        },
        {
          text: "📤 Share Code",
          onPress: async () => {
            await Share.share({
              message: `🗺️ Join my Scavlandia scavenger hunt!\n\nUse session code: ${sessionCode}\n\nOpen Scavlandia, start a hunt in any city, tap "Compete" and enter this code. Let's see who wins! 🏆`,
            });
          },
        },
        { text: "Start Hunt", onPress: () => handleStartHunt(sessionCode) },
      ],
    );
  };

  const handleJoinSession = async () => {
    if (!joinCode.trim())
      return Alert.alert("Missing info", "Please enter a session code");
    setLoading(true);
    try {
      const result = await joinSession(
        joinCode.trim().toUpperCase(),
        hunt.city,
        false,
        undefined,
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
    <View style={styles.container}>
      <Image source={HERO_BG} style={styles.heroBg} resizeMode="cover" />
      <View style={styles.overlay} />

      <SafeAreaView style={styles.safeArea}>
        {/* Hero section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroEmoji}>🏁</Text>
          <Text style={styles.heroTitle}>Ready to Hunt?</Text>
          <Text style={styles.huntName} numberOfLines={2}>
            {hunt.huntTitle}
          </Text>
          <View style={styles.cityBadge}>
            <Text style={styles.cityBadgeText}>📍 {hunt.city}</Text>
          </View>
        </View>

        {/* White card */}
        <ScrollView
          style={styles.card}
          contentContainerStyle={styles.cardContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ── SOLO FLOW ─────────────────────────────────── */}
          {isSolo && (
            <>
              <Card style={styles.section}>
                <Text style={styles.sectionTitle}>🔗 Share This Hunt</Text>
                <Text style={styles.sectionDesc}>
                  Want a friend to follow along on the same hunt? Generate a
                  share code and send it to them.
                </Text>
                {shareCode ? (
                  <View style={styles.codeBox}>
                    <Text style={styles.codeText}>{shareCode}</Text>
                    <TouchableOpacity
                      style={styles.copyBtn}
                      onPress={async () => {
                        await Clipboard.setStringAsync(shareCode);
                        Alert.alert(
                          "Copied!",
                          "Share code copied to clipboard.",
                        );
                      }}
                    >
                      <Text style={styles.copyBtnText}>📋 Copy</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <Button
                    label={
                      loadingShareCode ? "Generating..." : "Generate Share Code"
                    }
                    onPress={handleGenerateShareCode}
                    variant="secondary"
                    size="md"
                    emoji="🔗"
                    loading={loadingShareCode}
                    style={styles.shareCodeBtn}
                  />
                )}
                <Text style={styles.shareNote}>
                  Each code can only be used once. Optional — you can skip this
                  and start now.
                </Text>
              </Card>

              <Button
                label="Start Hunt"
                onPress={() => handleStartHunt()}
                variant="accent"
                size="lg"
                emoji="🚀"
                style={styles.startBtn}
              />
            </>
          )}

          {/* ── COMPETE FLOW ──────────────────────────────── */}
          {!isSolo && (
            <>
              <Card style={styles.section}>
                <Text style={styles.competingExplainer}>
                  {
                    "🌍 Everyone generates their own unique hunt in whatever city they are in — your scores are combined on a live leaderboard. May the best explorer win!"
                  }
                </Text>
              </Card>

              {/* Create or Join */}
              <Card style={styles.section}>
                <Text style={styles.sectionTitle}>
                  Create or join a session?
                </Text>
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

              {sessionAction === "create" ? (
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

              <Button
                label="Skip — Play Solo Instead"
                onPress={() => handleStartHunt()}
                variant="ghost"
                size="md"
                style={styles.skipBtn}
              />
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primary },
  heroBg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(25, 50, 85, 0.68)",
  },
  safeArea: { flex: 1 },
  heroSection: {
    alignItems: "center",
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  heroEmoji: { fontSize: 56, marginBottom: SPACING.sm },
  heroTitle: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.white,
    marginBottom: 8,
  },
  huntName: {
    fontSize: FONTS.sizes.md,
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    marginBottom: SPACING.sm,
  },
  cityBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: RADIUS.round,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
  },
  cityBadgeText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
  },
  card: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  cardContent: { padding: SPACING.lg, paddingBottom: 40 },
  section: { marginBottom: SPACING.md },
  sectionTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  sectionDesc: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  competingExplainer: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
    lineHeight: 20,
    textAlign: "center",
  },
  codeBox: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: "center",
    marginBottom: SPACING.sm,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  codeText: {
    fontSize: 32,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.white,
    letterSpacing: 6,
  },
  copyBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
  },
  copyBtnText: {
    color: COLORS.white,
    fontWeight: FONTS.weights.bold,
    fontSize: FONTS.sizes.sm,
  },
  shareCodeBtn: { marginBottom: SPACING.sm },
  shareNote: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.midGray,
    fontStyle: "italic",
    textAlign: "center",
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

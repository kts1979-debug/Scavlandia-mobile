// src/screens/JoinHuntScreen.tsx
// Receiver enters a 6-char share code to get a copy of a friend's hunt.

import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { joinHunt } from "../services/apiService";
import { COLORS, FONTS, RADIUS, SPACING } from "../theme";

export default function JoinHuntScreen() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handleJoin = async () => {
    const trimmed = code.trim().toUpperCase();
    if (trimmed.length !== 6) {
      Alert.alert("Invalid code", "Please enter the full 6-character code.");
      return;
    }

    setLoading(true);
    try {
      const result = await joinHunt(trimmed);
      const hunt = result.hunt;

      Alert.alert(
        "🎉 Hunt Joined!",
        `You've joined "${hunt.huntTitle}". Ready to start?`,
        [
          {
            text: "Let's go!",
            onPress: () =>
              router.replace({
                pathname: "/safety-warning",
                params: {
                  hunt: JSON.stringify(hunt),
                  sessionCode: "",
                },
              }),
          },
        ],
      );
    } catch (error: any) {
      const msg =
        error.response?.data?.error ||
        "Could not join hunt. Check the code and try again.";
      Alert.alert("Couldn't join", msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (text: string) => {
    // Only allow alphanumeric, auto-uppercase, max 6 chars
    const clean = text
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 6);
    setCode(clean);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.emoji}>🤝</Text>
        <Text style={styles.title}>Join a Hunt</Text>
        <Text style={styles.subtitle}>
          Enter the 6-character code your friend shared with you to get a copy
          of their hunt on your device.
        </Text>

        {/* Code input */}
        <TouchableOpacity
          style={styles.codeInputContainer}
          onPress={() => inputRef.current?.focus()}
          activeOpacity={1}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.codeBox,
                i < code.length && styles.codeBoxFilled,
                i === code.length && styles.codeBoxActive,
              ]}
            >
              <Text style={styles.codeChar}>{code[i] || ""}</Text>
            </View>
          ))}
        </TouchableOpacity>

        {/* Hidden actual input */}
        <TextInput
          ref={inputRef}
          value={code}
          onChangeText={handleCodeChange}
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={6}
          style={styles.hiddenInput}
          autoFocus
        />

        <TouchableOpacity
          style={[
            styles.joinBtn,
            (code.length !== 6 || loading) && styles.joinBtnDisabled,
          ]}
          onPress={handleJoin}
          disabled={code.length !== 6 || loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Text style={styles.joinBtnText}>Join Hunt →</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.note}>
          {
            "Each share code can only be used once. You'll get your own copy of the hunt to complete independently."
          }
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.offWhite },
  header: {
    padding: SPACING.md,
    paddingBottom: 0,
  },
  backText: {
    color: COLORS.primary,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.xl,
    paddingBottom: 80,
  },
  emoji: { fontSize: 64, marginBottom: SPACING.md },
  title: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.primary,
    marginBottom: SPACING.sm,
    textAlign: "center",
  },
  subtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.darkGray,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  codeInputContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: SPACING.xl,
  },
  codeBox: {
    width: 44,
    height: 56,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.midGray,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
  },
  codeBoxFilled: {
    borderColor: COLORS.primary,
    backgroundColor: "#e8f4fd",
  },
  codeBoxActive: {
    borderColor: COLORS.accent,
    borderWidth: 2.5,
  },
  codeChar: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.primary,
    letterSpacing: 1,
  },
  hiddenInput: {
    position: "absolute",
    opacity: 0,
    height: 0,
    width: 0,
  },
  joinBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    alignItems: "center",
    width: "100%",
    marginBottom: SPACING.md,
  },
  joinBtnDisabled: { backgroundColor: COLORS.midGray },
  joinBtnText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.heavy,
  },
  note: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.midGray,
    textAlign: "center",
    fontStyle: "italic",
    lineHeight: 18,
  },
});

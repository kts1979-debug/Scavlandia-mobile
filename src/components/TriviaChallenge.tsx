// src/components/TriviaChallenge.tsx
// Trivia challenge shown after arriving at a stop.
// User must answer before taking the completion photo.
// Correct: +10 bonus pts. Wrong: -5 pts. Skip: no change.

import React, { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS, FONTS, RADIUS, SPACING } from "../theme";

interface TriviaProps {
  question: string;
  options: string[];
  answerIndex: number;
  funFact: string;
  onCorrect: () => void; // called with +10 bonus
  onWrong: () => void; // called with -5 penalty
  onSkip: () => void; // called with no penalty
}

const BONUS_PTS = 10;
const PENALTY_PTS = 5;

export default function TriviaChallenge({
  question,
  options,
  answerIndex,
  funFact,
  onCorrect,
  onWrong,
  onSkip,
}: TriviaProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  const handleSelect = (index: number) => {
    if (revealed) return;
    setSelected(index);
    setRevealed(true);

    if (index === answerIndex) {
      Alert.alert(
        "🎉 Correct!",
        `+${BONUS_PTS} points awarded!\n\n${funFact}`,
        [{ text: "Continue", onPress: onCorrect }],
      );
    } else {
      Alert.alert(
        "❌ Wrong Answer",
        `-${PENALTY_PTS} points deducted.\n\nThe correct answer was: ${options[answerIndex]}\n\n${funFact}`,
        [{ text: "Continue", onPress: onWrong }],
      );
    }
  };

  const isCorrect = selected === answerIndex;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerEmoji}>🧠</Text>
        <View>
          <Text style={styles.headerTitle}>Trivia Challenge</Text>
          <Text style={styles.headerSub}>
            +{BONUS_PTS} pts correct · -{PENALTY_PTS} pts wrong
          </Text>
        </View>
      </View>

      {/* Question */}
      <Text style={styles.question}>{question}</Text>

      {/* Options */}
      <View style={styles.options}>
        {options.map((option, index) => {
          let optionStyle = styles.option;
          let textStyle = styles.optionText;

          if (revealed) {
            if (index === answerIndex) {
              optionStyle = { ...styles.option, ...styles.optionCorrect };
              textStyle = { ...styles.optionText, ...styles.optionTextCorrect };
            } else if (index === selected) {
              optionStyle = { ...styles.option, ...styles.optionWrong };
              textStyle = { ...styles.optionText, ...styles.optionTextWrong };
            } else {
              optionStyle = { ...styles.option, ...styles.optionDimmed };
            }
          }

          return (
            <TouchableOpacity
              key={index}
              style={optionStyle}
              onPress={() => handleSelect(index)}
              disabled={revealed}
              activeOpacity={0.8}
            >
              <View style={styles.optionLetter}>
                <Text style={styles.optionLetterText}>
                  {["A", "B", "C", "D"][index]}
                </Text>
              </View>
              <Text style={textStyle}>{option}</Text>
              {revealed && index === answerIndex && (
                <Text style={styles.checkmark}>✓</Text>
              )}
              {revealed && index === selected && index !== answerIndex && (
                <Text style={styles.cross}>✗</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Result message */}
      {revealed && (
        <View
          style={[
            styles.resultCard,
            isCorrect ? styles.resultCorrect : styles.resultWrong,
          ]}
        >
          <Text style={styles.resultTitle}>
            {isCorrect
              ? `🎉 Correct! +${BONUS_PTS} pts`
              : `❌ Wrong! -${PENALTY_PTS} pts`}
          </Text>
          <Text style={styles.resultFact}>{funFact}</Text>
        </View>
      )}

      {/* Skip option — only shown before answering */}
      {!revealed && (
        <TouchableOpacity style={styles.skipBtn} onPress={onSkip}>
          <Text style={styles.skipBtnText}>
            Skip trivia — no bonus or penalty
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    marginBottom: SPACING.md,
    backgroundColor: "#EBF5FB",
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
  },
  headerEmoji: { fontSize: 32 },
  headerTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.primary,
  },
  headerSub: { fontSize: FONTS.sizes.xs, color: COLORS.darkGray, marginTop: 2 },
  question: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.black,
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  options: { gap: SPACING.sm, marginBottom: SPACING.sm },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    borderWidth: 1.5,
    borderColor: COLORS.midGray,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    backgroundColor: COLORS.white,
  },
  optionCorrect: {
    borderColor: COLORS.success,
    backgroundColor: COLORS.lgreen,
  },
  optionWrong: { borderColor: COLORS.danger, backgroundColor: COLORS.lred },
  optionDimmed: { opacity: 0.4 },
  optionLetter: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  optionLetterText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.heavy,
  },
  optionText: {
    flex: 1,
    fontSize: FONTS.sizes.sm,
    color: COLORS.black,
    lineHeight: 20,
  },
  optionTextCorrect: { color: COLORS.success, fontWeight: FONTS.weights.bold },
  optionTextWrong: { color: COLORS.danger, fontWeight: FONTS.weights.bold },
  checkmark: {
    fontSize: 18,
    color: COLORS.success,
    fontWeight: FONTS.weights.heavy,
  },
  cross: {
    fontSize: 18,
    color: COLORS.danger,
    fontWeight: FONTS.weights.heavy,
  },
  resultCard: {
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.sm,
  },
  resultCorrect: {
    backgroundColor: COLORS.lgreen,
    borderWidth: 1.5,
    borderColor: COLORS.success,
  },
  resultWrong: {
    backgroundColor: COLORS.lred,
    borderWidth: 1.5,
    borderColor: COLORS.danger,
  },
  resultTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.black,
    marginBottom: SPACING.sm,
  },
  resultFact: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  continueBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    alignItems: "center",
  },
  continueBtnText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.heavy,
  },
  skipBtn: { alignItems: "center", padding: SPACING.sm },
  skipBtnText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.midGray,
    fontStyle: "italic",
  },
});

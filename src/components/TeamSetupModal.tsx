import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { saveTeamProfile } from "../services/apiService";
import { COLORS, FONTS, RADIUS, SPACING } from "../theme";

const PRESET_AVATARS = [
  "🦁",
  "🐯",
  "🦊",
  "🐺",
  "🦝",
  "🐻",
  "🐼",
  "🐨",
  "🦄",
  "🐲",
  "🦅",
  "🦉",
  "🦋",
  "🐬",
  "🦈",
  "🐙",
  "🌵",
  "🌋",
  "⚡",
  "🔥",
  "🌊",
  "🎯",
  "🚀",
  "👑",
];

interface TeamSetupModalProps {
  visible: boolean;
  onDismiss: () => void;
  onSave: (teamName: string, teamAvatar: string) => void;
}

export default function TeamSetupModal({
  visible,
  onDismiss,
  onSave,
}: TeamSetupModalProps) {
  const [teamName, setTeamName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("🦁");
  const [customPhoto, setCustomPhoto] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleTakePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Camera needed", "Please allow camera access in settings.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setCustomPhoto(result.assets[0].uri);
      setSelectedAvatar("");
    }
  };

  const handlePickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission needed", "Please allow photo library access.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setCustomPhoto(result.assets[0].uri);
      setSelectedAvatar("");
    }
  };

  const handleSave = async () => {
    const finalName = teamName.trim() || "Anonymous";
    const finalAvatar = customPhoto || selectedAvatar || "🦁";

    setSaving(true);
    try {
      await saveTeamProfile(finalName, finalAvatar);
    } catch {
      // Non-blocking — don't prevent hunt from starting
      console.warn("Team profile save failed (non-blocking)");
    } finally {
      setSaving(false);
    }
    onSave(finalName, finalAvatar);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Handle bar */}
          <View style={styles.handle} />

          <Text style={styles.title}>Set Up Your Team</Text>
          <Text style={styles.subtitle}>
            Name your team and pick an avatar — used for leaderboards and your
            hunt history.
          </Text>

          {/* Avatar preview */}
          <View style={styles.avatarPreview}>
            {customPhoto ? (
              <Image source={{ uri: customPhoto }} style={styles.avatarPhoto} />
            ) : (
              <View style={styles.avatarEmoji}>
                <Text style={styles.avatarEmojiText}>{selectedAvatar}</Text>
              </View>
            )}
          </View>

          {/* Photo buttons */}
          <View style={styles.photoRow}>
            <TouchableOpacity style={styles.photoBtn} onPress={handleTakePhoto}>
              <Text style={styles.photoBtnText}>📷 Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoBtn} onPress={handlePickPhoto}>
              <Text style={styles.photoBtnText}>🖼️ Library</Text>
            </TouchableOpacity>
            {customPhoto && (
              <TouchableOpacity
                style={styles.photoBtn}
                onPress={() => {
                  setCustomPhoto(null);
                  setSelectedAvatar("🦁");
                }}
              >
                <Text style={styles.photoBtnText}>✕ Clear</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Emoji grid */}
          {!customPhoto && (
            <ScrollView
              style={styles.gridScroll}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.grid}>
                {PRESET_AVATARS.map((emoji) => (
                  <TouchableOpacity
                    key={emoji}
                    style={[
                      styles.gridItem,
                      selectedAvatar === emoji && styles.gridItemSelected,
                    ]}
                    onPress={() => setSelectedAvatar(emoji)}
                  >
                    <Text style={styles.gridEmoji}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          )}

          {/* Team name input */}
          <TextInput
            style={styles.input}
            value={teamName}
            onChangeText={setTeamName}
            placeholder="Enter team name (optional)"
            placeholderTextColor={COLORS.midGray}
            maxLength={30}
            autoCorrect={false}
          />

          {/* Buttons */}
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.saveBtnText}>✅ Save & Continue</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipBtn} onPress={onDismiss}>
            <Text style={styles.skipBtnText}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: SPACING.lg,
    paddingBottom: 40,
    maxHeight: "85%",
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.lightGray,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.primary,
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  avatarPreview: {
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  avatarPhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: COLORS.accent,
  },
  avatarEmoji: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.accentPale,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: COLORS.accent,
  },
  avatarEmojiText: { fontSize: 40 },
  photoRow: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginBottom: SPACING.md,
    justifyContent: "center",
  },
  photoBtn: {
    borderWidth: 1.5,
    borderColor: COLORS.midGray,
    borderRadius: RADIUS.round,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    backgroundColor: COLORS.offWhite,
  },
  photoBtnText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
    fontWeight: FONTS.weights.medium,
  },
  gridScroll: { maxHeight: 160, marginBottom: SPACING.md },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
  },
  gridItem: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.lightGray,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  gridItemSelected: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accentPale,
  },
  gridEmoji: { fontSize: 24 },
  input: {
    borderWidth: 1.5,
    borderColor: COLORS.midGray,
    borderRadius: RADIUS.md,
    padding: 14,
    fontSize: FONTS.sizes.md,
    color: COLORS.black,
    backgroundColor: COLORS.offWhite,
    marginBottom: SPACING.md,
  },
  saveBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  saveBtnText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.heavy,
  },
  skipBtn: { alignItems: "center", padding: SPACING.sm },
  skipBtnText: {
    color: COLORS.midGray,
    fontSize: FONTS.sizes.sm,
  },
});

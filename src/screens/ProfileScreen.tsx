// src/screens/ProfileScreen.tsx
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { useAuth } from "../context/AuthContext";
import { deleteAccount } from "../services/apiService";
import { COLORS, FONTS, RADIUS, SPACING } from "../theme";

export default function ProfileScreen() {
  const { user, signOut, loading } = useAuth();
  const [deleting, setDeleting] = useState(false);

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/login");
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "⚠️ Delete Account",
      "This will permanently delete your account and all your data including hunt history and photos. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete My Account",
          style: "destructive",
          onPress: () => confirmDelete(),
        },
      ],
    );
  };

  const confirmDelete = () => {
    // Second confirmation
    Alert.alert(
      "Are you absolutely sure?",
      "All your hunts, photos, and progress will be permanently deleted.",
      [
        { text: "No, keep my account", style: "cancel" },
        {
          text: "Yes, delete everything",
          style: "destructive",
          onPress: async () => {
            try {
              setDeleting(true);
              await deleteAccount();
              await signOut();
              Alert.alert(
                "Account Deleted",
                "Your account and all data have been permanently deleted.",
                [{ text: "OK", onPress: () => router.replace("/login") }],
              );
            } catch {
              Alert.alert(
                "Error",
                "Could not delete your account. Please try again or contact support@scavlandia.com",
              );
            } finally {
              setDeleting(false);
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.loadingEmoji}>⏳</Text>
          <Text style={styles.loadingText}>Loading your profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.centeredScroll}>
          <Text style={styles.guestEmoji}>🗺️</Text>
          <Text style={styles.guestTitle}>Join the Adventure</Text>
          <Text style={styles.guestSubtitle}>
            Sign in to save your hunts, track your points, and see your history.
          </Text>
          <Button
            label="Sign In"
            onPress={() => router.push("/login")}
            variant="accent"
            size="lg"
            emoji="🚀"
            style={styles.authBtn}
          />
          <Button
            label="Create Free Account"
            onPress={() => router.push("/signup")}
            variant="secondary"
            size="lg"
            emoji="✨"
            style={styles.authBtn}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  const initial = user.displayName?.charAt(0).toUpperCase() || "?";
  const memberSince = user.metadata.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "Unknown";

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <Card variant="primary" style={styles.profileHeader}>
          <View style={styles.avatarRing}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
          </View>
          <Text style={styles.displayName}>
            {user.displayName || "Explorer"}
          </Text>
          <Text style={styles.email}>{user.email}</Text>
          <Badge
            label={`Member since ${memberSince}`}
            emoji="📅"
            color="rgba(255,255,255,0.2)"
            style={styles.memberBadge}
          />
        </Card>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {[
            { emoji: "🗺️", label: "Hunts", value: "—" },
            { emoji: "⭐", label: "Points", value: "—" },
            { emoji: "🏆", label: "Best", value: "—" },
          ].map((s, i) => (
            <Card key={i} style={styles.statCard}>
              <Text style={styles.statEmoji}>{s.emoji}</Text>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </Card>
          ))}
        </View>

        {/* Account Details */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ Account Details</Text>
          {[
            { label: "Name", value: user.displayName || "—" },
            { label: "Email", value: user.email || "—" },
            { label: "Member since", value: memberSince },
            { label: "Plan", value: "Free tier" },
          ].map((row, i) => (
            <View key={i} style={[styles.row, i > 0 && styles.rowBorder]}>
              <Text style={styles.rowLabel}>{row.label}</Text>
              <Text style={styles.rowValue} numberOfLines={1}>
                {row.value}
              </Text>
            </View>
          ))}
        </Card>

        {/* Community leaderboard link */}
        <Card style={styles.section}>
          <TouchableOpacity
            style={styles.leaderboardLink}
            onPress={() => router.push("/community-leaderboard")}
          >
            <Text style={styles.leaderboardLinkEmoji}>🌍</Text>
            <View style={styles.leaderboardLinkText}>
              <Text style={styles.leaderboardLinkTitle}>
                Community Leaderboard
              </Text>
              <Text style={styles.leaderboardLinkSub}>
                See how you rank globally
              </Text>
            </View>
            <Text style={styles.leaderboardLinkArrow}>›</Text>
          </TouchableOpacity>
        </Card>

        {/* Upgrade Banner */}
        <Card variant="accent" style={styles.upgradeBanner}>
          <Text style={styles.upgradeEmoji}>♾️</Text>
          <View style={styles.upgradeText}>
            <Text style={styles.upgradeTitle}>Go Unlimited</Text>
            <Text style={styles.upgradeSub}>
              Unlimited hunts for $19.99/month
            </Text>
          </View>
          <TouchableOpacity
            style={styles.upgradeBtn}
            onPress={() => router.push("/paywall")}
          >
            <Text style={styles.upgradeBtnText}>Upgrade</Text>
          </TouchableOpacity>
        </Card>

        {/* Sign Out */}
        <Button
          label="Sign Out"
          onPress={handleSignOut}
          variant="ghost"
          size="md"
          emoji="👋"
          style={styles.signOutBtn}
        />

        {/* Danger Zone */}
        <View style={styles.dangerZone}>
          <Text style={styles.dangerZoneTitle}>⚠️ Danger Zone</Text>
          <Text style={styles.dangerZoneDesc}>
            Permanently delete your account and all associated data including
            hunt history and photos. This cannot be undone.
          </Text>
          <TouchableOpacity
            style={[styles.deleteBtn, deleting && styles.deleteBtnDisabled]}
            onPress={handleDeleteAccount}
            disabled={deleting}
          >
            <Text style={styles.deleteBtnText}>
              {deleting ? "Deleting..." : "🗑️ Delete My Account"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Privacy Policy & Data links */}
        <View style={styles.legalLinks}>
          <TouchableOpacity
            onPress={() => router.push("/community-leaderboard")}
          >
            <Text style={styles.legalLink}>Privacy Policy</Text>
          </TouchableOpacity>
          <Text style={styles.legalDot}>·</Text>
          <TouchableOpacity>
            <Text style={styles.legalLink}>Data Deletion</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.offWhite },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.xl,
  },
  centeredScroll: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.xl,
  },
  loadingEmoji: { fontSize: 48, marginBottom: SPACING.md },
  loadingText: { fontSize: FONTS.sizes.md, color: COLORS.darkGray },
  guestEmoji: { fontSize: 72, marginBottom: SPACING.md },
  guestTitle: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.primary,
    marginBottom: SPACING.sm,
    textAlign: "center",
  },
  guestSubtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.darkGray,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  authBtn: { width: "100%", marginBottom: SPACING.sm },
  scroll: { padding: SPACING.md, paddingBottom: 40 },
  profileHeader: {
    alignItems: "center",
    paddingVertical: SPACING.xl,
    marginBottom: SPACING.md,
  },
  avatarRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: COLORS.accent,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: COLORS.accent,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 36,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.white,
  },
  displayName: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.white,
    marginBottom: 4,
  },
  email: {
    fontSize: FONTS.sizes.sm,
    color: "#AED6F1",
    marginBottom: SPACING.md,
  },
  memberBadge: {},
  statsRow: { flexDirection: "row", gap: SPACING.sm, marginBottom: SPACING.md },
  statCard: { flex: 1, alignItems: "center", paddingVertical: SPACING.md },
  statEmoji: { fontSize: 24, marginBottom: 4 },
  statValue: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.primary,
  },
  statLabel: { fontSize: FONTS.sizes.xs, color: COLORS.darkGray, marginTop: 2 },
  section: { marginBottom: SPACING.md },
  sectionTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: SPACING.sm,
  },
  rowBorder: { borderTopWidth: 1, borderTopColor: COLORS.lightGray },
  rowLabel: { fontSize: FONTS.sizes.sm, color: COLORS.darkGray, flex: 1 },
  rowValue: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
    color: COLORS.black,
    flex: 1,
    textAlign: "right",
  },
  upgradeBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  upgradeEmoji: { fontSize: 32 },
  upgradeText: { flex: 1 },
  upgradeTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.primary,
  },
  upgradeSub: { fontSize: FONTS.sizes.xs, color: COLORS.darkGray },
  upgradeBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  upgradeBtnText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
  },
  signOutBtn: { marginTop: SPACING.sm, marginBottom: SPACING.lg },
  dangerZone: {
    backgroundColor: COLORS.lred,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1.5,
    borderColor: COLORS.danger,
  },
  dangerZoneTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.danger,
    marginBottom: SPACING.sm,
  },
  dangerZoneDesc: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  deleteBtn: {
    backgroundColor: COLORS.danger,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    alignItems: "center",
  },
  deleteBtnDisabled: { opacity: 0.5 },
  deleteBtnText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
  },
  legalLinks: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  legalLink: { fontSize: FONTS.sizes.xs, color: COLORS.accent },
  legalDot: { fontSize: FONTS.sizes.xs, color: COLORS.midGray },
  leaderboardLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  leaderboardLinkEmoji: { fontSize: 32 },
  leaderboardLinkText: { flex: 1 },
  leaderboardLinkTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.primary,
  },
  leaderboardLinkSub: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
    marginTop: 2,
  },
  leaderboardLinkArrow: { fontSize: FONTS.sizes.xxl, color: COLORS.midGray },
});

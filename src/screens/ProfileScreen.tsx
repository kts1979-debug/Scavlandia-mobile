// src/screens/ProfileScreen.tsx
import { router } from "expo-router";
import React from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../context/AuthContext";

export default function ProfileScreen() {
  const { user, signOut, loading } = useAuth();

  const handleSignOut = async () => {
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

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Not logged in — show sign in prompt
  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.centered}>
            <Text style={styles.emoji}>👤</Text>
            <Text style={styles.title}>Your Profile</Text>
            <Text style={styles.subtitle}>
              Sign in to save your hunts and track your progress.
            </Text>
            <TouchableOpacity
              style={styles.signInButton}
              onPress={() => router.push("/login")}
            >
              <Text style={styles.signInButtonText}>Sign In</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.signUpButton}
              onPress={() => router.push("/signup")}
            >
              <Text style={styles.signUpButtonText}>Create an Account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Logged in — show profile
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Avatar and name */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user.displayName?.charAt(0).toUpperCase() || "?"}
            </Text>
          </View>
          <Text style={styles.displayName}>
            {user.displayName || "Explorer"}
          </Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>

        {/* Account details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Email</Text>
            <Text style={styles.rowValue}>{user.email}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Member since</Text>
            <Text style={styles.rowValue}>
              {user.metadata.creationTime
                ? new Date(user.metadata.creationTime).toLocaleDateString()
                : "Unknown"}
            </Text>
          </View>
        </View>

        {/* Sign out */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  scroll: { padding: 20 },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    paddingTop: 80,
  },
  loadingText: { fontSize: 16, color: "#5D6D7E" },
  emoji: { fontSize: 60, marginBottom: 16 },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1A5276",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#5D6D7E",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 22,
  },
  signInButton: {
    backgroundColor: "#1A5276",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    width: "100%",
    marginBottom: 12,
  },
  signInButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
  signUpButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#1A5276",
    padding: 16,
    alignItems: "center",
    width: "100%",
  },
  signUpButtonText: { color: "#1A5276", fontSize: 16, fontWeight: "bold" },
  profileHeader: {
    alignItems: "center",
    paddingVertical: 30,
    backgroundColor: "#1A5276",
    borderRadius: 16,
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#2E86C1",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarText: { fontSize: 36, fontWeight: "bold", color: "#FFFFFF" },
  displayName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  email: { fontSize: 14, color: "#AED6F1" },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1A5276",
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F3F4",
  },
  rowLabel: { fontSize: 15, color: "#5D6D7E" },
  rowValue: {
    fontSize: 15,
    color: "#2C3E50",
    fontWeight: "500",
    maxWidth: "60%",
    textAlign: "right",
  },
  signOutButton: {
    backgroundColor: "#FADBD8",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E74C3C",
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  signOutButtonText: { color: "#C0392B", fontSize: 16, fontWeight: "bold" },
});

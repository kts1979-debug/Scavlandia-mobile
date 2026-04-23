// src/screens/PaywallScreen.tsx
// Shown when a user tries to generate a hunt without a purchase.
// Displays pricing options and handles the purchase flow.

import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  getCurrentOffering,
  purchasePackage,
  restorePurchases,
  PRODUCT_IDS,
} from "../services/purchaseService";
import { COLORS, FONTS, RADIUS, SPACING } from "../theme";

type HuntType = "city" | "museum" | "micro";

const HUNT_INFO = {
  city: {
    emoji: "🏙️",
    title: "City Hunt",
    desc: "A personalized scavenger hunt in any city",
    price: "$7.99",
    productId: PRODUCT_IDS.cityHunt,
    packageId: "city_hunt",
  },
  museum: {
    emoji: "🏛️",
    title: "Museum Hunt",
    desc: "Discover artworks with custom riddle clues",
    price: "$7.99",
    productId: PRODUCT_IDS.museumHunt,
    packageId: "museum_hunt",
  },
  micro: {
    emoji: "⚡",
    title: "Micro Hunt",
    desc: "A quick adventure near your location",
    price: "$1.99",
    productId: PRODUCT_IDS.microHunt,
    packageId: "micro_hunt",
  },
};

export default function PaywallScreen() {
  const params = useLocalSearchParams();
  const huntType = (params.huntType as HuntType) || "city";
  const nextRoute = (params.nextRoute as string) || "/generating";
  const nextParams = params.nextParams
    ? JSON.parse(params.nextParams as string)
    : {};

  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [offering, setOffering] = useState<any>(null);

  const huntInfo = HUNT_INFO[huntType];

  useEffect(() => {
    loadOffering();
  }, []);

  const loadOffering = async () => {
    try {
      const current = await getCurrentOffering();
      setOffering(current);
    } catch (err) {
      console.warn("Could not load offering:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseSingle = async () => {
    if (!offering) return;

    const pkg = offering.availablePackages.find(
      (p: any) => p.identifier === huntInfo.packageId,
    );

    if (!pkg) {
      Alert.alert("Error", "Could not find this product. Please try again.");
      return;
    }

    try {
      setPurchasing(true);
      const customerInfo = await purchasePackage(pkg);
      const entitlements = customerInfo.entitlements.active;

      const entitlementMap: Record<HuntType, string> = {
        city: "city_hunt",
        museum: "museum_hunt",
        micro: "micro_hunt",
      };

      if (
        entitlementMap[huntType] in entitlements ||
        "premium" in entitlements
      ) {
        // Purchase successful — proceed to hunt generation
        Alert.alert(
          "✅ Purchase Successful!",
          `Your ${huntInfo.title} is ready. Let's go!`,
          [
            {
              text: "Let's Hunt!",
              onPress: () =>
                router.replace({
                  pathname: nextRoute as any,
                  params: nextParams,
                }),
            },
          ],
        );
      }
    } catch (err: any) {
      if (!err.userCancelled) {
        Alert.alert(
          "Purchase Failed",
          "Could not complete purchase. Please try again.",
        );
      }
    } finally {
      setPurchasing(false);
    }
  };

  const handlePurchaseSubscription = async () => {
    if (!offering) return;

    const pkg = offering.availablePackages.find(
      (p: any) => p.identifier === "$rc_monthly",
    );

    if (!pkg) {
      Alert.alert("Error", "Could not find subscription. Please try again.");
      return;
    }

    try {
      setPurchasing(true);
      const customerInfo = await purchasePackage(pkg);

      if ("premium" in customerInfo.entitlements.active) {
        Alert.alert(
          "✅ Welcome to Scavlandia Premium!",
          "You now have unlimited hunts. Let the adventure begin!",
          [
            {
              text: "Let's Hunt!",
              onPress: () =>
                router.replace({
                  pathname: nextRoute as any,
                  params: nextParams,
                }),
            },
          ],
        );
      }
    } catch (err: any) {
      if (!err.userCancelled) {
        Alert.alert(
          "Purchase Failed",
          "Could not complete purchase. Please try again.",
        );
      }
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    try {
      setRestoring(true);
      const customerInfo = await restorePurchases();
      const active = customerInfo.entitlements.active;

      if (Object.keys(active).length > 0) {
        Alert.alert(
          "✅ Purchases Restored",
          "Your previous purchases have been restored.",
          [
            {
              text: "Continue",
              onPress: () =>
                router.replace({
                  pathname: nextRoute as any,
                  params: nextParams,
                }),
            },
          ],
        );
      } else {
        Alert.alert(
          "No Purchases Found",
          "No previous purchases were found for this account.",
        );
      }
    } catch {
      Alert.alert("Error", "Could not restore purchases. Please try again.");
    } finally {
      setRestoring(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.accent} />
          <Text style={styles.loadingText}>Loading pricing...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>

        <Text style={styles.heroEmoji}>{huntInfo.emoji}</Text>
        <Text style={styles.heroTitle}>
          Unlock Your{"\n"}
          {huntInfo.title}
        </Text>
        <Text style={styles.heroDesc}>{huntInfo.desc}</Text>

        {/* What you get */}
        <View style={styles.featureCard}>
          <Text style={styles.featureTitle}>What you get</Text>
          {[
            "🔍 Custom clues written just for your group",
            "📍 Real locations in any city worldwide",
            "🧠 Trivia challenges at every stop",
            "📸 Photo challenges and a shareable album",
            "⏭️ Skip and swap stops as needed",
            "🎵 Audio clue reading",
          ].map((f) => (
            <Text key={f} style={styles.featureItem}>
              {f}
            </Text>
          ))}
        </View>

        {/* Single purchase option */}
        <TouchableOpacity
          style={[styles.purchaseBtn, purchasing && styles.purchaseBtnDisabled]}
          onPress={handlePurchaseSingle}
          disabled={purchasing || restoring}
        >
          {purchasing ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <>
              <Text style={styles.purchaseBtnTitle}>
                Buy This Hunt — {huntInfo.price}
              </Text>
              <Text style={styles.purchaseBtnSub}>
                One-time purchase, no subscription
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Subscription option */}
        <TouchableOpacity
          style={[
            styles.subscriptionBtn,
            purchasing && styles.purchaseBtnDisabled,
          ]}
          onPress={handlePurchaseSubscription}
          disabled={purchasing || restoring}
        >
          <View style={styles.bestValueBadge}>
            <Text style={styles.bestValueText}>BEST VALUE</Text>
          </View>
          <Text style={styles.subscriptionTitle}>
            Scavlandia Premium — $19.99/mo
          </Text>
          <Text style={styles.subscriptionSub}>
            Unlimited city, museum and micro hunts
          </Text>
          <Text style={styles.subscriptionDetail}>
            {"That's less than $1 per adventure 🎉"}
          </Text>
        </TouchableOpacity>

        {/* Restore purchases */}
        <TouchableOpacity
          style={styles.restoreBtn}
          onPress={handleRestore}
          disabled={purchasing || restoring}
        >
          <Text style={styles.restoreBtnText}>
            {restoring ? "Restoring..." : "Restore Previous Purchases"}
          </Text>
        </TouchableOpacity>

        {/* Legal */}
        <Text style={styles.legal}>
          Payment will be charged to your App Store account. Subscriptions
          automatically renew unless cancelled at least 24 hours before the end
          of the current period. You can manage subscriptions in your App Store
          account settings.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primary },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  loadingText: {
    color: COLORS.white,
    marginTop: SPACING.md,
    fontSize: FONTS.sizes.md,
  },
  scroll: { padding: SPACING.lg, paddingBottom: 40 },
  closeBtn: {
    alignSelf: "flex-end",
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  closeBtnText: { color: "rgba(255,255,255,0.6)", fontSize: FONTS.sizes.xl },
  heroEmoji: { fontSize: 64, textAlign: "center", marginBottom: SPACING.sm },
  heroTitle: {
    fontSize: FONTS.sizes.hero,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.white,
    textAlign: "center",
    marginBottom: SPACING.sm,
    lineHeight: 44,
  },
  heroDesc: {
    fontSize: FONTS.sizes.md,
    color: "#AED6F1",
    textAlign: "center",
    marginBottom: SPACING.xl,
  },
  featureCard: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  featureTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.white,
    marginBottom: SPACING.sm,
  },
  featureItem: {
    fontSize: FONTS.sizes.sm,
    color: "rgba(255,255,255,0.85)",
    lineHeight: 28,
  },
  purchaseBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  purchaseBtnDisabled: { opacity: 0.6 },
  purchaseBtnTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.white,
    marginBottom: 4,
  },
  purchaseBtnSub: { fontSize: FONTS.sizes.sm, color: "rgba(255,255,255,0.8)" },
  subscriptionBtn: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: "center",
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.gold,
    position: "relative",
  },
  bestValueBadge: {
    backgroundColor: COLORS.gold,
    borderRadius: RADIUS.round,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    marginBottom: SPACING.sm,
  },
  bestValueText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.black,
  },
  subscriptionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.white,
    marginBottom: 4,
  },
  subscriptionSub: {
    fontSize: FONTS.sizes.sm,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 4,
  },
  subscriptionDetail: { fontSize: FONTS.sizes.xs, color: COLORS.gold },
  restoreBtn: { alignItems: "center", padding: SPACING.md },
  restoreBtnText: { color: "rgba(255,255,255,0.6)", fontSize: FONTS.sizes.sm },
  legal: {
    fontSize: 10,
    color: "rgba(255,255,255,0.4)",
    textAlign: "center",
    lineHeight: 16,
    marginTop: SPACING.sm,
  },
});

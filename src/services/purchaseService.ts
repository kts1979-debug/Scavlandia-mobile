// src/services/purchaseService.ts
// Handles all in-app purchase logic via RevenueCat.
// Abstracts purchase state so the rest of the app
// doesn't need to know about RevenueCat directly.

import Constants from "expo-constants";
import Purchases, {
  CustomerInfo,
  LOG_LEVEL,
  PurchasesOffering,
} from "react-native-purchases";
import { Platform } from "react-native";

// ── Expo Go detection ──────────────────────────────────────────────
// RevenueCat cannot run in Expo Go — skip all purchase logic during testing
const isExpoGo = Constants.appOwnership === "expo";

// ── RevenueCat API Keys ────────────────────────────────────────────
const API_KEYS = {
  ios: "appl_RhtBfqfVHnAfrOQtEgDCaMSxRwM",
  android: "goog_REPLACE_WITH_YOUR_ANDROID_KEY",
};

// ── Product IDs ────────────────────────────────────────────────────
export const PRODUCT_IDS = {
  cityHunt: "com.katesauls.scavlandia.city_hunt",
  museumHunt: "com.katesauls.scavlandia.museum_hunt",
  microHunt: "com.katesauls.scavlandia.micro_hunt",
  monthly: "com.katesauls.scavlandia.monthly",
};

// ── Entitlement IDs ────────────────────────────────────────────────
export const ENTITLEMENTS = {
  cityHunt: "city_hunt",
  museumHunt: "museum_hunt",
  microHunt: "micro_hunt",
  premium: "premium",
};

// ── Initialize RevenueCat ──────────────────────────────────────────
export const initializePurchases = (userId?: string) => {
  if (isExpoGo) {
    console.log("💰 RevenueCat skipped — running in Expo Go");
    return;
  }
  const apiKey = Platform.OS === "ios" ? API_KEYS.ios : API_KEYS.android;
  Purchases.setLogLevel(LOG_LEVEL.WARN);
  Purchases.configure({ apiKey, appUserID: userId || null });
  console.log("💰 RevenueCat initialized");
};

// ── Check if user has entitlement ─────────────────────────────────
export const hasEntitlement = async (
  entitlementId: string,
): Promise<boolean> => {
  if (isExpoGo) return true;
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return entitlementId in customerInfo.entitlements.active;
  } catch (err) {
    console.warn("Could not check entitlement:", err);
    return false;
  }
};

// ── Check entitlement for hunt type ───────────────────────────────
export const canGenerateHunt = async (
  huntType: "city" | "museum" | "micro",
): Promise<boolean> => {
  if (isExpoGo) {
    console.log(
      "💰 Expo Go — skipping purchase check, allowing hunt generation",
    );
    return true;
  }
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    const active = customerInfo.entitlements.active;

    if (ENTITLEMENTS.premium in active) return true;

    const entitlementMap = {
      city: ENTITLEMENTS.cityHunt,
      museum: ENTITLEMENTS.museumHunt,
      micro: ENTITLEMENTS.microHunt,
    };

    return entitlementMap[huntType] in active;
  } catch (err) {
    console.warn("Could not check hunt entitlement:", err);
    return false;
  }
};

// ── Get current offering ───────────────────────────────────────────
export const getCurrentOffering =
  async (): Promise<PurchasesOffering | null> => {
    if (isExpoGo) return null;
    try {
      const offerings = await Purchases.getOfferings();
      return offerings.current;
    } catch (err) {
      console.warn("Could not fetch offerings:", err);
      return null;
    }
  };

// ── Purchase a package ────────────────────────────────────────────
export const purchasePackage = async (packageToPurchase: any) => {
  const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
  return customerInfo;
};

// ── Restore purchases ─────────────────────────────────────────────
export const restorePurchases = async (): Promise<CustomerInfo> => {
  return await Purchases.restorePurchases();
};

// ── Get customer info ─────────────────────────────────────────────
export const getCustomerInfo = async (): Promise<CustomerInfo> => {
  return await Purchases.getCustomerInfo();
};

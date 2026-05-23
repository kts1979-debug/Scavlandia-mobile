// src/services/purchaseService.ts
import Constants from "expo-constants";
import { Platform } from "react-native";
import Purchases, {
  CustomerInfo,
  LOG_LEVEL,
  PurchasesOffering,
} from "react-native-purchases";

const isExpoGo = Constants.appOwnership === "expo";

const API_KEYS = {
  ios: "appl_RhtBfqfVHnAfrOQtEgDCaMSxRwM",
  android: "goog_ITlqwUuNFHSvNZZtMxMxUuyMQuJ",
};

// ── Product IDs ────────────────────────────────────────────────────
export const PRODUCT_IDS = {
  cityHunt: "com.katesauls.scavlandia.hunt_city",
  microHunt: "com.katesauls.scavlandia.hunt_micro",
  roadTripHunt: "com.katesauls.scavlandia.road_trip_hunt",
  monthly: "com.katesauls.scavlandia.monthly",
};

// ── Entitlement IDs (subscription only) ───────────────────────────
export const ENTITLEMENTS = {
  premium: "premium",
};

// ── Initialize RevenueCat ──────────────────────────────────────────
export const initializePurchases = (userId?: string) => {
  if (isExpoGo) {
    return;
  }
  const apiKey = Platform.OS === "ios" ? API_KEYS.ios : API_KEYS.android;
  Purchases.setLogLevel(LOG_LEVEL.WARN);
  Purchases.configure({ apiKey, appUserID: userId || null });
};

// ── Check if user has active premium subscription ─────────────────
export const hasPremium = async (): Promise<boolean> => {
  if (isExpoGo) return false;
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    const active = customerInfo.entitlements.active;
    return "premium" in active;
  } catch (err) {
    // Retry once after short delay in case RC hasn't initialized yet
    try {
      await new Promise((r) => setTimeout(r, 1500));
      const customerInfo = await Purchases.getCustomerInfo();
      return "premium" in customerInfo.entitlements.active;
    } catch {
      console.warn("Could not check entitlement after retry:", err);
      return false;
    }
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

// ── Restore purchases (subscriptions only) ────────────────────────
export const restorePurchases = async (): Promise<CustomerInfo> => {
  return await Purchases.restorePurchases();
};

// ── Get customer info ─────────────────────────────────────────────
export const getCustomerInfo = async (): Promise<CustomerInfo> => {
  return await Purchases.getCustomerInfo();
};

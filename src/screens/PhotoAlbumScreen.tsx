// src/screens/PhotoAlbumScreen.tsx
import * as MediaLibrary from "expo-media-library";
import * as Print from "expo-print";
import { router, useLocalSearchParams } from "expo-router";
import * as Sharing from "expo-sharing";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Callout, Marker } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import ViewShot from "react-native-view-shot";
import { Hunt } from "../services/apiService";
import { COLORS, FONTS, RADIUS, SHADOW, SPACING } from "../theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type TabType = "map" | "grid" | "slideshow";
type FormatType = "square" | "story" | "landscape";

export default function PhotoAlbumScreen() {
  const params = useLocalSearchParams();
  const hunt: Hunt = JSON.parse(params.hunt as string);
  const rawPhotos = JSON.parse((params.stopPhotos as string) || "{}");

  // Normalize all keys to strings
  const stopPhotos: Record<string, string> = {};
  Object.keys(rawPhotos).forEach((k) => {
    stopPhotos[String(k)] = rawPhotos[k];
  });

  // Helper to get photo URL by stop order
  const getPhoto = (order: number): string | undefined =>
    stopPhotos[String(order)];

  console.log("Stop photos received:", JSON.stringify(stopPhotos));
  console.log("Number of photos:", Object.keys(stopPhotos).length);
  console.log(
    "Hunt stops:",
    hunt.stops.map((s) => s.order),
  );

  const [activeTab, setActiveTab] = useState<TabType>("grid");
  const [slideIndex, setSlideIndex] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [showFormatMenu, setShowFormatMenu] = useState(false);

  const collageRef = useRef<ViewShot | null>(null);
  const slideshowRef = useRef<ViewShot | null>(null);

  // Only include stops that have photos
  const stopsWithPhotos = hunt.stops.filter((stop) => !!getPhoto(stop.order));
  const totalPhotos = stopsWithPhotos.length;

  // ── Capture view as image ──────────────────────────────────────
  const captureView = async (
    ref: React.RefObject<ViewShot | null>,
  ): Promise<string | null> => {
    try {
      const uri = await ref.current?.capture?.();
      return uri || null;
    } catch (err) {
      console.error("Capture failed:", err);
      return null;
    }
  };

  // ── Save individual photos to camera roll ──────────────────────
  const saveToPhotos = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Please allow photo library access in settings.",
      );
      return;
    }
    setDownloading(true);
    try {
      let saved = 0;
      for (const stop of stopsWithPhotos) {
        const url = getPhoto(stop.order);
        if (url) {
          await MediaLibrary.saveToLibraryAsync(url);
          saved++;
        }
      }
      Alert.alert("✅ Saved!", `${saved} photos saved to your camera roll.`);
    } catch {
      Alert.alert("Error", "Could not save photos. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  // ── Save collage to camera roll ────────────────────────────────
  const saveAsCollage = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Please allow photo library access in settings.",
      );
      return;
    }
    setDownloading(true);
    try {
      // Switch to grid tab so collageRef is rendered
      setActiveTab("grid");
      setShowFormatMenu(false);
      await new Promise((r) => setTimeout(r, 500));
      const uri = await captureView(collageRef);
      if (uri) {
        await MediaLibrary.saveToLibraryAsync(uri);
        Alert.alert("✅ Saved!", "Collage saved to your camera roll.");
      }
    } catch {
      Alert.alert("Error", "Could not save collage. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  // ── Save as PDF ────────────────────────────────────────────────
  const saveAsPDF = async () => {
    setDownloading(true);
    try {
      const stopRows = stopsWithPhotos
        .map(
          (stop) => `
        <div style="page-break-inside:avoid;margin-bottom:30px;">
          <h2 style="color:#1A3A5C;">${stop.order}. ${stop.locationName}</h2>
          <p style="color:#666;">${stop.address}</p>
          <img src="${getPhoto(stop.order)}"
            style="width:100%;max-height:300px;object-fit:cover;border-radius:8px;" />
          <p style="color:#444;font-style:italic;">💡 ${stop.funFact}</p>
        </div>
      `,
        )
        .join("");

      const html = `
        <html><head><meta charset="utf-8">
        <style>body{font-family:Arial,sans-serif;padding:40px;}</style></head>
        <body>
          <h1 style="color:#1A3A5C;">${hunt.huntTitle}</h1>
          <p style="color:#E8622A;">📍 ${hunt.city} · ${totalPhotos} stops</p>
          ${stopRows}
        </body></html>`;

      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: `${hunt.huntTitle} — Photo Album`,
      });
    } catch {
      Alert.alert("Error", "Could not generate PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  // ── Share via social ───────────────────────────────────────────
  const handleShare = async (format: FormatType) => {
    setShowFormatMenu(false);
    setDownloading(true);
    try {
      setActiveTab("grid");
      await new Promise((r) => setTimeout(r, 500));
      const uri = await captureView(collageRef);
      if (uri && (await Sharing.isAvailableAsync())) {
        await Sharing.shareAsync(uri, {
          mimeType: "image/png",
          dialogTitle: "Share your Daytripper adventure!",
        });
      } else {
        await Share.share({
          message:
            `🗺️ Just completed a Daytripper hunt in ${hunt.city?.split(",")[0]}!\n\n` +
            `Visited ${totalPhotos} amazing stops. 🏆`,
        });
      }
    } catch {
      Alert.alert("Error", "Could not share. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  // ── Empty state ────────────────────────────────────────────────
  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>📷</Text>
      <Text style={styles.emptyTitle}>No photos yet</Text>
      <Text style={styles.emptySub}>
        Complete stops and take photos to build your album
      </Text>
    </View>
  );

  // ── Map View ───────────────────────────────────────────────────
  const MapTab = () => {
    if (stopsWithPhotos.length === 0) return <EmptyState />;
    const first = stopsWithPhotos[0];
    const region = {
      latitude: first.lat,
      longitude: first.lng,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };
    return (
      <View style={styles.mapContainer}>
        <MapView style={styles.map} initialRegion={region}>
          {stopsWithPhotos.map((stop) => (
            <Marker
              key={stop.order}
              coordinate={{ latitude: stop.lat, longitude: stop.lng }}
              title={stop.locationName}
            >
              <View style={styles.photoMarker}>
                <Image
                  source={{
                    uri: getPhoto(stop.order),
                  }}
                  style={styles.photoMarkerImage}
                />
                <View style={styles.photoMarkerBadge}>
                  <Text style={styles.photoMarkerNum}>{stop.order}</Text>
                </View>
              </View>
              <Callout>
                <View style={styles.callout}>
                  <Text style={styles.calloutTitle}>{stop.locationName}</Text>
                  <Text style={styles.calloutSub}>Stop {stop.order}</Text>
                </View>
              </Callout>
            </Marker>
          ))}
        </MapView>
        <View style={styles.mapOverlay}>
          <Text style={styles.mapOverlayTitle}>{hunt.huntTitle}</Text>
          <Text style={styles.mapOverlayCity}>📍 {hunt.city}</Text>
        </View>
      </View>
    );
  };

  // ── Grid View ──────────────────────────────────────────────────
  const GridTab = () => {
    if (stopsWithPhotos.length === 0) return <EmptyState />;
    return (
      <ScrollView contentContainerStyle={styles.gridScroll}>
        <ViewShot ref={collageRef} options={{ format: "png", quality: 0.9 }}>
          <View style={styles.collageContainer}>
            <View style={styles.collageHeader}>
              <Text style={styles.collageTitle}>{hunt.huntTitle}</Text>
              <Text style={styles.collageCity}>📍 {hunt.city}</Text>
              <Text style={styles.collageMeta}>
                {totalPhotos} stops · Daytripper
              </Text>
            </View>
            <View style={styles.photoGrid}>
              {stopsWithPhotos.map((stop) => (
                <View key={stop.order} style={styles.gridPhotoContainer}>
                  <Image
                    source={{
                      uri: getPhoto(stop.order),
                    }}
                    style={styles.gridPhoto}
                    onError={(e) =>
                      console.log(
                        "Image load error stop",
                        stop.order,
                        e.nativeEvent.error,
                      )
                    }
                    onLoad={() => console.log("Image loaded stop", stop.order)}
                  />
                  <View style={styles.gridPhotoOverlay}>
                    <Text style={styles.gridPhotoNum}>{stop.order}</Text>
                  </View>
                  <Text style={styles.gridPhotoName} numberOfLines={1}>
                    {stop.locationName}
                  </Text>
                </View>
              ))}
            </View>
            <View style={styles.collageFooter}>
              <Text style={styles.collageFooterText}>🗺️ daytripper.app</Text>
            </View>
          </View>
        </ViewShot>
      </ScrollView>
    );
  };

  // ── Slideshow View ─────────────────────────────────────────────
  const SlideshowTab = () => {
    if (stopsWithPhotos.length === 0) return <EmptyState />;
    const stop = stopsWithPhotos[slideIndex];
    return (
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <ViewShot ref={slideshowRef} options={{ format: "png", quality: 0.9 }}>
          <View style={styles.slideContainer}>
            <Image
              source={{
                uri: getPhoto(stop.order),
              }}
              style={styles.slidePhoto}
              resizeMode="cover"
              onError={(e) =>
                console.log("Slideshow image error:", e.nativeEvent.error)
              }
              onLoad={() => console.log("Slideshow image loaded")}
            />
            <View style={styles.slideOverlay}>
              <View style={styles.slideStopBadge}>
                <Text style={styles.slideStopNum}>Stop {stop.order}</Text>
              </View>
              <Text style={styles.slideName}>{stop.locationName}</Text>
              <Text style={styles.slideAddress}>{stop.address}</Text>
            </View>
          </View>
        </ViewShot>
        <View style={styles.slideFact}>
          <Text style={styles.slideFactLabel}>💡 Fun Fact</Text>
          <Text style={styles.slideFactText}>{stop.funFact}</Text>
        </View>
        <View style={styles.slideNav}>
          <TouchableOpacity
            style={[
              styles.slideNavBtn,
              slideIndex === 0 && styles.slideNavBtnDisabled,
            ]}
            onPress={() => setSlideIndex((i) => Math.max(0, i - 1))}
            disabled={slideIndex === 0}
          >
            <Text style={styles.slideNavText}>‹ Prev</Text>
          </TouchableOpacity>
          <Text style={styles.slideCounter}>
            {slideIndex + 1} / {stopsWithPhotos.length}
          </Text>
          <TouchableOpacity
            style={[
              styles.slideNavBtn,
              slideIndex === stopsWithPhotos.length - 1 &&
                styles.slideNavBtnDisabled,
            ]}
            onPress={() =>
              setSlideIndex((i) => Math.min(stopsWithPhotos.length - 1, i + 1))
            }
            disabled={slideIndex === stopsWithPhotos.length - 1}
          >
            <Text style={styles.slideNavText}>Next ›</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.slideBrand}>
          <Text style={styles.slideBrandText}>
            {hunt.huntTitle} · 🗺️ Daytripper
          </Text>
        </View>
      </ScrollView>
    );
  };

  // ── Download menu ──────────────────────────────────────────────
  const DownloadMenu = () => (
    <View style={styles.downloadMenu}>
      <Text style={styles.downloadMenuTitle}>Save or Share</Text>
      {[
        {
          emoji: "📱",
          title: "Save to Camera Roll",
          sub: "Save each stop photo individually",
          onPress: saveToPhotos,
        },
        {
          emoji: "🖼️",
          title: "Save as Collage",
          sub: "Single image with all photos",
          onPress: saveAsCollage,
        },
        {
          emoji: "📄",
          title: "Save as PDF",
          sub: "Full album with fun facts",
          onPress: saveAsPDF,
        },
      ].map((item) => (
        <TouchableOpacity
          key={item.title}
          style={styles.downloadOption}
          onPress={item.onPress}
        >
          <Text style={styles.downloadOptionEmoji}>{item.emoji}</Text>
          <View style={styles.downloadOptionText}>
            <Text style={styles.downloadOptionTitle}>{item.title}</Text>
            <Text style={styles.downloadOptionSub}>{item.sub}</Text>
          </View>
        </TouchableOpacity>
      ))}
      <View style={styles.downloadDivider} />
      <Text style={styles.downloadShareLabel}>Share Format</Text>
      {(["square", "story", "landscape"] as FormatType[]).map((format) => (
        <TouchableOpacity
          key={format}
          style={styles.downloadOption}
          onPress={() => handleShare(format)}
        >
          <Text style={styles.downloadOptionEmoji}>
            {format === "square" ? "⬛" : format === "story" ? "📱" : "🖥️"}
          </Text>
          <View style={styles.downloadOptionText}>
            <Text style={styles.downloadOptionTitle}>
              Share{" "}
              {format === "square"
                ? "Square"
                : format === "story"
                  ? "Story"
                  : "Landscape"}
            </Text>
            <Text style={styles.downloadOptionSub}>
              {format === "square"
                ? "Instagram feed"
                : format === "story"
                  ? "Instagram/TikTok Stories"
                  : "Standard photo"}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
      <TouchableOpacity
        style={styles.downloadCancelBtn}
        onPress={() => setShowFormatMenu(false)}
      >
        <Text style={styles.downloadCancelText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );

  // ── Main render ────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>📸 Hunt Album</Text>
          <Text style={styles.headerSub}>{totalPhotos} photos</Text>
        </View>
        <TouchableOpacity
          style={styles.shareBtn}
          onPress={() => setShowFormatMenu(true)}
          disabled={downloading}
        >
          {downloading ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Text style={styles.shareBtnText}>⬇️</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Tab bar */}
      <View style={styles.tabs}>
        {(
          [
            { key: "map", label: "🗺️ Map" },
            { key: "grid", label: "⊞ Grid" },
            { key: "slideshow", label: "▶ Slideshow" },
          ] as { key: TabType; label: string }[]
        ).map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab.key && styles.tabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab content */}
      <View style={styles.content}>
        {activeTab === "map" && <MapTab />}
        {activeTab === "grid" && <GridTab />}
        {activeTab === "slideshow" && <SlideshowTab />}
      </View>

      {/* Download Modal — slides up from bottom */}
      <Modal
        visible={showFormatMenu}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFormatMenu(false)}
      >
        <View style={styles.modalOverlay}>
          <SafeAreaView edges={["bottom"]} style={styles.modalContainer}>
            <ScrollView>
              <DownloadMenu />
            </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.offWhite },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: SPACING.md,
    backgroundColor: COLORS.primary,
  },
  backBtn: { padding: SPACING.sm },
  backText: {
    color: COLORS.accent,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
  },
  headerCenter: { alignItems: "center" },
  headerTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.white,
  },
  headerSub: { fontSize: FONTS.sizes.xs, color: "#AED6F1", marginTop: 2 },
  shareBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.round,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  shareBtnText: { fontSize: 18 },
  tabs: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  tab: { flex: 1, padding: SPACING.md, alignItems: "center" },
  tabActive: { borderBottomWidth: 3, borderBottomColor: COLORS.accent },
  tabText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
    fontWeight: FONTS.weights.medium,
  },
  tabTextActive: { color: COLORS.accent, fontWeight: FONTS.weights.bold },
  content: { flex: 1 },
  mapContainer: { flex: 1 },
  map: { flex: 1 },
  photoMarker: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: COLORS.white,
    overflow: "hidden",
    ...SHADOW.md,
  },
  photoMarkerImage: { width: "100%", height: "100%" },
  photoMarkerBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.accent,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  photoMarkerNum: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: FONTS.weights.heavy,
  },
  callout: { padding: SPACING.sm, minWidth: 120 },
  calloutTitle: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
    color: COLORS.primary,
  },
  calloutSub: { fontSize: FONTS.sizes.xs, color: COLORS.darkGray },
  mapOverlay: {
    position: "absolute",
    top: SPACING.md,
    left: SPACING.md,
    right: SPACING.md,
    backgroundColor: "rgba(26,58,92,0.85)",
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
  },
  mapOverlayTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.white,
  },
  mapOverlayCity: { fontSize: FONTS.sizes.sm, color: "#AED6F1", marginTop: 2 },
  gridScroll: { padding: SPACING.md },
  collageContainer: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    overflow: "hidden",
    ...SHADOW.md,
  },
  collageHeader: {
    backgroundColor: COLORS.primary,
    padding: SPACING.lg,
    alignItems: "center",
  },
  collageTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.white,
    textAlign: "center",
  },
  collageCity: { fontSize: FONTS.sizes.md, color: "#AED6F1", marginTop: 4 },
  collageMeta: {
    fontSize: FONTS.sizes.xs,
    color: "rgba(255,255,255,0.6)",
    marginTop: 4,
  },
  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: SPACING.sm,
    gap: SPACING.sm,
  },
  gridPhotoContainer: {
    width: (SCREEN_WIDTH - SPACING.lg * 2 - SPACING.sm * 4) / 3,
  },
  gridPhoto: { width: "100%", aspectRatio: 1, borderRadius: RADIUS.sm },
  gridPhotoOverlay: {
    position: "absolute",
    top: 4,
    left: 4,
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.round,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  gridPhotoNum: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: FONTS.weights.heavy,
  },
  gridPhotoName: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.darkGray,
    marginTop: 4,
    textAlign: "center",
  },
  collageFooter: {
    padding: SPACING.md,
    alignItems: "center",
    backgroundColor: COLORS.lightGray,
  },
  collageFooterText: { fontSize: FONTS.sizes.sm, color: COLORS.darkGray },
  slideContainer: { backgroundColor: COLORS.black },
  slidePhoto: { width: SCREEN_WIDTH, height: SCREEN_WIDTH * 1.2 },
  slideOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.md,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  slideStopBadge: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.round,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: "flex-start",
    marginBottom: SPACING.sm,
  },
  slideStopNum: {
    color: COLORS.white,
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.heavy,
  },
  slideName: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.white,
    marginBottom: 4,
  },
  slideAddress: { fontSize: FONTS.sizes.sm, color: "rgba(255,255,255,0.7)" },
  slideFact: { backgroundColor: COLORS.white, padding: SPACING.md },
  slideFactLabel: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
    color: COLORS.accent,
    marginBottom: 6,
  },
  slideFactText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
    lineHeight: 20,
  },
  slideNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  slideNavBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  slideNavBtnDisabled: { opacity: 0.4 },
  slideNavText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
  },
  slideCounter: {
    fontSize: FONTS.sizes.md,
    color: COLORS.darkGray,
    fontWeight: FONTS.weights.medium,
  },
  slideBrand: {
    backgroundColor: COLORS.lightGray,
    padding: SPACING.sm,
    alignItems: "center",
  },
  slideBrandText: { fontSize: FONTS.sizes.xs, color: COLORS.darkGray },
  downloadMenu: { padding: SPACING.lg },
  downloadMenuTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.primary,
    marginBottom: SPACING.lg,
  },
  downloadOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  downloadOptionEmoji: { fontSize: 28 },
  downloadOptionText: { flex: 1 },
  downloadOptionTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.black,
  },
  downloadOptionSub: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
    marginTop: 2,
  },
  downloadDivider: {
    height: 1,
    backgroundColor: COLORS.lightGray,
    marginVertical: SPACING.md,
  },
  downloadShareLabel: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
    color: COLORS.darkGray,
    marginBottom: SPACING.sm,
  },
  downloadCancelBtn: {
    marginTop: SPACING.lg,
    padding: SPACING.md,
    alignItems: "center",
  },
  downloadCancelText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.danger,
    fontWeight: FONTS.weights.bold,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl,
  },
  emptyEmoji: { fontSize: 64, marginBottom: SPACING.md },
  emptyTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  emptySub: {
    fontSize: FONTS.sizes.md,
    color: COLORS.darkGray,
    textAlign: "center",
    lineHeight: 22,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    maxHeight: "80%",
  },
});

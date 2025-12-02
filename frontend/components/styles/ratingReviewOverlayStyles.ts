import { StyleSheet } from "react-native";

export const ratingReviewOverlayStyles = StyleSheet.create({
  selectedOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  overlayInner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20, // keeps card off very top/bottom on short viewports
  },
  selectedCard: {
    width: 420,
    maxWidth: "100%",
    maxHeight: "80%", // allow it to shrink on short screens
    backgroundColor: "#050814",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#1f2937",
    overflow: "hidden",
  },
  selectedCardContent: {
    padding: 20,
    paddingBottom: 16,
  },

  selectedImageWrapper: {
    marginBottom: 16,
  },
  selectedImage: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 14,
    backgroundColor: "#111827",
  },
  selectedTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
  },
  selectedSubtitle: {
    color: "#9ca3af",
    fontSize: 13,
    marginTop: 2,
  },
  selectedMeta: {
    color: "#6b7280",
    fontSize: 11,
    marginTop: 4,
    marginBottom: 12,
  },

  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  ratingStars: {
    flexDirection: "row",
    marginRight: 12,
  },

  // star rendering
  starPressArea: {
    paddingHorizontal: 2,
  },
  starContainer: {
    width: 20,
    height: 20,
    position: "relative",
  },
  starBase: {
    position: "absolute",
    left: 0,
    top: 0,
  },
  starFillMask: {
    position: "absolute",
    left: 0,
    top: 0,
    height: 20,
    overflow: "hidden",
  },
  starFill: {
    position: "absolute",
    left: 0,
    top: 0,
  },

  ratingInput: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#374151",
    color: "#ffffff",
    width: 60,
    fontSize: 13,
  },

  reviewInput: {
    borderWidth: 1,
    borderColor: "#374151",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: "#ffffff",
    fontSize: 13,
    minHeight: 80,
    textAlignVertical: "top",
    marginBottom: 16,
  },

  actionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  secondaryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#4b5563",
    marginRight: 8,
  },
  secondaryButtonText: {
    color: "#e5e7eb",
    fontSize: 13,
  },
  primaryButton: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#22c55e",
  },
  primaryButtonText: {
    color: "#050814",
    fontSize: 13,
    fontWeight: "600",
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },

  loadingExistingText: {
    color: "#9ca3af",
    fontSize: 11,
    marginTop: 4,
    marginBottom: 8,
  },
  errorText: {
    color: "#f97373",
    marginTop: 8,
    fontSize: 12,
  },
});


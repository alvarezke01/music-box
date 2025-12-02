import { StyleSheet } from "react-native";

export const discoverStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050814",
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  title: {
    color: "white",
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    color: "#b0b0b0",
    fontSize: 14,
  },

  // Scroll / layout
  resultsScroll: {
    marginTop: 16,
  },

  // Status / feedback text
  authStatusText: {
    color: "#b0b0b0",
    marginBottom: 8,
  },
  loadingContainer: {
    marginTop: 4,
  },
  loadingText: {
    color: "#b0b0b0",
    marginTop: 8,
  },
  errorText: {
    color: "#f97373",
  },

  // Search results header
  resultHeader: {
    color: "#ffffff",
    fontWeight: "600",
    marginBottom: 12,
  },

  // Sections (Tracks / Albums / Artists)
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: "#e5e7eb",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },

  // Grid of cards — wraps to multiple rows based on screen width
  resultsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  //  Selected item overlay 
  selectedOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 40,    
    paddingBottom: 40, 
  },
  selectedCard: {
    width: 420,
    maxWidth: "100%",
    backgroundColor: "#050814",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#1f2937",
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
  starPressArea: {
    paddingHorizontal: 2,
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
});


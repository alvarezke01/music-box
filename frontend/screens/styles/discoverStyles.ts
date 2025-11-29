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

  // Horizontal card row
  cardRow: {
    paddingRight: 8,
  },

  // Individual result card
  resultCard: {
    width: 130,
    marginRight: 12,
    backgroundColor: "#101522",
    borderRadius: 12,
    padding: 10,
  },

  // Images for cards
  albumImageCard: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 10,
    marginBottom: 8,
  },
  artistImageCard: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 999,
    marginBottom: 8,
  },

  // Card text
  cardTitle: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 2,
  },
  cardSubtitle: {
    color: "#9ca3af",
    fontSize: 11,
  },
});

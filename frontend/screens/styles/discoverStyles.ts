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
});


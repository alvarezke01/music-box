import { StyleSheet } from "react-native";

export const recentlyPlayedCardStyles = StyleSheet.create({
  sectionTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 32,
    marginBottom: 16,
  },

  cardContainer: {
    backgroundColor: "#111423",
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: "center",        // center row inside the card
  },

  row: {
    flexDirection: "row",
    justifyContent: "center",    // center tiles within the row
    alignItems: "center",
  },

  trackTile: {
    width: 110,
    marginHorizontal: 8,
    alignItems: "center",
  },

  albumArt: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginBottom: 8,
  },

  trackName: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },

  artistName: {
    color: "#b0b0b0",
    fontSize: 11,
    textAlign: "center",
    marginTop: 2,
  },

  loadingContainer: {
    paddingVertical: 24,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyText: {
    color: "#7a7f9a",
    fontSize: 13,
    textAlign: "center",
  },

  errorText: {
    color: "red",
    fontSize: 12,
    textAlign: "center",
  },
});


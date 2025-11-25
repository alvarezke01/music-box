import { StyleSheet } from "react-native";

export const nowPlayingCardStyles = StyleSheet.create({
  sectionTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },

  cardContainer: {
    backgroundColor: "#111423",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
  },

  albumArt: {
    width: 240,
    height: 240,
    borderRadius: 16,
    marginBottom: 20,
  },

  trackName: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 4,
  },

  artistName: {
    color: "#b0b0b0",
    fontSize: 15,
    textAlign: "center",
    marginBottom: 4,
  },

  albumName: {
    color: "#7a7f9a",
    fontSize: 14,
    textAlign: "center",
  },

  loadingContainer: {
    paddingVertical: 24,
    alignItems: "center",
    justifyContent: "center",
  },

  inactiveText: {
    color: "#7a7f9a",
    fontSize: 13,
  },
});

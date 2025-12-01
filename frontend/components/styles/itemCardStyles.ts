import { StyleSheet } from "react-native";

export const itemCardStyles = StyleSheet.create({
  cardContainer: {
    width: 130,
    marginRight: 12,
    marginBottom: 12,
    backgroundColor: "#101522",
    borderRadius: 12,
    padding: 10,
  },
  cardPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },
  squareImage: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 10,
    marginBottom: 8,
  },
  artistImage: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 999,
    marginBottom: 8,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 2,
  },
  subtitle: {
    color: "#9ca3af",
    fontSize: 11,
  },
});

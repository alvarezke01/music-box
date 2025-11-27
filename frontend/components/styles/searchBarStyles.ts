import { StyleSheet } from "react-native";

export const searchBarStyles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
    marginTop: 12,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111827",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 0,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: "#ffffff",
    fontSize: 14,
    borderWidth: 0,
    backgroundColor: "transparent",
  },
  clearButton: {
    paddingLeft: 8,
    paddingVertical: 4,
  },
  clearText: {
    color: "#9ca3af",
    fontSize: 14,
  },
});

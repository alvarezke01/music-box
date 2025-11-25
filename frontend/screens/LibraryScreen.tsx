import React from "react";
import { View, Text } from "react-native";
import { libraryStyles } from "./styles/libraryStyles";

export const LibraryScreen: React.FC = () => {
  return (
    <View style={libraryStyles.container}>
      <Text style={libraryStyles.title}>Library</Text>
      <Text style={libraryStyles.subtitle}>
        Saved albums, playlists, and rated songs here.
      </Text>
    </View>
  );
};

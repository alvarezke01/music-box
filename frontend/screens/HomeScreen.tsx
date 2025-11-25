import React from "react";
import { ScrollView, Text } from "react-native";
import { homeStyles } from "./styles/homeStyles";
import { useAuth } from "../auth/AuthContext";
import { useNowPlaying } from "../hooks/useNowPlaying";
import { NowPlayingCard } from "../components/NowPlayingCard";

export const HomeScreen: React.FC = () => {
  const { user, accessToken } = useAuth();

  const {
    data: nowPlaying,
    loading,
    error,
  } = useNowPlaying(accessToken);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#050814" }} // Safe container styles
      contentContainerStyle={{
        ...homeStyles.container, // Layout here
        paddingBottom: 32,
      }}
    >
      <Text style={homeStyles.title}>Music Box</Text>
      <Text style={homeStyles.subtitle}>
        HomeScreen: Song of the Day, Now Playing
      </Text>

      <NowPlayingCard
        nowPlaying={nowPlaying}
        loading={loading}
        error={error}
      />
    </ScrollView>
  );
};


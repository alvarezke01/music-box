import React from "react";
import { View, Text, Image, ActivityIndicator } from "react-native";
import { NowPlayingData } from "../hooks/useNowPlaying";
import { nowPlayingCardStyles as styles } from "./styles/nowPlayingCardStyles";

type Props = {
  nowPlaying: NowPlayingData | null;
  loading: boolean;
  error: string | null;
};

export const NowPlayingCard: React.FC<Props> = ({
  nowPlaying,
  loading,
  error,
}) => {
  return (
    <View style={{ marginTop: 24 }}>
      {/* Section Title */}
      <Text style={styles.sectionTitle}>Now Playing</Text>

      {/* Loading State */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator />
        </View>
      )}

      {/* Error */}
      {!loading && error && (
        <Text style={{ color: "red", fontSize: 12 }}>{error}</Text>
      )}

      {/* Active Track */}
      {!loading &&
        !error &&
        nowPlaying &&
        nowPlaying.status !== "inactive" && (
          <View style={styles.cardContainer}>
            {nowPlaying.album_image && (
              <Image
                source={{ uri: nowPlaying.album_image }}
                style={styles.albumArt}
              />
            )}

            <Text style={styles.trackName} numberOfLines={2}>
              {nowPlaying.track_name}
            </Text>

            <Text style={styles.artistName} numberOfLines={1}>
              {nowPlaying.artists.join(", ")}
            </Text>

            <Text style={styles.albumName} numberOfLines={1}>
              {nowPlaying.album}
            </Text>
          </View>
        )}

      {/* Inactive */}
      {!loading &&
        !error &&
        (!nowPlaying || nowPlaying.status === "inactive") && (
          <Text style={styles.inactiveText}>
            Nothing is playing right now. Start something on Spotify to see it
            here.
          </Text>
        )}
    </View>
  );
};

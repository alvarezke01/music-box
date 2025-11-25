import React from "react";
import { View, Text, Image, ActivityIndicator } from "react-native";
import { RecentlyPlayedItem } from "../hooks/useRecentlyPlayed";
import { recentlyPlayedCardStyles as styles } from "./styles/recentlyPlayedCardStyles";

type Props = {
  items: RecentlyPlayedItem[];
  loading: boolean;
  error: string | null;
};

export const RecentlyPlayedCard: React.FC<Props> = ({
  items,
  loading,
  error,
}) => {
  return (
    <View style={{ marginTop: 24 }}>
      <Text style={styles.sectionTitle}>Recently Played</Text>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator />
        </View>
      )}

      {!loading && error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      {!loading && !error && items.length === 0 && (
        <Text style={styles.emptyText}>
          No recent tracks found yet. Start listening on Spotify to see them here.
        </Text>
      )}

      {!loading && !error && items.length > 0 && (
        <View style={styles.cardContainer}>
          <View style={styles.row}>
            {items.map((item, index) => (
              <View key={`${item.played_at}-${index}`} style={styles.trackTile}>
                {item.album_image && (
                  <Image
                    source={{ uri: item.album_image }}
                    style={styles.albumArt}
                  />
                )}
                <Text numberOfLines={2} style={styles.trackName}>
                  {item.track_name}
                </Text>
                <Text numberOfLines={1} style={styles.artistName}>
                  {item.artists.join(", ")}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

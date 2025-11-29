import React, { useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  Image,
} from "react-native";
import { discoverStyles } from "./styles/discoverStyles";
import { SearchBar } from "../components/SearchBar";
import { API_BASE_URL } from "../config";
import { useAuth } from "../auth/AuthContext";

// --- Types ---
type TrackResult = {
  id: string;
  type: "track";
  name: string;
  artists: string[];
  album: string | null;
  album_image: string | null;
  duration_ms: number | null;
};

type AlbumResult = {
  id: string;
  type: "album";
  name: string;
  artists: string[];
  image: string | null;
  release_date: string | null;
};

type ArtistResult = {
  id: string;
  type: "artist";
  name: string;
  image: string | null;
  followers: number | null;
  genres: string[];
};

type DiscoverSearchResults = {
  tracks: TrackResult[];
  albums: AlbumResult[];
  artists: ArtistResult[];
};

type SectionKey = "artists" | "albums" | "tracks";

// Decide which section should come first based on query
const getOrderedSections = (
  query: string,
  results: DiscoverSearchResults
): SectionKey[] => {
  const q = query.toLowerCase().trim();

  const matchesArtist = results.artists.some(
    (a) => a.name.toLowerCase() === q
  );
  const matchesAlbum = results.albums.some(
    (a) => a.name.toLowerCase() === q
  );
  const matchesTrack = results.tracks.some(
    (t) => t.name.toLowerCase() === q
  );

  if (matchesArtist) return ["artists", "albums", "tracks"];
  if (matchesAlbum) return ["albums", "tracks", "artists"];
  if (matchesTrack) return ["tracks", "artists", "albums"];

  // Default order
  return ["artists", "albums", "tracks"];
};

export const DiscoverScreen: React.FC = () => {
  const { accessToken, isAuthenticated, isLoading: authLoading } = useAuth();

  const [query, setQuery] = useState("");
  const [lastSearchQuery, setLastSearchQuery] = useState<string | null>(null);
  const [results, setResults] = useState<DiscoverSearchResults | null>(null);
  const [loading, setLoading] = useState(false); // search loading
  const [error, setError] = useState<string | null>(null);

  const handleSearchSubmit = async () => {
    const trimmed = query.trim();
    if (!trimmed) return;

    if (!accessToken || !isAuthenticated) {
      setError("You need to be logged in and connected to Spotify to search.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url =
        `${API_BASE_URL}/discover/search/music/` +
        `?q=${encodeURIComponent(trimmed)}&type=track,album,artist`;

      const res = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!res.ok) {
        let message = `Request failed with status ${res.status}`;
        try {
          const body = await res.json();
          if (body.detail) message = body.detail;
        } catch {
          // ignore parse error
        }
        throw new Error(message);
      }

      const data: DiscoverSearchResults = await res.json();
      setResults(data);
      setLastSearchQuery(trimmed); // only update when search succeeds
    } catch (err: any) {
      console.error("Discover search error:", err);
      setError(err.message || "Something went wrong while searching.");
      setResults(null);
      setLastSearchQuery(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={discoverStyles.container}>
      <Text style={discoverStyles.title}>Discover</Text>
      <Text style={discoverStyles.subtitle}>
        Explore new artists, genres, and Song of the Day.
      </Text>

      <SearchBar
        value={query}
        onChangeText={setQuery}
        onSubmit={handleSearchSubmit}
      />

      <ScrollView style={discoverStyles.resultsScroll}>
        {authLoading && (
          <Text style={discoverStyles.authStatusText}>
            Checking your session…
          </Text>
        )}

        {loading && (
          <View style={discoverStyles.loadingContainer}>
            <ActivityIndicator size="small" color="#ffffff" />
            <Text style={discoverStyles.loadingText}>Searching…</Text>
          </View>
        )}

        {error && !loading && (
          <Text style={discoverStyles.errorText}>{error}</Text>
        )}

        {results && !loading && !error && lastSearchQuery && (
          <View>
            <Text style={discoverStyles.resultHeader}>
              Results for "{lastSearchQuery}":
            </Text>

            {getOrderedSections(lastSearchQuery, results).map((section) => {
              // Artists
              if (section === "artists" && results.artists.length > 0) {
                return (
                  <View
                    key="artists"
                    style={discoverStyles.sectionContainer}
                  >
                    <Text style={discoverStyles.sectionTitle}>Artists</Text>
                    {results.artists.map((artist) => (
                      <View
                        key={artist.id}
                        style={discoverStyles.listItemRow}
                      >
                        {artist.image && (
                          <Image
                            source={{ uri: artist.image }}
                            style={discoverStyles.artistImage}
                          />
                        )}
                        <View style={discoverStyles.listItemTextContainer}>
                          <Text
                            style={discoverStyles.itemTitle}
                            numberOfLines={1}
                          >
                            {artist.name}
                          </Text>
                          {artist.genres.length > 0 && (
                            <Text
                              style={discoverStyles.itemSubtitle}
                              numberOfLines={1}
                            >
                              {artist.genres.slice(0, 2).join(" • ")}
                            </Text>
                          )}
                        </View>
                      </View>
                    ))}
                  </View>
                );
              }

              // Albums
              if (section === "albums" && results.albums.length > 0) {
                return (
                  <View key="albums" style={discoverStyles.sectionContainer}>
                    <Text style={discoverStyles.sectionTitle}>Albums</Text>
                    {results.albums.map((album) => (
                      <View
                        key={album.id}
                        style={discoverStyles.listItemRow}
                      >
                        {album.image && (
                          <Image
                            source={{ uri: album.image }}
                            style={discoverStyles.albumArt}
                          />
                        )}
                        <View style={discoverStyles.listItemTextContainer}>
                          <Text
                            style={discoverStyles.itemTitle}
                            numberOfLines={1}
                          >
                            {album.name}
                          </Text>
                          <Text
                            style={discoverStyles.itemSubtitle}
                            numberOfLines={1}
                          >
                            {album.artists.join(", ")}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                );
              }

              // Tracks
              if (section === "tracks" && results.tracks.length > 0) {
                return (
                  <View key="tracks" style={discoverStyles.sectionContainer}>
                    <Text style={discoverStyles.sectionTitle}>Tracks</Text>
                    {results.tracks.map((track) => (
                      <View
                        key={track.id}
                        style={discoverStyles.listItemRow}
                      >
                        {track.album_image && (
                          <Image
                            source={{ uri: track.album_image }}
                            style={discoverStyles.albumArt}
                          />
                        )}
                        <View style={discoverStyles.listItemTextContainer}>
                          <Text
                            style={discoverStyles.itemTitle}
                            numberOfLines={1}
                          >
                            {track.name}
                          </Text>
                          <Text
                            style={discoverStyles.itemSubtitle}
                            numberOfLines={1}
                          >
                            {track.artists.join(", ")}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                );
              }

              return null;
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

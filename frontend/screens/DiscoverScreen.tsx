import React, { useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { discoverStyles } from "./styles/discoverStyles";
import { SearchBar } from "../components/SearchBar";
import { API_BASE_URL } from "../config";
import { useAuth } from "../auth/AuthContext";
import { ItemCard } from "../components/ItemCard";

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

                    <View style={discoverStyles.resultsGrid}>
                      {results.artists.map((artist) => (
                        <ItemCard
                          key={artist.id}
                          id={artist.id}
                          itemType="artist"
                          imageUrl={artist.image}
                          title={artist.name}
                          subtitle={artist.genres[0]}
                        />
                      ))}
                    </View>
                  </View>
                );
              }

              // Albums
              if (section === "albums" && results.albums.length > 0) {
                return (
                  <View key="albums" style={discoverStyles.sectionContainer}>
                    <Text style={discoverStyles.sectionTitle}>Albums</Text>

                    <View style={discoverStyles.resultsGrid}>
                      {results.albums.map((album) => (
                        <ItemCard
                          key={album.id}
                          id={album.id}
                          itemType="album"
                          imageUrl={album.image}
                          title={album.name}
                          subtitle={album.artists.join(", ")}
                        />
                      ))}
                    </View>
                  </View>
                );
              }

              // Tracks
              if (section === "tracks" && results.tracks.length > 0) {
                return (
                  <View key="tracks" style={discoverStyles.sectionContainer}>
                    <Text style={discoverStyles.sectionTitle}>Tracks</Text>

                    <View style={discoverStyles.resultsGrid}>
                      {results.tracks.map((track) => (
                        <ItemCard
                          key={track.id}
                          id={track.id}
                          itemType="track"
                          imageUrl={track.album_image}
                          title={track.name}
                          subtitle={track.artists.join(", ")}
                        />
                      ))}
                    </View>
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


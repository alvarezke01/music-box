import { useEffect, useState } from "react";
import { API_BASE_URL } from "../config";

export type RecentlyPlayedItem = {
  played_at: string;
  track_name: string;
  artists: string[];
  album: string;
  album_image: string | null;
  duration_ms: number;
};

type RecentlyPlayedResponse = {
  items: RecentlyPlayedItem[];
};

type UseRecentlyPlayedResult = {
  items: RecentlyPlayedItem[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export const useRecentlyPlayed = (
  accessToken: string | null
): UseRecentlyPlayedResult => {
  const [items, setItems] = useState<RecentlyPlayedItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecentlyPlayed = async (showLoading: boolean = true) => {
    if (!accessToken) {
      setLoading(false);
      setItems([]);
      return;
    }

    try {
      if (showLoading) {
        setLoading(true);
        setError(null);
      }

      const resp = await fetch(`${API_BASE_URL}/user/recently-played/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!resp.ok) {
        throw new Error(`Failed to fetch recently played: ${resp.status}`);
      }

      const json = (await resp.json()) as RecentlyPlayedResponse;
      const limited = (json.items ?? []).slice(0, 5);
      setItems(limited);
    } catch (err) {
      console.error("useRecentlyPlayed error:", err);
      setError("Unable to load recently played tracks.");
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (!accessToken) {
      setLoading(false);
      setItems([]);
      setError(null);
      return;
    }

    // Initial load with spinner
    fetchRecentlyPlayed(true);

    // Background poll every 60 seconds (no spinner)
    const intervalId = setInterval(() => {
      fetchRecentlyPlayed(false);
    }, 60000);

    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  return {
    items,
    loading,
    error,
    refetch: () => fetchRecentlyPlayed(true),
  };
};

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

  const fetchRecentlyPlayed = async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const resp = await fetch(`${API_BASE_URL}/user/recently-played/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!resp.ok) {
        throw new Error(`Failed to fetch recently played: ${resp.status}`);
      }

      const json = (await resp.json()) as RecentlyPlayedResponse;

      // Ensure we only keep the last 5
      const limited = (json.items ?? []).slice(0, 5);
      setItems(limited);
    } catch (err) {
      console.error("useRecentlyPlayed error:", err);
      setError("Unable to load recently played tracks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentlyPlayed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  return { items, loading, error, refetch: fetchRecentlyPlayed };
};

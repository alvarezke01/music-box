import { useEffect, useState } from "react";
import { API_BASE_URL } from "../config";

export type NowPlayingStatus = "playing" | "paused" | "inactive";

export type NowPlayingData = {
  status: NowPlayingStatus;
  is_playing: boolean;
  progress_ms: number | null;
  duration_ms: number | null;
  track_name: string | null;
  artists: string[];
  album: string | null;
  album_image: string | null;
};

type UseNowPlayingResult = {
  data: NowPlayingData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export const useNowPlaying = (
  accessToken: string | null
): UseNowPlayingResult => {
  const [data, setData] = useState<NowPlayingData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // showLoading = true for initial load, false for background polls
  const fetchNowPlaying = async (showLoading: boolean = true) => {
    if (!accessToken) {
      setLoading(false);
      setData(null);
      return;
    }

    try {
      if (showLoading) {
        setLoading(true);
        setError(null);
      }

      const resp = await fetch(`${API_BASE_URL}/user/now-playing/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!resp.ok) {
        throw new Error(`Failed to fetch now playing: ${resp.status}`);
      }

      const json = (await resp.json()) as NowPlayingData;
      setData(json);
    } catch (err) {
      console.error("useNowPlaying error:", err);
      setError("Unable to load now playing.");
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (!accessToken) {
      setLoading(false);
      setData(null);
      setError(null);
      return;
    }

    // Initial load with spinner
    fetchNowPlaying(true);

    // Background poll every 15 seconds (no spinner)
    const intervalId = setInterval(() => {
      fetchNowPlaying(false);
    }, 15000);

    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  return {
    data,
    loading,
    error,
    refetch: () => fetchNowPlaying(true),
  };
};


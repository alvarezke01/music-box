import Constants from "expo-constants";

export const API_BASE_URL: string =
  (Constants.expoConfig?.extra as any)?.apiBaseUrl ?? "http://127.0.0.1:8000";

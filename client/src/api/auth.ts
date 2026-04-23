import { API_BASE } from "@/constants/routes";

export const getAccessToken = async (): Promise<string> => {
  const res = await fetch(`${API_BASE}${"auth/token"}`);
  const tokenData = await res.json();
  return tokenData.access_token;
};

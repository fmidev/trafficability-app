// Small helpers for the two preference cookies the app keeps in the browser:
// the observer's nickname and whether the user has already allowed GPS location.

export const NICKNAME_COOKIE = "traff_nickname";
export const GEOLOCATION_COOKIE = "traff_geolocation_ok";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;
  const prefix = `${name}=`;
  const match = document.cookie
    .split("; ")
    .find((part) => part.startsWith(prefix));
  if (!match) return null;
  try {
    return decodeURIComponent(match.substring(prefix.length));
  } catch {
    return null;
  }
};

export const setCookie = (
  name: string,
  value: string,
  maxAgeSeconds: number = ONE_YEAR_SECONDS
) => {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${maxAgeSeconds}; Path=/; SameSite=Lax${secure}`;
};

export const deleteCookie = (name: string) => {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
};
import { writable } from 'svelte/store';

export interface LocalBackground {
  id: number;
  stationId?: string;
  ambientId?: string;
  label: string;
  subtitle: string;
  path: string;
}

export const LOCAL_BACKGROUNDS: LocalBackground[] = [
  { id: 1, stationId: "cafe", label: "咖啡廳輕音樂", subtitle: "Cafe Lounge", path: "/assets/background/bg1.jpg" },
  { id: 2, stationId: "lofi", label: "專注 Lo-Fi Beats", subtitle: "Lo-Fi Study", path: "/assets/background/bg2.jpg" },
  { id: 3, stationId: "chillhop", label: "Chillhop 律動", subtitle: "Chillhop Groove", path: "/assets/background/bg3.jpg" },
  { id: 4, stationId: "jazz", label: "深夜爵士鋼琴", subtitle: "Piano Jazz Bar", path: "/assets/background/bg4.jpg" },
  { id: 5, stationId: "piano", label: "純淨療癒鋼琴", subtitle: "Peaceful Piano", path: "/assets/background/bg5.jpg" },
  { id: 6, stationId: "nightwave", label: "深夜放鬆氛圍", subtitle: "Nightwave Chill", path: "/assets/background/bg6.jpg" },
  { id: 7, ambientId: "rain", label: "聽雨夜色", subtitle: "Rainy Night Alley", path: "/assets/background/bg7.jpg" },
  { id: 8, ambientId: "campfire", label: "星空營火", subtitle: "Starry Campfire", path: "/assets/background/bg8.jpg" },
  { id: 9, ambientId: "jungle", label: "迷霧森林", subtitle: "Misty Forest", path: "/assets/background/bg9.jpg" },
  { id: 10, ambientId: "waves", label: "靜謐海浪", subtitle: "Moonlit Ocean", path: "/assets/background/bg10.jpg" },
];

/**
 * Returns the path for a given local background ID (clamped to 1..10)
 */
export function getLocalBgPath(id: number): string {
  const clamped = Math.min(10, Math.max(1, Math.floor(id || 1)));
  return `/assets/background/bg${clamped}.jpg`;
}

/**
 * Maps a stationId to its corresponding local background ID (1..6), defaults to 2 (lofi)
 */
export function getLocalBgByStation(stationId: string): number {
  switch (stationId) {
    case "cafe":
      return 1;
    case "lofi":
      return 2;
    case "chillhop":
      return 3;
    case "jazz":
      return 4;
    case "piano":
      return 5;
    case "nightwave":
      return 6;
    default:
      return 2;
  }
}

/**
 * Checks whether a URL is falsy or comes from deprecated / dead domains (bing.img.run, liuzhuai.com)
 */
export function isLegacyBrokenUrl(url: string | null | undefined): boolean {
  if (!url) return true;
  return url.includes("bing.img.run") || url.includes("liuzhuai.com");
}

// Compute initial background URL
function computeInitialBg(): string {
  if (typeof window === "undefined") {
    return "/assets/background/bg2.jpg";
  }

  try {
    const rawBing = localStorage.getItem("bing-bg-url");
    if (isLegacyBrokenUrl(rawBing)) localStorage.removeItem("bing-bg-url");
    const rawBeauty = localStorage.getItem("beauty-bg-url");
    if (isLegacyBrokenUrl(rawBeauty)) localStorage.removeItem("beauty-bg-url");

    const useBing = localStorage.getItem("use-bing-api") === "true";
    const useBeauty = localStorage.getItem("use-beauty-api") === "true";
    const syncStation = localStorage.getItem("bg-sync-station") !== "false";
    const curStation = localStorage.getItem("LofiEngine_Station") || "lofi";

    if (!useBing && !useBeauty) {
      if (syncStation) {
        const initId = getLocalBgByStation(curStation);
        localStorage.setItem("bg-id", initId.toString());
        return getLocalBgPath(initId);
      }
      const savedId = parseInt(localStorage.getItem("bg-id") || "", 10);
      if (!isNaN(savedId) && savedId >= 1 && savedId <= 10) {
        return getLocalBgPath(savedId);
      }
      return getLocalBgPath(getLocalBgByStation(curStation));
    }

    if (useBeauty) {
      const beautyUrl = localStorage.getItem("beauty-bg-url");
      if (beautyUrl && !isLegacyBrokenUrl(beautyUrl)) return beautyUrl;
    }

    if (useBing) {
      const bingUrl = localStorage.getItem("bing-bg-url");
      if (bingUrl && !isLegacyBrokenUrl(bingUrl)) return bingUrl;
    }

    return getLocalBgPath(getLocalBgByStation(curStation));
  } catch {
    return "/assets/background/bg2.jpg";
  }
}

// Initialized so both App.svelte and TVApp.svelte always have a valid initial background URL
export const bgUrl = writable<string>(computeInitialBg());
export const bgTitle = writable<string>("");

// Global fallback station listener for App & TVApp (registered once per window)
if (typeof window !== "undefined" && !(window as any).__lofiBgStationListenerAttached) {
  (window as any).__lofiBgStationListenerAttached = true;
  window.addEventListener("stationChange", (e: any) => {
    try {
      const useBing = localStorage.getItem("use-bing-api") === "true";
      const useBeauty = localStorage.getItem("use-beauty-api") === "true";
      const syncStation = localStorage.getItem("bg-sync-station") !== "false";
      if (!useBing && !useBeauty && syncStation) {
        const station = e.detail;
        if (station && station.id) {
          const newId = getLocalBgByStation(station.id);
          localStorage.setItem("bg-id", newId.toString());
          localStorage.setItem("activeBg", newId.toString());
          bgUrl.set(getLocalBgPath(newId));
          const meta = LOCAL_BACKGROUNDS.find((b) => b.id === newId);
          if (meta) {
            bgTitle.set(`${meta.label} - ${meta.subtitle}`);
          }
        }
      }
    } catch {
      // Ignore storage error
    }
  });
}

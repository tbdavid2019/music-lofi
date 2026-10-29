/**
 * Shareable URL state utilities for Music Lo-Fi Engine
 * Supports deep linking with station, wallpaper, track volumes, and focus timer
 */

import { STATIONS } from "../stores/radioStore";

export interface ShareState {
  stationId: string;
  bg?: string | number; // 1..10 or 'bing' or 'beauty'
  volumes?: {
    main_track: number;
    rain: number;
    thunder: number;
    campfire: number;
    jungle: number;
  };
  timerMinutes?: number;
}

/**
 * Builds a clean, portable shareable URL based on given or current settings
 */
export function buildShareUrl(customState?: Partial<ShareState>): string {
  if (typeof window === "undefined") return "";

  const baseUrl = window.location.origin + window.location.pathname;
  const params = new URLSearchParams();

  // 1. Station
  let stationId = customState?.stationId;
  if (!stationId) {
    try {
      stationId = localStorage.getItem("LofiEngine_Station") || "lofi";
    } catch {
      stationId = "lofi";
    }
  }
  if (stationId) {
    params.set("st", stationId);
  }

  // 2. Wallpaper
  let bg = customState?.bg;
  if (bg === undefined) {
    try {
      const useBing = localStorage.getItem("use-bing-api") === "true";
      const useBeauty = localStorage.getItem("use-beauty-api") === "true";
      if (useBing) bg = "bing";
      else if (useBeauty) bg = "beauty";
      else {
        const rawBg = localStorage.getItem("bg-id");
        if (rawBg) bg = parseInt(rawBg, 10);
      }
    } catch {
      bg = 2;
    }
  }
  if (bg !== undefined && bg !== "") {
    params.set("bg", bg.toString());
  }

  // 3. Volumes: formatted as main,rain,thunder,campfire,jungle (integers 0..100)
  let vols = customState?.volumes;
  if (!vols) {
    try {
      const raw = localStorage.getItem("Volumes");
      if (raw) vols = JSON.parse(raw);
    } catch {}
  }

  const vMain = Math.round(Math.max(0, Math.min(1, vols?.main_track ?? 1)) * 100);
  const vRain = Math.round(Math.max(0, Math.min(1, vols?.rain ?? 1)) * 100);
  const vThunder = Math.round(Math.max(0, Math.min(1, vols?.thunder ?? 1)) * 100);
  const vCampfire = Math.round(Math.max(0, Math.min(1, vols?.campfire ?? 1)) * 100);
  const vJungle = Math.round(Math.max(0, Math.min(1, vols?.jungle ?? 1)) * 100);

  // Only append volumes if not all defaults (100)
  if (vMain !== 100 || vRain !== 100 || vThunder !== 100 || vCampfire !== 100 || vJungle !== 100) {
    params.set("vol", `${vMain},${vRain},${vThunder},${vCampfire},${vJungle}`);
  }

  // 4. Timer if any
  if (customState?.timerMinutes) {
    params.set("tm", customState.timerMinutes.toString());
  }

  const queryString = params.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

/**
 * Parses query params from window.location and returns valid ShareState or null
 */
export function parseShareUrl(): ShareState | null {
  if (typeof window === "undefined") return null;

  try {
    const search = window.location.search;
    if (!search || search.length <= 1) return null;

    const params = new URLSearchParams(search);
    const stParam = params.get("st");
    const bgParam = params.get("bg");
    const volParam = params.get("vol");
    const tmParam = params.get("tm");

    if (!stParam && !bgParam && !volParam && !tmParam) {
      return null;
    }

    const state: ShareState = {
      stationId: "lofi",
    };

    // Station
    if (stParam && STATIONS.some((s) => s.id === stParam)) {
      state.stationId = stParam;
    } else if (stParam === "nightwave") {
      state.stationId = "groovesalad"; // alias compatibility
    }

    // Wallpaper
    if (bgParam) {
      if (bgParam === "bing" || bgParam === "beauty") {
        state.bg = bgParam;
      } else {
        const bgNum = parseInt(bgParam, 10);
        if (!isNaN(bgNum) && bgNum >= 1 && bgNum <= 10) {
          state.bg = bgNum;
        }
      }
    }

    // Volumes
    if (volParam) {
      const parts = volParam.split(",").map((v) => parseInt(v.trim(), 10));
      if (parts.length >= 5 && parts.every((n) => !isNaN(n))) {
        state.volumes = {
          main_track: Math.max(0, Math.min(100, parts[0])) / 100,
          rain: Math.max(0, Math.min(100, parts[1])) / 100,
          thunder: Math.max(0, Math.min(100, parts[2])) / 100,
          campfire: Math.max(0, Math.min(100, parts[3])) / 100,
          jungle: Math.max(0, Math.min(100, parts[4])) / 100,
        };
      }
    }

    // Timer
    if (tmParam) {
      const tm = parseInt(tmParam, 10);
      if (!isNaN(tm) && tm > 0) {
        state.timerMinutes = tm;
      }
    }

    return state;
  } catch (e) {
    console.warn("[shareUtils] Failed to parse share URL:", e);
    return null;
  }
}

/**
 * Copies the current share URL to clipboard with fallback
 */
export async function copyShareLink(customState?: Partial<ShareState>): Promise<boolean> {
  const url = buildShareUrl(customState);
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
      return true;
    }
  } catch (err) {
    console.warn("[shareUtils] Clipboard API failed, trying execCommand:", err);
  }

  try {
    const input = document.createElement("textarea");
    input.value = url;
    input.style.position = "fixed";
    input.style.opacity = "0";
    document.body.appendChild(input);
    input.select();
    const success = document.execCommand("copy");
    document.body.removeChild(input);
    return success;
  } catch (e) {
    console.error("[shareUtils] Failed to copy link to clipboard:", e);
    return false;
  }
}

import { writable, derived, get } from "svelte/store";

export type StationIcon =
  | "coffee"
  | "headphones"
  | "disc"
  | "music2"
  | "music"
  | "eighth-notes"
  | "moon"
  | "sparkles"
  | "cpu"
  | "radio";

export type StationCategory = "focus" | "chill" | "calm" | "retro";

export interface StationCategoryInfo {
  id: StationCategory;
  label: string;
  iconName: string;
}

export const STATION_CATEGORIES: StationCategoryInfo[] = [
  { id: "focus", label: "專注工作", iconName: "headphones" },
  { id: "chill", label: "咖啡弛放", iconName: "coffee" },
  { id: "calm", label: "器樂古典", iconName: "eighth-notes" },
  { id: "retro", label: "懷舊氛圍", iconName: "disc" },
];

export interface Station {
  id: string;
  category: StationCategory;
  icon: StationIcon;
  name: string;
  label: string;
  description: string;
  url: string;
  fallbackUrl: string;
}

export const STATIONS: Station[] = [
  // 1. Focus 專注工作
  {
    id: "lofi",
    category: "focus",
    icon: "headphones",
    name: "Lo-Fi Study",
    label: "專注 Lo-Fi Beats",
    description: "經典 24/7 Lo-Fi Hip Hop 讀書工作節拍",
    url: "https://listen.reyfm.de/lofi_192kbps.mp3",
    fallbackUrl: "https://0nlineradio.radioho.st/0r-lo-fi",
  },
  {
    id: "chillhop",
    category: "focus",
    icon: "disc",
    name: "Chillhop Groove",
    label: "Chillhop 律動",
    description: "柔和輕快的爵士嘻哈與節奏感",
    url: "https://streams.ilovemusic.de/iloveradio17.mp3",
    fallbackUrl: "https://public.isekoi-radio.com/listen/chill/radio.mp3",
  },
  {
    id: "dronezone",
    category: "focus",
    icon: "sparkles",
    name: "Drone Zone",
    label: "深層冥想環境音",
    description: "SomaFM 殿堂級環境氛圍，深沉無人聲專注流",
    url: "https://ice1.somafm.com/dronezone-128-mp3",
    fallbackUrl: "https://ice4.somafm.com/dronezone-128-mp3",
  },
  {
    id: "defcon",
    category: "focus",
    icon: "cpu",
    name: "DEF CON Radio",
    label: "賽博駭客節拍",
    description: "暗黑賽博龐克與工程電子，編碼心流專用",
    url: "https://ice1.somafm.com/defcon-128-mp3",
    fallbackUrl: "https://ice4.somafm.com/defcon-128-mp3",
  },

  // 2. Chill 咖啡弛放
  {
    id: "cafe",
    category: "chill",
    icon: "coffee",
    name: "Cafe Lounge",
    label: "咖啡廳輕音樂",
    description: "溫暖慵懶的 Bossa 與午後咖啡廳氛圍",
    url: "https://0nlineradio.radioho.st/lounge-coffee-bar-lounge",
    fallbackUrl: "https://streams.ilovemusic.de/iloveradio17.mp3",
  },
  {
    id: "jazz",
    category: "chill",
    icon: "eighth-notes",
    name: "Piano Jazz Bar",
    label: "深夜爵士鋼琴",
    description: "優雅醇厚的鋼琴爵士與低吟酒廊時光",
    url: "https://0nlineradio.radioho.st/lounge-piano-jazz-bar",
    fallbackUrl: "https://ice1.somafm.com/illstreet-128-mp3",
  },
  {
    id: "secretagent",
    category: "chill",
    icon: "radio",
    name: "Secret Agent",
    label: "復古秘密沙龍",
    description: "SomaFM 007 沙龍，復古 Downtempo 與弛放調情",
    url: "https://ice1.somafm.com/secretagent-128-mp3",
    fallbackUrl: "https://ice4.somafm.com/secretagent-128-mp3",
  },
  {
    id: "lush",
    category: "chill",
    icon: "moon",
    name: "Lush Chillout",
    label: "空靈溫柔女聲",
    description: "SomaFM 夢幻空靈人聲與絲滑緩拍治癒",
    url: "https://ice1.somafm.com/lush-128-mp3",
    fallbackUrl: "https://ice4.somafm.com/lush-128-mp3",
  },

  // 3. Calm 器樂古典
  {
    id: "piano",
    category: "calm",
    icon: "eighth-notes",
    name: "Peaceful Piano",
    label: "純淨療癒鋼琴",
    description: "寧靜溫柔的純鋼琴獨奏曲庫",
    url: "https://peacefulpiano.stream.publicradio.org/peacefulpiano.aac",
    fallbackUrl: "https://0nlineradio.radioho.st/classical-classical-piano",
  },
  {
    id: "classical",
    category: "calm",
    icon: "eighth-notes",
    name: "Classical Radio",
    label: "經典古典管弦",
    description: "優雅沉靜的室內樂與巴洛克古典交響",
    url: "https://0nlineradio.radioho.st/classical-classical-piano",
    fallbackUrl: "https://media-ssl.musicradio.com/ClassicFM",
  },

  // 4. Retro 懷舊氛圍
  {
    id: "nightwave",
    category: "retro",
    icon: "moon",
    name: "Groove Salad",
    label: "深夜放鬆氛圍",
    description: "SomaFM 全球經典環境弛放電台",
    url: "https://ice1.somafm.com/groovesalad-128-mp3",
    fallbackUrl: "https://radio.plaza.one/mp3",
  },
  {
    id: "vaporwave",
    category: "retro",
    icon: "disc",
    name: "Nightwave Plaza",
    label: "蒸氣波懷舊電台",
    description: "Nightwave Plaza 復古蒸氣波與 80s 迷幻回憶",
    url: "https://radio.plaza.one/mp3",
    fallbackUrl: "https://plaza.one/mp3",
  },
];

export interface RadioState {
  isPlaying: boolean;
  isBuffering: boolean;
  currentStationId: string;
  volume: number;
  error: string | null;
}

function getInitialStationId(): string {
  if (typeof window !== "undefined") {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const urlStation = urlParams.get("st");
      if (urlStation) {
        if (STATIONS.some((s) => s.id === urlStation)) {
          return urlStation;
        }
        if (urlStation === "nightwave") {
          return "nightwave";
        }
      }
    } catch {}

    const saved = localStorage.getItem("LofiEngine_Station");
    if (saved && STATIONS.some((s) => s.id === saved)) {
      return saved;
    }
  }
  return "lofi";
}

function getInitialVolume(): number {
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("Volumes");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed.main_track === "number" && !isNaN(parsed.main_track)) {
          return Math.max(0, Math.min(1, parsed.main_track));
        }
      }
    } catch (e) {
      console.warn("[radioStore] Failed to parse Volumes:", e);
    }
  }
  return 1;
}

export const radioStore = writable<RadioState>({
  isPlaying: false,
  isBuffering: false,
  currentStationId: getInitialStationId(),
  volume: getInitialVolume(),
  error: null,
});

export const currentStation = derived(radioStore, ($store) => {
  return (
    STATIONS.find((s) => s.id === $store.currentStationId) || STATIONS[1]
  );
});

// Audio singleton & internals
let audio: HTMLAudioElement | null = null;
let usingFallback = false;
let fadeInterval: any = null;
let requestSeq = 0;

function clearFadeInterval() {
  if (fadeInterval) {
    clearInterval(fadeInterval);
    fadeInterval = null;
  }
}

function getAudio(): HTMLAudioElement {
  if (!audio && typeof window !== "undefined") {
    audio = new Audio();
    audio.preload = "none";
    const initialVol = get(radioStore).volume;
    audio.volume = initialVol;

    audio.addEventListener("loadstart", () => {
      radioStore.update((s) => ({ ...s, isBuffering: true, error: null }));
    });

    audio.addEventListener("waiting", () => {
      radioStore.update((s) => ({ ...s, isBuffering: true }));
    });

    audio.addEventListener("stalled", () => {
      if (!audio?.paused) {
        radioStore.update((s) => ({ ...s, isBuffering: true }));
      }
    });

    audio.addEventListener("playing", () => {
      radioStore.update((s) => ({
        ...s,
        isPlaying: true,
        isBuffering: false,
        error: null,
      }));
      dispatchPlayState(true);
    });

    audio.addEventListener("pause", () => {
      // If paused not while fading out
      if (!fadeInterval) {
        radioStore.update((s) => ({ ...s, isPlaying: false, isBuffering: false }));
        dispatchPlayState(false);
      }
    });

    audio.addEventListener("canplay", () => {
      radioStore.update((s) => ({ ...s, isBuffering: false }));
    });

    audio.addEventListener("error", (e) => {
      console.warn("[radioStore] Audio error:", e);
      handleAudioError();
    });
  }
  return audio as HTMLAudioElement;
}

function dispatchPlayState(isPlaying: boolean) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("playStateChange", { detail: isPlaying })
    );
  }
}

function dispatchStationChange(station: Station) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("stationChange", { detail: station })
    );
  }
}

function handleAudioError() {
  const state = get(radioStore);
  const station = STATIONS.find((s) => s.id === state.currentStationId) || STATIONS[1];

  if (!usingFallback && station.fallbackUrl) {
    console.warn(`[radioStore] Primary stream failed for ${station.name}. Trying fallback: ${station.fallbackUrl}`);
    usingFallback = true;
    radioStore.update((s) => ({ ...s, isBuffering: true, error: null }));
    const a = getAudio();
    a.src = station.fallbackUrl;
    a.load();
    a.play().catch((err) => {
      if (err?.name === "AbortError") return;
      if (err?.name === "NotAllowedError") {
        radioStore.update((s) => ({ ...s, isPlaying: false, isBuffering: false }));
        dispatchPlayState(false);
        return;
      }
      console.error("[radioStore] Fallback stream play error:", err);
      radioStore.update((s) => ({
        ...s,
        isPlaying: false,
        isBuffering: false,
        error: "電台暫時無法播放，請切換其他頻道",
      }));
      dispatchPlayState(false);
    });
  } else {
    radioStore.update((s) => ({
      ...s,
      isPlaying: false,
      isBuffering: false,
      error: "電台連線失敗，請稍後再試或切換頻道",
    }));
    dispatchPlayState(false);
  }
}

export function playStation(stationId: string, autoPlay = true) {
  const station = STATIONS.find((s) => s.id === stationId) || STATIONS[0];
  const a = getAudio();
  const currentReq = ++requestSeq;

  clearFadeInterval();
  a.volume = get(radioStore).volume;

  usingFallback = false;
  radioStore.update((s) => ({
    ...s,
    currentStationId: station.id,
    error: null,
    isBuffering: autoPlay,
  }));

  if (typeof window !== "undefined") {
    localStorage.setItem("LofiEngine_Station", station.id);
  }
  dispatchStationChange(station);

  a.pause();
  a.src = station.url;
  a.load();

  if (autoPlay) {
    a.play().catch((err) => {
      if (currentReq !== requestSeq || err?.name === "AbortError") return;
      if (err?.name === "NotAllowedError") {
        radioStore.update((s) => ({ ...s, isPlaying: false, isBuffering: false }));
        dispatchPlayState(false);
        return;
      }
      console.warn("[radioStore] Play error on primary stream:", err);
      handleAudioError();
    });
  } else {
    radioStore.update((s) => ({ ...s, isPlaying: false, isBuffering: false }));
    dispatchPlayState(false);
  }
}

export function togglePlay() {
  const a = getAudio();
  const state = get(radioStore);

  clearFadeInterval();
  a.volume = state.volume;

  if (state.isPlaying) {
    a.pause();
    radioStore.update((s) => ({ ...s, isPlaying: false, isBuffering: false }));
    dispatchPlayState(false);
  } else {
    if (!a.src || a.src === "" || a.src === window.location.href) {
      playStation(state.currentStationId, true);
    } else {
      const currentReq = ++requestSeq;
      radioStore.update((s) => ({ ...s, isBuffering: true, error: null }));
      a.play().catch((err) => {
        if (currentReq !== requestSeq || err?.name === "AbortError") return;
        if (err?.name === "NotAllowedError") {
          radioStore.update((s) => ({ ...s, isPlaying: false, isBuffering: false }));
          dispatchPlayState(false);
          return;
        }
        console.warn("[radioStore] Play error:", err);
        handleAudioError();
      });
    }
  }
}

export function nextStation() {
  const state = get(radioStore);
  const currentIndex = STATIONS.findIndex((s) => s.id === state.currentStationId);
  const nextIndex = (currentIndex + 1) % STATIONS.length;
  playStation(STATIONS[nextIndex].id, true);
}

export function prevStation() {
  const state = get(radioStore);
  const currentIndex = STATIONS.findIndex((s) => s.id === state.currentStationId);
  const prevIndex = (currentIndex - 1 + STATIONS.length) % STATIONS.length;
  playStation(STATIONS[prevIndex].id, true);
}

export function setMainVolume(vol: number) {
  const clamped = Math.max(0, Math.min(1, vol));
  const a = getAudio();
  clearFadeInterval();
  a.volume = clamped;

  radioStore.update((s) => ({ ...s, volume: clamped }));

  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("Volumes");
      const vols = raw ? JSON.parse(raw) : {
        rain: 1,
        thunder: 1,
        campfire: 1,
        jungle: 1,
        main_track: 1,
      };
      vols.main_track = clamped;
      localStorage.setItem("Volumes", JSON.stringify(vols));
      window.dispatchEvent(new CustomEvent("volumesUpdated", { detail: vols }));
      window.dispatchEvent(new CustomEvent("volumeChange", { detail: Math.round(clamped * 100) }));
    } catch (e) {
      console.warn("[radioStore] Failed to save volume:", e);
    }
  }
}

export function fadeOutAndStop(durationSec = 3) {
  const a = getAudio();
  const state = get(radioStore);
  if (!state.isPlaying || a.paused) return;

  clearFadeInterval();

  const initialVolume = state.volume;
  const steps = Math.max(10, Math.round(durationSec * 10));
  const stepTime = (durationSec * 1000) / steps;
  const volStep = initialVolume / steps;
  let currentStep = 0;

  fadeInterval = setInterval(() => {
    currentStep++;
    if (currentStep >= steps || a.volume <= volStep) {
      clearFadeInterval();
      a.pause();
      a.volume = get(radioStore).volume; // Restore configured volume setting
      radioStore.update((s) => ({ ...s, isPlaying: false, isBuffering: false }));
      dispatchPlayState(false);
    } else {
      a.volume = Math.max(0, a.volume - volStep);
    }
  }, stepTime);
}

// Global browser listeners
if (typeof window !== "undefined") {
  window.addEventListener("fadeOutMusic", () => {
    fadeOutAndStop(3);
  });

  window.addEventListener("loadPreset", (e: any) => {
    const detail = e.detail;
    if (!detail) return;
    if (detail.volumes && typeof detail.volumes === "object") {
      try {
        const mergedVols = {
          rain: 1,
          thunder: 1,
          campfire: 1,
          jungle: 1,
          main_track: 1,
          ...detail.volumes,
        };
        localStorage.setItem("Volumes", JSON.stringify(mergedVols));
        window.dispatchEvent(new CustomEvent("volumesUpdated", { detail: mergedVols }));
        if (typeof mergedVols.main_track === "number") {
          setMainVolume(mergedVols.main_track);
        }
      } catch (err) {
        console.warn("[radioStore] Failed to apply preset volumes:", err);
      }
    }
    if (typeof detail.background === "number") {
      localStorage.setItem("activeBg", detail.background.toString());
      localStorage.setItem("bg-id", detail.background.toString());
      window.dispatchEvent(new CustomEvent("changeBg", { detail: detail.background }));
    }
    if (detail.stationId) {
      playStation(detail.stationId, true);
    }
  });
}

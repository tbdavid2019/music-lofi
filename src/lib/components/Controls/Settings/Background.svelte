<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { get } from "svelte/store";
  import {
    Globe,
    Heart,
    Coffee,
    Pin,
    Dices,
    ChevronLeft,
    ChevronRight,
    RotateCcw,
    Loader2,
    Check,
  } from "@lucide/svelte";
  import {
    bgUrl,
    bgTitle,
    LOCAL_BACKGROUNDS,
    getLocalBgPath,
    getLocalBgByStation,
    isLegacyBrokenUrl,
  } from "../../../stores/bgStore";

  type BgSource = "bing" | "beauty" | "local";
  type BgMode = "fixed" | "random";

  let currentSource: BgSource = "local";
  let currentMode: BgMode = "fixed";

  // State from localStorage
  let id: number = 2;
  let useBingApi = false;
  let useBingRandom = true;
  let useBeautyApi = false;
  let syncWithStation = true;

  let currentBingUrl = "";
  let currentBeautyUrl = "";
  let lastBingFetchDate = "";
  let lastBeautyFetchDate = "";

  let isLoadingBing = false;
  let isLoadingBeauty = false;
  let requestSeq = 0;

  let cleanupListeners: (() => void) | null = null;

  // Detect mobile screen or user agent
  function isMobileDevice(): boolean {
    if (typeof window === "undefined") return false;
    return (
      window.innerWidth <= 600 ||
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    );
  }

  // Helper for JSON fetching with abort timeout covering both headers and body
  async function fetchJsonWithTimeout(url: string, timeoutMs = 3500): Promise<any> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    } finally {
      clearTimeout(timer);
    }
  }

  // Preload an image to verify it loads without error
  function preloadImage(url: string, timeoutMs = 5000): Promise<boolean> {
    return new Promise((resolve) => {
      if (typeof window === "undefined") {
        resolve(true);
        return;
      }
      const img = new Image();
      let settled = false;
      const timer = setTimeout(() => {
        if (!settled) {
          settled = true;
          resolve(false);
        }
      }, timeoutMs);

      img.onload = () => {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          resolve(true);
        }
      };
      img.onerror = () => {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          resolve(false);
        }
      };
      img.src = url;
    });
  }

  // Tier 3 Verified Official Microsoft Bing URLs
  const BING_VERIFIED_POOL = [
    "https://www.bing.com/th?id=OHR.YellowstoneWolves_ZH-CN6767268961_1920x1080.jpg",
    "https://www.bing.com/th?id=OHR.WroclawPoland_ZH-CN6042428292_1920x1080.jpg",
    "https://www.bing.com/th?id=OHR.AmmoniteFossils_ZH-CN5825251327_1920x1080.jpg",
    "https://www.bing.com/th?id=OHR.PlitviceAutumn_ZH-CN5646237897_1920x1080.jpg",
    "https://www.bing.com/th?id=OHR.MumblesSwansea2026_ZH-CN5419531039_1920x1080.jpg",
    "https://www.bing.com/th?id=OHR.BabcockSP_ZH-CN5266848536_1920x1080.jpg",
    "https://www.bing.com/th?id=OHR.CormorantsFlight_ZH-CN0770863330_1920x1080.jpg",
    "https://www.bing.com/th?id=OHR.IlesSanguinaires_ZH-CN3149346035_1920x1080.jpg",
  ];

  // Tier 2 Verified High-Res Beauty & Portrait Pool
  const BEAUTY_VERIFIED_POOL = [
    "https://img.btstu.cn/api/images/5bc030557e11c.jpg",
    "https://img.btstu.cn/api/images/5b440db8bf666.jpg",
    "https://img.btstu.cn/api/images/5a2244b0c55dc.jpg",
    "https://img.btstu.cn/api/images/5a5881fb44d96.jpg",
    "https://img.btstu.cn/api/images/5a3386b9b9114.jpg",
    "https://img.btstu.cn/api/images/5ac2df781cd85.jpg",
    "https://img.btstu.cn/api/images/5a124521cfcc7.jpg",
    "https://img.btstu.cn/api/images/59f98735f31d3.jpg",
    "https://img.btstu.cn/api/images/5a127adb10350.jpg",
    "https://img.btstu.cn/api/images/5a0eaa582d054.jpg",
    "https://img.btstu.cn/api/images/5a0a954e7ebe9.jpg",
    "https://img.btstu.cn/api/images/5a0abc8dd712f.jpg",
    "https://img.btstu.cn/api/images/5a4ca29a88354.jpg",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1920&q=85",
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1920&q=85",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1920&q=85",
    "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=1920&q=85",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1920&q=85",
  ];

  // 3-Tier Bing Wallpaper Fetcher
  async function fetchBingWallpaper(random: boolean): Promise<string | null> {
    const currentUrl = get(bgUrl);
    const isMobile = isMobileDevice();

    // Tier 1: Same-Origin Official Microsoft Bing API /api/bing-official
    try {
      const idx = random && Math.random() < 0.5 ? 7 : 0;
      const tier1Url = `/api/bing-official?format=js&idx=${idx}&n=8&mkt=zh-CN`;
      const data = await fetchJsonWithTimeout(tier1Url, 3500);
      if (data && Array.isArray(data.images) && data.images.length > 0) {
        let candidates = data.images;
        if (random && candidates.length > 1) {
          const diff = candidates.filter((item: any) => {
            const u1 = item.urlbase
              ? `https://www.bing.com${item.urlbase}_${isMobile ? "1080x1920" : "1920x1080"}.jpg`
              : `https://www.bing.com${item.url}`;
            return u1 !== currentUrl;
          });
          if (diff.length > 0) candidates = diff;
        }

        const picked = !random ? candidates[0] : candidates[Math.floor(Math.random() * candidates.length)];
        const cdnUrl = picked.urlbase
          ? `https://www.bing.com${picked.urlbase}_${isMobile ? "1080x1920" : "1920x1080"}.jpg`
          : `https://www.bing.com${picked.url}`;

        if (await preloadImage(cdnUrl)) {
          if (picked.copyright || picked.title) {
            bgTitle.set(picked.copyright || picked.title);
          }
          return cdnUrl;
        }
      }
    } catch (err) {
      console.warn("[Background] Bing Tier 1 fetch error:", err);
    }

    // Tier 2: Direct CORS JSON APIs bing.biturl.top & peapix.com
    try {
      const biturl = `https://bing.biturl.top/?resolution=1920&format=json&index=${random ? "random" : "0"}&mkt=zh-CN`;
      const bData = await fetchJsonWithTimeout(biturl, 3500);
      if (bData && bData.url && (!random || bData.url !== currentUrl)) {
        if (await preloadImage(bData.url)) {
          if (bData.copyright) bgTitle.set(bData.copyright);
          return bData.url;
        }
      }
    } catch (err) {
      console.warn("[Background] Bing Tier 2 (biturl) fetch error:", err);
    }

    try {
      const peapixUrl = `https://peapix.com/bing/feed?country=cn`;
      const pData = await fetchJsonWithTimeout(peapixUrl, 3500);
      if (pData && Array.isArray(pData) && pData.length > 0) {
        let candidates = pData;
        if (random && candidates.length > 1) {
          const diff = candidates.filter(
            (item: any) => item.imageUrl !== currentUrl && item.fullUrl !== currentUrl
          );
          if (diff.length > 0) candidates = diff;
        }
        const picked = !random ? candidates[0] : candidates[Math.floor(Math.random() * candidates.length)];
        const imgUrl = picked?.imageUrl || picked?.fullUrl;
        if (imgUrl && (await preloadImage(imgUrl))) {
          if (picked.title || picked.copyright) bgTitle.set(picked.title || picked.copyright);
          return imgUrl;
        }
      }
    } catch (err) {
      console.warn("[Background] Bing Tier 2 (peapix) fetch error:", err);
    }

    // Tier 3: Verified Official Microsoft Fallback Pool
    let poolCandidates = [...BING_VERIFIED_POOL];
    if (random && poolCandidates.length > 1) {
      poolCandidates = poolCandidates.filter((u) => u !== currentUrl);
    }
    const chosen = !random
      ? poolCandidates[0]
      : poolCandidates[Math.floor(Math.random() * poolCandidates.length)];

    if (await preloadImage(chosen)) {
      return chosen;
    }
    for (const cand of poolCandidates) {
      if (cand !== chosen && (await preloadImage(cand))) {
        return cand;
      }
    }

    return null;
  }

  // 2-Tier Beauty Wallpaper Fetcher
  async function fetchBeautyWallpaper(): Promise<string | null> {
    const currentUrl = get(bgUrl);

    // Tier 1: Live API
    const endpoints = [
      `/api/beauty-official?lx=meizi&format=json&_t=${Date.now()}`,
      `https://api.btstu.cn/sjbz/api.php?lx=meizi&format=json&_t=${Date.now()}`,
    ];

    for (const ep of endpoints) {
      try {
        const data = await fetchJsonWithTimeout(ep, 3500);
        if (data && data.imgurl) {
          let normalized = String(data.imgurl).trim();
          if (normalized.startsWith("http://")) {
            normalized = "https://" + normalized.slice(7);
          }
          if (normalized !== currentUrl && (await preloadImage(normalized))) {
            return normalized;
          }
        }
      } catch (err) {
        console.warn(`[Background] Beauty Tier 1 (${ep}) failed:`, err);
      }
    }

    // Tier 2: Verified High-Res Pool
    let candidates = BEAUTY_VERIFIED_POOL.filter((u) => u !== currentUrl);
    if (candidates.length === 0) candidates = BEAUTY_VERIFIED_POOL;

    const shuffled = [...candidates].sort(() => Math.random() - 0.5);
    for (const cand of shuffled) {
      if (await preloadImage(cand)) {
        return cand;
      }
    }

    return null;
  }

  // Fetch and apply Bing wallpaper
  async function fetchAndSetBingWallpaper(forceRandom = (currentMode === "random")) {
    const currentSeq = ++requestSeq;
    isLoadingBing = true;
    try {
      const url = await fetchBingWallpaper(forceRandom);
      if (currentSeq !== requestSeq) return;
      if (url) {
        currentBingUrl = url;
        useBingApi = true;
        useBeautyApi = false;
        bgUrl.set(url);
        const today = new Date().toDateString();
        localStorage.setItem("use-bing-api", "true");
        localStorage.setItem("use-beauty-api", "false");
        localStorage.setItem("bing-bg-url", url);
        localStorage.setItem("bing-fetch-date", today);
        localStorage.setItem("use-bing-random", forceRandom.toString());
      } else {
        console.warn("⚠️ Bing 桌布獲取失敗，退回本地背景");
        useLocalBg(id);
      }
    } finally {
      if (currentSeq === requestSeq) {
        isLoadingBing = false;
      }
    }
  }

  // Fetch and apply Beauty wallpaper
  async function fetchAndSetBeautyWallpaper() {
    const currentSeq = ++requestSeq;
    isLoadingBeauty = true;
    try {
      const url = await fetchBeautyWallpaper();
      if (currentSeq !== requestSeq) return;
      if (url) {
        currentBeautyUrl = url;
        useBeautyApi = true;
        useBingApi = false;
        bgUrl.set(url);
        const today = new Date().toDateString();
        localStorage.setItem("use-beauty-api", "true");
        localStorage.setItem("use-bing-api", "false");
        localStorage.setItem("beauty-bg-url", url);
        localStorage.setItem("beauty-fetch-date", today);
        bgTitle.set("高解析真人藝術寫真");
      } else {
        console.warn("⚠️ 美女桌布獲取失敗，退回本地背景");
        useLocalBg(id);
      }
    } finally {
      if (currentSeq === requestSeq) {
        isLoadingBeauty = false;
      }
    }
  }

  // Switch to local background
  function useLocalBg(bgId: number) {
    currentSource = "local";
    requestSeq++;
    isLoadingBing = false;
    isLoadingBeauty = false;
    id = Math.min(10, Math.max(1, Math.floor(bgId || 1)));
    useBingApi = false;
    useBeautyApi = false;
    const path = getLocalBgPath(id);
    bgUrl.set(path);
    const meta = LOCAL_BACKGROUNDS.find((b) => b.id === id);
    if (meta) {
      bgTitle.set(`${meta.label} - ${meta.subtitle}`);
    }
    localStorage.setItem("bg-id", id.toString());
    localStorage.setItem("activeBg", id.toString());
    localStorage.setItem("use-bing-api", "false");
    localStorage.setItem("use-beauty-api", "false");
  }

  function randomBg() {
    let newId: number;
    do {
      newId = Math.floor(Math.random() * 10) + 1;
    } while (newId === id && LOCAL_BACKGROUNDS.length > 1);
    useLocalBg(newId);
  }

  function nextBg() {
    const nextId = id >= 10 ? 1 : id + 1;
    useLocalBg(nextId);
  }

  function prevBg() {
    const prevId = id <= 1 ? 10 : id - 1;
    useLocalBg(prevId);
  }

  // Matrix Selection Handlers
  function selectSource(source: BgSource) {
    currentSource = source;
    if (source === "bing") {
      useBingApi = true;
      useBeautyApi = false;
      fetchAndSetBingWallpaper(currentMode === "random");
    } else if (source === "beauty") {
      useBeautyApi = true;
      useBingApi = false;
      if (currentMode === "fixed" && currentBeautyUrl) {
        bgUrl.set(currentBeautyUrl);
        localStorage.setItem("use-beauty-api", "true");
        localStorage.setItem("use-bing-api", "false");
        bgTitle.set("高解析真人藝術寫真");
      } else {
        fetchAndSetBeautyWallpaper();
      }
    } else {
      useBingApi = false;
      useBeautyApi = false;
      if (currentMode === "random") {
        randomBg();
      } else {
        useLocalBg(id);
      }
    }
  }

  function selectMode(mode: BgMode) {
    currentMode = mode;
    localStorage.setItem("bg-mode", mode);

    if (currentSource === "bing") {
      useBingRandom = (mode === "random");
      localStorage.setItem("use-bing-random", useBingRandom.toString());
      fetchAndSetBingWallpaper(useBingRandom);
    } else if (currentSource === "beauty") {
      if (mode === "random") {
        fetchAndSetBeautyWallpaper();
      }
    } else {
      if (mode === "random") {
        randomBg();
      }
    }
  }

  function toggleSyncStation() {
    syncWithStation = !syncWithStation;
    localStorage.setItem("bg-sync-station", syncWithStation.toString());
    if (syncWithStation && currentSource === "local") {
      const curStation = localStorage.getItem("LofiEngine_Station") || "lofi";
      useLocalBg(getLocalBgByStation(curStation));
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (
      e.target instanceof HTMLElement &&
      (e.target.closest("input") || e.target.closest("textarea") || e.target.isContentEditable)
    ) {
      return;
    }
    if (currentSource === "local" && currentMode === "fixed") {
      if (e.key === "ArrowRight") {
        nextBg();
      } else if (e.key === "ArrowLeft") {
        prevBg();
      }
    }
  }

  $: currentLocalMeta = LOCAL_BACKGROUNDS.find((b) => b.id === Number(id)) || LOCAL_BACKGROUNDS[1];

  onMount(() => {
    // 1. Purge legacy broken URLs
    const rawBing = localStorage.getItem("bing-bg-url");
    if (isLegacyBrokenUrl(rawBing)) {
      localStorage.removeItem("bing-bg-url");
      currentBingUrl = "";
    } else {
      currentBingUrl = rawBing || "";
    }

    const rawBeauty = localStorage.getItem("beauty-bg-url");
    if (isLegacyBrokenUrl(rawBeauty)) {
      localStorage.removeItem("beauty-bg-url");
      currentBeautyUrl = "";
    } else {
      currentBeautyUrl = rawBeauty || "";
    }

    useBingApi = localStorage.getItem("use-bing-api") === "true";
    useBeautyApi = localStorage.getItem("use-beauty-api") === "true";
    useBingRandom = localStorage.getItem("use-bing-random") !== "false";
    syncWithStation = localStorage.getItem("bg-sync-station") !== "false";
    lastBingFetchDate = localStorage.getItem("bing-fetch-date") || "";
    lastBeautyFetchDate = localStorage.getItem("beauty-fetch-date") || "";

    // Determine currentSource & currentMode
    if (useBingApi) {
      currentSource = "bing";
      currentMode = useBingRandom ? "random" : "fixed";
    } else if (useBeautyApi) {
      currentSource = "beauty";
      currentMode = localStorage.getItem("bg-mode") === "fixed" ? "fixed" : "random";
    } else {
      currentSource = "local";
      currentMode = localStorage.getItem("bg-mode") === "random" ? "random" : "fixed";
    }

    const curStation = localStorage.getItem("LofiEngine_Station") || "lofi";
    const savedId = parseInt(localStorage.getItem("bg-id") || "", 10);
    if (!isNaN(savedId) && savedId >= 1 && savedId <= 10) {
      id = savedId;
    } else {
      id = getLocalBgByStation(curStation);
      localStorage.setItem("bg-id", id.toString());
    }

    const today = new Date().toDateString();
    const shouldRefreshBing = useBingApi && (!currentBingUrl || lastBingFetchDate !== today);
    const shouldRefreshBeauty = useBeautyApi && (!currentBeautyUrl || lastBeautyFetchDate !== today);

    if (useBeautyApi && currentBeautyUrl && !shouldRefreshBeauty) {
      bgUrl.set(currentBeautyUrl);
      bgTitle.set("高解析真人藝術寫真");
    } else if (shouldRefreshBeauty) {
      fetchAndSetBeautyWallpaper();
    } else if (useBingApi && currentBingUrl && !shouldRefreshBing) {
      bgUrl.set(currentBingUrl);
    } else if (shouldRefreshBing) {
      fetchAndSetBingWallpaper(useBingRandom);
    } else {
      if (syncWithStation) {
        id = getLocalBgByStation(curStation);
      }
      localStorage.setItem("bg-id", id.toString());
      localStorage.setItem("activeBg", id.toString());
      bgUrl.set(getLocalBgPath(id));
      const meta = LOCAL_BACKGROUNDS.find((b) => b.id === id);
      if (meta) bgTitle.set(`${meta.label} - ${meta.subtitle}`);
    }

    // Listeners for stationChange, changeBg, and keydown
    const handleStationChange = (e: any) => {
      if (useBingApi || useBeautyApi) return;
      if (!syncWithStation) return;
      const station = e.detail;
      if (station && station.id) {
        const matchId = getLocalBgByStation(station.id);
        useLocalBg(matchId);
      }
    };

    const handleChangeBg = (e: any) => {
      const bgNum = typeof e.detail === "number" ? e.detail : parseInt(e.detail, 10);
      if (!isNaN(bgNum) && bgNum >= 1 && bgNum <= 10) {
        useLocalBg(bgNum);
      }
    };

    window.addEventListener("stationChange", handleStationChange);
    window.addEventListener("changeBg", handleChangeBg);
    window.addEventListener("keydown", handleKeyDown);

    cleanupListeners = () => {
      window.removeEventListener("stationChange", handleStationChange);
      window.removeEventListener("changeBg", handleChangeBg);
      window.removeEventListener("keydown", handleKeyDown);
    };
  });

  onDestroy(() => {
    if (cleanupListeners) {
      cleanupListeners();
      cleanupListeners = null;
    }
  });
</script>

<div class="background-matrix-card">
  <div class="section-title-row">
    <h4>桌布設定 (Wallpaper)</h4>
    <span class="matrix-badge">二維配置</span>
  </div>

  <!-- LAYER 1: 來源選擇器 (Source: Bing / 人像 / 插畫) -->
  <div class="matrix-layer">
    <div class="layer-header">
      <span class="layer-step">1</span>
      <span class="layer-label">桌布來源</span>
    </div>
    <div class="source-grid" role="radiogroup" aria-label="桌布來源選擇">
      <!-- Bing -->
      <button
        type="button"
        role="radio"
        class="source-card"
        class:selected={currentSource === "bing"}
        aria-checked={currentSource === "bing"}
        on:click={() => selectSource("bing")}
      >
        <div class="card-icon-wrap bing">
          <Globe size={18} />
        </div>
        <div class="card-text">
          <span class="card-title">Bing 官方</span>
          <span class="card-desc">每日世界風光</span>
        </div>
        {#if currentSource === "bing"}
          <span class="check-indicator"><Check size={14} /></span>
        {/if}
      </button>

      <!-- Beauty -->
      <button
        type="button"
        role="radio"
        class="source-card"
        class:selected={currentSource === "beauty"}
        aria-checked={currentSource === "beauty"}
        on:click={() => selectSource("beauty")}
      >
        <div class="card-icon-wrap beauty">
          <Heart size={18} />
        </div>
        <div class="card-text">
          <span class="card-title">人像寫真</span>
          <span class="card-desc">高解析藝術人像</span>
        </div>
        {#if currentSource === "beauty"}
          <span class="check-indicator"><Check size={14} /></span>
        {/if}
      </button>

      <!-- Local -->
      <button
        type="button"
        role="radio"
        class="source-card"
        class:selected={currentSource === "local"}
        aria-checked={currentSource === "local"}
        on:click={() => selectSource("local")}
      >
        <div class="card-icon-wrap local">
          <Coffee size={18} />
        </div>
        <div class="card-text">
          <span class="card-title">插畫主題</span>
          <span class="card-desc">10 款 Lo-Fi 原創</span>
        </div>
        {#if currentSource === "local"}
          <span class="check-indicator"><Check size={14} /></span>
        {/if}
      </button>
    </div>
  </div>

  <!-- LAYER 2: 模式切換 (Mode: 固定/手動 vs 隨機輪播) -->
  <div class="matrix-layer">
    <div class="layer-header">
      <span class="layer-step">2</span>
      <span class="layer-label">展示模式</span>
    </div>
    <div class="mode-capsule-group" role="radiogroup" aria-label="展示模式切換">
      <button
        type="button"
        role="radio"
        class="capsule-mode-btn"
        class:active={currentMode === "fixed"}
        aria-checked={currentMode === "fixed"}
        on:click={() => selectMode("fixed")}
      >
        <Pin size={14} />
        <span>固定 / 手動精選</span>
      </button>
      <button
        type="button"
        role="radio"
        class="capsule-mode-btn"
        class:active={currentMode === "random"}
        aria-checked={currentMode === "random"}
        on:click={() => selectMode("random")}
      >
        <Dices size={15} />
        <span>隨機輪播</span>
      </button>
    </div>
  </div>

  <!-- LAYER 3: 自適應微調操作區 (Adaptive Details Area) -->
  <div class="matrix-layer adaptive-container">
    <div class="layer-header">
      <span class="layer-step">3</span>
      <span class="layer-label">微調與控制</span>
    </div>

    {#if currentSource === "bing"}
      <div class="adaptive-panel bing-panel">
        <div class="panel-info-row">
          <div class="panel-badge">
            {currentMode === "fixed" ? "今日官方精選 1080P" : "Bing 歷年圖庫隨選"}
          </div>
          <span class="device-hint">
            {isMobileDevice() ? "📱 手機版直式" : "🖥️ 桌面高畫質"}
          </span>
        </div>

        {#if $bgTitle}
          <div class="bing-story-box">
            <span class="story-tag">地理故事</span>
            <p class="story-text">{$bgTitle}</p>
          </div>
        {/if}

        <div class="actions-row">
          <button
            type="button"
            class="action-button primary"
            disabled={isLoadingBing}
            on:click={() => fetchAndSetBingWallpaper(currentMode === "random")}
          >
            {#if isLoadingBing}
              <Loader2 size={15} class="spin" />
              <span>桌布載入中...</span>
            {:else if currentMode === "fixed"}
              <RotateCcw size={15} />
              <span>重新載入今日精選</span>
            {:else}
              <Dices size={16} />
              <span>換一張 🎲</span>
            {/if}
          </button>
        </div>
      </div>
    {:else if currentSource === "beauty"}
      <div class="adaptive-panel beauty-panel">
        <div class="panel-info-row">
          <div class="panel-badge beauty-badge">
            {currentMode === "fixed" ? "已鎖定當前人像" : "隨機人像藝術寫真"}
          </div>
        </div>

        <p class="panel-desc">
          {currentMode === "fixed"
            ? "當前壁紙已鎖定，刷新頁面將保持此照片。"
            : "隨選高解析真人寫真與人像攝影，隨時探索新視角。"}
        </p>

        <div class="actions-row">
          <button
            type="button"
            class="action-button beauty-action"
            disabled={isLoadingBeauty}
            on:click={fetchAndSetBeautyWallpaper}
          >
            {#if isLoadingBeauty}
              <Loader2 size={15} class="spin" />
              <span>正在載入寫真...</span>
            {:else if currentMode === "fixed"}
              <Heart size={15} />
              <span>換一張並鎖定 🌸</span>
            {:else}
              <Dices size={16} />
              <span>換一張 🎲</span>
            {/if}
          </button>
        </div>
      </div>
    {:else}
      <!-- Local Illustrations (10) -->
      <div class="adaptive-panel local-panel">
        {#if currentMode === "fixed"}
          <div class="local-carousel-wrap">
            <div class="local-header-info">
              <span class="local-title">({id}/10) · {currentLocalMeta.label}</span>
              <span class="local-subtitle">{currentLocalMeta.subtitle}</span>
            </div>

            <!-- Preview Carousel -->
            <div class="carousel-preview-row">
              <button
                type="button"
                class="carousel-arrow prev"
                on:click={prevBg}
                title="上一張背景 (←)"
                aria-label="上一張背景"
              >
                <ChevronLeft size={18} />
              </button>
              <img
                id="bg-preview"
                src={getLocalBgPath(id)}
                alt={currentLocalMeta.label}
                loading="lazy"
              />
              <button
                type="button"
                class="carousel-arrow next"
                on:click={nextBg}
                title="下一張背景 (→)"
                aria-label="下一張背景"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <!-- Sync with station toggle -->
            <div class="sync-toggle-box">
              <label class="switch-container">
                <input
                  type="checkbox"
                  checked={syncWithStation}
                  on:change={toggleSyncStation}
                />
                <span class="slider"></span>
                <span class="label-text">
                  隨電台同步切換主題
                  <strong class="sync-status">{syncWithStation ? "開啟" : "關閉"}</strong>
                </span>
              </label>
            </div>
          </div>
        {:else}
          <!-- Local Random Mode -->
          <div class="local-random-wrap">
            <div class="local-header-info">
              <span class="local-title">目前隨選：{currentLocalMeta.label}</span>
              <span class="local-subtitle">{currentLocalMeta.subtitle}</span>
            </div>
            <div class="random-preview-center">
              <img
                id="bg-preview-random"
                src={getLocalBgPath(id)}
                alt={currentLocalMeta.label}
                loading="lazy"
              />
            </div>
            <div class="actions-row">
              <button
                type="button"
                class="action-button local-action"
                on:click={randomBg}
                title="隨機切換 10 款插畫"
              >
                <Dices size={16} />
                <span>隨機切換 🎲</span>
              </button>
            </div>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>

<style>
  .background-matrix-card {
    display: flex;
    flex-direction: column;
    gap: 14px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 14px;
    padding: 14px;
    color: #ffffff;
  }

  .section-title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 8px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .section-title-row h4 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: #ffffff;
  }

  .matrix-badge {
    font-size: 11px;
    font-weight: 600;
    color: #a855f7;
    background: rgba(168, 85, 247, 0.12);
    border: 1px solid rgba(168, 85, 247, 0.28);
    padding: 1px 7px;
    border-radius: 999px;
  }

  .matrix-layer {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .layer-header {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .layer-step {
    width: 17px;
    height: 17px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.14);
    color: #ffffff;
    font-size: 10px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .layer-label {
    font-size: 12px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.85);
  }

  /* Source Grid */
  .source-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }

  .source-card {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 10px 8px;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: rgba(255, 255, 255, 0.05);
    color: #ffffff;
    cursor: pointer;
    text-align: left;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .source-card:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.24);
    transform: translateY(-1px);
  }

  .source-card.selected {
    background: rgba(255, 255, 255, 0.15);
    border-color: #38bdf8;
    box-shadow: 0 0 12px rgba(56, 189, 248, 0.25);
  }

  .card-icon-wrap {
    width: 28px;
    height: 28px;
    border-radius: 7px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 6px;
  }

  .card-icon-wrap.bing {
    background: rgba(56, 189, 248, 0.2);
    color: #38bdf8;
  }

  .card-icon-wrap.beauty {
    background: rgba(244, 114, 182, 0.2);
    color: #f472b6;
  }

  .card-icon-wrap.local {
    background: rgba(251, 146, 60, 0.2);
    color: #fb923c;
  }

  .card-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .card-title {
    font-size: 12px;
    font-weight: 600;
    color: #ffffff;
  }

  .card-desc {
    font-size: 10px;
    color: rgba(255, 255, 255, 0.6);
  }

  .check-indicator {
    position: absolute;
    top: 6px;
    right: 6px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #38bdf8;
    color: #0f172a;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Mode Capsule Group */
  .mode-capsule-group {
    display: flex;
    background: rgba(0, 0, 0, 0.35);
    border-radius: 10px;
    padding: 3px;
    gap: 4px;
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .capsule-mode-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 7px 10px;
    border-radius: 8px;
    border: 1px solid transparent;
    background: transparent;
    color: rgba(255, 255, 255, 0.7);
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .capsule-mode-btn:hover {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.08);
  }

  .capsule-mode-btn.active {
    background: rgba(255, 255, 255, 0.16);
    border-color: rgba(255, 255, 255, 0.18);
    color: #ffffff;
    font-weight: 600;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
  }

  /* Adaptive Details Area */
  .adaptive-container {
    background: rgba(0, 0, 0, 0.25);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 12px;
  }

  .adaptive-panel {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .panel-info-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .panel-badge {
    font-size: 11.5px;
    font-weight: 600;
    padding: 3px 8px;
    border-radius: 6px;
    background: rgba(56, 189, 248, 0.15);
    border: 1px solid rgba(56, 189, 248, 0.3);
    color: #38bdf8;
  }

  .panel-badge.beauty-badge {
    background: rgba(244, 114, 182, 0.15);
    border-color: rgba(244, 114, 182, 0.3);
    color: #f472b6;
  }

  .device-hint {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.55);
  }

  .bing-story-box {
    background: rgba(255, 255, 255, 0.04);
    border-radius: 8px;
    padding: 8px 10px;
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .story-tag {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    color: #94a3b8;
    display: block;
    margin-bottom: 2px;
  }

  .story-text {
    margin: 0;
    font-size: 11.5px;
    line-height: 1.4;
    color: rgba(255, 255, 255, 0.85);
  }

  .panel-desc {
    margin: 0;
    font-size: 11.5px;
    line-height: 1.4;
    color: rgba(255, 255, 255, 0.7);
  }

  .actions-row {
    display: flex;
    margin-top: 4px;
  }

  .action-button {
    width: 100%;
    padding: 8px 14px;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    background: rgba(255, 255, 255, 0.08);
    color: #ffffff;
    font-size: 12.5px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .action-button:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.16);
    border-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
  }

  .action-button.primary {
    background: rgba(56, 189, 248, 0.2);
    border-color: rgba(56, 189, 248, 0.4);
    color: #7dd3fc;
  }

  .action-button.primary:hover:not(:disabled) {
    background: rgba(56, 189, 248, 0.3);
    color: #ffffff;
  }

  .action-button.beauty-action {
    background: rgba(244, 114, 182, 0.2);
    border-color: rgba(244, 114, 182, 0.4);
    color: #fbcfe8;
  }

  .action-button.beauty-action:hover:not(:disabled) {
    background: rgba(244, 114, 182, 0.3);
    color: #ffffff;
  }

  .action-button.local-action {
    background: rgba(251, 146, 60, 0.2);
    border-color: rgba(251, 146, 60, 0.4);
    color: #fed7aa;
  }

  .action-button.local-action:hover:not(:disabled) {
    background: rgba(251, 146, 60, 0.3);
    color: #ffffff;
  }

  .action-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* Local Panel Carousel */
  .local-carousel-wrap,
  .local-random-wrap {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .local-header-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }

  .local-title {
    font-size: 12.5px;
    font-weight: 600;
    color: #ffffff;
  }

  .local-subtitle {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.6);
  }

  .carousel-preview-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin: 4px 0;
  }

  .carousel-arrow {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.16);
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
  }

  .carousel-arrow:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.08);
  }

  #bg-preview,
  #bg-preview-random {
    width: 170px;
    height: 96px;
    aspect-ratio: 16 / 9;
    border-radius: 8px;
    object-fit: cover;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .random-preview-center {
    display: flex;
    justify-content: center;
    margin: 4px 0;
  }

  /* Switch Toggle */
  .sync-toggle-box {
    margin-top: 4px;
    display: flex;
    justify-content: center;
  }

  .switch-container {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    user-select: none;
  }

  .switch-container input {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
    margin: 0;
    pointer-events: none;
  }

  .slider {
    position: relative;
    display: inline-block;
    width: 32px;
    height: 17px;
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 20px;
    transition: 0.3s;
    flex-shrink: 0;
  }

  .slider:before {
    position: absolute;
    content: "";
    height: 11px;
    width: 11px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    border-radius: 50%;
    transition: 0.3s;
  }

  input:checked + .slider {
    background-color: #38bdf8;
  }

  input:checked + .slider:before {
    transform: translateX(15px);
  }

  .label-text {
    font-size: 11.5px;
    color: rgba(255, 255, 255, 0.85);
  }

  .sync-status {
    color: #38bdf8;
    margin-left: 2px;
  }

  :global(.spin) {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
</style>

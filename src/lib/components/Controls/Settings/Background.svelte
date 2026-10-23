<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { get } from "svelte/store";
  import { ArrowLeft, ArrowRight, RotateCcw, Image as ImageIcon, Heart } from "lucide-svelte";
  import {
    bgUrl,
    bgTitle,
    LOCAL_BACKGROUNDS,
    getLocalBgPath,
    getLocalBgByStation,
    isLegacyBrokenUrl,
  } from "../../../stores/bgStore";

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

  // Tier 2 Verified High-Res Beauty & Portrait Pool (13 BTSTU + 5 Unsplash)
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

    // Tier 1: Live API api.btstu.cn / /api/beauty-official
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

  // Fetch and apply Bing wallpaper (guarded against overlapping requests)
  async function fetchAndSetBingWallpaper(forceRandom = useBingRandom) {
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

  // Fetch and apply Beauty wallpaper (guarded against overlapping requests)
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

  function toggleBingRandom() {
    useBingRandom = !useBingRandom;
    localStorage.setItem("use-bing-random", useBingRandom.toString());
    if (useBingApi) {
      fetchAndSetBingWallpaper(useBingRandom);
    }
  }

  function toggleSyncStation() {
    syncWithStation = !syncWithStation;
    localStorage.setItem("bg-sync-station", syncWithStation.toString());
    if (syncWithStation && !useBingApi && !useBeautyApi) {
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
    if (e.key === "ArrowRight") {
      nextBg();
    } else if (e.key === "ArrowLeft") {
      prevBg();
    }
  }

  // Reactive current local metadata
  $: currentLocalMeta = LOCAL_BACKGROUNDS.find((b) => b.id === Number(id)) || LOCAL_BACKGROUNDS[1];

  // Lifecycle initialization
  onMount(() => {
    // 1. Purge legacy broken URLs (bing.img.run / liuzhuai.com)
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
    } else if (shouldRefreshBeauty) {
      fetchAndSetBeautyWallpaper();
    } else if (useBingApi && currentBingUrl && !shouldRefreshBing) {
      bgUrl.set(currentBingUrl);
    } else if (shouldRefreshBing) {
      fetchAndSetBingWallpaper(useBingRandom);
    } else {
      // Local mode: if syncWithStation is enabled on boot, align with current station
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

<div>
  <h4>背景桌布 (Background)</h4>

  <!-- API 桌布選項 -->
  <div class="api-wallpaper-section">
    <!-- Bing 每日/隨機桌布按鈕 -->
    <button
      type="button"
      class="api-btn bing-btn"
      class:active={useBingApi}
      on:click={() => fetchAndSetBingWallpaper(useBingRandom)}
      title={useBingRandom ? "獲取隨機 Bing 官方高清桌布" : "使用 Bing 官方每日高清桌布（自動適配桌面/手機解析度）"}
      disabled={isLoadingBing}
    >
      <ImageIcon size={18} />
      <span>
        {isLoadingBing
          ? "正在獲取 Bing 桌布..."
          : useBingApi
          ? `✓ Bing ${useBingRandom ? "隨機" : "每日"}桌布`
          : `Bing ${useBingRandom ? "隨機" : "每日"}桌布`}
      </span>
    </button>

    <!-- Bing 模式切換 (每日 / 隨機) -->
    <div class="bing-mode-toggle">
      <label class="switch-container">
        <input type="checkbox" checked={useBingRandom} on:change={toggleBingRandom} />
        <span class="slider"></span>
        <span class="label-text">Bing 隨機模式 {useBingRandom ? "ON" : "OFF"}</span>
      </label>
    </div>

    <!-- 美女 / 藝術桌布按鈕 -->
    <button
      type="button"
      class="api-btn beauty-btn"
      class:active={useBeautyApi}
      on:click={fetchAndSetBeautyWallpaper}
      title="隨機高畫質美女 / 人像藝術桌布"
      disabled={isLoadingBeauty}
    >
      <Heart size={18} />
      <span>{isLoadingBeauty ? "正在獲取美女桌布..." : useBeautyApi ? "✓ 美女桌布" : "美女桌布"}</span>
    </button>

    <!-- API 狀態提示 -->
    {#if useBingApi}
      <div class="api-hint bing-hint">
        <div>Bing 官方桌布 ({isMobileDevice() ? "手機版" : "桌面版 1080P"})</div>
        {#if $bgTitle}
          <div class="bing-copyright">{$bgTitle}</div>
        {/if}
      </div>
    {/if}
    {#if useBeautyApi}
      <div class="api-hint beauty-hint">
        高解析真人人像 / 藝術寫真桌布
      </div>
    {/if}
  </div>

  <!-- 本地背景選擇器 -->
  <div class="local-bg-section">
    <h5>本地背景 ({id}/10) · {currentLocalMeta.label}</h5>
    <p class="local-subtitle">{currentLocalMeta.subtitle}</p>

    <!-- 隨電台同步切換背景開關 -->
    <div class="sync-mode-toggle">
      <label class="switch-container">
        <input type="checkbox" checked={syncWithStation} on:change={toggleSyncStation} />
        <span class="slider"></span>
        <span class="label-text">隨電台同步切換背景 {syncWithStation ? "ON" : "OFF"}</span>
      </label>
    </div>

    <div class="container">
      <button type="button" on:click={prevBg} title="上一張背景 (←)">
        <ArrowLeft size={20} />
      </button>
      <img id="bg-preview" src={getLocalBgPath(id)} alt={currentLocalMeta.label} />
      <button type="button" on:click={nextBg} title="下一張背景 (→)">
        <ArrowRight size={20} />
      </button>
    </div>

    <div class="random-btn-container">
      <button type="button" class="random-btn" on:click={randomBg} title="隨機本地背景">
        <RotateCcw size={18} />
        <span>隨機本地背景</span>
      </button>
    </div>
  </div>
</div>

<style>
  h4 {
    margin: 0 0 12px 0;
    font-size: 15px;
    font-weight: 600;
    color: white;
  }

  h5 {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.9);
    margin: 0 0 4px 0;
    text-align: center;
    font-weight: 600;
  }

  .local-subtitle {
    margin: 0 0 10px 0;
    font-size: 11px;
    color: rgba(255, 255, 255, 0.6);
    text-align: center;
  }

  /* API 桌布選項樣式 */
  .api-wallpaper-section {
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .api-btn {
    width: 100%;
    height: 44px;
    margin-bottom: 8px;
    padding: 8px 15px;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: rgba(255, 255, 255, 0.06);
    color: white;
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.25s ease;
    backdrop-filter: blur(8px);
    cursor: pointer;
  }

  .api-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.25);
    transform: translateY(-1px);
  }

  .api-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  .bing-btn.active {
    background: linear-gradient(135deg, rgba(0, 120, 212, 0.35), rgba(0, 178, 148, 0.35));
    border-color: rgba(0, 255, 178, 0.7);
    color: #00ffb2;
    box-shadow: 0 0 16px rgba(0, 178, 148, 0.4);
  }

  .beauty-btn.active {
    background: linear-gradient(135deg, rgba(255, 105, 180, 0.35), rgba(219, 39, 119, 0.35));
    border-color: rgba(255, 105, 180, 0.7);
    color: #ff80bf;
    box-shadow: 0 0 16px rgba(255, 105, 180, 0.4);
  }

  .api-hint {
    font-size: 12px;
    padding: 6px 10px;
    border-radius: 6px;
    margin-top: 6px;
    text-align: center;
    font-weight: 500;
  }

  .bing-hint {
    color: #60a5fa;
    background: rgba(37, 99, 235, 0.15);
    border: 1px solid rgba(59, 130, 246, 0.3);
  }

  .bing-copyright {
    margin-top: 3px;
    font-size: 11px;
    color: rgba(255, 255, 255, 0.72);
    font-weight: 400;
    line-height: 1.35;
  }

  .beauty-hint {
    color: #f472b6;
    background: rgba(219, 39, 119, 0.15);
    border: 1px solid rgba(236, 72, 153, 0.3);
  }

  /* 切換開關 */
  .bing-mode-toggle,
  .sync-mode-toggle {
    margin: 6px 0 12px 4px;
  }

  .switch-container {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.85);
  }

  .switch-container input {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
    margin: 0;
    pointer-events: none;
  }

  .switch-container input:focus-visible + .slider {
    outline: 2px solid #60a5fa;
    outline-offset: 2px;
  }

  .slider {
    position: relative;
    display: inline-block;
    width: 34px;
    height: 18px;
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 20px;
    transition: 0.3s;
    flex-shrink: 0;
  }

  .slider:before {
    position: absolute;
    content: "";
    height: 12px;
    width: 12px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    border-radius: 50%;
    transition: 0.3s;
  }

  input:checked + .slider {
    background-color: #3b82f6;
  }

  input:checked + .slider:before {
    transform: translateX(16px);
  }

  .label-text {
    font-size: 12px;
  }

  /* 本地背景區塊 */
  .local-bg-section {
    margin-top: 10px;
  }

  .container {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 14px;
    justify-content: center;
  }

  #bg-preview {
    width: 180px;
    height: 101px;
    aspect-ratio: 16 / 9;
    border-radius: 8px;
    object-fit: cover;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .container button {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    color: white;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .container button:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.05);
  }

  .random-btn-container {
    display: flex;
    justify-content: center;
    margin-top: 12px;
  }

  .random-btn {
    width: auto;
    height: auto;
    padding: 8px 18px;
    border-radius: 8px;
    background: rgba(168, 85, 247, 0.15);
    border: 1px solid rgba(168, 85, 247, 0.35);
    color: #e9d5ff;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 500;
    transition: all 0.2s ease;
    cursor: pointer;
  }

  .random-btn:hover {
    background: rgba(168, 85, 247, 0.25);
    border-color: rgba(168, 85, 247, 0.6);
    transform: translateY(-1px);
    color: white;
  }

  .random-btn:active {
    transform: translateY(0);
  }

  @media only screen and (max-width: 600px) {
    #bg-preview {
      width: 120px;
      height: 67px;
    }
  }
</style>

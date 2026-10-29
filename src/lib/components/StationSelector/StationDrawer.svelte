<script lang="ts">
  import {
    X,
    Share2,
    Check,
    Search,
    Coffee,
    Headphones,
    Disc,
    Music2,
    Music,
    Moon,
    Sparkles,
    Cpu,
    Radio,
    RadioTower,
  } from "@lucide/svelte";
  import {
    radioStore,
    currentStation,
    STATIONS,
    STATION_CATEGORIES,
    playStation,
    type Station,
    type StationCategory,
  } from "../../stores/radioStore";
  import { copyShareLink } from "../../utils/shareUtils";
  import { tick } from "svelte";

  export let isOpen = false;
  export let onClose: () => void = () => {};

  let activeCategory: "all" | StationCategory = "all";
  let searchQuery = "";
  let searchInputEl: HTMLInputElement | null = null;
  let copyToast = false;
  let copyTimeout: any = null;

  // Key mappings for the 12 stations: 1..9, 0, -, =
  const HOTKEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "="];

  $: filteredStations = STATIONS.filter((s) => {
    const matchCategory =
      activeCategory === "all" || s.category === activeCategory;
    if (!matchCategory) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      s.name.toLowerCase().includes(q) ||
      s.label.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q)
    );
  });

  function getStationHotkey(stationId: string): string | null {
    const idx = STATIONS.findIndex((s) => s.id === stationId);
    if (idx >= 0 && idx < HOTKEYS.length) {
      return HOTKEYS[idx];
    }
    return null;
  }

  function handleSelect(station: Station) {
    playStation(station.id, true);
    // On small screens, close drawer after selection for seamless experience
    if (typeof window !== "undefined" && window.innerWidth <= 640) {
      onClose();
    }
  }

  async function handleShare() {
    const success = await copyShareLink({
      stationId: $radioStore.currentStationId,
    });
    if (success) {
      copyToast = true;
      if (copyTimeout) clearTimeout(copyTimeout);
      copyTimeout = setTimeout(() => {
        copyToast = false;
      }, 2400);

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("lofi:showToast", {
            detail: "✨ 專屬音樂空間連結已複製！好友開啟即可同步聆聽。",
          })
        );
      }
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (!isOpen) return;

    if (e.key === "Escape") {
      e.stopPropagation();
      e.preventDefault();
      onClose();
      return;
    }

    // If Enter pressed in search box and we have matches, play the first one
    if (e.key === "Enter" && filteredStations.length > 0) {
      e.preventDefault();
      handleSelect(filteredStations[0]);
      onClose();
      return;
    }

    // If user is not actively typing in an input with text, hotkeys 1..9, 0 can switch stations directly
    const isInputActive = document.activeElement === searchInputEl;
    if (!isInputActive || searchQuery === "") {
      const matchIndex = HOTKEYS.indexOf(e.key);
      if (matchIndex >= 0 && matchIndex < STATIONS.length) {
        e.preventDefault();
        handleSelect(STATIONS[matchIndex]);
      }
    }
  }

  // Auto-focus search input when drawer opens
  $: if (isOpen) {
    searchQuery = "";
    tick().then(() => {
      if (searchInputEl) {
        searchInputEl.focus();
      }
    });
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
  <!-- Mobile / Desktop Backdrop -->
  <div
    class="drawer-backdrop"
    on:click={onClose}
    role="presentation"
    aria-hidden="true"
  ></div>

  <!-- Station Drawer Sheet -->
  <div
    class="station-drawer"
    role="dialog"
    aria-modal="true"
    aria-label="選擇電台頻道"
  >
    <!-- Mobile Drag Pill Indicator -->
    <div class="drag-indicator-wrapper" aria-hidden="true">
      <div class="drag-indicator"></div>
    </div>

    <!-- Header Section -->
    <header class="drawer-header">
      <div class="header-title-box">
        <div class="header-icon-wrap">
          <RadioTower size={18} />
        </div>
        <div class="header-text-wrap">
          <h3 class="header-title">線上串流電台</h3>
          <span class="header-subtitle">12 個 24/7 高音質情境頻道</span>
        </div>
      </div>

      <div class="header-actions">
        <!-- Share Link Button -->
        <button
          type="button"
          class="btn-action-share"
          on:click={handleShare}
          title="複製當前電台與混音空間分享連結"
          aria-label="複製分享連結"
        >
          {#if copyToast}
            <Check size={15} class="text-emerald-400" />
            <span class="share-btn-text">已複製連結！</span>
          {:else}
            <Share2 size={15} />
            <span class="share-btn-text">分享空間</span>
          {/if}
        </button>

        <!-- Close Button -->
        <button
          type="button"
          class="btn-close"
          on:click={onClose}
          title="關閉選單 (ESC)"
          aria-label="關閉選單"
        >
          <X size={18} />
        </button>
      </div>
    </header>

    <!-- Quick Search Input Bar -->
    <div class="search-bar-row">
      <div class="search-input-wrap">
        <Search size={15} class="search-icon" />
        <input
          bind:this={searchInputEl}
          type="text"
          class="search-input"
          placeholder="快速輸入搜尋電台（如 lofi, jazz, piano, 專注...）按 Enter 播放"
          bind:value={searchQuery}
          aria-label="搜尋電台"
        />
        {#if searchQuery}
          <button
            type="button"
            class="btn-clear-search"
            on:click={() => (searchQuery = "")}
            aria-label="清除搜尋"
          >
            <X size={14} />
          </button>
        {/if}
      </div>
    </div>

    <!-- Category Filter Tabs -->
    <div class="category-tabs" role="tablist" aria-label="情境分類">
      <button
        type="button"
        role="tab"
        class="category-tab"
        class:active={activeCategory === "all"}
        aria-selected={activeCategory === "all"}
        on:click={() => (activeCategory = "all")}
      >
        <span>全部頻道</span>
        <span class="tab-badge">{STATIONS.length}</span>
      </button>

      {#each STATION_CATEGORIES as cat (cat.id)}
        {@const count = STATIONS.filter((s) => s.category === cat.id).length}
        <button
          type="button"
          role="tab"
          class="category-tab"
          class:active={activeCategory === cat.id}
          aria-selected={activeCategory === cat.id}
          on:click={() => (activeCategory = cat.id)}
        >
          <span>{cat.label}</span>
          <span class="tab-badge">{count}</span>
        </button>
      {/each}
    </div>

    <!-- Stations Grid Container -->
    <div class="stations-grid-scroll">
      {#if filteredStations.length === 0}
        <div class="no-results-box">
          <Search size={28} class="no-results-icon" />
          <p class="no-results-title">找不到符合「{searchQuery}」的電台</p>
          <span class="no-results-hint">可嘗試搜尋 lofi、jazz、piano、drone 或切換分類</span>
        </div>
      {:else}
        <div class="stations-grid">
          {#each filteredStations as station (station.id)}
            {@const isCurrent = $radioStore.currentStationId === station.id}
            {@const hotkey = getStationHotkey(station.id)}
            <button
              type="button"
              class="station-card"
              class:current={isCurrent}
              class:playing={isCurrent && $radioStore.isPlaying}
              on:click={() => handleSelect(station)}
              aria-current={isCurrent ? "true" : undefined}
            >
              <!-- Card Left: Icon badge -->
              <div class="card-icon-badge" class:active-icon={isCurrent}>
                {#if station.icon === "coffee"}
                  <Coffee size={20} />
                {:else if station.icon === "headphones"}
                  <Headphones size={20} />
                {:else if station.icon === "disc"}
                  <Disc size={20} />
                {:else if station.icon === "music2"}
                  <Music2 size={20} />
                {:else if station.icon === "music"}
                  <Music size={20} />
                {:else if station.icon === "moon"}
                  <Moon size={20} />
                {:else if station.icon === "sparkles"}
                  <Sparkles size={20} />
                {:else if station.icon === "cpu"}
                  <Cpu size={20} />
                {:else if station.icon === "radio"}
                  <Radio size={20} />
                {:else}
                  <Music size={20} />
                {/if}
              </div>

              <!-- Card Center: Meta Info -->
              <div class="card-content">
                <div class="card-title-row">
                  <span class="card-title">{station.label}</span>
                  {#if hotkey}
                    <kbd class="hotkey-pill" title={`按 ${hotkey} 鍵直接播放`}>
                      {hotkey}
                    </kbd>
                  {/if}
                  {#if isCurrent}
                    <span class="active-badge">
                      {$radioStore.isPlaying ? "播放中" : "已選取"}
                    </span>
                  {/if}
                </div>
                <span class="card-sub">{station.name}</span>
                <p class="card-desc">{station.description}</p>
              </div>

              <!-- Card Right: Status Indicator / Equalizer -->
              <div class="card-status-indicator">
                {#if isCurrent && $radioStore.isPlaying}
                  <div class="mini-equalizer" aria-label="正在播放">
                    <span class="m-bar bar-1"></span>
                    <span class="m-bar bar-2"></span>
                    <span class="m-bar bar-3"></span>
                  </div>
                {:else if isCurrent}
                  <div class="status-dot paused" title="已選取但暫停中"></div>
                {:else}
                  <div class="status-dot idle" title="點擊切換播放"></div>
                {/if}
              </div>
            </button>
          {/each}
        </div>
      {/if}
    </div>

    <!-- Drawer Footer Note -->
    <footer class="drawer-footer">
      <span class="footer-tip">
        💡 快捷操控：直接按 <kbd>1</kbd>~<kbd>9</kbd>、<kbd>0</kbd> 直達電台，按 <kbd>Enter</kbd> 播放搜尋結果，按 <kbd>ESC</kbd> 關閉
      </span>
    </footer>
  </div>
{/if}

<style>
  /* Backdrop */
  .drawer-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(4, 7, 15, 0.65);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    z-index: 48;
    animation: fadeIn 0.2s ease-out;
  }

  /* Drawer Container */
  .station-drawer {
    position: fixed;
    bottom: 96px;
    left: 50%;
    transform: translateX(-50%);
    width: min(680px, calc(100vw - 32px));
    max-height: calc(85vh - 100px);
    background: rgba(14, 18, 28, 0.94);
    backdrop-filter: blur(28px);
    -webkit-backdrop-filter: blur(28px);
    border: 1px solid rgba(255, 255, 255, 0.14);
    border-radius: 24px;
    box-shadow:
      0 24px 60px rgba(0, 0, 0, 0.7),
      0 0 0 1px rgba(255, 255, 255, 0.06) inset;
    display: flex;
    flex-direction: column;
    z-index: 50;
    overflow: hidden;
    animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .drag-indicator-wrapper {
    display: none;
    justify-content: center;
    padding-top: 10px;
    padding-bottom: 4px;
  }

  .drag-indicator {
    width: 36px;
    height: 4px;
    border-radius: 2px;
    background: rgba(255, 255, 255, 0.25);
  }

  /* Header */
  .drawer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px 10px 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }

  .header-title-box {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .header-icon-wrap {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: rgba(168, 85, 247, 0.18);
    border: 1px solid rgba(168, 85, 247, 0.35);
    color: #c084fc;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .header-text-wrap {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .header-title {
    margin: 0;
    font-size: 1.05rem;
    font-weight: 600;
    color: #ffffff;
    letter-spacing: 0.2px;
  }

  .header-subtitle {
    font-size: 0.78rem;
    color: #94a3b8;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .btn-action-share {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.14);
    border-radius: 10px;
    color: #f1f5f9;
    font-size: 0.82rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-action-share:hover {
    background: rgba(168, 85, 247, 0.2);
    border-color: rgba(168, 85, 247, 0.4);
    color: #ffffff;
    transform: translateY(-1px);
  }

  .share-btn-text {
    font-size: 0.82rem;
  }

  .btn-close {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #cbd5e1;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-close:hover {
    background: rgba(239, 68, 68, 0.2);
    border-color: rgba(239, 68, 68, 0.35);
    color: #fca5a5;
  }

  /* Search Input Row */
  .search-bar-row {
    padding: 10px 20px 4px 20px;
  }

  .search-input-wrap {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
  }

  :global(.search-icon) {
    position: absolute;
    left: 12px;
    color: #94a3b8;
    pointer-events: none;
  }

  .search-input {
    width: 100%;
    height: 38px;
    padding: 0 34px 0 34px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.07);
    border: 1px solid rgba(255, 255, 255, 0.12);
    color: #ffffff;
    font-size: 0.84rem;
    transition: all 0.2s ease;
    box-sizing: border-box;
  }

  .search-input:focus {
    outline: none;
    border-color: #a855f7;
    background: rgba(255, 255, 255, 0.11);
    box-shadow: 0 0 12px rgba(168, 85, 247, 0.3);
  }

  .search-input::placeholder {
    color: #64748b;
    font-size: 0.8rem;
  }

  .btn-clear-search {
    position: absolute;
    right: 10px;
    background: transparent;
    border: none;
    color: #94a3b8;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    padding: 4px;
  }

  .btn-clear-search:hover {
    color: #ffffff;
  }

  /* Category Filter Tabs */
  .category-tabs {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px 8px 20px;
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .category-tabs::-webkit-scrollbar {
    display: none;
  }

  .category-tab {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 11px;
    border-radius: 9999px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #cbd5e1;
    font-size: 0.8rem;
    font-weight: 500;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.2s ease;
  }

  .category-tab:hover {
    background: rgba(255, 255, 255, 0.12);
    color: #ffffff;
  }

  .category-tab.active {
    background: #ffffff;
    color: #0f1117;
    border-color: #ffffff;
    font-weight: 600;
    box-shadow: 0 2px 10px rgba(255, 255, 255, 0.25);
  }

  .tab-badge {
    padding: 1px 6px;
    border-radius: 9999px;
    background: rgba(0, 0, 0, 0.15);
    font-size: 0.72rem;
  }

  .category-tab.active .tab-badge {
    background: rgba(0, 0, 0, 0.12);
    color: #0f1117;
  }

  /* Grid Scroll Area */
  .stations-grid-scroll {
    flex: 1;
    overflow-y: auto;
    padding: 6px 20px 14px 20px;
    overscroll-behavior: contain;
  }

  .stations-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  /* Station Card */
  .station-card {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px 14px;
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    text-align: left;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
    user-select: none;
  }

  .station-card:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.18);
    transform: translateY(-1px);
  }

  .station-card.current {
    background: rgba(168, 85, 247, 0.12);
    border-color: rgba(168, 85, 247, 0.45);
    box-shadow: 0 4px 18px rgba(168, 85, 247, 0.18);
  }

  .station-card.playing {
    border-color: rgba(168, 85, 247, 0.65);
  }

  .card-icon-badge {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.12);
    color: #cbd5e1;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: all 0.25s ease;
  }

  .card-icon-badge.active-icon {
    background: linear-gradient(135deg, #a855f7, #6366f1);
    border-color: rgba(192, 132, 252, 0.6);
    color: #ffffff;
    box-shadow: 0 0 14px rgba(168, 85, 247, 0.4);
  }

  .card-content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .card-title-row {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
  }

  .card-title {
    font-size: 0.92rem;
    font-weight: 600;
    color: #ffffff;
    line-height: 1.3;
  }

  .hotkey-pill {
    padding: 1px 5px;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.12);
    border: 1px solid rgba(255, 255, 255, 0.18);
    color: #e2e8f0;
    font-size: 0.68rem;
    font-family: inherit;
    font-weight: 600;
    line-height: 1;
  }

  .active-badge {
    display: inline-flex;
    align-items: center;
    padding: 1px 6px;
    border-radius: 4px;
    background: rgba(168, 85, 247, 0.25);
    border: 1px solid rgba(168, 85, 247, 0.4);
    color: #d8b4fe;
    font-size: 0.68rem;
    font-weight: 600;
    letter-spacing: 0.3px;
  }

  .card-sub {
    font-size: 0.76rem;
    color: #94a3b8;
    line-height: 1.3;
  }

  .card-desc {
    margin: 4px 0 0 0;
    font-size: 0.74rem;
    color: #cbd5e1;
    line-height: 1.35;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .card-status-indicator {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    align-self: center;
  }

  /* Equalizer Animation */
  .mini-equalizer {
    display: flex;
    align-items: flex-end;
    gap: 2px;
    height: 14px;
  }

  .m-bar {
    width: 3px;
    border-radius: 2px;
    background: #c084fc;
    animation: miniBounce 0.9s ease-in-out infinite alternate;
  }

  .bar-1 { height: 4px; animation-delay: 0.1s; }
  .bar-2 { height: 12px; animation-delay: 0.3s; }
  .bar-3 { height: 7px; animation-delay: 0.2s; }

  @keyframes miniBounce {
    0% { height: 3px; }
    50% { height: 14px; }
    100% { height: 6px; }
  }

  .status-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
  }

  .status-dot.paused {
    background: #f59e0b;
    box-shadow: 0 0 6px rgba(245, 158, 11, 0.6);
  }

  .status-dot.idle {
    background: rgba(255, 255, 255, 0.2);
  }

  /* No results box */
  .no-results-box {
    padding: 32px 16px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  :global(.no-results-icon) {
    color: #64748b;
  }

  .no-results-title {
    margin: 0;
    color: #e2e8f0;
    font-size: 0.9rem;
    font-weight: 500;
  }

  .no-results-hint {
    color: #94a3b8;
    font-size: 0.78rem;
  }

  /* Footer Tip */
  .drawer-footer {
    padding: 10px 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(10, 13, 22, 0.5);
  }

  .footer-tip {
    font-size: 0.74rem;
    color: #94a3b8;
    display: flex;
    align-items: center;
    gap: 4px;
    flex-wrap: wrap;
  }

  kbd {
    padding: 2px 6px;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: #e2e8f0;
    font-size: 0.72rem;
    font-family: inherit;
  }

  /* Animations */
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translate(-50%, 16px) scale(0.98);
    }
    to {
      opacity: 1;
      transform: translate(-50%, 0) scale(1);
    }
  }

  /* Mobile Responsive Behavior */
  @media (max-width: 640px) {
    .station-drawer {
      bottom: 0;
      left: 0;
      right: 0;
      width: 100vw;
      transform: none;
      max-height: 78vh;
      border-radius: 22px 22px 0 0;
      border-bottom: none;
      animation: slideUpMobile 0.28s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .drag-indicator-wrapper {
      display: flex;
    }

    .drawer-header {
      padding: 10px 16px 8px 16px;
    }

    .search-bar-row {
      padding: 6px 16px 4px 16px;
    }

    .stations-grid {
      grid-template-columns: 1fr;
      gap: 8px;
    }

    .card-desc {
      -webkit-line-clamp: 1;
      line-clamp: 1;
    }

    .drawer-footer {
      display: none; /* Hide keyboard tips on mobile */
    }

    @keyframes slideUpMobile {
      from {
        transform: translateY(100%);
      }
      to {
        transform: translateY(0);
      }
    }
  }
</style>

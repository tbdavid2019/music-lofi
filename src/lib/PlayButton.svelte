<script lang="ts">
  import {
    Play,
    Pause,
    Loader2,
    SkipBack,
    SkipForward,
    RadioTower,
    ChevronUp,
    Share2,
    Check,
    Coffee,
    Headphones,
    Disc,
    Music2,
    Music,
    Moon,
    Sparkles,
    Cpu,
    Radio,
    AlertCircle,
  } from "@lucide/svelte";
  import {
    radioStore,
    currentStation,
    STATIONS,
    togglePlay,
    nextStation,
    prevStation,
  } from "./stores/radioStore";
  import StationDrawer from "./components/StationSelector/StationDrawer.svelte";
  import { copyShareLink } from "./utils/shareUtils";
  import { onMount, onDestroy } from "svelte";

  let isDrawerOpen = false;
  let copyFeedback = false;
  let copyTimeout: any = null;

  function toggleDrawer() {
    isDrawerOpen = !isDrawerOpen;
  }

  function closeDrawer() {
    isDrawerOpen = false;
  }

  async function handleQuickShare() {
    const ok = await copyShareLink({ stationId: $radioStore.currentStationId });
    if (ok) {
      copyFeedback = true;
      if (copyTimeout) clearTimeout(copyTimeout);
      copyTimeout = setTimeout(() => {
        copyFeedback = false;
      }, 2200);
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.ctrlKey || e.metaKey || e.altKey) {
      return;
    }
    const target = e.target as HTMLElement | null;
    if (
      target &&
      (target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable)
    ) {
      return;
    }

    if (e.code === "Space") {
      if (target?.closest("button, a, [role='button'], select")) {
        return;
      }
      e.preventDefault();
      togglePlay();
    } else if (e.key === "n" || e.key === "N") {
      e.preventDefault();
      nextStation();
    } else if (e.key === "p" || e.key === "P") {
      e.preventDefault();
      prevStation();
    } else if (
      (e.key === "c" || e.key === "C" || e.key === "s" || e.key === "S") &&
      !isDrawerOpen
    ) {
      e.preventDefault();
      isDrawerOpen = true;
    }
  }

  onMount(() => {
    window.addEventListener("keydown", handleKeydown);
  });

  onDestroy(() => {
    if (typeof window !== "undefined") {
      window.removeEventListener("keydown", handleKeydown);
    }
  });
</script>

<!-- Expandable Station Drawer / Modal -->
<StationDrawer isOpen={isDrawerOpen} onClose={closeDrawer} />

<!-- Docked Bottom Audio Bar -->
<div class="radio-player-container">
  <!-- Station Info Card Button (Interactive click opens drawer) -->
  <button
    type="button"
    class="station-info-btn"
    on:click={toggleDrawer}
    title="點擊展開 12 個電台頻道選單"
    aria-label={`當前電台：${$currentStation.label}。點擊切換頻道`}
    aria-expanded={isDrawerOpen}
  >
    <!-- Station icon badge -->
    <div class="station-icon-badge" class:playing={$radioStore.isPlaying}>
      {#if $currentStation.icon === "coffee"}
        <Coffee size={22} />
      {:else if $currentStation.icon === "headphones"}
        <Headphones size={22} />
      {:else if $currentStation.icon === "disc"}
        <Disc size={22} />
      {:else if $currentStation.icon === "music2"}
        <Music2 size={22} />
      {:else if $currentStation.icon === "music"}
        <Music size={22} />
      {:else if $currentStation.icon === "moon"}
        <Moon size={22} />
      {:else if $currentStation.icon === "sparkles"}
        <Sparkles size={22} />
      {:else if $currentStation.icon === "cpu"}
        <Cpu size={22} />
      {:else if $currentStation.icon === "radio"}
        <Radio size={22} />
      {:else}
        <Music size={22} />
      {/if}
    </div>

    <!-- Station Text & Category badge -->
    <div class="station-text">
      <div class="station-title-row">
        <span class="station-title">{$currentStation.name}</span>
        <span class="station-sublabel">{$currentStation.label}</span>
      </div>
      <p class="station-desc">{$currentStation.description}</p>
    </div>

    <!-- Animated Equalizer Bars -->
    <div
      class="equalizer"
      class:active={$radioStore.isPlaying && !$radioStore.isBuffering}
      class:buffering={$radioStore.isBuffering}
      title={$radioStore.isBuffering
        ? "緩衝中..."
        : $radioStore.isPlaying
          ? "播放中"
          : "已暫停"}
    >
      <span class="bar bar-1"></span>
      <span class="bar bar-2"></span>
      <span class="bar bar-3"></span>
      <span class="bar bar-4"></span>
    </div>

    <!-- Chevron Indicator for drawer trigger -->
    <div class="chevron-indicator" class:rotated={isDrawerOpen} aria-hidden="true">
      <ChevronUp size={16} />
    </div>
  </button>

  <!-- Playback & Navigation Controls Row -->
  <div class="controls-row">
    <!-- Channel Drawer Toggle Button -->
    <button
      type="button"
      class="btn-drawer-toggle"
      class:active={isDrawerOpen}
      on:click={toggleDrawer}
      title="切換電台頻道 (C)"
      aria-label="打開電台清單"
    >
      <RadioTower size={16} />
      <span class="drawer-btn-label">頻道</span>
      <span class="station-count-pill">{STATIONS.length}</span>
    </button>

    <!-- Quick Share Button -->
    <button
      type="button"
      class="btn-quick-share"
      class:copied={copyFeedback}
      on:click={handleQuickShare}
      title="一鍵複製此空間直達連結"
      aria-label="複製分享連結"
    >
      {#if copyFeedback}
        <Check size={16} />
      {:else}
        <Share2 size={16} />
      {/if}
    </button>

    <!-- Playback Prev / Play / Next Buttons -->
    <div class="playback-buttons">
      <button
        type="button"
        class="btn-nav"
        on:click={prevStation}
        title="上一頻道 (P)"
        aria-label="Previous station"
      >
        <SkipBack size={19} />
      </button>

      <button
        type="button"
        class="btn-play-pause"
        class:playing={$radioStore.isPlaying}
        on:click={togglePlay}
        title={$radioStore.isPlaying ? "暫停 (空白鍵)" : "播放 (空白鍵)"}
        aria-label={$radioStore.isPlaying ? "Pause" : "Play"}
      >
        {#if $radioStore.isBuffering}
          <span class="spin">
            <Loader2 size={24} />
          </span>
        {:else if $radioStore.isPlaying}
          <Pause size={24} />
        {:else}
          <Play size={24} style="margin-left: 2px;" />
        {/if}
      </button>

      <button
        type="button"
        class="btn-nav"
        on:click={nextStation}
        title="下一頻道 (N)"
        aria-label="Next station"
      >
        <SkipForward size={19} />
      </button>
    </div>
  </div>

  <!-- Error feedback message -->
  {#if $radioStore.error}
    <div class="error-notice">
      <AlertCircle size={15} />
      <span>{$radioStore.error}</span>
    </div>
  {/if}

  <!-- Quick Share Toast Notification -->
  {#if copyFeedback}
    <div class="quick-share-toast" role="status">
      <Check size={14} />
      <span>已複製專屬分享連結！好友開啟即可沉浸同一空間。</span>
    </div>
  {/if}
</div>

<style>
  .radio-player-container {
    position: absolute;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    width: min(680px, calc(100vw - 28px));
    background: rgba(14, 18, 28, 0.88);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(255, 255, 255, 0.14);
    border-radius: 22px;
    padding: 10px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    box-shadow:
      0 18px 45px rgba(0, 0, 0, 0.55),
      0 0 0 1px rgba(255, 255, 255, 0.08) inset;
    z-index: 40;
    pointer-events: auto;
    transition: all 0.25s ease;
  }

  /* Station Info Clickable Card */
  .station-info-btn {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
    flex: 1;
    background: transparent;
    border: none;
    padding: 4px 8px;
    border-radius: 14px;
    text-align: left;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .station-info-btn:hover {
    background: rgba(255, 255, 255, 0.07);
  }

  .station-info-btn:focus-visible {
    outline: 2px solid #a855f7;
    outline-offset: 2px;
  }

  .station-icon-badge {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.12);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #cbd5e1;
    flex-shrink: 0;
    transition: all 0.3s ease;
  }

  .station-icon-badge.playing {
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.4), rgba(168, 85, 247, 0.45));
    border-color: rgba(168, 85, 247, 0.6);
    color: #ffffff;
    box-shadow: 0 0 16px rgba(168, 85, 247, 0.35);
  }

  .station-text {
    display: flex;
    flex-direction: column;
    min-width: 0;
    gap: 2px;
  }

  .station-title-row {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .station-title {
    color: #ffffff;
    font-size: 0.95rem;
    font-weight: 600;
    letter-spacing: 0.2px;
    line-height: 1.2;
  }

  .station-sublabel {
    color: #94a3b8;
    font-size: 0.78rem;
    line-height: 1.2;
  }

  .station-desc {
    color: #cbd5e1;
    font-size: 0.74rem;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.3;
  }

  /* Animated Equalizer */
  .equalizer {
    display: flex;
    align-items: flex-end;
    gap: 3px;
    height: 18px;
    padding: 0 4px;
    flex-shrink: 0;
  }

  .bar {
    width: 3px;
    height: 4px;
    background: rgba(255, 255, 255, 0.25);
    border-radius: 2px;
    transition: height 0.2s ease, background-color 0.2s ease;
  }

  .equalizer.active .bar {
    background: #c084fc;
    animation: bounce 1.1s ease-in-out infinite alternate;
  }

  .equalizer.buffering .bar {
    background: #f59e0b;
    animation: pulse 0.8s ease-in-out infinite alternate;
  }

  .bar-1 { animation-delay: 0.1s !important; }
  .bar-2 { animation-delay: 0.35s !important; }
  .bar-3 { animation-delay: 0.2s !important; }
  .bar-4 { animation-delay: 0.45s !important; }

  @keyframes bounce {
    0% { height: 4px; }
    50% { height: 18px; }
    100% { height: 9px; }
  }

  @keyframes pulse {
    0% { height: 4px; opacity: 0.4; }
    100% { height: 14px; opacity: 1; }
  }

  .chevron-indicator {
    color: #94a3b8;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.25s ease;
    margin-left: 2px;
  }

  .chevron-indicator.rotated {
    transform: rotate(180deg);
    color: #c084fc;
  }

  /* Controls Row */
  .controls-row {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  /* Drawer Toggle Button */
  .btn-drawer-toggle {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 38px;
    padding: 0 12px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.12);
    color: #f1f5f9;
    font-size: 0.82rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-drawer-toggle:hover {
    background: rgba(168, 85, 247, 0.2);
    border-color: rgba(168, 85, 247, 0.4);
    color: #ffffff;
  }

  .btn-drawer-toggle.active {
    background: rgba(168, 85, 247, 0.3);
    border-color: #a855f7;
    color: #ffffff;
  }

  .station-count-pill {
    padding: 1px 6px;
    border-radius: 9999px;
    background: rgba(255, 255, 255, 0.14);
    font-size: 0.7rem;
    font-weight: 600;
    color: #ffffff;
  }

  /* Quick Share Button */
  .btn-quick-share {
    width: 38px;
    height: 38px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.12);
    color: #cbd5e1;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-quick-share:hover {
    background: rgba(255, 255, 255, 0.16);
    color: #ffffff;
    transform: scale(1.05);
  }

  .btn-quick-share.copied {
    background: rgba(16, 185, 129, 0.25);
    border-color: rgba(16, 185, 129, 0.5);
    color: #34d399;
  }

  /* Playback Buttons */
  .playback-buttons {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .btn-nav {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #cbd5e1;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-nav:hover {
    background: rgba(255, 255, 255, 0.16);
    color: #ffffff;
    transform: scale(1.05);
  }

  .btn-play-pause {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: #ffffff;
    border: none;
    color: #0f1117;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 4px 18px rgba(255, 255, 255, 0.25);
    transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .btn-play-pause:hover {
    transform: scale(1.06);
    box-shadow: 0 6px 22px rgba(255, 255, 255, 0.4);
  }

  .btn-play-pause.playing {
    background: linear-gradient(135deg, #a855f7, #6366f1);
    color: #ffffff;
    box-shadow: 0 4px 20px rgba(168, 85, 247, 0.45);
  }

  .spin {
    display: inline-flex;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  /* Error notice */
  .error-notice {
    position: absolute;
    top: -46px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 7px 14px;
    background: rgba(239, 68, 68, 0.2);
    border: 1px solid rgba(239, 68, 68, 0.4);
    border-radius: 10px;
    backdrop-filter: blur(12px);
    color: #fca5a5;
    font-size: 0.8rem;
    white-space: nowrap;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
  }

  /* Quick share toast */
  .quick-share-toast {
    position: absolute;
    top: -46px;
    right: 0;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 7px 14px;
    background: rgba(16, 185, 129, 0.25);
    border: 1px solid rgba(16, 185, 129, 0.5);
    border-radius: 10px;
    backdrop-filter: blur(12px);
    color: #a7f3d0;
    font-size: 0.8rem;
    white-space: nowrap;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
    animation: fadeIn 0.2s ease-out;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* RWD for Mobile */
  @media (max-width: 640px) {
    .radio-player-container {
      bottom: 16px;
      padding: 8px 12px;
      gap: 8px;
    }

    .station-desc {
      display: none;
    }

    .equalizer {
      display: none;
    }

    .drawer-btn-label {
      display: none;
    }

    .btn-drawer-toggle {
      padding: 0 8px;
    }

    .btn-nav {
      width: 32px;
      height: 32px;
    }

    .btn-play-pause {
      width: 44px;
      height: 44px;
    }

    .quick-share-toast {
      right: 50%;
      transform: translateX(50%);
    }
  }
</style>

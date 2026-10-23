<script lang="ts">
  import {
    Play,
    Pause,
    Loader2,
    SkipBack,
    SkipForward,
    Coffee,
    Headphones,
    Disc,
    Music2,
    Music,
    Moon,
    AlertCircle,
  } from "lucide-svelte";
  import {
    radioStore,
    currentStation,
    STATIONS,
    togglePlay,
    playStation,
    nextStation,
    prevStation,
  } from "./stores/radioStore";
  import { onMount, onDestroy } from "svelte";

  function handleKeydown(e: KeyboardEvent) {
    if (e.ctrlKey || e.metaKey || e.altKey) {
      return;
    }
    const target = e.target as HTMLElement | null;
    if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
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

<div class="radio-player-container">
  <!-- Station Selector Pill Bar -->
  <div class="station-pills" role="tablist" aria-label="電台頻道選擇">
    {#each STATIONS as station (station.id)}
      <button
        type="button"
        class="station-pill"
        class:active={$radioStore.currentStationId === station.id}
        on:click={() => playStation(station.id, true)}
        title={station.description}
      >
        <span class="pill-icon">
          {#if station.icon === 'coffee'}
            <Coffee size={15} />
          {:else if station.icon === 'headphones'}
            <Headphones size={15} />
          {:else if station.icon === 'disc'}
            <Disc size={15} />
          {:else if station.icon === 'music2'}
            <Music2 size={15} />
          {:else if station.icon === 'music'}
            <Music size={15} />
          {:else if station.icon === 'moon'}
            <Moon size={15} />
          {/if}
        </span>
        <span class="pill-name">{station.label}</span>
      </button>
    {/each}
  </div>

  <!-- Player Main Body -->
  <div class="player-body">
    <!-- Station Info & Equalizer -->
    <div class="station-info">
      <div class="station-icon-badge" class:playing={$radioStore.isPlaying}>
        {#if $currentStation.icon === 'coffee'}
          <Coffee size={22} />
        {:else if $currentStation.icon === 'headphones'}
          <Headphones size={22} />
        {:else if $currentStation.icon === 'disc'}
          <Disc size={22} />
        {:else if $currentStation.icon === 'music2'}
          <Music2 size={22} />
        {:else if $currentStation.icon === 'music'}
          <Music size={22} />
        {:else if $currentStation.icon === 'moon'}
          <Moon size={22} />
        {/if}
      </div>

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
        title={$radioStore.isBuffering ? '緩衝中...' : $radioStore.isPlaying ? '播放中' : '已暫停'}
      >
        <span class="bar bar-1"></span>
        <span class="bar bar-2"></span>
        <span class="bar bar-3"></span>
        <span class="bar bar-4"></span>
      </div>
    </div>

    <!-- Playback Controls -->
    <div class="controls-row">
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
</div>

<style>
  .radio-player-container {
    position: absolute;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    width: min(640px, 92vw);
    background: rgba(18, 20, 28, 0.78);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 20px;
    padding: 14px 18px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08);
    z-index: 40;
    pointer-events: auto;
    transition: all 0.25s ease;
  }

  /* Station Pills */
  .station-pills {
    display: flex;
    align-items: center;
    gap: 6px;
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
    padding-bottom: 2px;
  }
  .station-pills::-webkit-scrollbar {
    display: none;
  }

  .station-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 9999px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.75);
    font-size: 0.82rem;
    font-weight: 500;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.2s ease;
  }

  .station-pill:hover {
    background: rgba(255, 255, 255, 0.12);
    color: #ffffff;
    transform: translateY(-1px);
  }

  .station-pill.active {
    background: rgba(255, 255, 255, 0.95);
    color: #12141c;
    border-color: rgba(255, 255, 255, 0.95);
    box-shadow: 0 4px 14px rgba(255, 255, 255, 0.2);
  }

  .pill-icon {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Player Body */
  .player-body {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }

  .station-info {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
    flex: 1;
  }

  .station-icon-badge {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.12);
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.9);
    flex-shrink: 0;
    transition: all 0.3s ease;
  }

  .station-icon-badge.playing {
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(168, 85, 247, 0.3));
    border-color: rgba(168, 85, 247, 0.4);
    color: #ffffff;
    box-shadow: 0 0 16px rgba(168, 85, 247, 0.3);
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
  }

  .station-title {
    color: #ffffff;
    font-size: 0.95rem;
    font-weight: 600;
    letter-spacing: 0.3px;
  }

  .station-sublabel {
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.78rem;
  }

  .station-desc {
    color: rgba(255, 255, 255, 0.65);
    font-size: 0.75rem;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Animated Equalizer */
  .equalizer {
    display: flex;
    align-items: flex-end;
    gap: 3px;
    height: 20px;
    padding: 0 4px;
    flex-shrink: 0;
  }

  .bar {
    width: 3px;
    height: 4px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 2px;
    transition: height 0.2s ease, background-color 0.2s ease;
  }

  .equalizer.active .bar {
    background: #a855f7;
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

  /* Controls Row */
  .controls-row {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
  }

  .btn-nav {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.85);
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
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: #ffffff;
    border: none;
    color: #0f1117;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 4px 18px rgba(255, 255, 255, 0.3);
    transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .btn-play-pause:hover {
    transform: scale(1.08);
    box-shadow: 0 6px 24px rgba(255, 255, 255, 0.45);
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
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    background: rgba(239, 68, 68, 0.15);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 8px;
    color: #fca5a5;
    font-size: 0.78rem;
  }

  @media (max-width: 640px) {
    .radio-player-container {
      bottom: 16px;
      padding: 12px 14px;
    }
    .station-desc {
      display: none;
    }
    .equalizer {
      display: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .equalizer.active .bar,
    .equalizer.buffering .bar {
      animation: none;
      height: 12px;
    }
  }
</style>

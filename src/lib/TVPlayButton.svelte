<script lang="ts">
  import {
    Play,
    Pause,
    Loader2,
    SkipBack,
    SkipForward,
    Volume2,
    VolumeX,
    Coffee,
    Headphones,
    Disc,
    Music2,
    Music,
    Moon,
    AlertCircle,
    Radio,
  } from "@lucide/svelte";
  import {
    radioStore,
    currentStation,
    STATIONS,
    togglePlay,
    playStation,
    nextStation,
    prevStation,
    setMainVolume,
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

    switch (e.code) {
      case "Enter":
      case "Space":
        if (target?.closest("button, a, [role='button'], select")) {
          return;
        }
        e.preventDefault();
        togglePlay();
        break;
      case "ArrowLeft":
        e.preventDefault();
        prevStation();
        break;
      case "ArrowRight":
        e.preventDefault();
        nextStation();
        break;
      case "ArrowUp":
        e.preventDefault();
        setMainVolume(Math.min(1, $radioStore.volume + 0.05));
        break;
      case "ArrowDown":
        e.preventDefault();
        setMainVolume(Math.max(0, $radioStore.volume - 0.05));
        break;
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

<div class="tv-player-card">
  <!-- Top Header Badge -->
  <div class="tv-status-badge">
    <Radio size={18} class="badge-icon" />
    <span class="badge-title">24/7 直播音樂電台</span>
    <span class="badge-dot" class:live={$radioStore.isPlaying}></span>
  </div>

  <!-- Now Playing Display -->
  <div class="tv-station-hero">
    <div class="tv-icon-wrapper" class:pulse={$radioStore.isPlaying && !$radioStore.isBuffering}>
      {#if $currentStation.icon === 'coffee'}
        <Coffee size={54} />
      {:else if $currentStation.icon === 'headphones'}
        <Headphones size={54} />
      {:else if $currentStation.icon === 'disc'}
        <Disc size={54} />
      {:else if $currentStation.icon === 'music2'}
        <Music2 size={54} />
      {:else if $currentStation.icon === 'music'}
        <Music size={54} />
      {:else if $currentStation.icon === 'moon'}
        <Moon size={54} />
      {/if}
    </div>

    <div class="tv-station-details">
      <div class="tv-station-name-row">
        <h2 class="tv-station-name">{$currentStation.name}</h2>
        <span class="tv-station-label">{$currentStation.label}</span>
      </div>
      <p class="tv-station-desc">{$currentStation.description}</p>
    </div>
  </div>

  <!-- Equalizer -->
  <div class="tv-equalizer" class:active={$radioStore.isPlaying && !$radioStore.isBuffering}>
    <span class="eq-bar bar-1"></span>
    <span class="eq-bar bar-2"></span>
    <span class="eq-bar bar-3"></span>
    <span class="eq-bar bar-4"></span>
    <span class="eq-bar bar-5"></span>
    <span class="eq-bar bar-6"></span>
    <span class="eq-bar bar-7"></span>
    <span class="eq-bar bar-8"></span>
  </div>

  <!-- Big TV Controls -->
  <div class="tv-controls-row">
    <button
      type="button"
      class="tv-btn tv-btn-nav"
      on:click={prevStation}
      title="上一台 (← 鍵盤向左)"
      aria-label="Previous station"
    >
      <SkipBack size={32} />
    </button>

    <button
      type="button"
      class="tv-btn tv-btn-play"
      class:playing={$radioStore.isPlaying}
      on:click={togglePlay}
      title={$radioStore.isPlaying ? "暫停 (OK / 空白鍵)" : "播放 (OK / 空白鍵)"}
      aria-label={$radioStore.isPlaying ? "Pause" : "Play"}
    >
      {#if $radioStore.isBuffering}
        <span class="tv-spin">
          <Loader2 size={40} />
        </span>
      {:else if $radioStore.isPlaying}
        <Pause size={40} />
      {:else}
        <Play size={40} style="margin-left: 4px;" />
      {/if}
    </button>

    <button
      type="button"
      class="tv-btn tv-btn-nav"
      on:click={nextStation}
      title="下一台 (→ 鍵盤向右)"
      aria-label="Next station"
    >
      <SkipForward size={32} />
    </button>
  </div>

  <!-- Volume Display Slider -->
  <div class="tv-volume-row">
    {#if $radioStore.volume === 0}
      <VolumeX size={22} class="tv-vol-icon" />
    {:else}
      <Volume2 size={22} class="tv-vol-icon" />
    {/if}
    <input
      type="range"
      min="0"
      max="1"
      step="0.01"
      value={$radioStore.volume}
      on:input={(e) => setMainVolume(parseFloat(e.currentTarget.value))}
      class="tv-vol-slider"
      aria-label="電台音量"
    />
    <span class="tv-vol-pct">{Math.round($radioStore.volume * 100)}%</span>
  </div>

  <!-- Error Alert -->
  {#if $radioStore.error}
    <div class="tv-error-badge">
      <AlertCircle size={20} />
      <span>{$radioStore.error}</span>
    </div>
  {/if}
</div>

<style>
  .tv-player-card {
    background: rgba(16, 20, 32, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 24px;
    padding: 2.2rem;
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.6rem;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
    width: 100%;
    box-sizing: border-box;
  }

  .tv-status-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.4rem 1.1rem;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 9999px;
    color: rgba(255, 255, 255, 0.85);
    font-size: 0.95rem;
    font-weight: 500;
  }

  .badge-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #64748b;
    transition: background 0.3s ease;
  }

  .badge-dot.live {
    background: #22c55e;
    box-shadow: 0 0 10px #22c55e;
  }

  .tv-station-hero {
    display: flex;
    align-items: center;
    gap: 1.8rem;
    width: 100%;
    justify-content: center;
  }

  .tv-icon-wrapper {
    width: 96px;
    height: 96px;
    border-radius: 20px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.04));
    border: 1px solid rgba(255, 255, 255, 0.18);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ffffff;
    flex-shrink: 0;
    transition: all 0.3s ease;
  }

  .tv-icon-wrapper.pulse {
    border-color: rgba(168, 85, 247, 0.6);
    box-shadow: 0 0 28px rgba(168, 85, 247, 0.4);
    transform: scale(1.02);
  }

  .tv-station-details {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    text-align: left;
  }

  .tv-station-name-row {
    display: flex;
    align-items: baseline;
    gap: 0.8rem;
  }

  .tv-station-name {
    margin: 0;
    font-size: 2rem;
    font-weight: 700;
    color: #ffffff;
    letter-spacing: 0.5px;
  }

  .tv-station-label {
    font-size: 1.1rem;
    color: #a855f7;
    font-weight: 600;
  }

  .tv-station-desc {
    margin: 0;
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.7);
  }

  /* Equalizer */
  .tv-equalizer {
    display: flex;
    align-items: flex-end;
    gap: 6px;
    height: 36px;
  }

  .eq-bar {
    width: 6px;
    height: 6px;
    border-radius: 3px;
    background: rgba(255, 255, 255, 0.2);
    transition: height 0.2s ease, background 0.2s ease;
  }

  .tv-equalizer.active .eq-bar {
    background: linear-gradient(to top, #6366f1, #a855f7);
    animation: tvBounce 1.2s ease-in-out infinite alternate;
  }

  .tv-equalizer.active .bar-1 { animation-delay: 0.1s; }
  .tv-equalizer.active .bar-2 { animation-delay: 0.4s; }
  .tv-equalizer.active .bar-3 { animation-delay: 0.2s; }
  .tv-equalizer.active .bar-4 { animation-delay: 0.6s; }
  .tv-equalizer.active .bar-5 { animation-delay: 0.3s; }
  .tv-equalizer.active .bar-6 { animation-delay: 0.5s; }
  .tv-equalizer.active .bar-7 { animation-delay: 0.15s; }
  .tv-equalizer.active .bar-8 { animation-delay: 0.45s; }

  @keyframes tvBounce {
    0% { height: 6px; }
    50% { height: 34px; }
    100% { height: 14px; }
  }

  /* Controls */
  .tv-controls-row {
    display: flex;
    align-items: center;
    gap: 1.8rem;
  }

  .tv-btn {
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .tv-btn-nav {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: #ffffff;
  }

  .tv-btn-nav:hover, .tv-btn-nav:focus {
    background: rgba(255, 255, 255, 0.22);
    transform: scale(1.1);
    outline: none;
  }

  .tv-btn-play {
    width: 88px;
    height: 88px;
    border-radius: 50%;
    background: #ffffff;
    color: #0f1117;
    box-shadow: 0 8px 30px rgba(255, 255, 255, 0.35);
  }

  .tv-btn-play:hover, .tv-btn-play:focus {
    transform: scale(1.1);
    box-shadow: 0 12px 36px rgba(255, 255, 255, 0.5);
    outline: none;
  }

  .tv-btn-play.playing {
    background: linear-gradient(135deg, #a855f7, #6366f1);
    color: #ffffff;
    box-shadow: 0 8px 32px rgba(168, 85, 247, 0.5);
  }

  .tv-spin {
    display: inline-flex;
    animation: tvSpin 1s linear infinite;
  }

  @keyframes tvSpin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  /* Volume Row */
  .tv-volume-row {
    display: flex;
    align-items: center;
    gap: 1rem;
    width: 80%;
    max-width: 420px;
  }

  :global(.tv-vol-icon) {
    color: rgba(255, 255, 255, 0.7);
    flex-shrink: 0;
  }

  .tv-vol-slider {
    flex: 1;
    accent-color: #a855f7;
    cursor: pointer;
    height: 6px;
    border-radius: 3px;
  }

  .tv-vol-pct {
    color: rgba(255, 255, 255, 0.85);
    font-size: 1rem;
    font-weight: 600;
    min-width: 48px;
  }

  .tv-error-badge {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.6rem 1.2rem;
    background: rgba(239, 68, 68, 0.2);
    border: 1px solid rgba(239, 68, 68, 0.4);
    border-radius: 12px;
    color: #fca5a5;
    font-size: 0.95rem;
  }

  @media (prefers-reduced-motion: reduce) {
    .tv-equalizer.active .eq-bar {
      animation: none;
      height: 18px;
    }
  }
</style>

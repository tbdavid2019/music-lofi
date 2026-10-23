<script lang="ts">
  import { afterUpdate, onMount } from "svelte";

  export let setMeVisible: (id: number) => void;
  export let activeAudios: Array<{ id: number; audio: HTMLAudioElement }> = [];
  export let track = {
    id: -1,
    track: "none",
    title: "Track",
    qoute: "none",
    isPlaying: false,
  };

  export let visibleTrackId = -1;
  export let onTogglePlay: (() => void) | undefined = undefined;

  let trackItemAnimationClass = "item-hidden";
  let volume = 0.5;

  function updateAnimation() {
    if (track.id == visibleTrackId) {
      trackItemAnimationClass = "item-visible";
    } else if (track.id + 1 == visibleTrackId) {
      trackItemAnimationClass = "item-before-visible";
    } else if (track.id - 1 == visibleTrackId) {
      trackItemAnimationClass = "item-after-visible";
    }
    // Edge tracks
    else if (track.id == 9 && visibleTrackId == 1) {
      trackItemAnimationClass = "item-before-visible";
    } else if (track.id == 1 && visibleTrackId == 9) {
      trackItemAnimationClass = "item-after-visible";
    } else {
      trackItemAnimationClass = "item-hidden";
    }
  }

  function handleVolumeChange(event: Event) {
    const target = event.target as HTMLInputElement;
    volume = parseFloat(target.value);
    try {
      localStorage.setItem(`audioVolume_${track.id}`, volume.toString());
      localStorage.setItem("audioVolume", volume.toString());
    } catch {
      // Ignore storage error
    }
    activeAudios.forEach((item) => {
      if (item.id === track.id) {
        item.audio.volume = volume;
      }
    });
  }

  function playTrack() {
    for (let i = activeAudios.length - 1; i >= 0; i--) {
      if (activeAudios[i].id === track.id) {
        activeAudios[i].audio.pause();
        activeAudios.splice(i, 1);
      }
    }
    const audio = new Audio(`assets/engine/tracks/${track.track}`);
    audio.volume = volume;
    audio.loop = true;
    audio.play().catch((err) => {
      console.warn("Audio playback failed:", err);
      for (let i = activeAudios.length - 1; i >= 0; i--) {
        if (activeAudios[i].audio === audio) {
          activeAudios.splice(i, 1);
        }
      }
      track.isPlaying = false;
      if (onTogglePlay) onTogglePlay();
    });
    activeAudios.push({
      id: track.id,
      audio,
    });
    track.isPlaying = true;
    setMeVisible(track.id);
    if (onTogglePlay) onTogglePlay();
  }

  function pauseTrack() {
    for (let i = activeAudios.length - 1; i >= 0; i--) {
      if (activeAudios[i].id === track.id) {
        activeAudios[i].audio.pause();
        activeAudios.splice(i, 1);
      }
    }
    track.isPlaying = false;
    if (onTogglePlay) onTogglePlay();
  }

  function togglePlay() {
    if (track.isPlaying) {
      pauseTrack();
    } else {
      playTrack();
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      togglePlay();
    }
  }

  onMount(() => {
    try {
      const savedVolume =
        localStorage.getItem(`audioVolume_${track.id}`) ?? localStorage.getItem("audioVolume");
      if (savedVolume !== null) {
        const parsed = parseFloat(savedVolume);
        if (!isNaN(parsed)) {
          volume = parsed;
        }
      }
    } catch {
      // Ignore storage error
    }
  });

  updateAnimation();
  afterUpdate(updateAnimation);
</script>

<div
  role="button"
  tabindex={track.id === visibleTrackId ? 0 : -1}
  aria-pressed={track.isPlaying}
  aria-keyshortcuts={track.id >= 1 && track.id <= 9 ? track.id.toString() : undefined}
  aria-label={`${track.title}，${track.isPlaying ? "播放中，按 Enter 鍵暫停" : "已暫停，按 Enter 鍵播放"}`}
  on:contextmenu|preventDefault={() => {
    if (!track.isPlaying) {
      setMeVisible(track.id);
    }
  }}
  on:click={togglePlay}
  on:keydown={handleKeydown}
  class={"carousel__item " + trackItemAnimationClass}
>
  <div class={"carousel__item-body " + (track.isPlaying ? "playing" : "")}>
    <img
      class="carousel__item-body__img"
      src="assets/images/{track.id}.jpg"
      alt="{track.title} 封面圖"
      loading="lazy"
    />
    <div class="track-info">
      <div class="track-header">
        <h3 class="track-title">{track.title || `Track ${track.id}`}</h3>
        {#if track.isPlaying}
          <span class="track-badge">播放中</span>
        {/if}
      </div>
      <p class="track-desc">{track?.qoute}</p>
      {#if track.isPlaying}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div
          class="volume-control-row"
          on:click|stopPropagation
          on:keydown|stopPropagation
        >
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            bind:value={volume}
            on:input={handleVolumeChange}
            aria-label={`${track.title} 音量`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(volume * 100)}
            class="volume-slider"
          />
          <span class="volume-badge">{Math.round(volume * 100)}%</span>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .carousel__item {
    display: flex;
    align-items: center;
    position: absolute;
    width: 100%;
    will-change: transform, opacity;
    transition: transform 500ms cubic-bezier(0.4, 0, 0.2, 1), opacity 500ms cubic-bezier(0.4, 0, 0.2, 1);
    outline: none;
  }

  .carousel__item:focus-visible .carousel__item-body {
    outline: 2px solid #FB923C;
    outline-offset: 3px;
  }

  .carousel__item-body {
    position: relative;
    width: 100%;
    color: #FFFFFF;
    border-radius: 16px;
    padding: 16px;
    display: flex;
    gap: 16px;
    min-width: 320px;
    background: rgba(15, 18, 28, 0.86);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.22);
    box-shadow: 0 14px 34px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.12);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
    overflow: hidden;
    user-select: none;
  }

  .carousel__item-body:hover {
    background: rgba(20, 24, 38, 0.92);
    border-color: rgba(255, 255, 255, 0.38);
    transform: translateY(-2px);
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.65), inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }

  .carousel__item-body.playing {
    background: linear-gradient(135deg, rgba(20, 24, 38, 0.94) 0%, rgba(45, 26, 18, 0.92) 100%);
    border: 1.5px solid #FB923C;
    box-shadow: 0 16px 38px rgba(0, 0, 0, 0.65), 0 0 20px rgba(251, 146, 60, 0.25);
  }

  .carousel__item-body__img {
    width: 80px;
    min-width: 80px;
    height: 80px;
    border-radius: 12px;
    overflow: hidden;
    object-fit: cover;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
    flex-shrink: 0;
  }

  .track-info {
    display: flex;
    flex-direction: column;
    justify-content: center;
    flex: 1;
    overflow: hidden;
    min-width: 0;
  }

  .track-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    width: 100%;
  }

  .track-title {
    font-size: 20px;
    font-weight: 700;
    color: #FFFFFF;
    line-height: 1.3;
    letter-spacing: 0.01em;
    margin: 0;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .playing .track-title {
    color: #FFF7ED;
  }

  .track-badge {
    font-size: 12px;
    font-weight: 700;
    color: #1C1917;
    background: #FDBA74;
    border: 1px solid #FB923C;
    padding: 2px 9px;
    border-radius: 999px;
    letter-spacing: 0.02em;
    white-space: nowrap;
    display: inline-flex;
    align-items: center;
    flex-shrink: 0;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
  }

  .track-desc {
    font-size: 15px;
    font-weight: 500;
    color: #E2E8F0;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    margin: 4px 0 0 0;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
  }

  .item-visible {
    opacity: 1;
    visibility: visible;
    z-index: 2;
  }

  .item-hidden {
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    animation-duration: 0ms;
    transform: scale(0.1);
    z-index: 0;
  }

  .item-before-visible {
    opacity: 0.92;
    visibility: visible;
    transform: scale(0.9) translate(0, -152px);
    z-index: 1;
  }

  .item-after-visible {
    opacity: 0.92;
    visibility: visible;
    transform: scale(0.9) translate(0, 152px);
    z-index: 1;
  }

  .item-before-visible .carousel__item-body,
  .item-after-visible .carousel__item-body {
    background: rgba(15, 18, 28, 0.80);
    border-color: rgba(255, 255, 255, 0.16);
  }

  .volume-control-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 10px;
    width: 100%;
  }

  .volume-badge {
    font-size: 13px;
    font-weight: 600;
    color: #FED7AA;
    min-width: 38px;
    text-align: right;
    font-variant-numeric: tabular-nums;
  }

  .volume-slider {
    flex: 1;
    width: 100%;
    height: 6px;
    -webkit-appearance: none;
    appearance: none;
    background: rgba(255, 255, 255, 0.28);
    border-radius: 999px;
    outline: none;
    cursor: pointer;
    transition: background 0.2s;
  }

  .volume-slider:hover,
  .volume-slider:focus-visible {
    background: rgba(255, 255, 255, 0.4);
  }

  .volume-slider:focus-visible {
    box-shadow: 0 0 0 2px #FB923C;
  }

  .volume-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    background: #FB923C;
    border: 2px solid #FFFFFF;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.45);
    transition: transform 0.15s ease, background-color 0.15s ease;
  }

  .volume-slider::-webkit-slider-thumb:hover {
    transform: scale(1.15);
    background: #F97316;
  }

  .volume-slider::-moz-range-thumb {
    width: 16px;
    height: 16px;
    background: #FB923C;
    border: 2px solid #FFFFFF;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.45);
    transition: transform 0.15s ease, background-color 0.15s ease;
  }

  .volume-slider::-moz-range-thumb:hover {
    transform: scale(1.15);
    background: #F97316;
  }

  @media only screen and (max-width: 600px) {
    .carousel__item {
      position: relative;
      margin-bottom: 12px;
      transform: none !important;
      opacity: 1 !important;
      visibility: visible !important;
      pointer-events: auto !important;
    }

    .carousel__item-body {
      min-width: auto;
      width: 100%;
      padding: 12px;
      gap: 12px;
      border-radius: 14px;
    }

    .carousel__item-body__img {
      width: 60px;
      min-width: 60px;
      height: 60px;
      border-radius: 10px;
    }

    .track-title {
      font-size: 17px;
    }

    .track-desc {
      font-size: 13px;
      color: #E2E8F0;
    }

    .volume-control-row {
      margin-top: 8px;
    }
  }
</style>
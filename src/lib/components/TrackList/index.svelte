<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { ChevronDown, ChevronUp, Sparkles } from "@lucide/svelte";
  import TrackListItem from "./TrackListItem.svelte";
  import Rain from "../Controls/Rain/index.svelte";
  import Thunder from "../Controls/Thunder/index.svelte";
  import Jungle from "../Controls/Jungle/index.svelte";
  import CampFire from "../Controls/CampFire/index.svelte";

  const STORAGE_KEY = "Volumes";
  const DEFAULT_VOLUMES = {
    rain: 1,
    thunder: 1,
    campfire: 1,
    jungle: 1,
    main_track: 1,
  };

  let volumes = loadVolumes();

  function loadVolumes() {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return { ...DEFAULT_VOLUMES, ...JSON.parse(raw) };
      } catch (e) {}
    }
    return { ...DEFAULT_VOLUMES };
  }

  function handleVolumesUpdated(e: any) {
    if (e.detail) {
      volumes = { ...DEFAULT_VOLUMES, ...e.detail };
    }
  }

  // Mobile visibility toggle
  let isMobileVisible = false;

  let tracks = [
    {
      id: 1,
      track: "Wind-Mark_DiAngelo-1940285615.mp3",
      title: "風聲",
      qoute: "微風拂過林梢與曠野，帶來自由舒緩的呼吸節奏。",
      isPlaying: false,
    },
    {
      id: 2,
      track: "small-waves-onto-the-sand-143040.mp3",
      title: "海灘聲",
      qoute: "輕柔海浪拍打細沙，讓思緒隨潮汐緩緩沉澱。",
      isPlaying: false,
    },
    {
      id: 3,
      track: "night-ambience-17064.mp3",
      title: "夜晚氛圍",
      qoute: "靜謐夏夜的微風與蟲鳴，陪伴深夜獨處與專注時刻。",
      isPlaying: false,
    },
    {
      id: 4,
      track: "urban-seagulls-30068.mp3",
      title: "海鷗聲",
      qoute: "遠方海灣的海鷗鳴叫，勾勒出寬闊悠閒的海岸午後。",
      isPlaying: false,
    },
    {
      id: 5,
      track: "office-ambience-6322.mp3",
      title: "辦公室",
      qoute: "柔和的鍵盤敲擊與翻頁聲，營造沉穩規律的共學工作感。",
      isPlaying: false,
    },
    {
      id: 6,
      track: "city-ambience-9272.mp3",
      title: "城市聲",
      qoute: "窗外遠處車流與街角脈動，在都市微光中享受片刻寧靜。",
      isPlaying: false,
    },
    {
      id: 7,
      track: "old-server-turning-on-and-off-24540.mp3",
      title: "伺服器",
      qoute: "低沉穩定的機房白噪音，屏蔽外界雜音、提升深度專注。",
      isPlaying: false,
    },
    {
      id: 8,
      track: "train-to-munich-germany.mp3",
      title: "火車聲",
      qoute: "鐵道規律的車廂晃動與軌道聲，帶你踏上放鬆的心靈旅程。",
      isPlaying: false,
    },
    {
      id: 9,
      track: "underwater-white-noise-46423.mp3",
      title: "水下白噪音",
      qoute: "深海溫柔包覆的低頻水波聲，隔絕紛擾、進入冥想與深眠。",
      isPlaying: false,
    },
  ];

  let activeAudios: Array<{ id: number; audio: HTMLAudioElement }> = [];
  let visibleTrackId = 1;

  $: activeCount = tracks.filter((t) => t.isPlaying).length;

  function stopAllTracks() {
    activeAudios.forEach((item) => {
      item.audio.pause();
    });
    activeAudios = [];
    tracks.forEach((track) => {
      track.isPlaying = false;
    });
    tracks = [...tracks];
  }

  function toggleTrack(index: number) {
    const targetTrack = tracks[index];
    if (!targetTrack) return;

    if (targetTrack.isPlaying) {
      for (let i = activeAudios.length - 1; i >= 0; i--) {
        if (activeAudios[i].id === targetTrack.id) {
          activeAudios[i].audio.pause();
          activeAudios.splice(i, 1);
        }
      }
      targetTrack.isPlaying = false;
    } else {
      for (let i = activeAudios.length - 1; i >= 0; i--) {
        if (activeAudios[i].id === targetTrack.id) {
          activeAudios[i].audio.pause();
          activeAudios.splice(i, 1);
        }
      }
      const savedVolume =
        typeof localStorage !== "undefined"
          ? localStorage.getItem(`audioVolume_${targetTrack.id}`) ?? localStorage.getItem("audioVolume")
          : null;
      const vol = savedVolume !== null ? parseFloat(savedVolume) : 0.5;
      const audio = new Audio(`assets/engine/tracks/${targetTrack.track}`);
      audio.volume = isNaN(vol) ? 0.5 : vol;
      audio.loop = true;
      audio.play().catch((err) => {
        console.warn("Audio playback failed:", err);
        activeAudios = activeAudios.filter((item) => item.audio !== audio);
        targetTrack.isPlaying = false;
        tracks = [...tracks];
      });
      activeAudios.push({
        id: targetTrack.id,
        audio,
      });
      targetTrack.isPlaying = true;
      visibleTrackId = targetTrack.id;
    }
    tracks = [...tracks];
  }

  function nextTrack() {
    visibleTrackId < tracks.length ? visibleTrackId++ : (visibleTrackId = 1);
  }

  function prevTrack() {
    visibleTrackId > 1 ? visibleTrackId-- : (visibleTrackId = tracks.length);
  }

  function toggleMobileVisibility() {
    isMobileVisible = !isMobileVisible;
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const target = e.target as HTMLElement | null;
    if (
      target &&
      (target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable ||
        (target.closest && target.closest("input, textarea, [contenteditable='true']")))
    ) {
      return;
    }

    if (e.key === "k" || e.key === "K") {
      stopAllTracks();
    } else if (e.key >= "1" && e.key <= "9") {
      const idx = parseInt(e.key, 10) - 1;
      toggleTrack(idx);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      prevTrack();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      nextTrack();
    }
  }

  onMount(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("volumesUpdated", handleVolumesUpdated);
  });

  onDestroy(() => {
    if (typeof window !== "undefined") {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("volumesUpdated", handleVolumesUpdated);
    }
    activeAudios.forEach((item) => {
      item.audio.pause();
    });
    activeAudios = [];
  });
</script>

<div class="track-list" class:mobile-visible={isMobileVisible}>
  <!-- Mobile toggle button -->
  <button
    type="button"
    class="mobile-toggle"
    aria-expanded={isMobileVisible}
    aria-controls="track-carousel-wrapper"
    on:click={toggleMobileVisibility}
  >
    {#if isMobileVisible}
      <ChevronDown size={20} />
      <span>隱藏音軌</span>
    {:else}
      <ChevronUp size={20} />
      <span>顯示音軌 ({activeCount}/{tracks.length})</span>
    {/if}
  </button>

  <!-- 快捷聲學氛圍塢 (Quick Ambience Bar) -->
  <div class="quick-ambience-bar" aria-label="快捷氛圍音效">
    <div class="ambience-info">
      <span class="ambience-tag">
        <Sparkles size={12} class="sparkle-icon" />
        快捷氛圍
      </span>
      <span class="ambience-hint">4 大自然原聲</span>
    </div>
    <div class="ambience-buttons">
      <Rain volume={volumes.rain} />
      <Thunder volume={volumes.thunder} />
      <Jungle volume={volumes.jungle} />
      <CampFire volume={volumes.campfire} />
    </div>
  </div>

  <div id="track-carousel-wrapper" class="wrapper">
    <div class="carousel">
      {#each tracks as track (track.id)}
        <TrackListItem
          {activeAudios}
          {track}
          {visibleTrackId}
          setMeVisible={(id) => (visibleTrackId = id)}
          onTogglePlay={() => {
            tracks = [...tracks];
          }}
        />
      {/each}
    </div>
  </div>

  <div id="btn-view" class="btn-view">
    <nav class="nav-bar" aria-label="音軌切換導覽">
      <button
        type="button"
        class="nav-btn prev-btn"
        on:click={prevTrack}
        aria-label="上一首音軌 (按鍵 ↑)"
        title="上一首 (方向鍵 ↑)"
      >
        <ChevronUp size={18} />
        <span>上一首</span>
      </button>

      <div class="nav-pill" aria-live="polite" aria-atomic="true">
        <span class="pill-track">{visibleTrackId} / {tracks.length}</span>
        {#if activeCount > 0}
          <span class="pill-active">· {activeCount} 首播放中</span>
        {/if}
      </div>

      <button
        type="button"
        class="nav-btn next-btn"
        on:click={nextTrack}
        aria-label="下一首音軌 (按鍵 ↓)"
        title="下一首 (方向鍵 ↓)"
      >
        <span>下一首</span>
        <ChevronDown size={18} />
      </button>
    </nav>
  </div>
</div>

<style>
  .track-list {
    width: 400px;
    height: 75vh;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    pointer-events: none;
    position: relative;
    user-select: none;
  }

  .quick-ambience-bar {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 14px;
    border-radius: 20px;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    background-color: rgba(0, 0, 0, 0.45);
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
    user-select: none;
    z-index: 25;
  }

  .ambience-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .ambience-tag {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 13px;
    font-weight: 600;
    color: #ffffff;
    letter-spacing: 0.3px;
  }

  :global(.sparkle-icon) {
    color: #38bdf8;
  }

  .ambience-hint {
    font-size: 10px;
    color: rgba(255, 255, 255, 0.6);
  }

  .ambience-buttons {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .track-list > * {
    pointer-events: auto;
  }

  .wrapper {
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: center;
    position: relative;
  }

  .carousel {
    position: relative;
    width: 100%;
    max-width: 500px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
  }

  #btn-view {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 8px;
  }

  .nav-bar {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .nav-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(15, 18, 28, 0.86);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.24);
    border-radius: 999px;
    color: #FFFFFF;
    font-size: 14px;
    font-weight: 600;
    padding: 8px 16px;
    cursor: pointer;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.12);
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    user-select: none;
  }

  .nav-btn:hover {
    background: rgba(24, 29, 46, 0.94);
    border-color: rgba(255, 255, 255, 0.42);
    transform: translateY(-1px);
    box-shadow: 0 10px 28px rgba(0, 0, 0, 0.55);
  }

  .nav-btn:focus-visible {
    outline: 2px solid #FB923C;
    outline-offset: 2px;
  }

  .nav-btn:active {
    transform: translateY(0);
  }

  .nav-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(15, 18, 28, 0.86);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.24);
    border-radius: 999px;
    padding: 8px 18px;
    color: #FFFFFF;
    font-size: 14px;
    font-weight: 600;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.12);
    font-variant-numeric: tabular-nums;
    user-select: none;
    white-space: nowrap;
  }

  .pill-track {
    color: #FFFFFF;
  }

  .pill-active {
    color: #FED7AA;
    font-size: 13px;
    font-weight: 600;
  }

  .mobile-toggle {
    display: none;
  }

  @media only screen and (max-width: 600px) {
    .track-list {
      width: 95vw;
      height: auto;
      max-height: 65vh;
      padding: 0;
      position: fixed;
      bottom: 100px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(15, 18, 28, 0.94);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 16px;
      overflow: hidden;
      transition: all 0.3s ease;
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6);
    }
    
    .track-list:not(.mobile-visible) {
      max-height: 50px;
      bottom: 20px;
    }
    
    .track-list:not(.mobile-visible) .wrapper,
    .track-list:not(.mobile-visible) #btn-view,
    .track-list:not(.mobile-visible) .quick-ambience-bar {
      display: none;
    }

    .track-list.mobile-visible .quick-ambience-bar {
      border-radius: 0;
      border: none;
      border-bottom: 1px solid rgba(255, 255, 255, 0.12);
      background: rgba(15, 18, 28, 0.7);
      padding: 10px 16px;
    }
    
    .mobile-toggle {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      padding: 14px;
      background: rgba(234, 88, 12, 0.35);
      border: none;
      border-bottom: 1px solid rgba(255, 255, 255, 0.15);
      color: #FFFFFF;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }
    
    .mobile-toggle:active {
      background: rgba(234, 88, 12, 0.5);
    }
    
    .wrapper {
      height: auto;
      max-height: 50vh;
      overflow-y: auto;
      padding: 12px;
    }
    
    .carousel {
      max-width: 100%;
      height: auto;
    }
    
    #btn-view {
      margin-top: 0;
      width: 100%;
      padding: 10px;
      background: rgba(15, 18, 28, 0.75);
      border-top: 1px solid rgba(255, 255, 255, 0.12);
    }

    .nav-btn {
      padding: 6px 12px;
      font-size: 13px;
    }

    .nav-pill {
      padding: 6px 12px;
      font-size: 13px;
    }
  }
</style>
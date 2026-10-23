<script lang="ts">
  import TVPlayButton from "./lib/TVPlayButton.svelte";
  import TVControls from "./lib/components/TVControls.svelte";
  import Config from "./lib/Config.svelte";
  import TVAmbientTracks from "./lib/components/TVAmbientTracks.svelte";
  import TVBPMControl from "./lib/components/TVBPMControl.svelte";
  import { bgUrl } from "./lib/stores/bgStore";
  import { radioStore, currentStation } from "./lib/stores/radioStore";
  import { Radio, Music2, Info } from "lucide-svelte";

  let isLoaded = false;

  const onImageLoad = () => {
    isLoaded = true;
  };

  $: if ($bgUrl) {
    isLoaded = false;
  }

  // Marquee text synced with radioStore
  $: marqueeText = `Lo-Fi Radio TV Player • 電台: ${$currentStation.label} (${$currentStation.name}) • 音量: ${Math.round($radioStore.volume * 100)}% • ${$radioStore.isPlaying ? "播放中" : "已暫停"}`;
</script>

<main id="bg" class="tv-container">
  {#if $bgUrl}
    <div class="bg-container" class:is-loaded={isLoaded}>
      <img src={$bgUrl} alt="background" on:load={onImageLoad} class="bg-image" />
    </div>
  {/if}

  <Config />

  <!-- TV 兩欄式佈局 -->
  <div class="tv-layout">
    <!-- 頂部跑馬燈狀態欄 -->
    <header class="tv-header">
      <div class="marquee-container">
        <div class="marquee-text">{marqueeText}</div>
      </div>
    </header>

    <!-- 主要內容區域：左右兩欄 -->
    <div class="tv-main-grid">
      <!-- 左欄：主音樂播放區 -->
      <div class="tv-left-panel">
        <div class="music-player-zone">
          <div class="player-wrapper">
            <TVPlayButton />
          </div>
        </div>

        <!-- 電台頻道選擇區 (原 BPM 控制區) -->
        <div class="station-selector-zone">
          <TVBPMControl />
        </div>

        <!-- 遙控提示 -->
        <div class="remote-hints">
          <Info size={18} class="hint-icon" />
          <p class="hint-text">遙控提示：OK 播放/暫停 • ←→ 切換電台 • ↑↓ 調整音量</p>
        </div>
      </div>

      <!-- 右欄：統一背景音效控制區 -->
      <div class="tv-right-panel">
        <div class="ambient-control-zone">
          <div class="ambient-header">
            <Music2 size={22} class="ambient-header-icon" />
            <h3>背景環境音效</h3>
          </div>

          <!-- 環境音效 (TVControls) -->
          <div class="environment-effects">
            <TVControls />
          </div>

          <!-- 背景音軌 (TVAmbientTracks) -->
          <div class="ambient-tracks">
            <TVAmbientTracks />
          </div>
        </div>
      </div>
    </div>

    <!-- 底部狀態欄 -->
    <footer class="tv-footer">
      <p>遙控操作：OK 播放/暫停 • ↑↓ 調整音量 • ←→ 切換電台 | 24/7 Lo-Fi Radio</p>
    </footer>
  </div>
</main>

<style>
  .tv-container {
    width: 100vw;
    height: 100vh;
    background: linear-gradient(135deg, #0d1117 0%, #161b22 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
    overflow: hidden;
    padding: 1.5rem;
    box-sizing: border-box;
    position: relative;
  }

  .bg-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    opacity: 0;
    transition: opacity 1.5s ease-in-out;
    pointer-events: none;
  }

  .bg-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    transform: scale(1.05);
    transition: transform 10s ease-out;
  }

  .bg-container.is-loaded {
    opacity: 1;
  }

  .bg-container.is-loaded .bg-image {
    transform: scale(1);
  }

  .tv-layout {
    width: 100%;
    height: 100%;
    max-width: 1600px;
    display: flex;
    flex-direction: column;
    color: white;
    z-index: 10;
    position: relative;
  }

  .tv-header {
    background: rgba(0, 0, 0, 0.4);
    border-bottom: 1px solid rgba(255, 255, 255, 0.15);
    padding: 0.6rem 1rem;
    backdrop-filter: blur(12px);
    overflow: hidden;
    height: 52px;
    display: flex;
    align-items: center;
    border-radius: 12px 12px 0 0;
  }

  .marquee-container {
    width: 100%;
    overflow: hidden;
    white-space: nowrap;
  }

  .marquee-text {
    display: inline-block;
    font-size: 1.3rem;
    font-weight: 600;
    color: #f0f8ff;
    text-shadow: 2px 2px 6px rgba(0, 0, 0, 0.6);
    animation: marquee 25s linear infinite;
    padding-left: 100%;
  }

  @keyframes marquee {
    0% {
      transform: translateX(0%);
    }
    100% {
      transform: translateX(-100%);
    }
  }

  .tv-main-grid {
    flex: 1;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    padding: 1.5rem 0;
    min-height: 0;
  }

  /* 左欄：主音樂播放區 */
  .tv-left-panel {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    background: rgba(18, 22, 34, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 20px;
    padding: 1.5rem;
    backdrop-filter: blur(15px);
    height: 100%;
    box-sizing: border-box;
    overflow-y: auto;
  }

  .music-player-zone {
    width: 100%;
  }

  .player-wrapper {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .station-selector-zone {
    width: 100%;
  }

  .remote-hints {
    background: rgba(168, 85, 247, 0.1);
    border: 1px solid rgba(168, 85, 247, 0.25);
    border-radius: 12px;
    padding: 0.8rem 1.2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.6rem;
  }

  :global(.hint-icon) {
    color: #c084fc;
    flex-shrink: 0;
  }

  .hint-text {
    margin: 0;
    font-size: 0.95rem;
    color: #e9d5ff;
    font-weight: 500;
  }

  /* 右欄：統一背景音效控制面板 */
  .tv-right-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

  .ambient-control-zone {
    background: rgba(18, 22, 34, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 20px;
    padding: 1.5rem;
    backdrop-filter: blur(15px);
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
    height: 100%;
    box-sizing: border-box;
  }

  .ambient-header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.6rem;
    padding-bottom: 0.6rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  :global(.ambient-header-icon) {
    color: #a855f7;
  }

  .ambient-header h3 {
    margin: 0;
    font-size: 1.3rem;
    color: #ffffff;
    font-weight: 600;
  }

  .environment-effects {
    flex-shrink: 0;
  }

  .ambient-tracks {
    flex: 1;
    min-height: 0;
  }

  .tv-footer {
    padding-top: 0.8rem;
    opacity: 0.7;
    text-align: center;
  }

  .tv-footer p {
    font-size: 1.1rem;
    margin: 0;
    font-weight: 500;
  }

  @media screen and (max-width: 1024px) {
    .tv-main-grid {
      grid-template-columns: 1fr;
    }
  }
</style>

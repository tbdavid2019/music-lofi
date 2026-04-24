<script lang="ts">
  import TVPlayButton from "./lib/TVPlayButton.svelte";
  import TVControls from "./lib/components/TVControls.svelte";
  import Config from "./lib/Config.svelte";
  import TVAmbientTracks from "./lib/components/TVAmbientTracks.svelte";
  import TVBPMControl from "./lib/components/TVBPMControl.svelte";
  import { onMount } from 'svelte';
  import { bgUrl } from "./lib/stores/bgStore";
  
  let isLoaded = false;
  
  const onImageLoad = () => {
    isLoaded = true;
  };

  $: if ($bgUrl) {
    isLoaded = false;
  }

  // 跑馬燈狀態資訊
  let marqueeText = "🎧 LoFi Music TV Player";
  let currentBPM = 140;
  let currentKey = "C";
  let currentVolume = 70;
  let isPlaying = false;

  // 更新跑馬燈內容
  function updateMarquee() {
    const statusParts = [
      "🎧 LoFi Music TV Player",
      `🎵 調性: ${currentKey}`,
      `🎚 BPM: ${currentBPM}`,
      `🔊 音量: ${currentVolume}%`,
      isPlaying ? "▶️ 播放中" : "⏸️ 已暫停"
    ];
    marqueeText = statusParts.join(" • ");
  }

  // 監聽各種狀態變化事件
  if (typeof window !== 'undefined') {
    // BPM 變更
    window.addEventListener('bpmChange', (e: CustomEvent) => {
      currentBPM = e.detail;
      updateMarquee();
    });

    // 其他狀態監聽
    window.addEventListener('keyChange', (e: CustomEvent) => {
      currentKey = e.detail;
      updateMarquee();
    });

    window.addEventListener('volumeChange', (e: CustomEvent) => {
      currentVolume = e.detail;
      updateMarquee();
    });

    window.addEventListener('playStateChange', (e: CustomEvent) => {
      isPlaying = e.detail;
      updateMarquee();
    });
  }

  onMount(() => {
    // 初始化讀取保存的 BPM
    if (typeof window !== 'undefined') {
      const savedBPM = localStorage.getItem('LofiEngine_BPM');
      if (savedBPM) {
        currentBPM = parseInt(savedBPM);
      }
    }
    updateMarquee();
  });
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
        
        <!-- BPM 控制區 -->
        <div class="bpm-control-zone">
          <TVBPMControl />
        </div>
        
        <!-- 遙控提示 -->
        <div class="remote-hints">
          <p class="hint-text">💡 遙控提示：↑↓音量 ←→切功能 OK確認</p>
        </div>
      </div>
      
      <!-- 右欄：統一背景音效控制區 -->
      <div class="tv-right-panel">
        <!-- 背景音效控制區 -->
        <div class="ambient-control-zone">
          <div class="ambient-header">
            <h3>🎵 背景音效</h3>
          </div>
          
          <!-- 環境音效 (原 TVControls) -->
          <div class="environment-effects">
            <TVControls />
          </div>
          
          <!-- 背景音軌 (原 TVAmbientTracks) -->
          <div class="ambient-tracks">
            <TVAmbientTracks />
          </div>
        </div>
      </div>
    </div>
    
    <!-- 底部狀態欄 -->
    <footer class="tv-footer">
      <p>🎮 遙控：OK播放/暫停 ↑↓音量 ←→切功能 | 🌐 music.david888.com</p>
    </footer>
  </div>
</main>

<style>
  .tv-container {
    width: 100vw;
    height: 100vh;
    background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
    overflow: hidden;
    padding: 2rem;
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
    transform: scale(1.1);
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
    background: rgba(0, 0, 0, 0.3);
    border-bottom: 2px solid rgba(255, 255, 255, 0.2);
    padding: 0.8rem 1rem;
    backdrop-filter: blur(10px);
    overflow: hidden;
    height: 60px;
    display: flex;
    align-items: center;
  }

  .marquee-container {
    width: 100%;
    overflow: hidden;
    white-space: nowrap;
  }

  .marquee-text {
    display: inline-block;
    font-size: 1.5rem;
    font-weight: 600;
    color: #f0f8ff;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
    animation: marquee 20s linear infinite;
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

  .tv-title {
    font-size: 2.2rem;
    font-weight: 700;
    margin: 0;
    text-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
    background: linear-gradient(45deg, #fff, #66bb6a);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }



  .tv-main-grid {
    flex: 1;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    padding: 2rem;
    min-height: 0;
  }

  /* 左欄：主音樂播放區 */
  .tv-left-panel {
    display: grid;
    grid-template-rows: 1fr auto auto;
    gap: 1rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 20px;
    padding: 1.5rem;
    backdrop-filter: blur(15px);
    height: 100%;
    overflow: hidden;
  }

  .music-player-zone {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2rem;
  }

  .zone-title {
    font-size: 1.8rem;
    font-weight: 600;
    margin: 0;
    text-align: center;
    color: #f0f8ff;
    text-shadow: 0 0 15px rgba(255, 255, 255, 0.3);
    border-bottom: 2px solid rgba(255, 255, 255, 0.2);
    padding-bottom: 1rem;
    width: 100%;
  }

    .player-wrapper {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .bpm-control-zone {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 15px;
    padding: 1.2rem;
    backdrop-filter: blur(10px);
  }

  .remote-hints {
    background: rgba(102, 187, 106, 0.1);
    border: 1px solid rgba(102, 187, 106, 0.3);
    border-radius: 15px;
    padding: 1rem 1.5rem;
    text-align: center;
  }

  .hint-text {
    margin: 0;
    font-size: 1.1rem;
    color: #66bb6a;
    font-weight: 500;
  }

  /* 右欄：統一背景音效控制面板 */
  .tv-right-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden; /* 完全禁用捲軸 */
  }

  /* 統一背景音效控制區 */
  .ambient-control-zone {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 15px;
    padding: 1.2rem;
    backdrop-filter: blur(10px);
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    height: 100%;
  }
  
  .ambient-header {
    text-align: center;
    margin-bottom: 0.5rem;
  }
  
  .ambient-header h3 {
    margin: 0;
    font-size: 1.4rem;
    color: #f0f8ff;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
  }
  
  /* 環境音效區域 */
  .environment-effects {
    flex-shrink: 0;
  }
  
  /* 背景音軌區域 */
  .ambient-tracks {
    flex: 1;
    min-height: 0;
  }

  .tv-footer {
    margin-top: 2rem;
    opacity: 0.7;
  }

  .tv-footer p {
    font-size: 1.4rem; /* 增大字體 */
    margin: 0;
    font-weight: 500; /* 稍微加粗 */
  }

  /* Android TV 響應式設計 */
  
  /* 標準 TV (1920x1080) */
  @media screen and (max-width: 1920px) and (max-height: 1080px) {
    .tv-container {
      padding: 1.5rem;
    }
    
    .tv-main {
      gap: 1.5rem;
      padding: 0 1rem;
    }
  }
  
  /* 小型 TV (1366x768) */
  @media screen and (max-width: 1366px) and (max-height: 768px) {
    .tv-container {
      padding: 1rem;
    }
    
    .tv-main {
      gap: 1rem;
      padding: 0 0.5rem;
    }
    
    .tv-footer p {
      font-size: 1rem;
    }
  }
  
  /* 超小型 TV (1280x720) */
  @media screen and (max-width: 1280px) and (max-height: 720px) {
    .tv-container {
      padding: 0.5rem;
    }
    
    .tv-main {
      gap: 0.5rem;
      padding: 0;
    }
    
    .tv-footer {
      margin-top: 1rem;
    }
    
    .tv-footer p {
      font-size: 0.9rem;
    }
  }
  
  /* 極小 TV / Android TV 盒子 (1024x600 或更小) */
  @media screen and (max-width: 1024px) and (max-height: 600px) {
    .tv-container {
      padding: 0.5rem;
    }
    
    .tv-layout {
      max-width: 100%;
    }
    
    .tv-title {
      font-size: 1.8rem;
    }
    
    .tv-subtitle {
      font-size: 0.9rem;
    }
    
    .tv-main {
      flex-direction: column;
      gap: 0.5rem;
      padding: 0;
    }
    
    .tv-player-section,
    .tv-controls-section {
      flex: none;
      width: 100%;
    }
    
    .tv-header {
      margin-bottom: 0.2rem;
    }
    
    .tv-footer {
      margin-top: 0.5rem;
    }
    
    .tv-footer p {
      font-size: 0.8rem;
    }
  }
  
  /* 針對 Android TV 瀏覽器的特殊優化 */
  @media screen and (max-height: 500px) {
    .tv-main {
      flex-direction: row;
      align-items: flex-start;
    }
    
    .tv-footer {
      display: none; /* 在極小螢幕隱藏底部資訊 */
    }
  }
</style>

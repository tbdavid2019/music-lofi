<script lang="ts">
  import TVPlayButton from "./lib/TVPlayButton.svelte";
  import TVControls from "./lib/components/TVControls.svelte";
  import Config from "./lib/Config.svelte";
  import TVAmbientTracks from "./lib/components/TVAmbientTracks.svelte";
</script>

<main id="bg" class="tv-container">
  <Config />
  
  <!-- TV 專用介面 -->
  <div class="tv-layout">
    <div class="tv-header">
      <h1 class="tv-title">🎵 LoFi Music</h1>
      <p class="tv-subtitle">TV Edition - 電視版</p>
    </div>
    
    <div class="tv-main">
      <!-- 主播放控制 (Tone.js 音樂生成) -->
      <div class="tv-player-section">
        <TVPlayButton />
      </div>
      
      <!-- 右側控制面板 -->
      <div class="tv-controls-section">
        <!-- 環境音效控制 -->
        <TVControls />
        
        <!-- 環境音軌控制 -->
        <TVAmbientTracks />
      </div>
    </div>
    
    <div class="tv-footer">
      <p>🎮 Space 播放 | R 重新生成 | 1-4 環境音效 | 🌐 music.david888.com</p>
    </div>
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
  }

  .tv-layout {
    width: 100%;
    height: 100%;
    max-width: 1400px;
    display: flex;
    flex-direction: column;
    text-align: center;
    color: white;
  }

  .tv-header {
    margin-bottom: 1rem;
    flex-shrink: 0;
  }

  .tv-title {
    font-size: 3.5rem;
    font-weight: bold;
    margin: 0;
    text-shadow: 3px 3px 6px rgba(0,0,0,0.5);
    background: linear-gradient(45deg, #fff, #f0f8ff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .tv-subtitle {
    font-size: 1.4rem;
    margin: 0.5rem 0 0 0;
    opacity: 0.9;
    font-weight: 300;
  }

  .tv-main {
    flex: 1;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: 2rem;
    padding: 0 2rem;
  }

  .tv-player-section {
    flex: 1;
    display: flex;
    justify-content: center;
  }

  .tv-controls-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 1rem;
    max-height: 100%;
    overflow-y: auto;
  }

  .tv-footer {
    margin-top: 2rem;
    opacity: 0.7;
  }

  .tv-footer p {
    font-size: 1.2rem;
    margin: 0;
  }

  /* 響應式設計 */
  @media (max-height: 600px) {
    .tv-title {
      font-size: 3rem;
    }
    
    .tv-subtitle {
      font-size: 1.4rem;
    }
    
    .tv-main {
      gap: 2rem;
    }
  }
</style>
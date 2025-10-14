<script lang="ts">
  import { IconVolume, IconVolumeOff } from "@tabler/icons-svelte";

  const INSTRUMENTS_STORAGE_KEY = "LofiEngine_InstrumentVolumes";
  const DEFAULT_VOLUMES = {
    piano: 1.0,  // 鋼琴全音量
    kick: 0,     // 預設靜音，專注於鋼琴的靈性
    snare: 0,    // 預設靜音
    hat: 0,      // 預設靜音
  };

  // Load saved volumes or use defaults
  let volumes = loadVolumes();

  function loadVolumes() {
    try {
      const saved = localStorage.getItem(INSTRUMENTS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : { ...DEFAULT_VOLUMES };
    } catch (e) {
      return { ...DEFAULT_VOLUMES };
    }
  }

  function saveVolumes() {
    localStorage.setItem(INSTRUMENTS_STORAGE_KEY, JSON.stringify(volumes));
    // 觸發事件通知 PlayButton 更新音量
    window.dispatchEvent(new CustomEvent("updateInstrumentVolumes", { detail: volumes }));
  }

  function updateVolume(instrument: string, value: number) {
    volumes[instrument] = value;
    saveVolumes();
  }

  function toggleMute(instrument: string) {
    volumes[instrument] = volumes[instrument] > 0 ? 0 : DEFAULT_VOLUMES[instrument];
    saveVolumes();
  }

  // Quick preset functions
  function setPianoOnly() {
    volumes = {
      piano: 1.0,
      kick: 0,
      snare: 0,
      hat: 0,
    };
    saveVolumes();
    console.log("🎹 設定為純鋼琴模式");
  }

  function setFullBand() {
    volumes = { 
      piano: 1.0,
      kick: 0.6,   // 適度的鼓聲
      snare: 0.5,  // 適度的軍鼓
      hat: 0.4,    // 輕微的 hi-hat
    };
    saveVolumes();
    console.log("🎵 設定為完整樂團模式");
  }

  function setDrumsOnly() {
    volumes = {
      piano: 0,
      kick: 0.8,
      snare: 0,  // snare 已停用
      hat: 0.6,
    };
    saveVolumes();
    console.log("🥁 設定為純鼓點模式");
  }

  // Auto-save volumes when changed
  $: if (volumes) {
    saveVolumes();
  }
</script>

<div class="instrument-controls">
  <h3>🎛️ 樂器控制</h3>
  <p class="description">獨立調整每個樂器的音量</p>

  <!-- 快速預設按鈕 -->
  <div class="quick-presets">
    <button class="preset-btn piano-only" on:click={setPianoOnly} title="純鋼琴模式">
      🎹 純鋼琴
    </button>
    <button class="preset-btn full-band" on:click={setFullBand} title="完整樂團">
      🎵 完整樂團
    </button>
    <button class="preset-btn drums-only" on:click={setDrumsOnly} title="純鼓點">
      🥁 純鼓點
    </button>
  </div>

  <div class="controls-grid">
    <!-- Piano Control -->
    <div class="instrument-control">
      <div class="control-header">
        <span class="instrument-name">🎹 鋼琴</span>
        <button 
          class="mute-btn" 
          class:muted={volumes.piano === 0}
          on:click={() => toggleMute('piano')}
          title={volumes.piano === 0 ? "取消靜音" : "靜音"}
        >
          {#if volumes.piano === 0}
            <IconVolumeOff size={16} />
          {:else}
            <IconVolume size={16} />
          {/if}
        </button>
      </div>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        bind:value={volumes.piano}
        on:input={() => updateVolume('piano', volumes.piano)}
        class="volume-slider"
      />
      <div class="volume-value">{Math.round(volumes.piano * 100)}%</div>
    </div>

    <!-- Kick Control -->
    <div class="instrument-control">
      <div class="control-header">
        <span class="instrument-name">🥁 大鼓 (Kick)</span>
        <button 
          class="mute-btn" 
          class:muted={volumes.kick === 0}
          on:click={() => toggleMute('kick')}
          title={volumes.kick === 0 ? "取消靜音" : "靜音"}
        >
          {#if volumes.kick === 0}
            <IconVolumeOff size={16} />
          {:else}
            <IconVolume size={16} />
          {/if}
        </button>
      </div>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        bind:value={volumes.kick}
        on:input={() => updateVolume('kick', volumes.kick)}
        class="volume-slider"
      />
      <div class="volume-value">{Math.round(volumes.kick * 100)}%</div>
    </div>

    <!-- Snare Control -->
    <div class="instrument-control">
      <div class="control-header">
        <span class="instrument-name">🥁 小鼓 (Snare)</span>
        <button 
          class="mute-btn" 
          class:muted={volumes.snare === 0}
          on:click={() => toggleMute('snare')}
          title={volumes.snare === 0 ? "取消靜音" : "靜音"}
        >
          {#if volumes.snare === 0}
            <IconVolumeOff size={16} />
          {:else}
            <IconVolume size={16} />
          {/if}
        </button>
      </div>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        bind:value={volumes.snare}
        on:input={() => updateVolume('snare', volumes.snare)}
        class="volume-slider"
      />
      <div class="volume-value">{Math.round(volumes.snare * 100)}%</div>
    </div>

    <!-- Hi-Hat Control -->
    <div class="instrument-control">
      <div class="control-header">
        <span class="instrument-name">🔔 鈸 (Hi-Hat)</span>
        <button 
          class="mute-btn" 
          class:muted={volumes.hat === 0}
          on:click={() => toggleMute('hat')}
          title={volumes.hat === 0 ? "取消靜音" : "靜音"}
        >
          {#if volumes.hat === 0}
            <IconVolumeOff size={16} />
          {:else}
            <IconVolume size={16} />
          {/if}
        </button>
      </div>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        bind:value={volumes.hat}
        on:input={() => updateVolume('hat', volumes.hat)}
        class="volume-slider"
      />
      <div class="volume-value">{Math.round(volumes.hat * 100)}%</div>
    </div>
  </div>

  <div class="preset-buttons">
    <button 
      class="preset-btn"
      on:click={() => {
        volumes = { piano: 1, kick: 0, snare: 0, hat: 0 };
        saveVolumes();
      }}
    >
      🎹 純鋼琴
    </button>
    <button 
      class="preset-btn"
      on:click={() => {
        volumes = { piano: 1, kick: 0.7, snare: 0, hat: 0 };
        saveVolumes();
      }}
    >
      🥁 輕鼓點
    </button>
    <button 
      class="preset-btn"
      on:click={() => {
        volumes = { ...DEFAULT_VOLUMES };
        saveVolumes();
      }}
    >
      🔄 重置
    </button>
  </div>

  <div class="info-note">
    💡 <strong>提示：</strong>不喜歡鼓聲？可以將所有鼓組滑桿調到 0%，或點擊「純鋼琴」快速切換
  </div>
</div>

<style>
  .instrument-controls {
    margin-top: 20px;
    padding: 15px 0;
  }

  h3 {
    margin: 0 0 5px 0;
    font-size: 16px;
    font-weight: 600;
  }

  .description {
    margin: 0 0 15px 0;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.7);
  }

  .controls-grid {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .instrument-control {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    padding: 12px;
    transition: all 0.2s;
  }

  .instrument-control:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
  }

  .control-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .instrument-name {
    font-size: 14px;
    font-weight: 500;
    color: white;
  }

  .mute-btn {
    padding: 4px 8px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 5px;
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    transition: all 0.2s;
  }

  .mute-btn:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  .mute-btn.muted {
    background: rgba(239, 68, 68, 0.3);
    border-color: rgba(239, 68, 68, 0.5);
    color: #fca5a5;
  }

  .volume-slider {
    width: 100%;
    height: 6px;
    border-radius: 3px;
    background: rgba(255, 255, 255, 0.1);
    outline: none;
    -webkit-appearance: none;
    appearance: none;
    cursor: pointer;
  }

  .volume-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    transition: transform 0.2s;
  }

  .volume-slider::-webkit-slider-thumb:hover {
    transform: scale(1.2);
  }

  .volume-slider::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    cursor: pointer;
    border: none;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    transition: transform 0.2s;
  }

  .volume-slider::-moz-range-thumb:hover {
    transform: scale(1.2);
  }

  /* 快速預設按鈕樣式 */
  .quick-presets {
    display: flex;
    gap: 8px;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }

  .preset-btn {
    flex: 1;
    min-width: 90px;
    padding: 8px 12px;
    border-radius: 6px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.05);
    color: white;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    backdrop-filter: blur(5px);
  }

  .preset-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
  }

  .preset-btn:active {
    transform: translateY(0);
  }

  .piano-only:hover {
    background: rgba(102, 126, 234, 0.2);
    border-color: rgba(102, 126, 234, 0.4);
    color: #667eea;
  }

  .full-band:hover {
    background: rgba(0, 255, 178, 0.2);
    border-color: rgba(0, 255, 178, 0.4);
    color: #00ffb2;
  }

  .drums-only:hover {
    background: rgba(255, 193, 7, 0.2);
    border-color: rgba(255, 193, 7, 0.4);
    color: #ffc107;
  }

  .volume-value {
    text-align: right;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
    margin-top: 5px;
    font-variant-numeric: tabular-nums;
  }

  .preset-buttons {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    margin-top: 15px;
    padding-top: 15px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .preset-btn {
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    color: white;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .preset-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
  }

  .info-note {
    margin-top: 15px;
    padding: 10px 12px;
    background: rgba(16, 185, 129, 0.1);
    border: 1px solid rgba(16, 185, 129, 0.3);
    border-radius: 8px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.9);
    line-height: 1.5;
  }
</style>

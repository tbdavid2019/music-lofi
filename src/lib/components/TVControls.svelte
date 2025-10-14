<script lang="ts">
  // 環境音效狀態
  let effects = {
    rain: { active: false, audio: null as HTMLAudioElement | null, volume: 0.5 },
    thunder: { active: false, audio: null as HTMLAudioElement | null, volume: 0.4 },
    campfire: { active: false, audio: null as HTMLAudioElement | null, volume: 0.6 },
    jungle: { active: false, audio: null as HTMLAudioElement | null, volume: 0.5 }
  };
  
  // 音效檔案路徑
  const effectFiles = {
    rain: "assets/engine/effects/rain.mp3",
    thunder: "assets/engine/effects/thunder.mp3", 
    campfire: "assets/engine/effects/campfire.mp3",
    jungle: "assets/engine/effects/jungle.mp3"
  };
  
  // 音效名稱 (中英文)
  const effectNames = {
    rain: { icon: "🌧️", name: "雨聲", en: "Rain" },
    thunder: { icon: "⛈️", name: "雷聲", en: "Thunder" },
    campfire: { icon: "🔥", name: "營火", en: "Campfire" },
    jungle: { icon: "🌿", name: "叢林", en: "Jungle" }
  };
  
  function toggleEffect(effectName: keyof typeof effects) {
    const effect = effects[effectName];
    
    if (effect.active) {
      // 停止音效
      if (effect.audio) {
        effect.audio.pause();
        effect.audio.currentTime = 0;
      }
      effect.active = false;
    } else {
      // 開始音效
      if (!effect.audio) {
        effect.audio = new Audio(effectFiles[effectName]);
        effect.audio.loop = true;
        effect.audio.volume = effect.volume;
      }
      
      effect.audio.play().catch(e => {
        console.warn(`${effectName} 音效播放失敗:`, e);
      });
      effect.active = true;
    }
    
    // 觸發響應式更新
    effects = { ...effects };
  }
  
  function adjustEffectVolume(effectName: keyof typeof effects, delta: number) {
    const effect = effects[effectName];
    effect.volume = Math.max(0, Math.min(1, effect.volume + delta));
    
    if (effect.audio) {
      effect.audio.volume = effect.volume;
    }
    
    effects = { ...effects };
  }
  
  // 停止所有音效
  function stopAllEffects() {
    Object.keys(effects).forEach(effectName => {
      const effect = effects[effectName as keyof typeof effects];
      if (effect.active && effect.audio) {
        effect.audio.pause();
        effect.audio.currentTime = 0;
        effect.active = false;
      }
    });
    effects = { ...effects };
  }
  
  // 鍵盤快捷鍵 (TV 遙控器)
  function handleKeydown(e: KeyboardEvent) {
    switch(e.code) {
      case 'Digit1':
        e.preventDefault();
        toggleEffect('rain');
        break;
      case 'Digit2':
        e.preventDefault();
        toggleEffect('thunder');
        break;
      case 'Digit3':
        e.preventDefault();
        toggleEffect('campfire');
        break;
      case 'Digit4':
        e.preventDefault();
        toggleEffect('jungle');
        break;
      case 'KeyK':
        e.preventDefault();
        stopAllEffects();
        break;
    }
  }
  
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleKeydown);
  }
</script>

<div class="tv-controls">
  <!-- 音效按鈕網格 -->
  <div class="effects-grid">
    {#each Object.entries(effectNames) as [key, info]}
      {@const effect = effects[key]}
      <div class="effect-item">
        <!-- 主控制按鈕 -->
        <button 
          class="effect-button" 
          class:active={effect.active}
          on:click={() => toggleEffect(key)}
        >
          <div class="effect-icon">{info.icon}</div>
          <div class="effect-name">{info.name}</div>
          <div class="effect-status">
            {effect.active ? 'ON' : 'OFF'}
          </div>
        </button>
        
        <!-- 音量控制 -->
        <div class="volume-controls">
          <span class="volume-label">音量: {Math.round(effect.volume * 100)}%</span>
          <div class="volume-buttons">
            <button 
              class="volume-adjust-btn"
              on:click={() => adjustEffectVolume(key, -0.1)}
              disabled={!effect.active}
            >
              ➖
            </button>
            <button 
              class="volume-adjust-btn"
              on:click={() => adjustEffectVolume(key, 0.1)}
              disabled={!effect.active}
            >
              ➕
            </button>
          </div>
        </div>
      </div>
    {/each}
  </div>
  
  <!-- 全局控制 -->
  <div class="global-controls">
    <button class="stop-all-btn" on:click={stopAllEffects}>
      🛑 停止所有音效
    </button>
  </div>
  
  <!-- 快捷鍵提示 -->
  <div class="shortcuts-hint">
    <p>🎮 遙控器快捷鍵: 1-4 切換音效 | K 停止全部</p>
  </div>
</div>

<style>
  .tv-controls {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
    height: 100%;
    overflow: hidden; /* 確保不產生捲軸 */
  }
  
  .controls-title {
    font-size: 1.5rem;
    margin: 0 0 0.5rem 0;
    color: #f0f8ff;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
    text-align: center;
  }
  
  .effects-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.5rem;
    flex: 1;
    min-height: 0;
  }
  
  .effect-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }
  
  .effect-button {
    width: 100%;
    height: 70px;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.2rem;
    backdrop-filter: blur(5px);
  }
  
  .effect-button:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }
  
  .effect-button.active {
    background: rgba(72, 187, 120, 0.3);
    border-color: rgba(72, 187, 120, 0.6);
    box-shadow: 0 0 20px rgba(72, 187, 120, 0.3);
  }
  
  .effect-icon {
    font-size: 1.8rem;
  }
  
  .effect-name {
    font-size: 1rem;
    font-weight: 500;
  }
  
  .effect-status {
    font-size: 0.8rem;
    opacity: 0.8;
    font-weight: bold;
  }
  
  .volume-controls {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.3rem;
    width: 100%;
  }
  
  .volume-label {
    font-size: 0.75rem;
    opacity: 0.8;
  }
  
  .volume-buttons {
    display: flex;
    gap: 0.5rem;
  }
  
  .volume-adjust-btn {
    width: 28px;
    height: 28px;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    cursor: pointer;
    font-size: 0.8rem;
    transition: all 0.3s ease;
  }
  
  .volume-adjust-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
  }
  
  .volume-adjust-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
  
  .global-controls {
    margin-top: 0.5rem;
    display: flex;
    justify-content: center;
  }
  
  .stop-all-btn {
    width: 180px;
    height: 45px;
    background: rgba(239, 68, 68, 0.2);
    color: white;
    border: 2px solid rgba(239, 68, 68, 0.5);
    border-radius: 12px;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 500;
    transition: all 0.3s ease;
  }
  
  .stop-all-btn:hover {
    background: rgba(239, 68, 68, 0.3);
    transform: translateY(-2px);
  }
  
  .shortcuts-hint {
    margin-top: 0.5rem;
    opacity: 0.6;
    font-size: 0.8rem;
    text-align: center;
  }
  
  .shortcuts-hint p {
    margin: 0;
  }
  
  /* 響應式設計 */
  @media (max-width: 768px) {
    .effects-grid {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
    
    .effect-button {
      width: 160px;
      height: 100px;
    }
    
    .controls-title {
      font-size: 1.8rem;
    }
  }
</style>
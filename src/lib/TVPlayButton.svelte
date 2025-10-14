<script lang="ts">
  // 導入 Tone.js 和音樂引擎組件 (簡化版)
  // @ts-ignore
  import * as Tone from "tone";
  import ChordProgression from "./engine/Chords/ChordProgression";
  import Keys from "./engine/Chords/Keys";
  import { fiveToFive } from "./engine/Chords/MajorScale";
  import Piano from "./engine/Piano/Piano";
  
  console.log('🎵 TVPlayButton component loaded');
  
  let isPlaying = false;
  let contextStarted = false;
  let genChordsOnce = false;
  let autoPlayReady = false;
  
  // 響應式 BPM 顯示 - 初始化時讀取 localStorage
  let currentBPM = 156;
  if (typeof window !== 'undefined') {
    const savedBPM = localStorage.getItem('LofiEngine_BPM');
    if (savedBPM) {
      currentBPM = parseInt(savedBPM);
    }
  }
  
  // 音樂狀態
  let key = "C";
  let progression = [];
  let scale = [];
  let progress = 0;
  let scalePos = 0;
  let activeProgressionIndex = 0;
  
  // 簡化的樂器
  let pianoLoaded = false;
  let pn: any;
  let chords: any, melody: any;
  
  // 音量控制 - LoFi 適中音量
  let volume = 0.8; // 調整為 0.8，平衡音量和 LoFi 感覺
  const linearToDb = (value: number) =>
    value === 0 ? -Infinity : 20 * Math.log10(value);
  
  // 音量節點引用 (在 startAudioContext 中初始化)
  let volumeNode: any = null;
  
  // 初始化 Tone.js 音樂引擎
  async function startAudioContext() {
    if (contextStarted) return;
    
    try {
      await Tone.start();
      contextStarted = true;
      
      // 初始化鋼琴
      pn = new Piano(() => {
        pianoLoaded = true;
        console.log("🎹 鋼琴載入完成");
      }).sampler;
      
      // 設置音頻處理鏈 - 原作者版本
      const cmp = new Tone.Compressor({
        threshold: -6,
        ratio: 3,
        attack: 0.5,
        release: 0.1,
      });
      const lpf = new Tone.Filter(2000, "lowpass");
      volumeNode = new Tone.Volume(linearToDb(volume));
      Tone.Master.chain(cmp, lpf, volumeNode);
      
      // 初始化 BPM (從 localStorage 讀取或使用默認值)
      let savedBPM = 156;
      if (typeof window !== 'undefined') {
        const bpmFromStorage = localStorage.getItem('LofiEngine_BPM');
        if (bpmFromStorage) {
          savedBPM = parseInt(bpmFromStorage);
        }
      }
      currentBPM = savedBPM; // 更新顯示的 BPM
      Tone.Transport.bpm.value = savedBPM;
      console.log(`🎵 TV版音頻初始化 BPM: ${savedBPM}`);
      
      setupSequences();
      generateProgression();
      
      // 初始化完成後，再次檢查最新的 BPM 設定
      setTimeout(() => {
        const latestBPM = localStorage.getItem('LofiEngine_BPM');
        if (latestBPM && parseInt(latestBPM) !== savedBPM) {
          Tone.Transport.bpm.value = parseInt(latestBPM);
          console.log(`🎵 TV版 BPM 更新為最新值: ${latestBPM}`);
        }
      }, 100);
      
    } catch (error) {
      console.error("音頻初始化失敗:", error);
    }
  }
  
  function setupSequences() {
    // 和弦序列 - 原作者版本
    chords = new Tone.Sequence(
      (time, note) => {
        playChord();
      },
      [""],
      "1n",
    );
    
    // 旋律序列 (簡化版) 
    melody = new Tone.Sequence(
      (time, note) => {
        playMelody();
      },
      [""],
      "8n",
    );
    
    chords.humanize = true;
    melody.humanize = true;
  }
  
  async function togglePlay() {
    if (!contextStarted) {
      await startAudioContext();
      // 初始化完成後立即開始播放
      setTimeout(() => {
        if (contextStarted) {
          startMusic();
        }
      }, 100);
      return;
    }
    
    if (Tone.Transport.state === "started") {
      Tone.Transport.stop();
      isPlaying = false;
      // 發送播放狀態變更事件
      window.dispatchEvent(new CustomEvent('playStateChange', { detail: false }));
    } else {
      startMusic();
    }
  }

  function startMusic() {
    if (!genChordsOnce) {
      generateProgression();
    }
    Tone.Transport.start();
    chords.start(0);
    melody.start(0);
    isPlaying = true;
    
    // 發送播放狀態變更事件
    window.dispatchEvent(new CustomEvent('playStateChange', { detail: true }));
  }
  
  function generateProgression() {
    const _scale = fiveToFive;
    const newKey = Keys[Math.floor(Math.random() * Keys.length)];
    // @ts-ignore
    const newScale = Tone.Frequency(newKey + "5")
      .harmonize(_scale)
      .map((f: any) => Tone.Frequency(f).toNote());
    // @ts-ignore
    const newProgression = ChordProgression.generate(8);
    const newScalePos = Math.floor(Math.random() * _scale.length);

    key = newKey;
    progress = 0;
    progression = newProgression;
    scale = newScale;
    genChordsOnce = true;
    scalePos = newScalePos;
    
    // 發送調性變更事件
    window.dispatchEvent(new CustomEvent('keyChange', { detail: newKey }));
    
    console.log(`🎵 新的進行生成: ${key} 調`);
  }
  
  function playChord() {
    if (!pianoLoaded || !progression[progress]) return;
    
    const chord = progression[progress];
    
    // 使用原作者的動態和聲生成
    // @ts-ignore
    const root = Tone.Frequency(key + "3").transpose(chord.semitoneDist);
    const size = 4;
    // @ts-ignore
    const voicing = chord.generateVoicing(size);
    // @ts-ignore
    const notes = Tone.Frequency(root)
      .harmonize(voicing)
      .map((f: any) => Tone.Frequency(f).toNote());
    
    // 降低音量，增加柔和感
    const velocity = 0.35 + Math.random() * 0.15; // 0.35-0.5，更柔和
    
    // @ts-ignore
    pn.triggerAttackRelease(notes, "1n", undefined, velocity);
    
    nextChord();
  }
  
  function nextChord() {
    activeProgressionIndex = progress;
    progress = progress === progression.length - 1 ? 0 : progress + 1;
  }
  
  function playMelody() {
    if (!pianoLoaded || Math.random() < 0.7) return; // 30% 機率播放旋律
    
    const note = scale[scalePos];
    if (note) {
      // 降低旋律音量，讓它更柔和
      const melodyVelocity = 0.3 + Math.random() * 0.15; // 0.3-0.45
      // @ts-ignore
      pn.triggerAttackRelease(note, "2n", undefined, melodyVelocity);
    }
    
    // 簡單的旋律運動
    const direction = Math.random() > 0.5 ? 1 : -1;
    scalePos = Math.max(0, Math.min(scale.length - 1, scalePos + direction));
  }
  
  function adjustVolume(delta: number) {
    volume = Math.max(0, Math.min(1, volume + delta));
    if (contextStarted && volumeNode) {
      volumeNode.volume.value = linearToDb(volume) + 3; // 使用正確的音量節點
    }
    
    // 發送音量變更事件
    window.dispatchEvent(new CustomEvent('volumeChange', { detail: Math.round(volume * 100) }));
  }
  
  // 鍵盤控制 (TV 遙控器)
  function handleKeydown(e: KeyboardEvent) {
    switch(e.code) {
      case 'Space':
      case 'Enter':
        e.preventDefault();
        togglePlay();
        break;
      case 'KeyR':
        e.preventDefault();
        generateProgression();
        break;
      case 'ArrowUp':
        e.preventDefault();
        adjustVolume(0.1);
        break;
      case 'ArrowDown':
        e.preventDefault();
        adjustVolume(-0.1);
        break;
    }
  }
  
  // 綁定鍵盤事件
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleKeydown);
    
    // BPM 變更監聽器
    const handleBPMChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      const newBPM = customEvent.detail;
      console.log(`🎵 TV版 BPM 變更事件收到: ${newBPM}`);
      
      // 更新顯示的 BPM 值
      currentBPM = newBPM;
      
      // 立即更新 Tone.js BPM，不管是否已初始化
      if (Tone.Transport) {
        Tone.Transport.bpm.value = newBPM;
        console.log(`🎵 BPM 已設定為: ${Tone.Transport.bpm.value}`);
      }
    };
    window.addEventListener('bpmChange', handleBPMChange);
  }
</script>

<div class="tv-player">
  <!-- 主要控制按鈕區域 -->
  <div class="main-controls">
    <!-- 主播放按鈕 -->
    <button class="tv-play-button" class:initialized={contextStarted} on:click={togglePlay}>
      <div class="play-text">
        {#if !contextStarted}
          🎵 點擊開始音樂
        {:else if isPlaying}
          ⏸️ 暫停音樂
        {:else}
          ▶️ 繼續播放
        {/if}
      </div>
    </button>

    <!-- 重新生成按鈕 -->
    <button class="control-btn" on:click={generateProgression} disabled={!contextStarted}>
      🔄 重新生成
    </button>
  </div>
  
  <!-- 音樂資訊 -->
  <div class="music-info">
    {#if contextStarted && genChordsOnce}
      <h3>🎼 調性: {key}</h3>
      <div class="progression-display">
        {#each progression as chord, idx}
          <span class="chord" class:active={idx === activeProgressionIndex}>
            {chord.degree}
          </span>
        {/each}
      </div>
    {/if}
  </div>
  
  <!-- 音量控制 -->
  <div class="volume-control">
    <span>🔊 音量: {Math.round(volume * 100)}%</span>
    <div class="volume-buttons">
      <button class="volume-btn" on:click={() => adjustVolume(-0.1)}>➖</button>
      <button class="volume-btn" on:click={() => adjustVolume(0.1)}>➕</button>
    </div>
  </div>
</div>

<style>
  .tv-player {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    color: white;
  }

  .main-controls {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  .tv-play-button {
    width: 250px;
    height: 120px;
    background: rgba(255, 255, 255, 0.15);
    color: white;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(10px);
  }
  
  .tv-play-button:hover {
    background: rgba(255, 255, 255, 0.25);
    border-color: rgba(255, 255, 255, 0.5);
    transform: scale(1.05);
  }
  
  .tv-play-button:active {
    transform: scale(0.98);
  }
  
  .play-text {
    font-size: 1.4rem;
    font-weight: 500;
  }

  .guide-hint {
    text-align: center;
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 15px;
    padding: 1.5rem 2rem;
    margin: 1rem 0;
    backdrop-filter: blur(10px);
    max-width: 600px;
  }

  .guide-hint.animated {
    animation: glow 2s ease-in-out infinite alternate;
  }

  .main-hint {
    margin: 0.5rem 0;
    font-size: 1.4rem;
    font-weight: 600;
    color: #f0f8ff;
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  }

  .sub-hint {
    margin: 0.8rem 0 0 0;
    font-size: 1.1rem !important;
    opacity: 0.9;
    font-weight: normal !important;
    color: #e0e8ff;
    line-height: 1.4;
  }

  @keyframes glow {
    0% { 
      border-color: rgba(255, 255, 255, 0.3);
      box-shadow: 0 0 15px rgba(255, 255, 255, 0.2);
    }
    100% { 
      border-color: rgba(102, 187, 106, 0.6);
      box-shadow: 0 0 25px rgba(102, 187, 106, 0.4);
    }
  }

  /* 讓按鈕在未初始化時更突出 */
  .tv-play-button:not(.initialized) {
    animation: buttonPulse 1.5s ease-in-out infinite;
    background: linear-gradient(135deg, rgba(102, 187, 106, 0.2), rgba(255, 255, 255, 0.15));
  }

  @keyframes buttonPulse {
    0%, 100% {
      transform: scale(1);
      box-shadow: 0 0 20px rgba(102, 187, 106, 0.3);
    }
    50% {
      transform: scale(1.05);
      box-shadow: 0 0 30px rgba(102, 187, 106, 0.5);
    }
  }

  /* Android TV 響應式設計 */
  
  /* 標準 TV (1920x1080) */
  @media screen and (max-width: 1920px) and (max-height: 1080px) {
    .tv-play-button {
      width: 280px;
      height: 130px;
    }
    
    .control-btn {
      width: 190px;
      height: 130px;
    }
    
    .play-text {
      font-size: 1.3rem;
    }
    
    .main-hint {
      font-size: 1.3rem;
    }
    
    .sub-hint {
      font-size: 1rem !important;
    }
  }
  
  /* 小型 TV (1366x768) */
  @media screen and (max-width: 1366px) and (max-height: 768px) {
    .tv-player {
      gap: 1.5rem;
    }
    
    .main-controls {
      gap: 0.8rem;
    }
    
    .tv-play-button {
      width: 250px;
      height: 110px;
    }
    
    .control-btn {
      width: 170px;
      height: 110px;
      font-size: 1rem;
    }
    
    .play-text {
      font-size: 1.2rem;
    }
    
    .guide-hint {
      padding: 1rem 1.5rem;
      max-width: 500px;
    }
    
    .main-hint {
      font-size: 1.2rem;
    }
    
    .sub-hint {
      font-size: 0.95rem !important;
    }
    
    .music-info h3 {
      font-size: 1.5rem;
    }
    
    .music-info p {
      font-size: 1.1rem;
    }
  }
  
  /* 超小型 TV (1280x720) */
  @media screen and (max-width: 1280px) and (max-height: 720px) {
    .tv-player {
      gap: 1rem;
    }
    
    .main-controls {
      gap: 0.8rem;
    }
    
    .tv-play-button {
      width: 220px;
      height: 100px;
    }
    
    .play-text {
      font-size: 1.1rem;
    }
    
    .guide-hint {
      padding: 0.8rem 1.2rem;
      max-width: 450px;
    }
    
    .main-hint {
      font-size: 1.1rem;
    }
    
    .sub-hint {
      font-size: 0.9rem !important;
    }
    
    .music-info h3 {
      font-size: 1.3rem;
    }
    
    .music-info p {
      font-size: 1rem;
    }
    
    .chord {
      padding: 0.2rem 0.6rem;
      font-size: 1rem;
    }
    
    .control-btn {
      width: 150px;
      height: 100px;
      font-size: 0.95rem;
    }
    
    .volume-control {
      font-size: 1.1rem;
    }
    
    .volume-btn {
      width: 45px;
      height: 45px;
      font-size: 1.1rem;
    }
  }
  
  /* 極小 TV / Android TV 盒子 (1024x600 或更小) */
  @media screen and (max-width: 1024px) and (max-height: 600px) {
    .tv-player {
      gap: 0.8rem;
    }
    
    .main-controls {
      gap: 0.6rem;
    }
    
    .tv-play-button {
      width: 200px;
      height: 90px;
    }
    
    .play-text {
      font-size: 1rem;
    }
    
    .guide-hint {
      padding: 0.6rem 1rem;
      max-width: 400px;
    }
    
    .main-hint {
      font-size: 1rem;
    }
    
    .sub-hint {
      font-size: 0.8rem !important;
      line-height: 1.2;
    }
    
    .music-info h3 {
      font-size: 1.1rem;
      margin: 0 0 0.3rem 0;
    }
    
    .music-info p {
      font-size: 0.9rem;
    }
    
    .progression-display {
      gap: 0.3rem;
      margin: 0.5rem 0;
    }
    
    .chord {
      padding: 0.15rem 0.5rem;
      font-size: 0.9rem;
    }
    
    .control-btn {
      width: 130px;
      height: 90px;
      font-size: 0.85rem;
    }
    
    .volume-control {
      font-size: 1rem;
      gap: 0.5rem;
    }
    
    .volume-btn {
      width: 40px;
      height: 40px;
      font-size: 1rem;
    }
  }
  
  /* 針對 Android TV 瀏覽器的特殊優化 */
  @media screen and (max-height: 500px) {
    .tv-player {
      gap: 0.5rem;
    }
    
    .guide-hint {
      display: none; /* 在極小螢幕隱藏引導文字節省空間 */
    }
    
    .music-info {
      margin: 0.5rem 0;
    }
    
    .control-buttons {
      margin-top: 0;
    }
    
    .volume-control {
      display: none; /* 在極小螢幕隱藏音量控制，改用遙控器 */
    }
  }
  
  .music-info {
    text-align: center;
    margin: 1rem 0;
  }
  
  .music-info h3 {
    font-size: 1.8rem;
    margin: 0 0 0.5rem 0;
    color: #f0f8ff;
  }
  
  .music-info p {
    font-size: 1.2rem;
    margin: 0;
    opacity: 0.8;
  }
  
  .progression-display {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    margin: 1rem 0;
    flex-wrap: wrap;
  }
  
  .chord {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 8px;
    padding: 0.3rem 0.8rem;
    font-size: 1.1rem;
    font-weight: bold;
    transition: all 0.3s ease;
  }
  
  .chord.active {
    background: rgba(102, 187, 106, 0.4);
    border-color: rgba(102, 187, 106, 0.7);
    color: #fff;
    transform: scale(1.1);
    box-shadow: 0 0 15px rgba(102, 187, 106, 0.5);
  }
  
  .control-buttons {
    display: flex;
    gap: 1.5rem;
  }
  
  .control-btn {
    width: 180px;
    height: 120px;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 20px;
    cursor: pointer;
    font-size: 1.2rem;
    font-weight: 500;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
  }
  
  .control-btn:hover {
    background: rgba(255, 255, 255, 0.25);
    border-color: rgba(255, 255, 255, 0.5);
    transform: scale(1.05);
  }

  .control-btn:active {
    transform: scale(0.98);
  }

  .control-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  .control-btn:disabled:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.3);
    transform: none;
  }
  
  .volume-control {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    font-size: 1.2rem;
  }
  
  .volume-buttons {
    display: flex;
    gap: 1rem;
  }
  
  .volume-btn {
    width: 50px;
    height: 50px;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    cursor: pointer;
    font-size: 1.2rem;
    transition: all 0.3s ease;
  }
  
  .volume-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
  }
  
  /* 響應式設計 */
  @media (max-width: 768px) {
    .tv-play-button {
      width: 200px;
      height: 100px;
    }
    
    .control-buttons {
      flex-direction: column;
      gap: 1rem;
    }
    
    .control-btn {
      width: 140px;
    }
  }
</style>
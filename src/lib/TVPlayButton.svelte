<script lang="ts">
  // 導入 Tone.js 和音樂引擎組件 (簡化版)
  // @ts-ignore
  import * as Tone from "tone";
  import ChordProgression from "./engine/Chords/ChordProgression";
  import Keys from "./engine/Chords/Keys";
  import { fiveToFive } from "./engine/Chords/MajorScale";
  import Piano from "./engine/Piano/Piano";
  
  let isPlaying = false;
  let contextStarted = false;
  let genChordsOnce = false;
  
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
  
  // 音量控制
  let volume = 0.7;
  const linearToDb = (value: number) =>
    value === 0 ? -Infinity : 20 * Math.log10(value);
  
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
      
      // 設置音量
      const vol = new Tone.Volume(linearToDb(volume));
      Tone.Master.chain(vol);
      Tone.Transport.bpm.value = 156;
      
      setupSequences();
      generateProgression();
      
    } catch (error) {
      console.error("音頻初始化失敗:", error);
    }
  }
  
  function setupSequences() {
    // 和弦序列 (簡化版)
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
  
  function togglePlay() {
    if (!contextStarted) {
      startAudioContext();
      return;
    }
    
    if (Tone.Transport.state === "started") {
      Tone.Transport.stop();
      isPlaying = false;
    } else {
      if (!genChordsOnce) {
        generateProgression();
      }
      Tone.Transport.start();
      chords.start(0);
      melody.start(0);
      isPlaying = true;
    }
  }
  
  function generateProgression() {
    const _scale = fiveToFive;
    const newKey = Keys[Math.floor(Math.random() * Keys.length)];
    const newScale = Tone.Frequency(newKey + "5")
      .harmonize(_scale)
      .map((f: any) => Tone.Frequency(f).toNote());
    const newProgression = ChordProgression.generate(8);
    const newScalePos = Math.floor(Math.random() * _scale.length);

    key = newKey;
    progress = 0;
    progression = newProgression;
    scale = newScale;
    genChordsOnce = true;
    scalePos = newScalePos;
    
    console.log(`🎵 新的進行生成: ${key} 調`);
  }
  
  function playChord() {
    if (!pianoLoaded || !progression[progress]) return;
    
    const chord = progression[progress];
    const root = Tone.Frequency(key + "3").transpose(chord.semitoneDist);
    const size = 4;
    const voicing = chord.generateVoicing(size);
    const notes = Tone.Frequency(root)
      .harmonize(voicing)
      .map((f: any) => Tone.Frequency(f).toNote());
    
    pn.triggerAttackRelease(notes, "1n");
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
      pn.triggerAttackRelease(note, "2n");
    }
    
    // 簡單的旋律運動
    const direction = Math.random() > 0.5 ? 1 : -1;
    scalePos = Math.max(0, Math.min(scale.length - 1, scalePos + direction));
  }
  
  function adjustVolume(delta: number) {
    volume = Math.max(0, Math.min(1, volume + delta));
    if (contextStarted) {
      Tone.Master.volume.value = linearToDb(volume);
    }
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
  }
</script>

<div class="tv-player">
  <!-- 主播放按鈕 -->
  <button class="tv-play-button" on:click={togglePlay}>
    <div class="play-icon">
      {#if !contextStarted}
        🎵
      {:else if isPlaying}
        ⏸️
      {:else}
        ▶️
      {/if}
    </div>
    <div class="play-text">
      {#if !contextStarted}
        初始化音樂
      {:else if isPlaying}
        暫停音樂
      {:else}
        播放音樂
      {/if}
    </div>
  </button>
  
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
      <p>LoFi 即時生成 - BPM: 156</p>
    {:else}
      <h3>🎵 LoFi 音樂引擎</h3>
      <p>使用 Tone.js 即時生成和弦進行</p>
    {/if}
  </div>
  
  <!-- 控制按鈕 -->
  <div class="control-buttons">
    <button class="control-btn" on:click={generateProgression} disabled={!contextStarted}>
      🔄 重新生成
    </button>
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
    gap: 2rem;
  }
  
  .tv-play-button {
    width: 300px;
    height: 140px;
    background: rgba(255, 255, 255, 0.15);
    color: white;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
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
  
  .play-icon {
    font-size: 2.5rem;
  }
  
  .play-text {
    font-size: 1.4rem;
    font-weight: 500;
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
    width: 160px;
    height: 60px;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 15px;
    cursor: pointer;
    font-size: 1.1rem;
    transition: all 0.3s ease;
  }
  
  .control-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
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
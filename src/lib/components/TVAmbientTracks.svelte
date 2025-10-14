<script lang="ts">
  // 環境音軌列表 (原本應用的音軌)
  let tracks = [
    { id: 1, name: "風聲", file: "assets/engine/tracks/Wind-Mark_DiAngelo-1940285615.mp3", isPlaying: false, audio: null as HTMLAudioElement | null },
    { id: 2, name: "海灘聲", file: "assets/engine/tracks/small-waves-onto-the-sand-143040.mp3", isPlaying: false, audio: null as HTMLAudioElement | null },
    { id: 3, name: "夜晚氛圍", file: "assets/engine/tracks/night-ambience-17064.mp3", isPlaying: false, audio: null as HTMLAudioElement | null },
    { id: 4, name: "辦公室", file: "assets/engine/tracks/office-ambience-6322.mp3", isPlaying: false, audio: null as HTMLAudioElement | null },
    { id: 5, name: "城市聲", file: "assets/engine/tracks/city-ambience-9272.mp3", isPlaying: false, audio: null as HTMLAudioElement | null }
  ];
  
  function toggleTrack(track: any) {
    if (track.isPlaying) {
      // 停止播放
      if (track.audio) {
        track.audio.pause();
        track.audio.currentTime = 0;
      }
      track.isPlaying = false;
    } else {
      // 開始播放
      if (!track.audio) {
        track.audio = new Audio(track.file);
        track.audio.loop = true;
        track.audio.volume = 0.4; // 背景音軌音量較低
      }
      
      track.audio.play().catch(e => {
        console.warn(`${track.name} 播放失敗:`, e);
      });
      track.isPlaying = true;
    }
    
    // 觸發響應式更新
    tracks = [...tracks];
  }
  
  function stopAllTracks() {
    tracks.forEach(track => {
      if (track.isPlaying && track.audio) {
        track.audio.pause();
        track.audio.currentTime = 0;
        track.isPlaying = false;
      }
    });
    tracks = [...tracks];
  }
  
  // 鍵盤快捷鍵
  function handleKeydown(e: KeyboardEvent) {
    const trackIndex = parseInt(e.key) - 1;
    if (trackIndex >= 0 && trackIndex < tracks.length) {
      e.preventDefault();
      toggleTrack(tracks[trackIndex]);
    } else if (e.key.toLowerCase() === 'k') {
      e.preventDefault();
      stopAllTracks();
    }
  }
  
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleKeydown);
  }
</script>

<div class="ambient-tracks">

  
  <div class="tracks-grid">
    {#each tracks as track}
      <button 
        class="track-button"
        class:active={track.isPlaying}
        on:click={() => toggleTrack(track)}
      >
        <div class="track-number">{track.id}</div>
        <div class="track-name">{track.name}</div>
        <div class="track-status">
          {track.isPlaying ? 'ON' : 'OFF'}
        </div>
      </button>
    {/each}
  </div>
  
  <div class="global-control">
    <button class="stop-all-btn" on:click={stopAllTracks}>
      🛑 停止全部
    </button>
  </div>
  
  <div class="hint">
    <p>🎮 按 1-5 快速切換 | K 停止全部</p>
  </div>
</div>

<style>
  .ambient-tracks {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    margin-top: 2rem;
  }
  
  .section-title {
    font-size: 1.6rem;
    margin: 0;
    color: #f0f8ff;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
  }
  
  .tracks-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 0.8rem;
  }
  
  .track-button {
    width: 80px;
    height: 80px;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 2px solid rgba(255, 255, 255, 0.2);
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
  
  .track-button:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-2px);
  }
  
  .track-button.active {
    background: rgba(72, 187, 120, 0.3);
    border-color: rgba(72, 187, 120, 0.6);
    box-shadow: 0 0 15px rgba(72, 187, 120, 0.4);
  }
  
  .track-number {
    font-size: 1.2rem;
    font-weight: bold;
  }
  
  .track-name {
    font-size: 0.7rem;
    text-align: center;
  }
  
  .track-status {
    font-size: 0.6rem;
    opacity: 0.8;
  }
  
  .global-control {
    margin-top: 1rem;
  }
  
  .stop-all-btn {
    width: 120px;
    height: 40px;
    background: rgba(239, 68, 68, 0.2);
    color: white;
    border: 2px solid rgba(239, 68, 68, 0.4);
    border-radius: 10px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.3s ease;
  }
  
  .stop-all-btn:hover {
    background: rgba(239, 68, 68, 0.3);
    transform: translateY(-2px);
  }
  
  .hint {
    margin-top: 0.5rem;
    opacity: 0.7;
    font-size: 0.8rem;
    text-align: center;
  }
  
  .hint p {
    margin: 0;
  }
  
  /* 響應式設計 */
  @media (max-width: 768px) {
    .tracks-grid {
      grid-template-columns: repeat(3, 1fr);
    }
    
    .track-button {
      width: 70px;
      height: 70px;
    }
  }
</style>
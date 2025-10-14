<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  const dispatch = createEventDispatcher();
  
  let currentBPM = 156; // 默認 BPM
  
  const bpmOptions = [
    { value: 120, label: '120', description: '輕鬆' },
    { value: 140, label: '140', description: '標準' },
    { value: 156, label: '156', description: '中快' },
    { value: 170, label: '170', description: '活力' }
  ];
  
  // 從 localStorage 讀取保存的 BPM
  function loadBPM() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('LofiEngine_BPM');
      if (saved) {
        currentBPM = parseInt(saved);
        dispatch('bpmChange', currentBPM);
      }
    }
  }
  
  // 保存 BPM 到 localStorage
  function saveBPM(bpm: number) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('LofiEngine_BPM', bpm.toString());
    }
  }
  
  // 切換 BPM
  function changeBPM(newBPM: number) {
    currentBPM = newBPM;
    saveBPM(newBPM);
    dispatch('bpmChange', newBPM);
    // 發送全局事件給 TVPlayButton
    window.dispatchEvent(new CustomEvent('bpmChange', { detail: newBPM }));
  }
  
  // 組件掛載時讀取保存的 BPM
  import { onMount } from 'svelte';
  onMount(() => {
    loadBPM();
  });
</script>

<div class="tv-bpm-control">
  <div class="bpm-header">
    <h3 class="bpm-title">🎵 節拍速度</h3>
    <div class="current-bpm">
      <span class="bpm-value">{currentBPM}</span>
      <span class="bpm-unit">BPM</span>
    </div>
  </div>
  
  <div class="bpm-options">
    {#each bpmOptions as option}
      <button 
        class="bpm-btn" 
        class:active={currentBPM === option.value}
        on:click={() => changeBPM(option.value)}
      >
        <div class="bpm-number">{option.label}</div>
        <div class="bpm-desc">{option.description}</div>
      </button>
    {/each}
  </div>
</div>

<style>
  .tv-bpm-control {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    padding: 1.2rem;
    margin: 0.8rem 0;
    backdrop-filter: blur(10px);
  }
  
  .bpm-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }
  
  .bpm-title {
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0;
    color: white;
  }
  
  .current-bpm {
    display: flex;
    align-items: baseline;
    gap: 0.2rem;
    background: rgba(102, 187, 106, 0.2);
    border: 1px solid rgba(102, 187, 106, 0.3);
    border-radius: 8px;
    padding: 0.3rem 0.8rem;
  }
  
  .bpm-value {
    font-size: 1.3rem;
    font-weight: 700;
    color: #66bb6a;
  }
  
  .bpm-unit {
    font-size: 0.9rem;
    color: #66bb6a;
    opacity: 0.8;
  }
  
  .bpm-options {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.6rem;
  }
  
  .bpm-btn {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 8px;
    padding: 0.8rem 0.4rem;
    color: white;
    cursor: pointer;
    transition: all 0.3s ease;
    text-align: center;
  }
  
  .bpm-btn:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
  }
  
  .bpm-btn.active {
    background: rgba(102, 187, 106, 0.25);
    border-color: rgba(102, 187, 106, 0.5);
    color: #66bb6a;
    transform: scale(1.05);
  }
  
  .bpm-number {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 0.1rem;
  }
  
  .bpm-desc {
    font-size: 0.75rem;
    opacity: 0.8;
  }
  
  /* 小型 TV 優化 */
  @media screen and (max-width: 1366px) and (max-height: 768px) {
    .tv-bpm-control {
      padding: 1rem;
    }
    
    .bpm-title {
      font-size: 1rem;
    }
    
    .bpm-value {
      font-size: 1.2rem;
    }
    
    .bpm-btn {
      padding: 0.6rem 0.3rem;
    }
    
    .bpm-number {
      font-size: 1rem;
    }
    
    .bpm-desc {
      font-size: 0.7rem;
    }
  }
  
  /* 極小 TV 優化 */
  @media screen and (max-width: 1024px) and (max-height: 600px) {
    .tv-bpm-control {
      padding: 0.8rem;
      margin: 0.5rem 0;
    }
    
    .bpm-options {
      gap: 0.4rem;
    }
    
    .bpm-btn {
      padding: 0.5rem 0.2rem;
    }
    
    .bpm-number {
      font-size: 0.9rem;
    }
    
    .bpm-desc {
      font-size: 0.65rem;
    }
  }
</style>
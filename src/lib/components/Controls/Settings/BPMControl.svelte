<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  const dispatch = createEventDispatcher();
  
  let currentBPM = 156; // 默認 BPM
  
  const bpmOptions = [
    { value: 120, label: '120 BPM', description: '輕鬆緩慢' },
    { value: 140, label: '140 BPM', description: '標準 LoFi' },
    { value: 156, label: '156 BPM', description: '中等偏快' },
    { value: 170, label: '170 BPM', description: '活力充沛' }
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
  }
  
  // 組件掛載時讀取保存的 BPM
  import { onMount } from 'svelte';
  onMount(() => {
    loadBPM();
  });
</script>

<div class="bpm-control">
  <h3 class="bpm-title">🎵 節拍速度 (BPM)</h3>
  
  <div class="bpm-current">
    <span class="current-bpm">目前：{currentBPM} BPM</span>
  </div>
  
  <div class="bpm-options">
    {#each bpmOptions as option}
      <button 
        class="bpm-option" 
        class:active={currentBPM === option.value}
        on:click={() => changeBPM(option.value)}
      >
        <div class="bpm-label">{option.label}</div>
        <div class="bpm-description">{option.description}</div>
      </button>
    {/each}
  </div>
  
  <div class="bpm-info">
    <p>💡 BPM 影響音樂節奏快慢，數字越大節拍越快</p>
  </div>
</div>

<style>
  .bpm-control {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 1.5rem;
    margin: 1rem 0;
  }
  
  .bpm-title {
    font-size: 1.2rem;
    font-weight: 600;
    margin: 0 0 1rem 0;
    color: white;
    text-align: center;
  }
  
  .bpm-current {
    text-align: center;
    margin-bottom: 1rem;
  }
  
  .current-bpm {
    background: rgba(102, 187, 106, 0.2);
    color: #66bb6a;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-weight: 600;
    border: 1px solid rgba(102, 187, 106, 0.3);
  }
  
  .bpm-options {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.8rem;
    margin-bottom: 1rem;
  }
  
  .bpm-option {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 10px;
    padding: 0.8rem 0.6rem;
    color: white;
    cursor: pointer;
    transition: all 0.3s ease;
    text-align: center;
  }
  
  .bpm-option:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
  }
  
  .bpm-option.active {
    background: rgba(102, 187, 106, 0.25);
    border-color: rgba(102, 187, 106, 0.5);
    color: #66bb6a;
  }
  
  .bpm-label {
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 0.2rem;
  }
  
  .bpm-description {
    font-size: 0.85rem;
    opacity: 0.8;
  }
  
  .bpm-info {
    text-align: center;
    margin-top: 1rem;
  }
  
  .bpm-info p {
    font-size: 0.9rem;
    margin: 0;
    opacity: 0.7;
    color: #f0f8ff;
  }
  
  /* 手機響應式 */
  @media (max-width: 768px) {
    .bpm-options {
      grid-template-columns: 1fr;
    }
    
    .bpm-option {
      padding: 1rem 0.8rem;
    }
  }
</style>
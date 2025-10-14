<script lang="ts">
  let currentBPM = 156; // 默認 BPM
  
  const bpmOptions = [
    { value: 120, label: '120 BPM', description: '輕鬆緩慢', icon: '🐌' },
    { value: 140, label: '140 BPM', description: '標準 LoFi', icon: '🎵' },
    { value: 156, label: '156 BPM', description: '中等偏快', icon: '🎶' },
    { value: 170, label: '170 BPM', description: '活力充沛', icon: '⚡' }
  ];
  
  // 從 localStorage 讀取保存的 BPM
  function loadBPM() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('LofiEngine_BPM');
      if (saved) {
        currentBPM = parseInt(saved);
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
    // 發送全局事件
    window.dispatchEvent(new CustomEvent('bpmChange', { detail: newBPM }));
  }
  
  // 組件掛載時讀取保存的 BPM
  import { onMount } from 'svelte';
  onMount(() => {
    loadBPM();
  });
</script>

<div class="info-bpm-control">
  <div class="bpm-header">
    <h3 class="section-title">🎵 節拍速度控制</h3>
    <div class="current-bpm-info">
      <span class="current-label">目前節拍：</span>
      <span class="current-value">{currentBPM} BPM</span>
    </div>
  </div>
  
  <div class="bpm-description">
    <p>BPM (每分鐘節拍數) 控制音樂播放速度，影響整體節奏感：</p>
  </div>
  
  <div class="bpm-options-grid">
    {#each bpmOptions as option}
      <button 
        class="bpm-option-btn" 
        class:selected={currentBPM === option.value}
        on:click={() => changeBPM(option.value)}
        title="點擊切換到 {option.label}"
      >
        <div class="option-icon">{option.icon}</div>
        <div class="option-details">
          <div class="option-bpm">{option.value}</div>
          <div class="option-desc">{option.description}</div>
        </div>
      </button>
    {/each}
  </div>
  
  <div class="bpm-tips">
    <p class="tip-text">💡 提示：較低的 BPM 適合放鬆，較高的 BPM 適合專注工作</p>
  </div>
</div>

<style>
  .info-bpm-control {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    backdrop-filter: blur(10px);
  }
  
  .bpm-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .section-title {
    font-size: 1.3rem;
    font-weight: 700;
    margin: 0;
    color: #f0f8ff;
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
  }
  
  .current-bpm-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(102, 187, 106, 0.15);
    border: 1px solid rgba(102, 187, 106, 0.3);
    border-radius: 20px;
    padding: 0.4rem 1rem;
  }
  
  .current-label {
    font-size: 0.9rem;
    color: #e0e8ff;
    opacity: 0.9;
  }
  
  .current-value {
    font-size: 1.1rem;
    font-weight: 700;
    color: #66bb6a;
    text-shadow: 0 0 8px rgba(102, 187, 106, 0.5);
  }
  
  .bpm-description {
    margin-bottom: 1rem;
  }
  
  .bpm-description p {
    margin: 0;
    font-size: 0.95rem;
    color: #e0e8ff;
    opacity: 0.8;
    line-height: 1.4;
  }
  
  .bpm-options-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.8rem;
    margin-bottom: 1rem;
  }
  
  .bpm-option-btn {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 10px;
    padding: 1rem 0.8rem;
    color: white;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.8rem;
    text-align: left;
  }
  
  .bpm-option-btn:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
  
  .bpm-option-btn.selected {
    background: rgba(102, 187, 106, 0.25);
    border-color: rgba(102, 187, 106, 0.5);
    color: #66bb6a;
    box-shadow: 0 0 15px rgba(102, 187, 106, 0.3);
  }
  
  .option-icon {
    font-size: 1.8rem;
    filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.3));
  }
  
  .option-details {
    flex: 1;
  }
  
  .option-bpm {
    font-size: 1.1rem;
    font-weight: 700;
    margin-bottom: 0.2rem;
  }
  
  .option-desc {
    font-size: 0.85rem;
    opacity: 0.8;
  }
  
  .bpm-tips {
    text-align: center;
    padding-top: 0.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .tip-text {
    margin: 0;
    font-size: 0.85rem;
    color: #f0f8ff;
    opacity: 0.7;
    font-style: italic;
  }
  
  /* 手機響應式 */
  @media (max-width: 600px) {
    .info-bpm-control {
      padding: 1rem;
    }
    
    .bpm-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.8rem;
    }
    
    .section-title {
      font-size: 1.2rem;
    }
    
    .bpm-options-grid {
      grid-template-columns: 1fr;
      gap: 0.6rem;
    }
    
    .bpm-option-btn {
      padding: 0.8rem 0.6rem;
    }
    
    .option-icon {
      font-size: 1.5rem;
    }
  }
</style>
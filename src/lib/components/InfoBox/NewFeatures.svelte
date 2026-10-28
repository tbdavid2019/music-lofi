<script lang="ts">
  import PresetManager from "../Controls/Settings/PresetManager.svelte";
  import { Sparkles, Radio, Sliders, Clock, ChevronDown, ChevronRight } from "@lucide/svelte";
  import { STATIONS, radioStore, playStation } from "../../stores/radioStore";

  let activeSection: "stations" | "presets" | "timer" | null = "stations";
</script>

<div class="features-guide">
  <div class="title-row">
    <Sparkles size={22} class="header-sparkle" />
    <h2>功能中心</h2>
  </div>
  <p class="subtitle">精選 24/7 Lo-Fi & Chill 線上電台與環境氛圍混音器</p>

  <!-- 功能卡片選單 -->
  <div class="feature-cards">
    <button
      type="button"
      class="feature-card"
      class:active={activeSection === "stations"}
      on:click={() => (activeSection = activeSection === "stations" ? null : "stations")}
    >
      <div class="card-icon">
        <Radio size={20} />
      </div>
      <div class="card-content">
        <h3>精選電台</h3>
        <p>6 大 24/7 高音質線上頻道</p>
      </div>
      <div class="card-arrow">
        {#if activeSection === "stations"}
          <ChevronDown size={16} />
        {:else}
          <ChevronRight size={16} />
        {/if}
      </div>
    </button>

    <button
      type="button"
      class="feature-card"
      class:active={activeSection === "presets"}
      on:click={() => (activeSection = activeSection === "presets" ? null : "presets")}
    >
      <div class="card-icon">
        <Sliders size={20} />
      </div>
      <div class="card-content">
        <h3>預設管理</h3>
        <p>保存和載入您的自訂設定</p>
      </div>
      <div class="card-arrow">
        {#if activeSection === "presets"}
          <ChevronDown size={16} />
        {:else}
          <ChevronRight size={16} />
        {/if}
      </div>
    </button>

    <button
      type="button"
      class="feature-card"
      class:active={activeSection === "timer"}
      on:click={() => (activeSection = activeSection === "timer" ? null : "timer")}
    >
      <div class="card-icon">
        <Clock size={20} />
      </div>
      <div class="card-content">
        <h3>專注定時器</h3>
        <p>番茄鐘、睡眠定時器</p>
      </div>
      <div class="card-arrow">
        {#if activeSection === "timer"}
          <ChevronDown size={16} />
        {:else}
          <ChevronRight size={16} />
        {/if}
      </div>
    </button>
  </div>

  <!-- 功能內容區域 -->
  {#if activeSection === "stations"}
    <div class="feature-content stations-quick-list">
      {#each STATIONS as s (s.id)}
        <button
          type="button"
          class="station-quick-item"
          class:current={$radioStore.currentStationId === s.id}
          on:click={() => playStation(s.id, true)}
        >
          <div class="sq-info">
            <span class="sq-name">{s.label} ({s.name})</span>
            <span class="sq-desc">{s.description}</span>
          </div>
          <span class="sq-status">
            {$radioStore.currentStationId === s.id && $radioStore.isPlaying ? "播放中" : "切換"}
          </span>
        </button>
      {/each}
    </div>
  {:else if activeSection === "presets"}
    <div class="feature-content">
      <PresetManager />
    </div>
  {:else if activeSection === "timer"}
    <div class="feature-content timer-guide-box">
      <div class="timer-guide-badge">
        <Clock size={15} />
        <span>右上角獨立控制塢</span>
      </div>
      <h4>專注定時器全新升級</h4>
      <p>專注定時器現已獨立設置於畫面右上角控制列，常駐顯示即時倒數標籤（如 ⏱️ 24:18），隨時掌握專注進度：</p>
      <ul class="timer-guide-list">
        <li><strong>☕ 番茄工作法</strong>：經典 25/5 分鐘專注與休息輪換，自動輪次記錄。</li>
        <li><strong>🌙 睡眠定時器</strong>：時間到達自動平滑淡出音樂，助你好眠。</li>
        <li><strong>⏱️ 自訂定時</strong>：自由自訂任意專注分鐘數。</li>
      </ul>
    </div>
  {/if}

  <!-- 快速提示 -->
  <div class="quick-tips">
    <h3>快捷提示</h3>
    <ul>
      <li>按 <kbd>空白鍵</kbd> 播放或暫停電台</li>
      <li>按 <kbd>N</kbd> / <kbd>P</kbd> 切換下一台 / 上一台</li>
      <li>按 <kbd>O</kbd> 開啟設定面板，按 <kbd>ESC</kbd> 關閉說明</li>
      <li>數字鍵 <kbd>1</kbd> - <kbd>9</kbd> 可啟動背景環境音軌，按 <kbd>K</kbd> 停止所有音軌</li>
    </ul>
  </div>
</div>

<style>
  .features-guide {
    padding: 10px 0;
  }

  .title-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-bottom: 6px;
  }

  :global(.header-sparkle) {
    color: #a855f7;
  }

  h2 {
    margin: 0;
    font-size: 18px;
    text-align: center;
    color: white;
  }

  .subtitle {
    text-align: center;
    margin: 0 0 16px 0;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.65);
  }

  .feature-cards {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 16px;
  }

  .feature-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 14px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 10px;
    color: white;
    cursor: pointer;
    text-align: left;
    transition: all 0.2s ease;
  }

  .feature-card:hover {
    background: rgba(255, 255, 255, 0.12);
  }

  .feature-card.active {
    background: rgba(168, 85, 247, 0.2);
    border-color: rgba(168, 85, 247, 0.5);
  }

  .card-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #a855f7;
  }

  .card-content {
    flex: 1;
  }

  .card-content h3 {
    margin: 0 0 2px 0;
    font-size: 14px;
    font-weight: 600;
  }

  .card-content p {
    margin: 0;
    font-size: 11px;
    color: rgba(255, 255, 255, 0.6);
  }

  .card-arrow {
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.5);
  }

  .feature-content {
    background: rgba(0, 0, 0, 0.25);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    padding: 12px;
    margin-bottom: 16px;
  }

  .stations-quick-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .station-quick-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 10px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 6px;
    color: white;
    cursor: pointer;
    text-align: left;
    transition: background 0.2s ease;
  }

  .station-quick-item:hover {
    background: rgba(255, 255, 255, 0.12);
  }

  .station-quick-item.current {
    background: rgba(99, 102, 241, 0.25);
    border-color: rgba(99, 102, 241, 0.6);
  }

  .sq-info {
    display: flex;
    flex-direction: column;
  }

  .sq-name {
    font-size: 13px;
    font-weight: 600;
  }

  .sq-desc {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.55);
  }

  .sq-status {
    font-size: 11px;
    color: #a855f7;
    font-weight: 500;
  }

  .quick-tips {
    background: rgba(255, 255, 255, 0.04);
    border-radius: 8px;
    padding: 10px 14px;
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .quick-tips h3 {
    margin: 0 0 6px 0;
    font-size: 13px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.85);
  }

  .quick-tips ul {
    margin: 0;
    padding-left: 18px;
    color: rgba(255, 255, 255, 0.65);
    font-size: 11px;
    line-height: 1.6;
  }

  kbd {
    background: rgba(255, 255, 255, 0.15);
    padding: 1px 5px;
    border-radius: 4px;
    font-family: inherit;
    font-size: 10px;
    color: white;
  }
</style>

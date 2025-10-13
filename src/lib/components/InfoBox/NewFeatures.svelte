<script lang="ts">
  import PresetManager from "../Controls/Settings/PresetManager.svelte";
  import InstrumentControls from "../Controls/Settings/InstrumentControls.svelte";
  import Recorder from "../Recorder/Recorder.svelte";
  import Timer from "../Timer/Timer.svelte";

  let activeSection: "presets" | "instruments" | "recorder" | "timer" | null = null;
</script>

<div class="features-guide">
  <h2>🎉 新功能中心</h2>
  <p class="subtitle">直接在這裡操作所有新功能，無需跳轉！</p>
  
  <!-- 功能卡片選單 -->
  <div class="feature-cards">
    <button 
      class="feature-card"
      class:active={activeSection === "presets"}
      on:click={() => activeSection = activeSection === "presets" ? null : "presets"}
    >
      <div class="card-icon">🎵</div>
      <div class="card-content">
        <h3>預設管理</h3>
        <p>保存和載入您的配置</p>
      </div>
      <div class="card-arrow">{activeSection === "presets" ? "▼" : "▶"}</div>
    </button>

    <button 
      class="feature-card"
      class:active={activeSection === "instruments"}
      on:click={() => activeSection = activeSection === "instruments" ? null : "instruments"}
    >
      <div class="card-icon">�️</div>
      <div class="card-content">
        <h3>樂器控制</h3>
        <p>調整各樂器音量（移除鼓聲）</p>
      </div>
      <div class="card-arrow">{activeSection === "instruments" ? "▼" : "▶"}</div>
    </button>

    <button 
      class="feature-card"
      class:active={activeSection === "recorder"}
      on:click={() => activeSection = activeSection === "recorder" ? null : "recorder"}
    >
      <div class="card-icon">🎙️</div>
      <div class="card-content">
        <h3>錄音功能</h3>
        <p>錄製您的 Lo-Fi 音樂</p>
      </div>
      <div class="card-arrow">{activeSection === "recorder" ? "▼" : "▶"}</div>
    </button>

    <button 
      class="feature-card"
      class:active={activeSection === "timer"}
      on:click={() => activeSection = activeSection === "timer" ? null : "timer"}
    >
      <div class="card-icon">⏰</div>
      <div class="card-content">
        <h3>定時器</h3>
        <p>番茄鐘、睡眠定時器</p>
      </div>
      <div class="card-arrow">{activeSection === "timer" ? "▼" : "▶"}</div>
    </button>
  </div>

  <!-- 功能內容區域 -->
  {#if activeSection === "presets"}
    <div class="feature-content">
      <PresetManager />
    </div>
  {:else if activeSection === "instruments"}
    <div class="feature-content">
      <InstrumentControls />
    </div>
  {:else if activeSection === "recorder"}
    <div class="feature-content">
      <Recorder />
    </div>
  {:else if activeSection === "timer"}
    <div class="feature-content">
      <Timer />
    </div>
  {/if}

  <!-- 快速提示 -->
  {#if !activeSection}
    <div class="quick-tips">
      <h3>💡 使用提示</h3>
      <ul>
        <li>點擊上方卡片展開功能，直接操作</li>
        <li>所有設定自動儲存在瀏覽器中</li>
        <li>也可以按 <kbd>J</kbd> 鍵開啟設定面板</li>
        <li>按 <kbd>ESC</kbd> 關閉此面板</li>
      </ul>
    </div>
  {/if}
</div>

<style>
  .features-guide {
    padding: 10px 0;
  }

  h2 {
    margin: 0 0 10px 0;
    font-size: 20px;
    text-align: center;
    color: white;
  }

  .subtitle {
    text-align: center;
    margin-bottom: 20px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 13px;
  }

  /* 功能卡片選單 */
  .feature-cards {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 15px;
  }

  .feature-card {
    width: 100%;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 12px 15px;
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    text-align: left;
  }

  .feature-card:hover {
    background: rgba(0, 0, 0, 0.4);
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateX(4px);
  }

  .feature-card.active {
    background: rgba(74, 144, 226, 0.25);
    border-color: rgba(74, 144, 226, 0.5);
  }

  .card-icon {
    font-size: 28px;
    flex-shrink: 0;
  }

  .card-content {
    flex: 1;
    min-width: 0;
  }

  .card-content h3 {
    margin: 0 0 3px 0;
    color: #fff;
    font-size: 15px;
  }

  .card-content p {
    margin: 0;
    color: rgba(255, 255, 255, 0.7);
    font-size: 12px;
  }

  .card-arrow {
    font-size: 16px;
    color: rgba(255, 255, 255, 0.5);
    flex-shrink: 0;
    transition: transform 0.3s ease;
  }

  .feature-card.active .card-arrow {
    transform: rotate(0deg);
  }

  /* 功能內容區域 */
  .feature-content {
    background: rgba(0, 0, 0, 0.35);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 12px;
    padding: 15px;
    margin-bottom: 15px;
  }

  /* 快速提示 */
  .quick-tips {
    background: rgba(255, 193, 7, 0.1);
    border: 1px solid rgba(255, 193, 7, 0.3);
    border-radius: 12px;
    padding: 15px;
  }

  .quick-tips h3 {
    margin: 0 0 10px 0;
    color: #ffc107;
    font-size: 15px;
  }

  .quick-tips ul {
    margin: 0;
    padding-left: 20px;
    color: rgba(255, 255, 255, 0.85);
    font-size: 13px;
  }

  .quick-tips li {
    margin: 6px 0;
    line-height: 1.5;
  }

  .quick-tips kbd {
    display: inline-block;
    padding: 2px 6px;
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 3px;
    font-family: monospace;
    font-size: 12px;
    color: #fff;
  }

  @media only screen and (max-width: 600px) {
    .feature-card {
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .card-icon {
      font-size: 35px;
    }
  }
</style>

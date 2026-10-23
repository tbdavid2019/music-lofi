<script lang="ts">
  import {
    ArrowRight,
    ArrowLeft,
    ArrowUp,
    ArrowDown,
    Keyboard,
  } from "lucide-svelte";

  let ambientTracks = [1, 2, 3, 4, 5, 6, 7, 8, 9];
</script>

<div class="shortcuts">
  <div class="shortcuts-header">
    <Keyboard size={18} class="shortcuts-icon" />
    <h4>鍵盤快捷鍵 (Keyboard Shortcuts)</h4>
  </div>

  <!-- General Shortcuts -->
  <h5 class="section-heading">一般功能 (General)</h5>
  <div class="shortcut">
    <div class="shortcut-key">ESC</div>
    <div class="shortcut-desc">顯示/隱藏此視窗 (Toggle Info Box)</div>
  </div>
  <div class="shortcut">
    <div class="shortcut-key">J</div>
    <div class="shortcut-desc">開啟/關閉設定 (Toggle Settings)</div>
  </div>
  <div class="shortcut">
    <div class="shortcut-key"><ArrowRight size={14} /></div>
    <div class="shortcut-desc">下一張背景圖片 (Next Background)</div>
  </div>
  <div class="shortcut">
    <div class="shortcut-key"><ArrowLeft size={14} /></div>
    <div class="shortcut-desc">上一張背景圖片 (Previous Background)</div>
  </div>

  <!-- Main Radio -->
  <h5 class="section-heading">線上電台 (Main Radio)</h5>
  <div class="shortcut">
    <div class="shortcut-key">SPACEBAR</div>
    <div class="shortcut-desc">播放 / 暫停主電台 (Play/Pause Radio)</div>
  </div>
  <div class="shortcut">
    <div class="shortcut-key">N</div>
    <div class="shortcut-desc">切換下一電台 (Next Station)</div>
  </div>
  <div class="shortcut">
    <div class="shortcut-key">P</div>
    <div class="shortcut-desc">切換上一電台 (Previous Station)</div>
  </div>

  <!-- Effects Shortcuts -->
  <h5 class="section-heading">環境音效 (Ambient Effects)</h5>
  <div class="shortcut">
    <div class="shortcut-key">Q / A</div>
    <div class="shortcut-desc">雨聲開關 (Toggle Rain)</div>
  </div>
  <div class="shortcut">
    <div class="shortcut-key">W / F</div>
    <div class="shortcut-desc">營火聲開關 (Toggle Campfire)</div>
  </div>
  <div class="shortcut">
    <div class="shortcut-key">E / D</div>
    <div class="shortcut-desc">叢林鳥鳴開關 (Toggle Jungle)</div>
  </div>
  <div class="shortcut">
    <div class="shortcut-key">T / S</div>
    <div class="shortcut-desc">雷雨聲開關 (Toggle Thunder)</div>
  </div>

  <!-- Ambient Tracks Shortcuts -->
  <h5 class="section-heading">背景音軌 (Ambient Tracks)</h5>
  <div class="shortcut">
    <div class="shortcut-key">K</div>
    <div class="shortcut-desc">停止所有背景音軌 (Stop All Tracks)</div>
  </div>
  {#each ambientTracks as track}
    <div class="shortcut">
      <div class="shortcut-key">{track}</div>
      <div class="shortcut-desc">
        播放/暫停音軌 {track} (Toggle Track {track})
      </div>
    </div>
  {/each}
</div>

<style>
  .shortcuts {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    padding: 0 4px;
  }

  .shortcuts-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
  }

  :global(.shortcuts-icon) {
    color: #a855f7;
  }

  h4 {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
  }

  .section-heading {
    margin: 8px 0 2px 0;
    font-size: 12px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.7);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .shortcut {
    display: flex;
    align-items: center;
    gap: 12px;
    background: rgba(255, 255, 255, 0.04);
    padding: 6px 10px;
    border-radius: 6px;
    border: 1px solid rgba(255, 255, 255, 0.06);
  }

  .shortcut-key {
    background: rgba(255, 255, 255, 0.12);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    padding: 2px 8px;
    font-size: 11px;
    font-weight: 600;
    min-width: 28px;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .shortcut-desc {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.75);
  }
</style>

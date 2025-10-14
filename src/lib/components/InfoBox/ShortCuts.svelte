<script lang="ts">
  import {
    IconArrowDown,
    IconArrowLeft,
    IconArrowRight,
    IconArrowUp,
  } from "@tabler/icons-svelte";
  let ambientTracks = [1, 2, 3, 4, 5, 6, 7, 8, 9];
</script>

<div class="shortcuts">
  <h4>Shortcuts 鍵盤快捷鍵</h4>
  <!-- General Shortcuts -->
  <h5 style="margin-left: 10px;">General 一般功能</h5>
  <div class="shortcut">
    <div class="shortcut-key">Esc</div>
    <div class="shortcut-desc">Show/hide This Box 顯示/隱藏此視窗</div>
  </div>
  <div class="shortcut">
    <div class="shortcut-key">J</div>
    <div class="shortcut-desc">Open/close Settings 開啟/關閉設定</div>
  </div>
  <div class="shortcut">
    <div class="shortcut-key"><IconArrowRight size={15} /></div>
    <div class="shortcut-desc">Next Background Image 下一張背景圖片</div>
  </div>
  <div class="shortcut">
    <div class="shortcut-key"><IconArrowLeft size={15} /></div>
    <div class="shortcut-desc">Previous Background Image 上一張背景圖片</div>
  </div>
  <div class="shortcut">
    <div class="shortcut-key">CTRL + R</div>
    <div class="shortcut-desc">Restart 重新啟動</div>
  </div>

  <h5 style="margin-left: 10px;">Main Track 主音軌</h5>
  <div class="shortcut">
    <div class="shortcut-key">SPACEBAR</div>
    <div class="shortcut-desc">Play/Pause Main Track 播放/暫停主音軌</div>
  </div>
  <div class="shortcut">
    <div class="shortcut-key">R</div>
    <div class="shortcut-desc">Regenerate Melody 重新生成旋律</div>
  </div>
  <div class="shortcut">
    <div class="shortcut-key">M</div>
    <div class="shortcut-desc">Toggle Melody On/Off 開關旋律</div>
  </div>
  <!-- Effects Shortcuts -->
  <h5 style="margin-left: 10px;">Effects 效果控制</h5>
  <div class="shortcut">
    <div class="shortcut-key">Q</div>
    <div class="shortcut-desc">Control The Rain 控制雨聲</div>
  </div>
  <div class="shortcut">
    <div class="shortcut-key">W</div>
    <div class="shortcut-desc">Control The Campfire 控制營火聲</div>
  </div>
  <div class="shortcut">
    <div class="shortcut-key">E</div>
    <div class="shortcut-desc">Control The Jungle Sounds 控制叢林聲音</div>
  </div>
  <div class="shortcut">
    <div class="shortcut-key">T</div>
    <div class="shortcut-desc">Control The Thunder Storm 控制雷雨聲</div>
  </div>
  <!-- Ambient Tracks Shortcuts -->
  <h5 style="margin-left: 10px;">Ambient Tracks 環境音軌</h5>
  <div class="shortcut">
    <div class="shortcut-key"><IconArrowUp size={15} /></div>
    <div class="shortcut-desc">Navigate To Next Track 切換到下一個音軌</div>
  </div>
  <div class="shortcut">
    <div class="shortcut-key"><IconArrowDown size={15} /></div>
    <div class="shortcut-desc">Navigate To Previous Track 切換到上一個音軌</div>
  </div>
  <div class="shortcut">
    <div class="shortcut-key">K</div>
    <div class="shortcut-desc">Stop All Ambient Sounds 停止所有環境音效</div>
  </div>
  {#each ambientTracks as track}
    <div class="shortcut">
      <div class="shortcut-key">{track}</div>
      <div class="shortcut-desc">
        Play/Pause Ambient Track {track} 播放/暫停環境音軌 {track}
      </div>
    </div>
  {/each}
</div>

<style>
  .shortcuts {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 0 10px;
  }
  h4,
  h5 {
    margin: 0;
  }
  .shortcut {
    display: flex;
    gap: 1rem;
    font-size: small;
    margin-left: 20px;
  }

  .shortcut-key {
    min-width: 30px;
    background-color: #fff;
    color: #000;
    padding: 5px 10px;
    border-radius: 10px;
    text-align: center;
  }

  .shortcut-desc {
    color: #fff;
  }
</style>

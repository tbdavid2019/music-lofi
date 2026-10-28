<script lang="ts">
  import { onMount } from "svelte";

  const STORAGE_KEY = "LofiEngine_MenuOpacity";
  let menuOpacity = 0.7;

  // Save current opacity to local storage and apply to root
  function saveOpacity() {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, menuOpacity.toString());
      document.documentElement.style.setProperty("--menu-opacity", menuOpacity.toString());
    }
  }

  // Updater function for the opacity slider
  function updateMenuOpacity(e: Event) {
    menuOpacity = parseFloat((e.currentTarget as HTMLInputElement).value);
    saveOpacity();
  }

  onMount(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved !== null) {
        menuOpacity = parseFloat(saved);
      }
    }
  });
</script>

<div class="ui-config-box">
  <div class="opacity-header">
    <label for="opacity-slider" class="opacity-title">選單面板透明度</label>
    <span class="opacity-value">{Math.round(menuOpacity * 100)}%</span>
  </div>
  <input
    id="opacity-slider"
    class="opacity-slider"
    type="range"
    bind:value={menuOpacity}
    min="0.2"
    max="1"
    step="0.05"
    on:input={updateMenuOpacity}
    aria-label="選單面板透明度"
  />
</div>

<style>
  .ui-config-box {
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 12px 14px;
  }

  .opacity-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .opacity-title {
    font-size: 13px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.9);
  }

  .opacity-value {
    font-size: 12.5px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    color: #38bdf8;
    background: rgba(56, 189, 248, 0.12);
    border: 1px solid rgba(56, 189, 248, 0.25);
    padding: 2px 8px;
    border-radius: 999px;
  }

  .opacity-slider {
    width: 100%;
    height: 6px;
    border-radius: 3px;
    background: rgba(255, 255, 255, 0.15);
    outline: none;
    cursor: pointer;
    accent-color: #38bdf8;
  }
</style>

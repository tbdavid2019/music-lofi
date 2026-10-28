<script lang="ts">
  import { Settings, Palette, Volume2, Bookmark, X } from "@lucide/svelte";
  import { onMount, onDestroy } from "svelte";
  import UIConfig from "./UIConfig.svelte";
  import Background from "./Background.svelte";
  import Volume from "./Volume.svelte";
  import PresetManager from "./PresetManager.svelte";

  type SettingsTab = "appearance" | "volume" | "presets";

  let isActive = false;
  let activeTab: SettingsTab = "appearance";
  let settingsBoxEl: HTMLElement | null = null;

  function toggle() {
    isActive = !isActive;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const target = e.target as HTMLElement | null;
    if (
      target &&
      (target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable ||
        target.closest("input, textarea, [contenteditable='true']"))
    ) {
      return;
    }
    // ESC key closes settings
    if (e.key === "Escape" && isActive) {
      e.preventDefault();
      isActive = false;
      return;
    }
    // 'o', 'O', or ',' opens settings
    if (e.key === "o" || e.key === "O" || e.key === ",") {
      toggle();
    }
  }

  const handleClickOutside = (event: MouseEvent) => {
    if (
      isActive &&
      settingsBoxEl &&
      event.target instanceof Node &&
      !settingsBoxEl.contains(event.target)
    ) {
      isActive = false;
    }
  };

  onMount(() => {
    window.addEventListener("keydown", handleKeydown);
    document.addEventListener("click", handleClickOutside);
  });

  onDestroy(() => {
    if (typeof window !== "undefined") {
      window.removeEventListener("keydown", handleKeydown);
    }
    if (typeof document !== "undefined") {
      document.removeEventListener("click", handleClickOutside);
    }
  });
</script>

<div id="settings-box" bind:this={settingsBoxEl}>
  <button
    type="button"
    class="settings-trigger-btn"
    class:active={isActive}
    on:click={toggle}
    title="系統設定 (O)"
    aria-label="Settings"
    aria-expanded={isActive}
  >
    <Settings size={20} color={isActive ? "black" : "white"} />
  </button>

  {#if isActive}
    <div class="settings-container" role="dialog" aria-label="系統設定面板">
      <!-- Header -->
      <div class="settings-header">
        <div class="header-left">
          <Settings size={18} class="settings-header-icon" />
          <h3 class="settings-title">控制面板</h3>
        </div>
        <button
          type="button"
          class="close-btn"
          on:click={() => (isActive = false)}
          aria-label="關閉設定"
          title="關閉 (ESC)"
        >
          <X size={18} />
        </button>
      </div>

      <!-- Segmented Tabs Header -->
      <div class="segmented-tabs" role="tablist" aria-label="設定分類">
        <button
          type="button"
          role="tab"
          class="tab-btn"
          class:selected={activeTab === "appearance"}
          aria-selected={activeTab === "appearance"}
          on:click={() => (activeTab = "appearance")}
        >
          <Palette size={15} />
          <span>外觀桌布</span>
        </button>
        <button
          type="button"
          role="tab"
          class="tab-btn"
          class:selected={activeTab === "volume"}
          aria-selected={activeTab === "volume"}
          on:click={() => (activeTab = "volume")}
        >
          <Volume2 size={15} />
          <span>混音音量</span>
        </button>
        <button
          type="button"
          role="tab"
          class="tab-btn"
          class:selected={activeTab === "presets"}
          aria-selected={activeTab === "presets"}
          on:click={() => (activeTab = "presets")}
        >
          <Bookmark size={15} />
          <span>情境預設</span>
        </button>
      </div>

      <!-- Tab Content Area -->
      <div class="tab-content-area">
        {#if activeTab === "appearance"}
          <div class="tab-panel" role="tabpanel">
            <UIConfig />
            <Background />
          </div>
        {:else if activeTab === "volume"}
          <div class="tab-panel" role="tabpanel">
            <Volume />
          </div>
        {:else if activeTab === "presets"}
          <div class="tab-panel" role="tabpanel">
            <PresetManager />
          </div>
        {/if}
      </div>

      <!-- Footer Info -->
      <footer class="settings-footer">
        <small class="info-label">按 <kbd>ESC</kbd> 檢視快捷鍵與說明 · 按 <kbd>O</kbd> 開關設定</small>
      </footer>
    </div>
  {/if}
</div>

<style>
  #settings-box {
    position: relative;
    display: inline-flex;
    align-items: center;
  }

  .settings-trigger-btn {
    color: white;
    border-radius: 50%;
    aspect-ratio: 1/1;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: transparent;
    border: none;
    cursor: pointer;
    width: 38px;
    height: 38px;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    user-select: none;
  }

  .settings-trigger-btn:hover {
    background-color: rgba(255, 255, 255, 0.12);
  }

  .settings-trigger-btn.active {
    background-color: #ffffff;
  }

  .settings-trigger-btn:focus-visible {
    outline: 2px solid #38bdf8;
    outline-offset: 2px;
  }

  .settings-container {
    position: absolute;
    right: 0;
    top: 50px;
    width: 420px;
    max-width: calc(100vw - 32px);
    height: 560px;
    max-height: 84vh;
    display: flex;
    flex-direction: column;
    padding: 18px;
    border-radius: 20px;
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    background-color: rgb(15 18 28 / max(var(--menu-opacity, 0.94), 0.92));
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 24px 50px rgba(0, 0, 0, 0.75), inset 0 1px 0 rgba(255, 255, 255, 0.15);
    z-index: 60;
    color: #ffffff;
    user-select: none;
    animation: pop-in 0.18s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes pop-in {
    from {
      opacity: 0;
      transform: translateY(-6px) scale(0.97);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .settings-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
    padding-bottom: 10px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.14);
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  :global(.settings-header-icon) {
    color: #c084fc;
  }

  .settings-title {
    margin: 0;
    font-size: 16px;
    font-weight: 700;
    letter-spacing: 0.3px;
    color: #ffffff;
  }

  .close-btn {
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.18);
    color: #cbd5e1;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .close-btn:hover {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.16);
    border-color: rgba(255, 255, 255, 0.35);
  }

  .close-btn:focus-visible {
    outline: 2px solid #38bdf8;
    outline-offset: 2px;
  }

  /* Segmented Tabs */
  .segmented-tabs {
    display: flex;
    background: rgba(0, 0, 0, 0.45);
    border-radius: 12px;
    padding: 4px;
    gap: 4px;
    margin-bottom: 14px;
    border: 1px solid rgba(255, 255, 255, 0.16);
  }

  .tab-btn {
    flex: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 8px 12px;
    border-radius: 9px;
    border: 1px solid transparent;
    background: transparent;
    color: #cbd5e1;
    font-size: 13.5px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .tab-btn:hover {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.1);
  }

  .tab-btn.selected {
    background: rgba(255, 255, 255, 0.22);
    border-color: rgba(255, 255, 255, 0.32);
    color: #ffffff;
    font-weight: 700;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }

  .tab-btn:focus-visible {
    outline: 2px solid #38bdf8;
    outline-offset: 2px;
  }

  /* Tab Content Area */
  .tab-content-area {
    flex: 1;
    overflow-y: auto;
    padding-right: 4px;
    margin-right: -4px;
  }

  .tab-content-area::-webkit-scrollbar {
    width: 5px;
  }

  .tab-content-area::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 10px;
  }

  .tab-content-area::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.25);
    border-radius: 10px;
  }

  .tab-content-area::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.4);
  }

  .tab-panel {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  /* Footer */
  .settings-footer {
    padding-top: 12px;
    margin-top: auto;
    border-top: 1px solid rgba(255, 255, 255, 0.12);
  }

  .info-label {
    display: block;
    color: #cbd5e1;
    text-align: center;
    font-size: 12px;
    font-weight: 500;
  }

  kbd {
    background: rgba(255, 255, 255, 0.18);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 4px;
    padding: 2px 7px;
    font-family: inherit;
    font-size: 12px;
    font-weight: 600;
    color: #ffffff;
  }
</style>

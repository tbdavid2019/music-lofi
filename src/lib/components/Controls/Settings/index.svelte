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
          <Settings size={16} class="settings-header-icon" />
          <h3 class="settings-title">控制面板</h3>
        </div>
        <button
          type="button"
          class="close-btn"
          on:click={() => (isActive = false)}
          aria-label="關閉設定"
          title="關閉"
        >
          <X size={16} />
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
          <Palette size={14} />
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
          <Volume2 size={14} />
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
          <Bookmark size={14} />
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

  .settings-container {
    position: absolute;
    right: 0;
    top: 50px;
    width: 380px;
    max-width: 90vw;
    height: 520px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    padding: 16px;
    border-radius: 20px;
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    background-color: rgb(15 18 28 / var(--menu-opacity, 0.94));
    border: 1px solid rgba(255, 255, 255, 0.16);
    box-shadow: 0 20px 48px rgba(0, 0, 0, 0.65), 0 0 1px rgba(255, 255, 255, 0.2);
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
    padding-bottom: 8px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  :global(.settings-header-icon) {
    color: #a855f7;
  }

  .settings-title {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    letter-spacing: 0.3px;
    color: #ffffff;
  }

  .close-btn {
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    transition: all 0.2s;
  }

  .close-btn:hover {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.1);
  }

  /* Segmented Tabs */
  .segmented-tabs {
    display: flex;
    background: rgba(0, 0, 0, 0.35);
    border-radius: 12px;
    padding: 3px;
    gap: 3px;
    margin-bottom: 14px;
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .tab-btn {
    flex: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 7px 10px;
    border-radius: 9px;
    border: 1px solid transparent;
    background: transparent;
    color: rgba(255, 255, 255, 0.7);
    font-size: 12.5px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .tab-btn:hover {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.08);
  }

  .tab-btn.selected {
    background: rgba(255, 255, 255, 0.16);
    border-color: rgba(255, 255, 255, 0.2);
    color: #ffffff;
    font-weight: 600;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
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
    background: rgba(255, 255, 255, 0.2);
    border-radius: 10px;
  }

  .tab-content-area::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.35);
  }

  .tab-panel {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  /* Footer */
  .settings-footer {
    padding-top: 10px;
    margin-top: auto;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }

  .info-label {
    display: block;
    color: rgba(255, 255, 255, 0.55);
    text-align: center;
    font-size: 11px;
  }

  kbd {
    background: rgba(255, 255, 255, 0.12);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    padding: 1px 5px;
    font-family: inherit;
    font-size: 10px;
    color: #ffffff;
  }
</style>

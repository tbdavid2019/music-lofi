<script lang="ts">
  import { Settings } from "lucide-svelte";
  import { onMount, onDestroy } from "svelte";
  import UIConfig from "./UIConfig.svelte";
  import Background from "./Background.svelte";
  import Volume from "./Volume.svelte";
  import PresetManager from "./PresetManager.svelte";
  import Timer from "../../Timer/Timer.svelte";

  let isActive = false;

  function toggle() {
    isActive = !isActive;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === "j" || e.key === "J") {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
      toggle();
    }
  }

  const handleClickOutside = (event: MouseEvent) => {
    if (
      isActive &&
      event.target instanceof HTMLElement &&
      !event.target.closest("#settings-box")
    ) {
      isActive = false;
    }
  };

  onMount(() => {
    window.addEventListener("keydown", handleKeydown);
    document.addEventListener("click", handleClickOutside);
    toggle();
    setTimeout(() => {
      toggle();
    }, 10);
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

<div id="settings-box">
  <button
    type="button"
    class="settings-trigger-btn"
    class:active={isActive}
    on:click={toggle}
    title="設定 (J)"
    aria-label="Settings"
  >
    <Settings size={22} color={isActive ? "black" : "white"} />
  </button>
  {#if isActive}
    <div class="settings-container">
      <div>
        <UIConfig />
        <Background />
        <Volume />
        <PresetManager />
        <Timer />
        <small class="info-label">按 ESC 鍵可查看更多資訊與說明</small>
      </div>
    </div>
  {/if}
</div>

<style>
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
    transition: all 0.2s ease;
  }
  .settings-trigger-btn.active {
    background-color: white;
  }
  #settings-box {
    position: relative;
  }
  .settings-container {
    position: absolute;
    right: 0;
    top: 70px;
    height: 58vh;
    padding: 10px 20px;
    width: 340px;
    color: white;
    border-radius: 20px;
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    background-color: rgb(0 0 0 / var(--menu-opacity, 0.6));
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.5);
    overflow-y: auto;
    z-index: 60;
  }
  .info-label {
    display: block;
    margin-top: 1rem;
    margin-bottom: 0.5rem;
    opacity: 0.6;
    text-align: center;
    font-size: 0.75rem;
  }
</style>

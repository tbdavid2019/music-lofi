<script lang="ts">
  import TimerControl from "../Timer/TimerControl.svelte";
  import Settings from "./Settings/index.svelte";
  import { Share2, Check, Download } from "@lucide/svelte";
  import { copyShareLink } from "../../utils/shareUtils";
  import { pwaStore, openPWAPrompt } from "../../stores/pwaStore";

  let isCopied = false;
  let copyTimeout: any = null;

  async function handleShare() {
    const success = await copyShareLink();
    if (success) {
      isCopied = true;
      if (copyTimeout) clearTimeout(copyTimeout);
      copyTimeout = setTimeout(() => {
        isCopied = false;
      }, 1500); // 1.5 秒自動回彈原狀

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("lofi:showToast", {
            detail: "✨ 專屬音樂空間連結已複製！好友開啟即可同步聆聽。",
          })
        );
      }
    }
  }
</script>

<div class="controls" aria-label="系統與專注控制塢">
  <!-- Pomodoro & Sleep Timer: 38px x 38px round glass button -->
  <TimerControl />

  <!-- Share Button: 38px x 38px round glass button with tooltip -->
  <button
    type="button"
    class="dock-icon-btn btn-share"
    class:copied={isCopied}
    on:click={handleShare}
    title="複製專屬音樂空間分享連結"
    aria-label="分享"
  >
    {#if isCopied}
      <Check size={18} class="share-icon check" />
    {:else}
      <Share2 size={18} class="share-icon" />
    {/if}
    <span class="dock-tooltip">
      {isCopied ? "已複製！" : "分享空間"}
    </span>
  </button>

  <!-- PWA Install Button: visible when not already standalone -->
  {#if !$pwaStore.isStandalone}
    <button
      type="button"
      class="dock-icon-btn btn-install"
      on:click={openPWAPrompt}
      title="安裝 888 Music 桌面 / 手機 App"
      aria-label="安裝 App"
    >
      <Download size={18} class="dock-install-icon" />
      <span class="dock-tooltip">安裝 App</span>
    </button>
  {/if}

  <!-- Settings: 38px x 38px round glass button -->
  <Settings />
</div>

<style>
  .controls {
    width: auto;
    height: 48px;
    color: white;
    display: inline-flex;
    align-items: center;
    padding: 0 6px;
    gap: 8px;
    border-radius: 50px;
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    background-color: rgba(14, 18, 28, 0.65);
    border: 1px solid rgba(255, 255, 255, 0.14);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
    z-index: 50;
    pointer-events: auto;
    position: relative;
    user-select: none;
  }

  .dock-icon-btn {
    position: relative;
    width: 38px;
    height: 38px;
    padding: 0;
    border-radius: 50%;
    aspect-ratio: 1/1;
    background: transparent;
    border: none;
    color: #e2e8f0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .dock-icon-btn:hover {
    background: rgba(255, 255, 255, 0.14);
    color: #ffffff;
  }

  .dock-icon-btn:focus-visible {
    outline: 2px solid #38bdf8;
    outline-offset: 2px;
  }

  .btn-share.copied {
    background: rgba(16, 185, 129, 0.25);
    color: #34d399;
  }

  :global(.share-icon) {
    transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  :global(.share-icon.check) {
    color: #34d399;
    transform: scale(1.1);
  }

  /* Shared dock tooltip */
  .dock-tooltip {
    position: absolute;
    top: 46px;
    left: 50%;
    transform: translateX(-50%) translateY(4px);
    background: rgba(14, 18, 28, 0.94);
    border: 1px solid rgba(255, 255, 255, 0.14);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    padding: 4px 8px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 500;
    color: #f1f5f9;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
    z-index: 60;
  }

  .dock-icon-btn:hover .dock-tooltip {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }

  @media only screen and (max-width: 600px) {
    .controls {
      position: relative;
      top: auto;
      right: auto;
      left: auto;
      transform: none;
      padding: 0 4px;
      gap: 4px;
      height: 42px;
    }

    .dock-icon-btn {
      width: 34px;
      height: 34px;
    }

    .dock-tooltip {
      display: none; /* Hide hover tooltips on mobile to avoid sticky tap artifacts */
    }
  }
</style>

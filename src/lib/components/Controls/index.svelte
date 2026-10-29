<script lang="ts">
  import TimerControl from "../Timer/TimerControl.svelte";
  import Settings from "./Settings/index.svelte";
  import { Share2, Check } from "@lucide/svelte";
  import { copyShareLink } from "../../utils/shareUtils";

  let isCopied = false;
  let copyTimeout: any = null;

  async function handleShare() {
    const success = await copyShareLink();
    if (success) {
      isCopied = true;
      if (copyTimeout) clearTimeout(copyTimeout);
      copyTimeout = setTimeout(() => {
        isCopied = false;
      }, 2200);

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
  <!-- Pomodoro & Sleep Timer -->
  <TimerControl />

  <!-- Top Right Share Button -->
  <button
    type="button"
    class="btn-top-share"
    class:copied={isCopied}
    on:click={handleShare}
    title="一鍵複製此空間直達分享連結 (Share)"
    aria-label="複製分享連結"
  >
    {#if isCopied}
      <Check size={18} class="share-icon check" />
      <span class="share-text">已複製</span>
    {:else}
      <Share2 size={17} class="share-icon" />
      <span class="share-text">分享</span>
    {/if}
  </button>

  <!-- Settings Gear -->
  <Settings />
</div>

<style>
  .controls {
    width: auto;
    height: 48px;
    color: white;
    display: inline-flex;
    align-items: center;
    padding: 4px 10px;
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

  .btn-top-share {
    height: 38px;
    padding: 0 12px;
    border-radius: 9999px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.12);
    color: #e2e8f0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .btn-top-share:hover {
    background: rgba(168, 85, 247, 0.2);
    border-color: rgba(168, 85, 247, 0.4);
    color: #ffffff;
    transform: translateY(-1px);
  }

  .btn-top-share:focus-visible {
    outline: 2px solid #38bdf8;
    outline-offset: 2px;
  }

  .btn-top-share.copied {
    background: rgba(16, 185, 129, 0.22);
    border-color: rgba(16, 185, 129, 0.45);
    color: #34d399;
  }

  :global(.share-icon) {
    transition: transform 0.2s ease;
  }

  :global(.share-icon.check) {
    color: #34d399;
  }

  .share-text {
    font-size: 13px;
    line-height: 1;
  }

  @media only screen and (max-width: 600px) {
    .controls {
      position: absolute;
      top: 16px;
      right: 16px;
      left: auto;
      transform: none;
      width: auto;
      padding: 4px 8px;
      gap: 6px;
    }

    .btn-top-share {
      width: 38px;
      height: 38px;
      padding: 0;
      border-radius: 50%;
    }

    .share-text {
      display: none;
    }
  }
</style>

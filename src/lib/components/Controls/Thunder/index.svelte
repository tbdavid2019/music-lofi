<script lang="ts">
  import { CloudLightning } from "@lucide/svelte";
  import { onDestroy, onMount } from "svelte";
  import { isLightningFlashingStore } from "../../../stores/ambientVisualStore";

  export let volume: number;

  let storm: HTMLAudioElement | null = null;
  let isStorming = false;
  let isFlashing = false;
  let flashTimer: any = null;
  let flashEndTimer: any = null;

  function getStormAudio() {
    if (!storm && typeof window !== "undefined") {
      storm = new Audio("assets/engine/effects/thunder.mp3");
      storm.loop = true;
    }
    return storm;
  }

  $: if (storm) {
    storm.volume = volume;
  }

  function scheduleNextFlash() {
    if (!isStorming) return;
    const delay = Math.random() * 8000 + 5000; // 5s - 13s
    flashTimer = setTimeout(() => {
      if (!isStorming) return;
      isFlashing = true;
      isLightningFlashingStore.set(true);
      flashEndTimer = setTimeout(() => {
        isFlashing = false;
        isLightningFlashingStore.set(false);
        scheduleNextFlash();
      }, 350);
    }, delay);
  }

  function clearFlashTimers() {
    if (flashTimer) clearTimeout(flashTimer);
    if (flashEndTimer) clearTimeout(flashEndTimer);
    flashTimer = null;
    flashEndTimer = null;
    isFlashing = false;
    isLightningFlashingStore.set(false);
  }

  function toggleStorm() {
    const a = getStormAudio();
    isStorming = !isStorming;
    if (isStorming) {
      if (a) {
        a.volume = volume;
        a.play().catch((e) => console.warn("Thunder audio play error:", e));
      }
      scheduleNextFlash();
    } else {
      a?.pause();
      clearFlashTimers();
    }
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
    if (e.key === "t" || e.key === "T" || e.key === "s" || e.key === "S") {
      toggleStorm();
    }
  }

  onMount(() => {
    window.addEventListener("keydown", handleKeydown);
  });

  onDestroy(() => {
    if (typeof window !== "undefined") {
      window.removeEventListener("keydown", handleKeydown);
    }
    clearFlashTimers();
    if (storm) {
      storm.pause();
      storm = null;
    }
  });
</script>

<div class="thunder-wrap">
  <button
    type="button"
    class="effect-btn"
    class:active={isStorming}
    on:click={toggleStorm}
    title="雷雨聲 (T / S)"
    aria-label="Thunderstorm"
  >
    <CloudLightning size={20} color={isStorming ? "black" : "white"} />
  </button>
</div>

<style>
  .thunder-wrap {
    position: relative;
    display: inline-flex;
    align-items: center;
  }

  .effect-btn {
    color: white;
    border-radius: 50%;
    aspect-ratio: 1/1;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: transparent;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .effect-btn:hover {
    background-color: rgba(255, 255, 255, 0.12);
  }

  .effect-btn.active {
    background-color: white;
  }
</style>

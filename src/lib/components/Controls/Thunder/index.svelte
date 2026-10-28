<script lang="ts">
  import { CloudLightning } from "@lucide/svelte";
  import { onDestroy } from "svelte";

  export let volume: number;

  let storm: HTMLAudioElement | null = null;
  let isStorming = false;

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

  function toggleStorm() {
    const a = getStormAudio();
    if (isStorming) {
      a?.pause();
    } else {
      if (a) {
        a.volume = volume;
        a.play().catch((e) => console.warn("Thunder audio play error:", e));
      }
    }
    isStorming = !isStorming;
  }

  function handleKeydown(e: KeyboardEvent) {
    const target = e.target as HTMLElement | null;
    if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
    if (e.key === "t" || e.key === "T" || e.key === "s" || e.key === "S") {
      toggleStorm();
    }
  }

  if (typeof window !== "undefined") {
    window.addEventListener("keydown", handleKeydown);
  }

  onDestroy(() => {
    if (typeof window !== "undefined") {
      window.removeEventListener("keydown", handleKeydown);
    }
    if (storm) {
      storm.pause();
      storm = null;
    }
  });
</script>

<button
  type="button"
  class="effect-btn"
  class:active={isStorming}
  on:click={toggleStorm}
  title="雷雨聲 (T/S)"
  aria-label="Thunderstorm"
>
  <CloudLightning size={22} color={isStorming ? "black" : "white"} />
</button>

<style>
  .effect-btn {
    color: white;
    border-radius: 50%;
    aspect-ratio: 1/1;
    width: 38px;
    height: 38px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: transparent;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .effect-btn.active {
    background-color: white;
  }
</style>

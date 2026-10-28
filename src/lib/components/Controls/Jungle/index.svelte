<script lang="ts">
  import { Trees } from "@lucide/svelte";
  import { onDestroy, onMount } from "svelte";

  export let volume: number;

  let jungle: HTMLAudioElement | null = null;
  let isActive = false;

  function getJungleAudio() {
    if (!jungle && typeof window !== "undefined") {
      jungle = new Audio("assets/engine/effects/jungle.mp3");
      jungle.loop = true;
    }
    return jungle;
  }

  $: if (jungle) {
    jungle.volume = volume;
  }

  function toggleSound() {
    const a = getJungleAudio();
    if (isActive) {
      a?.pause();
    } else {
      if (a) {
        a.volume = volume;
        a.play().catch((e) => console.warn("Jungle audio play error:", e));
      }
    }
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
    if (
      e.key === "e" ||
      e.key === "E" ||
      e.key === "d" ||
      e.key === "D" ||
      e.key === "j" ||
      e.key === "J"
    ) {
      toggleSound();
    }
  }

  onMount(() => {
    window.addEventListener("keydown", handleKeydown);
  });

  onDestroy(() => {
    if (typeof window !== "undefined") {
      window.removeEventListener("keydown", handleKeydown);
    }
    if (jungle) {
      jungle.pause();
      jungle = null;
    }
  });
</script>

<button
  type="button"
  class="effect-btn"
  class:active={isActive}
  on:click={toggleSound}
  title="叢林鳥鳴 (J / E / D)"
  aria-label="Jungle"
>
  <Trees size={20} color={isActive ? "black" : "white"} />
</button>

<style>
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

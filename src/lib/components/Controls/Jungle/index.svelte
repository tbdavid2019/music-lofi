<script lang="ts">
  import { Trees } from "@lucide/svelte";
  import { onDestroy } from "svelte";

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
    const target = e.target as HTMLElement | null;
    if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
    if (e.key === "e" || e.key === "E" || e.key === "d" || e.key === "D") {
      toggleSound();
    }
  }

  if (typeof window !== "undefined") {
    window.addEventListener("keydown", handleKeydown);
  }

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
  title="叢林鳥鳴 (E/D)"
  aria-label="Jungle"
>
  <Trees size={22} color={isActive ? "black" : "white"} />
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

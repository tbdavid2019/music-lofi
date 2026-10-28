<script lang="ts">
  import { Flame } from "@lucide/svelte";
  import { onDestroy, onMount } from "svelte";

  export let volume: number;

  let fire: HTMLAudioElement | null = null;
  let isFire = false;

  function getFireAudio() {
    if (!fire && typeof window !== "undefined") {
      fire = new Audio("assets/engine/effects/fire.mp3");
      fire.loop = true;
    }
    return fire;
  }

  $: if (fire) {
    fire.volume = volume;
  }

  function toggleFire() {
    const a = getFireAudio();
    if (isFire) {
      a?.pause();
    } else {
      if (a) {
        a.volume = volume;
        a.play().catch((e) => console.warn("Fire audio play error:", e));
      }
    }
    isFire = !isFire;
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
      e.key === "w" ||
      e.key === "W" ||
      e.key === "f" ||
      e.key === "F" ||
      e.key === "c" ||
      e.key === "C"
    ) {
      toggleFire();
    }
  }

  onMount(() => {
    window.addEventListener("keydown", handleKeydown);
  });

  onDestroy(() => {
    if (typeof window !== "undefined") {
      window.removeEventListener("keydown", handleKeydown);
    }
    if (fire) {
      fire.pause();
      fire = null;
    }
  });
</script>

<button
  type="button"
  class="effect-btn"
  class:active={isFire}
  on:click={toggleFire}
  title="營火聲 (W / F / C)"
  aria-label="Campfire"
>
  <Flame size={20} color={isFire ? "black" : "white"} />
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

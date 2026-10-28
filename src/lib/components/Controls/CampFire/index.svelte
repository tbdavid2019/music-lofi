<script lang="ts">
  import { Flame } from "@lucide/svelte";
  import { onDestroy } from "svelte";

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
    const target = e.target as HTMLElement | null;
    if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
    if (e.key === "w" || e.key === "W" || e.key === "f" || e.key === "F") {
      toggleFire();
    }
  }

  if (typeof window !== "undefined") {
    window.addEventListener("keydown", handleKeydown);
  }

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
  title="營火聲 (W/F)"
  aria-label="Campfire"
>
  <Flame size={22} color={isFire ? "black" : "white"} />
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

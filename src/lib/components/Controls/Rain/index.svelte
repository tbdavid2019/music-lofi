<script lang="ts">
  import { IconCloudRain } from "@tabler/icons-svelte";
  import { onDestroy, onMount } from "svelte";
  import * as Tone from "tone";
  import RainAnimation from "./RainAnimation.svelte";

  export let volume: number;

  const AMBIENT_GAIN_DB = 4;
  const linearToDb = (value: number) =>
    value === 0 ? -Infinity : 20 * Math.log10(value) + AMBIENT_GAIN_DB;

  let rainPlayer: Tone.GrainPlayer | null = null;
  let rainVolumeNode: Tone.Volume | null = null;
  let toneStarted = false;
  let isRaining = false;

  async function ensureToneStarted() {
    if (!toneStarted) {
      await Tone.start();
      toneStarted = true;
    }
  }

  async function toggleRain() {
    if (!rainPlayer) {
      await ensureToneStarted();
      await setupRainPlayer();
    }

    if (!rainPlayer) return;

    if (isRaining) {
      rainPlayer.stop();
    } else {
      await ensureToneStarted();
      rainPlayer.start();
    }

    isRaining = !isRaining;
  }

  async function setupRainPlayer() {
    if (rainPlayer) return;

    rainVolumeNode = new Tone.Volume(linearToDb(volume)).toDestination();
    rainPlayer = new Tone.GrainPlayer({
      url: "assets/engine/effects/rain.mp3",
      loop: true,
      autostart: false,
      grainSize: 1.2,
      overlap: 0.4,
    }).connect(rainVolumeNode);
    await rainPlayer.load();
  }

  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === "a") {
      toggleRain();
    }
  };

  onMount(() => {
    window.addEventListener("keydown", handleKeydown);
  });

  onDestroy(() => {
    window.removeEventListener("keydown", handleKeydown);
    rainPlayer?.dispose();
    rainVolumeNode?.dispose();
  });

  $: if (rainVolumeNode) {
    rainVolumeNode.volume.value = linearToDb(volume);
  }
</script>

<div>
  <button
    style={`
      background-color: ${isRaining ? "white" : "transparent"};
      `}
    on:click={toggleRain}
  >
    <IconCloudRain size={25} color={isRaining ? "black" : "white"} />
  </button>
  <RainAnimation {isRaining} />
</div>

<style>
  button {
    color: white;
    border-radius: 50%;
    aspect-ratio: 4/4;
  }
</style>

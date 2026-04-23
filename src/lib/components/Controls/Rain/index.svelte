<script lang="ts">
  import { IconCloudRain } from "@tabler/icons-svelte";
  import { onDestroy, onMount } from "svelte";
  import * as Tone from "tone";
  import RainAnimation from "./RainAnimation.svelte";

  export let volume: number;

  const AMBIENT_GAIN_DB = 4;
  const CROSSFADE_DURATION = 4; // Longer crossfade for smoothness
  const RAIN_URL = "assets/engine/effects/rain.mp3";

  const linearToDb = (value: number) =>
    value === 0 ? -Infinity : 20 * Math.log10(value) + AMBIENT_GAIN_DB;

  let playerA: Tone.Player | null = null;
  let playerB: Tone.Player | null = null;
  let gainA: Tone.Gain | null = null;
  let gainB: Tone.Gain | null = null;
  let masterVolume: Tone.Volume | null = null;
  let toneStarted = false;
  let isRaining = false;
  let scheduleId: number | null = null;
  let activePlayer: "A" | "B" = "A";
  let audioBuffer: Tone.ToneAudioBuffer | null = null;

  async function ensureToneStarted() {
    if (!toneStarted) {
      await Tone.start();
      toneStarted = true;
    }
  }

  async function setupPlayers() {
    if (playerA) return;

    masterVolume = new Tone.Volume(linearToDb(volume)).toDestination();
    
    // Use Gain nodes for linear crossfading (smoother than decibel Volume nodes)
    gainA = new Tone.Gain(1).connect(masterVolume);
    gainB = new Tone.Gain(0).connect(masterVolume);

    audioBuffer = new Tone.ToneAudioBuffer();
    await audioBuffer.load(RAIN_URL);

    playerA = new Tone.Player({
      url: audioBuffer,
      loop: false,
      autostart: false,
    }).connect(gainA);

    playerB = new Tone.Player({
      url: audioBuffer,
      loop: false,
      autostart: false,
    }).connect(gainB);
  }

  async function toggleRain() {
    if (!playerA) {
      await ensureToneStarted();
      await setupPlayers();
    }

    if (!playerA || !playerB) return;

    if (isRaining) {
      stopRain();
    } else {
      await ensureToneStarted();
      startRain();
    }

    isRaining = !isRaining;
  }

  function startRain() {
    if (!playerA || !playerB || !gainA || !gainB || !audioBuffer) return;

    activePlayer = "A";
    gainA.gain.value = 1;
    gainB.gain.value = 0;
    
    const startTime = Tone.now() + 0.1;
    playerA.start(startTime);

    const duration = audioBuffer.duration;
    if (duration <= 0) return;

    // Schedule the next crossfade precisely
    const interval = duration - CROSSFADE_DURATION;
    
    // Clear any existing schedule
    if (scheduleId !== null) Tone.Transport.clear(scheduleId);

    // Initial scheduling
    scheduleNextCrossfade(interval);
    
    if (Tone.Transport.state !== "started") {
      Tone.Transport.start();
    }
  }

  function scheduleNextCrossfade(interval: number) {
    scheduleId = Tone.Transport.scheduleOnce((time) => {
      if (!isRaining) return;
      performCrossfade(time);
      // Recursively schedule next
      scheduleNextCrossfade(interval);
    }, `+${interval}`);
  }

  function performCrossfade(time: number) {
    if (!playerA || !playerB || !gainA || !gainB) return;

    const incoming = activePlayer === "A" ? playerB : playerA;
    const outgoing = activePlayer === "A" ? playerA : playerB;
    const incomingGain = activePlayer === "A" ? gainB : gainA;
    const outgoingGain = activePlayer === "A" ? gainA : gainB;

    // Start incoming player precisely at crossfade time
    incoming.start(time);
    
    // Linear gain ramps are much smoother for noise/ambient loops
    incomingGain.gain.setValueAtTime(0, time);
    incomingGain.gain.linearRampToValueAtTime(1, time + CROSSFADE_DURATION);

    outgoingGain.gain.setValueAtTime(1, time);
    outgoingGain.gain.linearRampToValueAtTime(0, time + CROSSFADE_DURATION);

    // Stop outgoing player after fade out completes
    outgoing.stop(time + CROSSFADE_DURATION + 0.1);

    activePlayer = activePlayer === "A" ? "B" : "A";
  }

  function stopRain() {
    if (scheduleId !== null) {
      Tone.Transport.clear(scheduleId);
      scheduleId = null;
    }
    
    // Fade out everything
    const now = Tone.now();
    if (gainA) gainA.gain.rampTo(0, 0.8, now);
    if (gainB) gainB.gain.rampTo(0, 0.8, now);
    
    setTimeout(() => {
      try { playerA?.stop(); } catch(e) {}
      try { playerB?.stop(); } catch(e) {}
    }, 1000);
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
    if (scheduleId !== null) Tone.Transport.clear(scheduleId);
    playerA?.dispose();
    playerB?.dispose();
    gainA?.dispose();
    gainB?.dispose();
    masterVolume?.dispose();
  });

  $: if (masterVolume) {
    masterVolume.volume.value = linearToDb(volume);
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


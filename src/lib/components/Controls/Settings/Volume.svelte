<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { setMainVolume } from "../../../stores/radioStore";

  const STORAGE_KEY = "Volumes";
  const DEFAULT_VOLUMES = {
    rain: 1,
    thunder: 1,
    campfire: 1,
    jungle: 1,
    main_track: 1,
  };

  let volumes = loadVolumes();

  function loadVolumes() {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return { ...DEFAULT_VOLUMES, ...JSON.parse(raw) };
      } catch (e) {}
    }
    return { ...DEFAULT_VOLUMES };
  }

  function saveVolume() {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(volumes));
      window.dispatchEvent(new CustomEvent("volumesUpdated", { detail: volumes }));
    }
  }

  function updateRainVolume(e: any) {
    volumes.rain = parseFloat(e.target.value);
    saveVolume();
  }

  function updateThunderVolume(e: any) {
    volumes.thunder = parseFloat(e.target.value);
    saveVolume();
  }

  function updateJungleVolume(e: any) {
    volumes.jungle = parseFloat(e.target.value);
    saveVolume();
  }

  function updateFireVolume(e: any) {
    volumes.campfire = parseFloat(e.target.value);
    saveVolume();
  }

  function updateMainTrackVolume(e: any) {
    const val = parseFloat(e.target.value);
    volumes.main_track = val;
    setMainVolume(val);
    saveVolume();
  }

  function handleVolumesUpdated(e: any) {
    if (e.detail) {
      volumes = { ...DEFAULT_VOLUMES, ...e.detail };
    }
  }

  onMount(() => {
    window.addEventListener("volumesUpdated", handleVolumesUpdated);
  });

  onDestroy(() => {
    if (typeof window !== "undefined") {
      window.removeEventListener("volumesUpdated", handleVolumesUpdated);
    }
  });
</script>

<div class="volume-settings">
  <h4>音量控制 (Volume)</h4>
  <section id="main-track-volume">
    <div class="vol-label-row">
      <h5>主電台 (Main Radio)</h5>
      <span class="vol-num">{Math.round(volumes.main_track * 100)}%</span>
    </div>
    <input
      class="volume-slider"
      type="range"
      bind:value={volumes.main_track}
      min="0"
      max="1"
      step="0.01"
      on:input={updateMainTrackVolume}
      aria-label="Main Radio Volume"
    />
  </section>

  <section id="rain-volume">
    <div class="vol-label-row">
      <h5>雨聲 (Rain)</h5>
      <span class="vol-num">{Math.round(volumes.rain * 100)}%</span>
    </div>
    <input
      class="volume-slider"
      type="range"
      bind:value={volumes.rain}
      min="0"
      max="1"
      step="0.01"
      on:input={updateRainVolume}
      aria-label="Rain Volume"
    />
  </section>

  <section id="thunder-volume">
    <div class="vol-label-row">
      <h5>雷聲 (Thunder)</h5>
      <span class="vol-num">{Math.round(volumes.thunder * 100)}%</span>
    </div>
    <input
      class="volume-slider"
      type="range"
      bind:value={volumes.thunder}
      min="0"
      max="1"
      step="0.01"
      on:input={updateThunderVolume}
      aria-label="Thunder Volume"
    />
  </section>

  <section id="jungle-volume">
    <div class="vol-label-row">
      <h5>叢林 (Jungle)</h5>
      <span class="vol-num">{Math.round(volumes.jungle * 100)}%</span>
    </div>
    <input
      class="volume-slider"
      type="range"
      bind:value={volumes.jungle}
      min="0"
      max="1"
      step="0.01"
      on:input={updateJungleVolume}
      aria-label="Jungle Volume"
    />
  </section>

  <section id="fire-volume">
    <div class="vol-label-row">
      <h5>營火 (Campfire)</h5>
      <span class="vol-num">{Math.round(volumes.campfire * 100)}%</span>
    </div>
    <input
      class="volume-slider"
      type="range"
      bind:value={volumes.campfire}
      min="0"
      max="1"
      step="0.01"
      on:input={updateFireVolume}
      aria-label="Campfire Volume"
    />
  </section>
</div>

<style>
  .volume-settings {
    margin: 4px 0;
  }
  h4 {
    margin: 0 0 12px 0;
    font-size: 15px;
    font-weight: 700;
    letter-spacing: 0.2px;
    color: #ffffff;
  }
  section {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.14);
    border-radius: 12px;
    padding: 10px 12px;
    margin-bottom: 10px;
  }
  .vol-label-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }
  h5 {
    margin: 0;
    font-size: 13.5px;
    font-weight: 600;
    color: #ffffff;
  }
  .vol-num {
    font-size: 12.5px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    color: #fed7aa;
    background: rgba(251, 146, 60, 0.16);
    border: 1px solid rgba(251, 146, 60, 0.35);
    padding: 1px 7px;
    border-radius: 999px;
  }
  .volume-slider {
    width: 100%;
    height: 6px;
    border-radius: 3px;
    background: rgba(255, 255, 255, 0.25);
    accent-color: #fb923c;
    cursor: pointer;
  }
  .volume-slider:focus-visible {
    outline: 2px solid #38bdf8;
    outline-offset: 2px;
  }
</style>

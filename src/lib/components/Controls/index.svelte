<script lang="ts">
  import CampFire from "./CampFire/index.svelte";
  import Jungle from "./Jungle/index.svelte";
  import Rain from "./Rain/index.svelte";
  import Settings from "./Settings/index.svelte";
  import Thunder from "./Thunder/index.svelte";
  import { onMount, onDestroy } from "svelte";

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

<div class="controls">
  <Rain volume={volumes.rain} />
  <Thunder volume={volumes.thunder} />
  <Jungle volume={volumes.jungle} />
  <CampFire volume={volumes.campfire} />
  <Settings />
</div>

<style>
  .controls {
    width: 340px;
    height: 50px;
    color: white;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px;
    border-radius: 50px;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    background-color: rgba(0, 0, 0, 0.45);
    border: 1px solid rgba(255, 255, 255, 0.12);
    z-index: 50;
    pointer-events: auto;
    position: relative;
  }

  @media only screen and (max-width: 600px) {
    .controls {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      width: 85vw;
    }
  }
</style>

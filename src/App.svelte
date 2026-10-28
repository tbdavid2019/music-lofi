<script lang="ts">
  import PlayButton from "./lib/PlayButton.svelte";
  import TrackList from "./lib/components/TrackList/index.svelte";
  import Controls from "./lib/components/Controls/index.svelte";
  import TopBar from "./lib/components/TopBar/TopBar.svelte";
  import Info from "./lib/components/InfoBox/Info.svelte";
  import Config from "./lib/Config.svelte";
  import RainAnimation from "./lib/components/Controls/Rain/RainAnimation.svelte";
  import { bgUrl } from "./lib/stores/bgStore";
  import { isRainingStore, isLightningFlashingStore } from "./lib/stores/ambientVisualStore";
  import { onMount, tick } from "svelte";

  let isLoaded = false;
  let imgElement: HTMLImageElement | null = null;

  const onImageLoad = () => {
    isLoaded = true;
  };

  const onImageError = () => {
    console.warn("[App] Background image failed to load, falling back to /assets/background/bg2.jpg");
    if ($bgUrl !== "/assets/background/bg2.jpg") {
      bgUrl.set("/assets/background/bg2.jpg");
    } else {
      isLoaded = true;
    }
  };

  function checkImageComplete() {
    if (imgElement && imgElement.complete && imgElement.naturalWidth > 0) {
      isLoaded = true;
    }
  }

  $: if ($bgUrl) {
    isLoaded = false;
    tick().then(checkImageComplete);
  }

  onMount(() => {
    checkImageComplete();
  });
</script>

<main id="bg" class="container">
  {#if $bgUrl}
    <div class="bg-container" class:is-loaded={isLoaded}>
      <img
        bind:this={imgElement}
        src={$bgUrl}
        alt="background"
        on:load={onImageLoad}
        on:error={onImageError}
        class="bg-image"
      />
    </div>
  {/if}

  <!-- Full-screen Ambient Visual Overlays -->
  <RainAnimation isRaining={$isRainingStore} />
  {#if $isLightningFlashingStore}
    <div class="lightning-flash-overlay" aria-hidden="true"></div>
  {/if}

  <Config />
  <TopBar />
  <section class="content">
    <TrackList />
    <Controls />
    <Info />
  </section>
  <PlayButton />
</main>

<style>
  .container {
    max-width: 100vw;
    max-height: 100vh;
    height: 100vh;
    position: relative;
    overflow: hidden;
    background-color: black;
  }
  
  .bg-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    opacity: 0;
    transition: opacity 1.5s ease-in-out;
    pointer-events: none;
  }

  .bg-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    transform: scale(1.1);
    transition: transform 10s ease-out;
  }

  .bg-container.is-loaded {
    opacity: 1;
  }

  .bg-container.is-loaded .bg-image {
    transform: scale(1);
  }

  .content {
    padding: 24px;
    padding-top: 30px;
    height: 100vh;
    z-index: 20;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    position: relative;
    pointer-events: none;
  }
  
  :global(.content > *) {
    pointer-events: auto;
  }

  .lightning-flash-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(255, 255, 255, 0.32);
    pointer-events: none;
    z-index: 15;
    animation: lightning-pulse 0.35s ease-out;
  }

  @keyframes lightning-pulse {
    0% {
      opacity: 0;
    }
    15% {
      opacity: 0.95;
    }
    30% {
      opacity: 0.1;
    }
    45% {
      opacity: 0.85;
    }
    100% {
      opacity: 0;
    }
  }
</style>

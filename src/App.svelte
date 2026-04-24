<script lang="ts">
  import PlayButton from "./lib/PlayButton.svelte";
  import TrackList from "./lib/components/TrackList/index.svelte";
  import Controls from "./lib/components/Controls/index.svelte";
  import TopBar from "./lib/components/TopBar/TopBar.svelte";
  import Info from "./lib/components/InfoBox/Info.svelte";
  import Config from "./lib/Config.svelte";
  import { bgUrl } from "./lib/stores/bgStore";
  
  let isLoaded = false;
  
  const onImageLoad = () => {
    isLoaded = true;
  };

  $: if ($bgUrl) {
    isLoaded = false;
  }
</script>

<main id="bg" class="container">
  {#if $bgUrl}
    <div class="bg-container" class:is-loaded={isLoaded}>
      <img src={$bgUrl} alt="background" on:load={onImageLoad} class="bg-image" />
    </div>
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
  
  .content > * {
    pointer-events: auto;
  }
</style>

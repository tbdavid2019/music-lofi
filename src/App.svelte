<script lang="ts">
  import PlayButton from "./lib/PlayButton.svelte";
  import TrackList from "./lib/components/TrackList/index.svelte";
  import Controls from "./lib/components/Controls/index.svelte";
  import TopBar from "./lib/components/TopBar/TopBar.svelte";
  import Info from "./lib/components/InfoBox/Info.svelte";
  import Config from "./lib/Config.svelte";
  import RainAnimation from "./lib/components/Controls/Rain/RainAnimation.svelte";
  import { bgUrl } from "./lib/stores/bgStore";
  import { radioStore, setMainVolume } from "./lib/stores/radioStore";
  import { isRainingStore, isLightningFlashingStore } from "./lib/stores/ambientVisualStore";
  import { parseShareUrl } from "./lib/utils/shareUtils";
  import { Sparkles, X } from "@lucide/svelte";
  import { onMount, tick } from "svelte";

  let isLoaded = false;
  let imgElement: HTMLImageElement | null = null;
  let shareGreeting: string | null = null;

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

    // Check and apply deep link share state
    const shared = parseShareUrl();
    if (shared) {
      if (shared.stationId) {
        radioStore.update((s) => ({ ...s, currentStationId: shared.stationId }));
        localStorage.setItem("LofiEngine_Station", shared.stationId);
      }

      if (shared.bg !== undefined) {
        if (typeof shared.bg === "number") {
          localStorage.setItem("bg-id", shared.bg.toString());
          localStorage.setItem("activeBg", shared.bg.toString());
          localStorage.setItem("use-bing-api", "false");
          localStorage.setItem("use-beauty-api", "false");
          window.dispatchEvent(new CustomEvent("changeBg", { detail: shared.bg }));
        } else if (shared.bg === "bing") {
          localStorage.setItem("use-bing-api", "true");
          localStorage.setItem("use-beauty-api", "false");
          window.dispatchEvent(new CustomEvent("refreshBingBg"));
        } else if (shared.bg === "beauty") {
          localStorage.setItem("use-beauty-api", "true");
          localStorage.setItem("use-bing-api", "false");
          window.dispatchEvent(new CustomEvent("refreshBeautyBg"));
        }
      }

      if (shared.volumes) {
        try {
          localStorage.setItem("Volumes", JSON.stringify(shared.volumes));
          window.dispatchEvent(new CustomEvent("volumesUpdated", { detail: shared.volumes }));
          if (typeof shared.volumes.main_track === "number") {
            setMainVolume(shared.volumes.main_track);
          }
        } catch (err) {
          console.warn("[App] Failed to apply shared volumes:", err);
        }
      }

      shareGreeting = "✨ 已為您套用專屬分享空間！點擊下方播放鍵立即沉浸。";
      setTimeout(() => {
        shareGreeting = null;
      }, 9000);
    }
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

  <!-- Shared Link Welcome Banner -->
  {#if shareGreeting}
    <div class="share-welcome-banner" role="status">
      <div class="welcome-text-wrap">
        <Sparkles size={16} class="welcome-sparkle" />
        <span>{shareGreeting}</span>
      </div>
      <button
        type="button"
        class="btn-dismiss-welcome"
        on:click={() => (shareGreeting = null)}
        aria-label="關閉提示"
      >
        <X size={15} />
      </button>
    </div>
  {/if}

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

  /* Share Welcome Banner */
  .share-welcome-banner {
    position: fixed;
    top: 64px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 18px;
    background: rgba(14, 18, 28, 0.92);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(168, 85, 247, 0.45);
    border-radius: 9999px;
    box-shadow: 0 12px 36px rgba(0, 0, 0, 0.6), 0 0 18px rgba(168, 85, 247, 0.25);
    color: #f1f5f9;
    font-size: 0.86rem;
    font-weight: 500;
    z-index: 95;
    animation: bannerPop 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    max-width: min(580px, calc(100vw - 32px));
  }

  .welcome-text-wrap {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }

  :global(.welcome-sparkle) {
    color: #c084fc;
    flex-shrink: 0;
  }

  .btn-dismiss-welcome {
    background: rgba(255, 255, 255, 0.1);
    border: none;
    border-radius: 50%;
    width: 22px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #cbd5e1;
    cursor: pointer;
    flex-shrink: 0;
    transition: all 0.2s ease;
  }

  .btn-dismiss-welcome:hover {
    background: rgba(255, 255, 255, 0.2);
    color: #ffffff;
  }

  @keyframes bannerPop {
    from {
      opacity: 0;
      transform: translate(-50%, -10px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translate(-50%, 0) scale(1);
    }
  }

  @media (max-width: 640px) {
    .share-welcome-banner {
      top: 56px;
      font-size: 0.78rem;
      padding: 8px 14px;
      border-radius: 14px;
    }
  }
</style>

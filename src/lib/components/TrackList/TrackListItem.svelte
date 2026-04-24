<script lang="ts">
  import { afterUpdate, onMount } from "svelte";

  export let setMeVisible;
  export let activeAudios = [];
  export let track = {
    id: -1,
    track: "none",
    title: "Track",
    qoute: "none",
    isPlaying: false,
  };

  export let visibleTrackId = -1;
  let trackItemAnimationClass = "item-hidden";
  let volume = 0.5;

  function updateAnimation() {
    if (track.id == visibleTrackId) {
      trackItemAnimationClass = "item-visible";
    } else if (track.id + 1 == visibleTrackId) {
      trackItemAnimationClass = "item-before-visible";
    } else if (track.id - 1 == visibleTrackId) {
      trackItemAnimationClass = "item-after-visible";
    }
    // Edge tracks
    else if (track.id == 9 && visibleTrackId == 1) {
      trackItemAnimationClass = "item-before-visible";
    } else if (track.id == 1 && visibleTrackId == 9) {
      trackItemAnimationClass = "item-after-visible";
    } else {
      trackItemAnimationClass = "item-hidden";
    }
  }

  function handleVolumeChange(event) {
    volume = event.target.value;
    localStorage.setItem("audioVolume", volume.toString());
    activeAudios.forEach((item) => {
      if (item.id === track.id) {
        item.audio.volume = volume;
      }
    });
  }

  function playTrack() {
    const audio = new Audio(`assets/engine/tracks/${track.track}`);
    audio.volume = volume;
    audio.play();
    audio.loop = true;
    activeAudios.push({
      id: track.id,
      audio,
    });
    track.isPlaying = true;
    setMeVisible(track.id);
  }

  function pauseTrack() {
    activeAudios.forEach((item) => {
      if (item.id === track.id) {
        item.audio.pause();
      }
    });
    track.isPlaying = false;
  }

  onMount(() => {
    const savedVolume = localStorage.getItem("audioVolume");
    if (savedVolume !== null) {
      volume = parseFloat(savedVolume);
    }
  });

  updateAnimation();
  afterUpdate(updateAnimation);
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
  on:contextmenu={() => {
    if (!track.isPlaying) {
      setMeVisible(track.id);
    }
  }}
  on:click={() => {
    track.isPlaying ? pauseTrack() : playTrack();
  }}
  class={"carousel__item " + trackItemAnimationClass}
>
  <div class={"carousel__item-body " + (track.isPlaying ? "playing" : "")}>
    <img
      class="carousel__item-body__img"
      src="assets/images/{track.id}.jpg"
      alt=""
    />
    <div>
      <p id="title">{track.title || `Track ${track.id}`}</p>
      <p id="info">{track?.qoute}</p>
    {#if track.isPlaying}
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        bind:value={volume}
        on:input={handleVolumeChange}
        on:click={e => e.stopPropagation()}
        id="volume-slider"
        class="volume-slider"
      />
    {/if}
    </div>
  </div>
</div>

<style>
  .carousel__item {
    display: flex;
    align-items: center;
    position: absolute;
    width: 100%;
    will-change: transform, opacity;
    transition-duration: 500ms;
  }
  .carousel__item-body {
    position: relative;
    width: 100%;
    color: white;
    border-radius: 16px;
    padding: 16px;
    display: flex;
    gap: 16px;
    min-width: 320px;
    background-color: rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
    overflow: hidden;
  }

  .carousel__item-body:hover {
    background-color: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
    box-shadow: 0 12px 40px 0 rgba(0, 0, 0, 0.4);
  }

  .carousel__item-body__img {
    width: 80px;
    min-width: 80px;
    height: 80px;
    border-radius: 12px;
    overflow: hidden;
    object-fit: cover;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  .carousel__item-body > div {
    display: flex;
    flex-direction: column;
    justify-content: center;
    flex: 1;
    overflow: hidden;
  }

  #title {
    font-size: 20px;
    font-weight: 600;
    margin: 0 0 4px 0;
    letter-spacing: -0.01em;
  }

  #info {
    font-size: 13px;
    font-weight: 400;
    color: rgba(255, 255, 255, 0.6);
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    margin: 0;
  }
  
  .playing {
    background-color: rgba(250, 212, 192, 0.1);
    border-color: rgba(250, 212, 192, 0.4);
    box-shadow: 0 0 20px rgba(250, 212, 192, 0.15);
  }

  .playing #title {
    color: #fad4c0;
  }
  .item-visible {
    opacity: 1;
    visibility: visible;
  }
  .item-hidden {
    opacity: 0.2;
    visibility: hidden;
    animation-duration: 0ms;
    transform: scale(0.1);
  }
  .item-before-visible {
    opacity: 0.5;
    visibility: visible;
    transform: scale(0.8) translate(0, -150px);
  }
  .item-after-visible {
    opacity: 0.5;
    visibility: visible;
    transform: scale(0.8) translate(0, 150px);
  }
  .volume-slider {
    margin-top: 12px;
    width: 100%;
    height: 4px;
    -webkit-appearance: none;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
    outline: none;
  }

  .volume-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 12px;
    height: 12px;
    background: #fad4c0;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 0 10px rgba(250, 212, 192, 0.5);
  }

  .volume-slider::-moz-range-thumb {
    width: 12px;
    height: 12px;
    background: #fad4c0;
    border-radius: 50%;
    cursor: pointer;
    border: none;
    box-shadow: 0 0 10px rgba(250, 212, 192, 0.5);
  }

  @media only screen and (max-width: 600px) {
    .carousel__item {
      position: relative;
      margin-bottom: 10px;
    }
    
    .carousel__item-body {
      min-width: auto;
      width: 100%;
      padding: 12px;
      gap: 12px;
      border-radius: 14px;
    }
    
    .carousel__item-body__img {
      width: 60px;
      min-width: 60px;
      height: 60px;
      border-radius: 8px;
    }
    
    #title {
      font-size: 18px;
    }
    
    #info {
      font-size: 12px;
      opacity: 0.7;
    }
    
    .item-visible {
      opacity: 1;
      transform: scale(1);
    }
    
    .item-hidden {
      opacity: 0.4;
      visibility: visible;
      transform: scale(0.95);
    }
    
    .item-before-visible,
    .item-after-visible {
      opacity: 0.6;
      visibility: visible;
      transform: scale(0.98);
    }
    
    .volume-slider {
      margin-top: 8px;
    }
  }
</style>

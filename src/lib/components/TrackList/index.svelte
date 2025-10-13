<script lang="ts">
  import { IconChevronDown, IconChevronUp } from "@tabler/icons-svelte";
  import TrackListItem from "./TrackListItem.svelte";

  // Mobile visibility toggle
  let isMobileVisible = false;

  let tracks = [
    {
      id: 1,
      track: "Wind-Mark_DiAngelo-1940285615.mp3",
      title: "風聲",
      qoute: "We cannot direct the wind, but we can adjust the sails.",
      isPlaying: false,
    },
    {
      id: 2,
      track: "small-waves-onto-the-sand-143040.mp3",
      title: "海灘聲",
      qoute: "Sea is emotion incarnate. It loves, hates, and weeps.",
      isPlaying: false,
    },
    {
      id: 3,
      track: "night-ambience-17064.mp3",
      title: "夜晚氛圍",
      qoute: "The night reveals the stars as the darkness reveals the self.",
      isPlaying: false,
    },
    {
      id: 4,
      track: "urban-seagulls-30068.mp3",
      title: "海鷗聲",
      qoute: "The sunset sky speaks of a thousand of colors.",
      isPlaying: false,
    },
    {
      id: 5,
      track: "office-ambience-6322.mp3",
      title: "辦公室",
      qoute: "Work hard in silence, let your success be your noise.",
      isPlaying: false,
    },
    {
      id: 6,
      track: "city-ambience-9272.mp3",
      title: "城市聲",
      qoute: "The city is not a concrete jungle, it is a human zoo.",
      isPlaying: false,
    },
    {
      id: 7,
      track: "old-server-turning-on-and-off-24540.mp3",
      title: "伺服器",
      qoute: "The past is a place of reference, not a place of residence.",
      isPlaying: false,
    },
    {
      id: 8,
      track: "train-to-munich-germany.mp3",
      title: "火車聲",
      qoute: "Trips don't last forever, but memories do.",
      isPlaying: false,
    },
    {
      id: 9,
      track: "underwater-white-noise-46423.mp3",
      title: "水下白噪音",
      qoute: "Please help me, I'm underwater.",
      isPlaying: false,
    },
  ];

  let activeAudios = [];

  // Shortcut for stoping all effects with "k" key
  window.addEventListener("keydown", (e) => {
    if (e.key === "k") {
      activeAudios.forEach((item) => {
        item.audio.pause();
      });
      console.log("activeAudios", activeAudios);
      activeAudios = [];
      tracks.forEach((track) => {
        track.isPlaying = false;
      });
    }
  });

  // Add toggle for each track with number keys
  //  through (1-9) on keyboard
  for (let i = 1; i < 10; i++) {
    window.addEventListener("keydown", (e) => {
      if (e.key === i.toString()) {
        tracks[i - 1].isPlaying = !tracks[i - 1].isPlaying;
        if (tracks[i - 1].isPlaying) {
          const audio = new Audio(
            `assets/engine/tracks/${tracks[i - 1].track}`
          );
          audio.play();
          audio.loop = true;
          activeAudios.push({
            id: tracks[i - 1].id,
            audio,
          });
          visibleTrackId = i;
        } else {
          activeAudios.forEach((item) => {
            if (item.id === tracks[i - 1].id) {
              item.audio.pause();
              // Remove from activeAudios
              activeAudios = activeAudios.filter(
                (item) => item.id !== tracks[i - 1].id
              );
            }
          });
        }
      }
    });
  }

  // Visible tracks animation
  let visibleTrackId = 1;
  window.addEventListener("keydown", (e) => {
    // Ignore change when event is targeting inputs
    if (e.target instanceof HTMLElement && !e.target.closest("input")) {
      if (e.key == "ArrowUp") {
        prevTrack();
      }
      if (e.key == "ArrowDown") {
        nextTrack();
      }
    }
  });

  function nextTrack() {
    visibleTrackId < 9 ? visibleTrackId++ : (visibleTrackId = 1);
  }
  function prevTrack() {
    visibleTrackId > 1 ? visibleTrackId-- : (visibleTrackId = 9);
  }
  
  function toggleMobileVisibility() {
    isMobileVisible = !isMobileVisible;
  }
</script>

<div class="track-list" class:mobile-visible={isMobileVisible}>
  <!-- Mobile toggle button -->
  <button class="mobile-toggle" on:click={toggleMobileVisibility}>
    {#if isMobileVisible}
      <IconChevronDown size={20} />
      <span>隱藏音軌</span>
    {:else}
      <IconChevronUp size={20} />
      <span>顯示音軌 ({tracks.filter(t => t.isPlaying).length}/{tracks.length})</span>
    {/if}
  </button>
  
  <div class="wrapper">
    <div class="carousel">
      {#each tracks as track}
        <TrackListItem
          {activeAudios}
          {track}
          {visibleTrackId}
          setMeVisible={(id) => (visibleTrackId = id)}
        />
      {/each}
    </div>
  </div>
  <div id="btn-view">
    <button id="navigate-btn" on:click={prevTrack}>
      <IconChevronDown />
    </button>
  </div>
</div>

<style>
  .track-list {
    width: 28vw;
    height: 65vh;
    padding: 20px 10px;
    border-radius: 20px;
    backdrop-filter: blur(0px);
    z-index: 20;
  }

  .wrapper {
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .carousel {
    position: relative;
    width: 100%;
    max-width: 500px;
    display: flex;
    justify-content: center;
    flex-direction: column;
  }
  #btn-view {
    width: 120%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  #navigate-btn {
    width: 30px;
    height: 30px;
    color: white;
    border-radius: 99px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  #navigate-btn:hover {
    background-color: rgba(0, 0, 0, 30%);
    backdrop-filter: blur(10px);
  }

  .mobile-toggle {
    display: none;
  }

  @media only screen and (max-width: 600px) {
    .track-list {
      width: 95vw;
      height: auto;
      max-height: 65vh;
      padding: 0;
      position: fixed;
      bottom: 100px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(15px);
      border-radius: 15px;
      overflow: hidden;
      transition: all 0.3s ease;
    }
    
    .track-list:not(.mobile-visible) {
      max-height: 50px;
      bottom: 20px;
    }
    
    .track-list:not(.mobile-visible) .wrapper,
    .track-list:not(.mobile-visible) #btn-view {
      display: none;
    }
    
    .mobile-toggle {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      padding: 12px;
      background: rgba(102, 126, 234, 0.3);
      border: none;
      color: white;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s;
    }
    
    .mobile-toggle:active {
      background: rgba(102, 126, 234, 0.5);
    }
    
    .wrapper {
      height: auto;
      max-height: 55vh;
      overflow-y: auto;
      padding: 10px;
    }
    
    .carousel {
      max-width: 100%;
    }
    
    #btn-view {
      margin-top: 0;
      width: 100%;
      padding: 10px;
      background: rgba(0, 0, 0, 0.3);
    }
    
    #navigate-btn {
      background: rgba(255, 255, 255, 0.15);
    }
  }
</style>

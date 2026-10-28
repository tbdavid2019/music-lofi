<script lang="ts">
  import {
    Wind,
    Waves,
    Moon,
    Music,
    Building,
    Building2,
    Server,
    Train,
    Droplets,
  } from "@lucide/svelte";
  import { onMount, onDestroy } from "svelte";

  interface TrackItem {
    id: number;
    name: string;
    icon: any;
    file: string;
    isPlaying: boolean;
    audio: HTMLAudioElement | null;
  }

  let tracks: TrackItem[] = [
    {
      id: 1,
      name: "風聲",
      icon: Wind,
      file: "assets/engine/tracks/Wind-Mark_DiAngelo-1940285615.mp3",
      isPlaying: false,
      audio: null,
    },
    {
      id: 2,
      name: "海灘聲",
      icon: Waves,
      file: "assets/engine/tracks/small-waves-onto-the-sand-143040.mp3",
      isPlaying: false,
      audio: null,
    },
    {
      id: 3,
      name: "夜晚氛圍",
      icon: Moon,
      file: "assets/engine/tracks/night-ambience-17064.mp3",
      isPlaying: false,
      audio: null,
    },
    {
      id: 4,
      name: "海鷗聲",
      icon: Music,
      file: "assets/engine/tracks/urban-seagulls-30068.mp3",
      isPlaying: false,
      audio: null,
    },
    {
      id: 5,
      name: "辦公室",
      icon: Building,
      file: "assets/engine/tracks/office-ambience-6322.mp3",
      isPlaying: false,
      audio: null,
    },
    {
      id: 6,
      name: "城市聲",
      icon: Building2,
      file: "assets/engine/tracks/city-ambience-9272.mp3",
      isPlaying: false,
      audio: null,
    },
    {
      id: 7,
      name: "伺服器",
      icon: Server,
      file: "assets/engine/tracks/old-server-turning-on-and-off-24540.mp3",
      isPlaying: false,
      audio: null,
    },
    {
      id: 8,
      name: "火車聲",
      icon: Train,
      file: "assets/engine/tracks/train-to-munich-germany.mp3",
      isPlaying: false,
      audio: null,
    },
    {
      id: 9,
      name: "水下白噪音",
      icon: Droplets,
      file: "assets/engine/tracks/underwater-white-noise-46423.mp3",
      isPlaying: false,
      audio: null,
    },
  ];

  function toggleTrack(track: TrackItem) {
    if (track.isPlaying) {
      if (track.audio) {
        track.audio.pause();
        track.audio.currentTime = 0;
      }
      track.isPlaying = false;
    } else {
      if (!track.audio) {
        track.audio = new Audio(track.file);
        track.audio.loop = true;
        track.audio.volume = 0.4;
      }
      track.audio.play().catch((e) => {
        console.warn(`${track.name} 播放失敗:`, e);
      });
      track.isPlaying = true;
    }
    tracks = [...tracks];
  }

  function stopAllTracks() {
    tracks.forEach((track) => {
      if (track.isPlaying && track.audio) {
        track.audio.pause();
        track.audio.currentTime = 0;
        track.isPlaying = false;
      }
    });
    tracks = [...tracks];
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const target = e.target as HTMLElement | null;
    if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;

    const trackIndex = parseInt(e.key, 10) - 1;
    if (trackIndex >= 0 && trackIndex < tracks.length) {
      e.preventDefault();
      toggleTrack(tracks[trackIndex]);
    } else if (e.key.toLowerCase() === "k") {
      e.preventDefault();
      stopAllTracks();
    }
  }

  onMount(() => {
    window.addEventListener("keydown", handleKeydown);
  });

  onDestroy(() => {
    if (typeof window !== "undefined") {
      window.removeEventListener("keydown", handleKeydown);
    }
    stopAllTracks();
  });
</script>

<div class="ambient-tracks">
  <div class="tracks-grid">
    {#each tracks as track (track.id)}
      <button
        type="button"
        class="track-button"
        class:active={track.isPlaying}
        on:click={() => toggleTrack(track)}
      >
        <div class="track-icon">
          <svelte:component this={track.icon} size={22} />
        </div>
        <div class="track-name">{track.name}</div>
        <div class="track-status">
          {track.isPlaying ? "ON" : "OFF"}
        </div>
      </button>
    {/each}
  </div>
</div>

<style>
  .ambient-tracks {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    margin-top: 1rem;
  }

  .tracks-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 0.5rem;
    width: 100%;
  }

  .track-button {
    width: 100%;
    height: 72px;
    background: rgba(255, 255, 255, 0.08);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.25s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
    backdrop-filter: blur(5px);
    padding: 0.3rem;
    box-sizing: border-box;
  }

  .track-button:hover {
    background: rgba(255, 255, 255, 0.16);
    transform: translateY(-2px);
  }

  .track-button.active {
    background: rgba(74, 222, 128, 0.25);
    border-color: rgba(74, 222, 128, 0.6);
    box-shadow: 0 0 18px rgba(74, 222, 128, 0.3);
  }

  .track-icon {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .track-button.active .track-icon {
    color: #4ade80;
  }

  .track-name {
    font-size: 0.82rem;
    font-weight: 500;
    text-align: center;
    line-height: 1.1;
  }

  .track-status {
    font-size: 0.7rem;
    opacity: 0.8;
    font-weight: bold;
    line-height: 1;
  }

  @media (max-width: 768px) {
    .tracks-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }
</style>

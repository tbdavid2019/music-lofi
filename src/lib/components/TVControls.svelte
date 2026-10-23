<script lang="ts">
  import {
    CloudRain,
    CloudLightning,
    Flame,
    Trees,
    Plus,
    Minus,
  } from "lucide-svelte";
  import { onMount, onDestroy } from "svelte";

  type EffectKey = "rain" | "thunder" | "campfire" | "jungle";

  interface EffectItem {
    key: EffectKey;
    icon: typeof CloudRain;
    name: string;
    en: string;
    file: string;
    active: boolean;
    volume: number;
    audio: HTMLAudioElement | null;
  }

  let effectList: EffectItem[] = [
    {
      key: "rain",
      icon: CloudRain,
      name: "雨聲",
      en: "Rain",
      file: "assets/engine/effects/rain.mp3",
      active: false,
      volume: 0.5,
      audio: null,
    },
    {
      key: "thunder",
      icon: CloudLightning,
      name: "雷聲",
      en: "Thunder",
      file: "assets/engine/effects/thunder.mp3",
      active: false,
      volume: 0.4,
      audio: null,
    },
    {
      key: "campfire",
      icon: Flame,
      name: "營火",
      en: "Campfire",
      file: "assets/engine/effects/fire.mp3",
      active: false,
      volume: 0.6,
      audio: null,
    },
    {
      key: "jungle",
      icon: Trees,
      name: "叢林",
      en: "Jungle",
      file: "assets/engine/effects/jungle.mp3",
      active: false,
      volume: 0.5,
      audio: null,
    },
  ];

  function toggleEffect(item: EffectItem) {
    if (item.active) {
      if (item.audio) {
        item.audio.pause();
        item.audio.currentTime = 0;
      }
      item.active = false;
    } else {
      if (!item.audio) {
        item.audio = new Audio(item.file);
        item.audio.loop = true;
        item.audio.volume = item.volume;
      }
      item.audio.play().catch((e) => {
        console.warn(`${item.name} 音效播放失敗:`, e);
      });
      item.active = true;
    }
    effectList = [...effectList];
  }

  function adjustEffectVolume(item: EffectItem, delta: number) {
    item.volume = Math.max(0, Math.min(1, item.volume + delta));
    if (item.audio) {
      item.audio.volume = item.volume;
    }
    effectList = [...effectList];
  }

  function stopAllEffects() {
    effectList.forEach((item) => {
      if (item.active && item.audio) {
        item.audio.pause();
        item.audio.currentTime = 0;
        item.active = false;
      }
    });
    effectList = [...effectList];
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const target = e.target as HTMLElement | null;
    if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;

    switch (e.code) {
      case "KeyQ":
      case "KeyA":
        e.preventDefault();
        toggleEffect(effectList[0]);
        break;
      case "KeyE":
      case "KeyS":
        e.preventDefault();
        toggleEffect(effectList[1]);
        break;
      case "KeyW":
      case "KeyF":
        e.preventDefault();
        toggleEffect(effectList[2]);
        break;
      case "KeyR":
      case "KeyD":
        e.preventDefault();
        toggleEffect(effectList[3]);
        break;
      case "KeyK":
        e.preventDefault();
        stopAllEffects();
        break;
    }
  }

  onMount(() => {
    window.addEventListener("keydown", handleKeydown);
  });

  onDestroy(() => {
    if (typeof window !== "undefined") {
      window.removeEventListener("keydown", handleKeydown);
    }
    stopAllEffects();
  });
</script>

<div class="tv-controls">
  <div class="effects-grid">
    {#each effectList as item (item.key)}
      <div class="effect-item">
        <button
          type="button"
          class="effect-button"
          class:active={item.active}
          on:click={() => toggleEffect(item)}
        >
          <div class="effect-icon">
            <svelte:component this={item.icon} size={24} />
          </div>
          <div class="effect-name">{item.name}</div>
          <div class="effect-status">
            {item.active ? "ON" : "OFF"}
          </div>
        </button>

        <div class="volume-controls">
          <span class="volume-label">音量: {Math.round(item.volume * 100)}%</span>
          <div class="volume-buttons">
            <button
              type="button"
              class="volume-adjust-btn"
              on:click={() => adjustEffectVolume(item, -0.1)}
              disabled={!item.active}
              aria-label="降低音量"
            >
              <Minus size={14} />
            </button>
            <button
              type="button"
              class="volume-adjust-btn"
              on:click={() => adjustEffectVolume(item, 0.1)}
              disabled={!item.active}
              aria-label="提高音量"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .tv-controls {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  .effects-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.5rem;
    flex: 1;
    min-height: 0;
  }

  .effect-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .effect-button {
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

  .effect-button:hover {
    background: rgba(255, 255, 255, 0.16);
    transform: translateY(-2px);
  }

  .effect-button.active {
    background: rgba(74, 222, 128, 0.25);
    border-color: rgba(74, 222, 128, 0.6);
    box-shadow: 0 0 18px rgba(74, 222, 128, 0.3);
  }

  .effect-icon {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .effect-button.active .effect-icon {
    color: #4ade80;
  }

  .effect-name {
    font-size: 0.85rem;
    font-weight: 500;
    line-height: 1.1;
  }

  .effect-status {
    font-size: 0.7rem;
    opacity: 0.8;
    font-weight: bold;
    line-height: 1;
  }

  .volume-controls {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.3rem;
    width: 100%;
  }

  .volume-label {
    font-size: 0.75rem;
    opacity: 0.8;
  }

  .volume-buttons {
    display: flex;
    gap: 0.5rem;
  }

  .volume-adjust-btn {
    width: 28px;
    height: 28px;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }

  .volume-adjust-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
  }

  .volume-adjust-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    .effects-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 0.75rem;
    }
    .effect-button {
      width: 100%;
      height: 76px;
    }
  }
</style>

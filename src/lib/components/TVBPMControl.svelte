<script lang="ts">
  import {
    Radio,
    Coffee,
    Headphones,
    Disc,
    Music2,
    Music,
    Moon,
  } from "@lucide/svelte";
  import {
    radioStore,
    STATIONS,
    playStation,
    type Station,
  } from "../stores/radioStore";

  function selectStation(station: Station) {
    playStation(station.id, true);
  }
</script>

<div class="tv-station-selector">
  <div class="selector-header">
    <div class="title-with-icon">
      <Radio size={20} class="header-icon" />
      <h3 class="selector-title">音樂電台頻道</h3>
    </div>
    <span class="active-label">
      {STATIONS.find((s) => s.id === $radioStore.currentStationId)?.label || ""}
    </span>
  </div>

  <div class="stations-grid">
    {#each STATIONS as station (station.id)}
      <button
        type="button"
        class="station-card"
        class:active={$radioStore.currentStationId === station.id}
        on:click={() => selectStation(station)}
        title={station.description}
      >
        <div class="card-icon">
          {#if station.icon === 'coffee'}
            <Coffee size={24} />
          {:else if station.icon === 'headphones'}
            <Headphones size={24} />
          {:else if station.icon === 'disc'}
            <Disc size={24} />
          {:else if station.icon === 'music2'}
            <Music2 size={24} />
          {:else if station.icon === 'music'}
            <Music size={24} />
          {:else if station.icon === 'moon'}
            <Moon size={24} />
          {/if}
        </div>
        <div class="card-info">
          <div class="card-name">{station.label}</div>
          <div class="card-sub">{station.name}</div>
        </div>
        {#if $radioStore.currentStationId === station.id}
          <div class="active-indicator"></div>
        {/if}
      </button>
    {/each}
  </div>
</div>

<style>
  .tv-station-selector {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 18px;
    padding: 1.2rem;
    backdrop-filter: blur(12px);
    width: 100%;
    box-sizing: border-box;
  }

  .selector-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 0.6rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .title-with-icon {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  :global(.header-icon) {
    color: #a855f7;
  }

  .selector-title {
    font-size: 1.15rem;
    font-weight: 600;
    margin: 0;
    color: #ffffff;
  }

  .active-label {
    font-size: 0.9rem;
    color: #a855f7;
    font-weight: 500;
    background: rgba(168, 85, 247, 0.15);
    padding: 2px 10px;
    border-radius: 9999px;
  }

  .stations-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }

  .station-card {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    padding: 0.75rem 1rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    color: #ffffff;
    cursor: pointer;
    text-align: left;
    position: relative;
    transition: all 0.2s ease;
  }

  .station-card:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.25);
    transform: translateY(-2px);
  }

  .station-card.active {
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(168, 85, 247, 0.3));
    border-color: rgba(168, 85, 247, 0.6);
    box-shadow: 0 4px 16px rgba(168, 85, 247, 0.25);
  }

  .card-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.85);
  }

  .station-card.active .card-icon {
    color: #a855f7;
  }

  .card-info {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .card-name {
    font-size: 0.95rem;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .card-sub {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.55);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .active-indicator {
    position: absolute;
    right: 10px;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #a855f7;
    box-shadow: 0 0 8px #a855f7;
  }
</style>

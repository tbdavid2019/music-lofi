<script lang="ts">
  import { IconSettings } from "@tabler/icons-svelte";
  import { onMount } from "svelte";
  import Background from "./Background.svelte";
  import Volume from "./Volume.svelte";
  import InstrumentControls from "./InstrumentControls.svelte";
  import PresetManager from "./PresetManager.svelte";
  import Recorder from "../../Recorder/Recorder.svelte";
  import Timer from "../../Timer/Timer.svelte";
  import BPMControl from "./BPMControl.svelte";

  let isActive = false;

  function toggle() {
    isActive = !isActive;
  }

  // 處理 BPM 變更
  function handleBPMChange(event) {
    const newBPM = event.detail;
    // 發送 BPM 變更事件到父組件
    window.dispatchEvent(new CustomEvent('bpmChange', { detail: newBPM }));
  }

  // Shortuct to toggle settings with "J" key
  window.addEventListener("keydown", (e) => {
    if (e.key === "j") {
      toggle();
    }
  });

  // when mounted toggle settings
  // to excute settings of children (old saved)
  onMount(() => {
    toggle();
    setTimeout(() => {
      toggle();
    }, 10);
  });

  const handleClickOutside = (event: MouseEvent) => {
    if (
      isActive &&
      event.target instanceof HTMLElement &&
      !event.target.closest("#settings-box")
    ) {
      isActive = false;
    }
  };
  document.addEventListener("click", handleClickOutside);
</script>

<div id="settings-box">
  <button
    style={`
          background-color: ${isActive ? "white" : "transparent"};
          `}
    on:click={toggle}
  >
    <IconSettings size={25} color={isActive ? "black" : "white"} />
  </button>
  {#if isActive}
    <div class="settings-container">
      <div>
        <BPMControl on:bpmChange={handleBPMChange} />
        <Background />
        <Volume />
        <InstrumentControls />
        <PresetManager />
        <Recorder />
        <Timer />
        <small class="info-label">For more information press ESC key</small>
      </div>
    </div>
  {/if}
</div>

<style>
  button {
    color: white;
    border-radius: 50%;
    aspect-ratio: 4/4;
  }
  #settings-box {
    position: relative;
  }
  .settings-container {
    position: absolute;
    right: 0;
    top: 70px;
    height: 58vh;
    padding: 5px 20px;
    width: 340px; /* Like controls width */
    color: white;
    border-radius: 20px;
    backdrop-filter: blur(10px);
    background-color: rgba(0, 0, 0, 40%);
    overflow-y: auto;
    animation: show 0.4s ease-in-out;
  }
  @keyframes show {
    from {
      transform: translateY(-10%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
  .info-label {
    display: block;
    font-size: x-small;
    margin-top: 30px;
    color: azure;
  }

  @media only screen and (max-width: 600px) {
    .settings-container {
      width: 80vw;
      right: -3vw;
      background-color: rgba(0, 0, 0, 50%);
    }
    .info-label {
      opacity: 0;
    }
  }
</style>

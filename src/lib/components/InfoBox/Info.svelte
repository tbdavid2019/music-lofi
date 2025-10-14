<script lang="ts">
  import { IconEye, IconX, IconSparkles, IconKeyboard } from "@tabler/icons-svelte";
  import ShortCuts from "./ShortCuts.svelte";
  import SocialLinks from "./SocialLinks.svelte";
  import NewFeatures from "./NewFeatures.svelte";

  let visible = false;
  let activeTab: "features" | "shortcuts" = "features";

  function toggleInfoBox() {
    visible = !visible;
  }

  // First time, show info box with features tab
  if (!localStorage.getItem("shownBefore-info")) {
    toggleInfoBox();
    localStorage.setItem("shownBefore-info", "true");
    activeTab = "features"; // 顯示新功能頁
  }

  function showNextTime() {
    localStorage.removeItem("shownBefore-info");
  }
  // Listen to escape key to close info box
  document.addEventListener(
    "keydown",
    function (e) {
      if (e.key === "Escape") {
        toggleInfoBox();
      }
    },
    false
  );
</script>

{#if visible}
  <div class="info-overlay">
    <div id="info-box">
      <div id="top-section">
        <button id="close-btn" on:click={toggleInfoBox}>
          <IconX color="white" size={17} />
        </button>
        <button
          id="show-btn"
          title="Show on start next time"
          on:click={showNextTime}
        >
          <IconEye color="white" size={17} />
        </button>
        <div id="app-info">
          <img id="app-logo" src="LofiEngine.png" alt="" />
          <div>
            <h1>Music Lofi - DAVID888 </h1>
            <p id="version">Version 1.0.2</p>
            <p id="tagline">
              Create your own atmosphere, Lofi Engine sets the mood.
            </p>
            <SocialLinks />
          </div>
        </div>
      </div>
      
      <!-- Tabs -->
      <div class="tabs">
        <button 
          class="tab"
          class:active={activeTab === "features"}
          on:click={() => activeTab = "features"}
        >
          <IconSparkles size={18} />
          新功能
        </button>
        <button 
          class="tab"
          class:active={activeTab === "shortcuts"}
          on:click={() => activeTab = "shortcuts"}
        >
          <IconKeyboard size={18} />
          快捷鍵
        </button>
      </div>

      <div id="bottom-section">
        {#if activeTab === "features"}
          <NewFeatures />
        {:else}
          <ShortCuts />
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .info-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 99; /* on top of everything and under topbar(100 z-index) */
    background-color: rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(10px);
    display: flex;
    justify-content: center;
    align-items: center;
  }
  #info-box {
    padding: 0px 15px;
    color: white;
    background-color: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(10px);
    border-radius: 20px;
    width: 55vw;
    height: 75vh;
    overflow: hidden;
  }
  #top-section {
    display: flex;
    justify-content: space-between;
    margin-top: 5px;
    position: relative;
  }
  #close-btn {
    position: absolute;
    top: 10px;
    right: 0;
    outline: none;
  }
  #show-btn {
    position: absolute;
    top: 10px;
    right: 35px;
    outline: none;
  }
  button:active {
    transform: scale(0.9);
  }
  #app-info {
    display: flex;
    padding: 10px;
    gap: 20px;
  }
  #app-info h1 {
    margin: 10px 0px 5px 0px;
  }
  #app-info #version {
    font-size: x-small;
    margin: -2px 10px;
    color: lightgray;
  }
  #app-info #tagline {
    font-size: small;
    margin: 5px 10px;
    font-family: "Courier New", Courier, monospace;
  }
  #bottom-section {
    margin-top: 10px;
    overflow: hidden;
    overflow-y: scroll;
    height: 45vh;
    padding-bottom: 50px;
  }
  img {
    aspect-ratio: 1/1;
    width: 130px;
    height: 130px;
    min-width: 130px;
    min-height: 130px;
    border-radius: 20px;
  }

  .tabs {
    display: flex;
    gap: 10px;
    padding: 0 10px;
    margin-top: 15px;
    border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  }

  .tab {
    flex: 1;
    padding: 10px 15px;
    background: transparent;
    color: rgba(255, 255, 255, 0.6);
    border: none;
    border-bottom: 3px solid transparent;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.3s;
    margin-bottom: -2px;
  }

  .tab:hover {
    color: rgba(255, 255, 255, 0.9);
    background: rgba(255, 255, 255, 0.05);
  }

  .tab.active {
    color: white;
    border-bottom-color: #667eea;
  }

  @media only screen and (max-width: 600px) {
    .info-overlay {
      display: none;
    }
  }
</style>

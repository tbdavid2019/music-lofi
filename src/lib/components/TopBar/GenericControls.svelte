<script lang="ts">
  import { Copy, Minus, Square, X } from "@lucide/svelte";
  import { onMount } from "svelte";
  
  let isMaximized = false;

  export let appWindow: {
    close: () => unknown;
    minimize: () => unknown;
    maximize: () => unknown;
    unmaximize: () => unknown;
    isMaximized: () => Promise<boolean>;
  };
  export let noSideEffect = false;

  onMount(() => {
    const close = document.getElementById("close-maximaze-wl");
    const minimize = document.getElementById("minimize-wl");
    const maximize = document.getElementById("maximaze-wl");

    close?.addEventListener("click", () => {
      appWindow.close();
    });

    minimize?.addEventListener("click", () => {
      appWindow.minimize();
    });

    maximize?.addEventListener("click", () => {
      if (isMaximized) {
        appWindow.unmaximize();
      } else {
        appWindow.maximize();
      }
      isMaximized = !isMaximized;
    });

    // watch if window is maximized
    // from other sources apart from top bar
    !noSideEffect && setInterval(() => {
      appWindow.isMaximized().then((maximized) => {
        isMaximized = maximized;
        // Remove the rounded corners when maximized
        if (isMaximized) {
          document.body.style.borderRadius = "0px";
        } else {
          document.body.style.borderRadius = "10px";
        }
      });
    }, 300);
  });
</script>

<div class="controls">
  <div class="minimize" id="minimize-wl">
    <Minus size={14} />
  </div>
  <div class="maximize" id="maximaze-wl">
    {#if isMaximized}
      <Copy size={14} />
    {:else}
      <Square size={12} />
    {/if}
  </div>
  <div class="close" id="close-maximaze-wl">
    <X size={14} />
  </div>
</div>

<style>
  .controls {
    position: absolute;
    right: 35px;
    display: flex;
    gap: 15px;
    color: white;
  }
  .controls div {
    width: 18px;
    height: 18px;
    background-color: transparent;
    cursor: pointer;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .close:hover {
    background-color: #ff5f56;
  }
  .minimize:hover {
    background-color: #ffffff80;
  }
  .maximize:hover {
    background-color: #ffffff80;
  }
</style>

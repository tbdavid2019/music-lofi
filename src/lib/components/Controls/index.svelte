<script lang="ts">
  import TimerControl from "../Timer/TimerControl.svelte";
  import Settings from "./Settings/index.svelte";
</script>

<div class="controls" aria-label="系統與專注控制塢">
  <TimerControl />
  <Settings />
</div>

<style>
  .controls {
    width: auto;
    height: 48px;
    color: white;
    display: inline-flex;
    align-items: center;
    padding: 4px 10px;
    gap: 8px;
    border-radius: 50px;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    background-color: rgba(0, 0, 0, 0.45);
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
    z-index: 50;
    pointer-events: auto;
    position: relative;
    user-select: none;
  }

  @media only screen and (max-width: 600px) {
    .controls {
      position: absolute;
      top: 16px;
      right: 16px;
      left: auto;
      transform: none;
      width: auto;
    }
  }
</style>

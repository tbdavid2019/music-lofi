<script lang="ts">
  export let isRaining = false;
</script>

<div>
  {#if isRaining}
    <div class="rain" aria-hidden="true"></div>
  {/if}
</div>

<style>
  .rain {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 10;
    background: url("/rain.png");
    animation: rain 0.3s linear infinite;
    pointer-events: none;
  }

  @keyframes rain {
    0% {
      background-position: 0px 0px;
    }
    100% {
      background-position: 150px 400px;
    }
  }
</style>

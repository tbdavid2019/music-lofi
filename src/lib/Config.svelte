<!-- 
    Global Customization and Configuration
 -->

<script lang="ts">
  import { onMount } from "svelte";

  // Disable Right Click
  document.addEventListener(
    "contextmenu",
    function (e) {
      e.preventDefault();
    },
    false
  );

  onMount(() => {
    // Load UI Settings
    if (typeof window !== 'undefined') {
      const savedOpacity = localStorage.getItem("LofiEngine_MenuOpacity");
      if (savedOpacity !== null) {
        document.documentElement.style.setProperty('--menu-opacity', savedOpacity);
      }
    }
  });
</script>

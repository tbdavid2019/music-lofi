<script lang="ts">
    import { onMount } from "svelte";

    const STORAGE_KEY = "LofiEngine_MenuOpacity";
    let menuOpacity = 0.7;

    // Save current opacity to local storage and apply to root
    function saveOpacity() {
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, menuOpacity.toString());
            document.documentElement.style.setProperty('--menu-opacity', menuOpacity.toString());
        }
    }

    // Updater function for the opacity slider
    function updateMenuOpacity(e) {
        menuOpacity = parseFloat(e.target.value);
        saveOpacity();
    }

    onMount(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved !== null) {
                menuOpacity = parseFloat(saved);
            }
        }
    });
</script>

<div>
    <h4>Appearance</h4>
    <section id="menu-opacity">
        <h5>Menu Opacity</h5>
        <p>{Math.round(menuOpacity * 100)}%</p>
        <input
            id="opacity-slider"
            type="range"
            bind:value={menuOpacity}
            min="0.1"
            max="1"
            step="0.05"
            on:input={updateMenuOpacity}
        />
    </section>
</div>

<style>
    h4 {
        margin-top: 15px;
        margin-bottom: 5px;
    }
    h5 {
        margin-left: 10px;
        margin-bottom: -35px;
    }
    p {
        text-align: right;
        font-size: 14px;
        margin-right: 7%;
    }
    #opacity-slider {
        width: 90%;
        margin-left: 10px;
    }
</style>

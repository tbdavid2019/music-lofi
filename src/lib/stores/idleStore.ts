import { writable } from "svelte/store";

export const isIdleStore = writable<boolean>(false);

let idleTimeout: any = null;
const IDLE_DELAY_MS = 7500; // 7.5 seconds of inactivity triggers ambient TV mode

export function initIdleDetector() {
  if (typeof window === "undefined") return () => {};

  function resetIdle() {
    isIdleStore.update((curr) => {
      if (curr) return false;
      return false;
    });

    if (idleTimeout) clearTimeout(idleTimeout);
    idleTimeout = setTimeout(() => {
      // Do not enter idle mode if a modal, drawer, or info box is currently open
      const hasOpenModal = document.querySelector(
        ".timer-popover, .settings-container, .station-drawer, .info-overlay"
      );
      if (!hasOpenModal) {
        isIdleStore.set(true);
      }
    }, IDLE_DELAY_MS);
  }

  const events = ["mousemove", "mousedown", "keydown", "touchstart", "wheel"];
  events.forEach((evt) => {
    window.addEventListener(evt, resetIdle, { passive: true });
  });

  resetIdle();

  return () => {
    if (idleTimeout) clearTimeout(idleTimeout);
    events.forEach((evt) => {
      window.removeEventListener(evt, resetIdle);
    });
  };
}

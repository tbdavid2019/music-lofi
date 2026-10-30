import { writable, get } from "svelte/store";

export interface PWAState {
  canInstall: boolean;
  isStandalone: boolean;
  isIOS: boolean;
  showPrompt: boolean;
  showIOSGuide: boolean;
  hasDeferredPrompt: boolean;
}

const initialState: PWAState = {
  canInstall: false,
  isStandalone: false,
  isIOS: false,
  showPrompt: false,
  showIOSGuide: false,
  hasDeferredPrompt: false,
};

export const pwaStore = writable<PWAState>(initialState);

let deferredPrompt: any = null;
const DISMISS_KEY = "888music_pwa_dismissed_until";

/**
 * Initialize PWA listeners and checks
 */
export function initPWA(): () => void {
  if (typeof window === "undefined") return () => {};

  const isIOS =
    /iPhone|iPad|iPod/i.test(navigator.userAgent) &&
    !(window as any).MSStream;

  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes("android-app://");

  pwaStore.update((s) => ({
    ...s,
    isStandalone,
    isIOS,
  }));

  if (isStandalone) {
    console.log("[PWA] App is running in standalone mode.");
    return () => {};
  }

  // Check if dismissed previously
  const dismissedUntil = localStorage.getItem(DISMISS_KEY);
  const isDismissed = dismissedUntil && Number(dismissedUntil) > Date.now();

  // Handler for beforeinstallprompt
  const handleBeforeInstallPrompt = (e: Event) => {
    e.preventDefault();
    deferredPrompt = e;

    pwaStore.update((s) => ({
      ...s,
      canInstall: true,
      hasDeferredPrompt: true,
    }));

    // If not dismissed recently, show the prompt actively after 2 seconds
    if (!isDismissed) {
      setTimeout(() => {
        const current = get(pwaStore);
        if (!current.isStandalone) {
          pwaStore.update((s) => ({ ...s, showPrompt: true }));
        }
      }, 2000);
    }
  };

  // Handler for appinstalled
  const handleAppInstalled = () => {
    deferredPrompt = null;
    pwaStore.update((s) => ({
      ...s,
      canInstall: false,
      hasDeferredPrompt: false,
      showPrompt: false,
      showIOSGuide: false,
      isStandalone: true,
    }));

    window.dispatchEvent(
      new CustomEvent("lofi:showToast", {
        detail: "🎉 888 Music 已成功安裝！歡迎隨時從桌面捷徑開啟聆聽。",
      })
    );
  };

  window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  window.addEventListener("appinstalled", handleAppInstalled);

  // If on iOS and not dismissed, show gentle prompt after delay
  if (isIOS && !isStandalone && !isDismissed) {
    setTimeout(() => {
      const current = get(pwaStore);
      if (!current.isStandalone) {
        pwaStore.update((s) => ({ ...s, showPrompt: true }));
      }
    }, 3500);
  }

  return () => {
    window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.removeEventListener("appinstalled", handleAppInstalled);
  };
}

/**
 * Trigger installation prompt
 */
export async function installPWA(): Promise<"accepted" | "dismissed" | "ios" | "unavailable"> {
  const state = get(pwaStore);

  if (state.isIOS) {
    pwaStore.update((s) => ({ ...s, showIOSGuide: true, showPrompt: false }));
    return "ios";
  }

  if (!deferredPrompt) {
    // If browser doesn't have deferred prompt but user clicked install, show guide
    pwaStore.update((s) => ({ ...s, showPrompt: true }));
    return "unavailable";
  }

  try {
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    deferredPrompt = null;

    pwaStore.update((s) => ({
      ...s,
      hasDeferredPrompt: false,
      showPrompt: false,
    }));

    if (outcome === "accepted") {
      window.dispatchEvent(
        new CustomEvent("lofi:showToast", {
          detail: "⚡ 正在安裝 888 Music App，稍後即可在桌面開啟！",
        })
      );
      return "accepted";
    }

    return "dismissed";
  } catch (err) {
    console.error("[PWA] Installation failed:", err);
    return "unavailable";
  }
}

/**
 * Dismiss the active prompt and snooze for specified days (default 3 days)
 */
export function dismissPWAPrompt(days = 3): void {
  const snoozeUntil = Date.now() + days * 24 * 60 * 60 * 1000;
  localStorage.setItem(DISMISS_KEY, String(snoozeUntil));

  pwaStore.update((s) => ({
    ...s,
    showPrompt: false,
    showIOSGuide: false,
  }));
}

/**
 * Manually open the prompt (e.g. from a settings or dock button)
 */
export function openPWAPrompt(): void {
  const state = get(pwaStore);
  if (state.isIOS) {
    pwaStore.update((s) => ({ ...s, showIOSGuide: true, showPrompt: false }));
  } else {
    pwaStore.update((s) => ({ ...s, showPrompt: true, showIOSGuide: false }));
  }
}

/**
 * Close iOS guide
 */
export function closeIOSGuide(): void {
  pwaStore.update((s) => ({ ...s, showIOSGuide: false }));
}

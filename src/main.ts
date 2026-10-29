import "./styles.css";
import { mount } from "svelte";
import App from "./App.svelte";

// Keep the app shell available when the browser is offline.
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch((error) => {
      console.error("Service worker registration failed:", error);
    });
  });
}

const app = mount(App, {
  target: document.getElementById("app")!,
});

export default app;

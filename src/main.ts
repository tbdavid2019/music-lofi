import "./styles.css";
import App from "./App.svelte";
import TVApp from "./TVApp.svelte";

// 檢測當前路徑是否為 TV 版本
const currentPath = window.location.pathname;
const isTVMode = currentPath === '/tv' || currentPath.includes('/tv');

console.log(`🔍 檢測路徑: ${currentPath}, TV模式: ${isTVMode}`);

// 根據路徑選擇對應的應用版本
const AppComponent = isTVMode ? TVApp : App;

const app = new AppComponent({
  target: document.getElementById("app"),
});

export default app;

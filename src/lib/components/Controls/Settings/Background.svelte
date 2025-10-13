<script lang="ts">
  import { IconArrowLeft, IconArrowRight, IconRefresh, IconPhoto } from "@tabler/icons-svelte";

  // Background source types
  type BgSource = 'bing' | 'local';
  
  // Get settings from localStorage
  let id: any = localStorage.getItem("bg-id");
  let useBingApi: boolean = localStorage.getItem("use-bing-api") === "true";
  let currentBingUrl: string = localStorage.getItem("bing-bg-url") || "";
  
  // Initialize background
  if (!id) {
    // First time load - pick random background
    id = Math.floor(Math.random() * 10) + 1;
    localStorage.setItem("bg-id", id.toString());
  }
  
  const bg = document.getElementById("bg");
  let isLoadingBing = false;
  
  // Load initial background
  if (useBingApi && currentBingUrl) {
    bg.style.backgroundImage = `url('${currentBingUrl}')`;
  } else {
    bg.style.backgroundImage = `url('assets/background/bg${id}.jpg')`;
  }

  // Detect if device is mobile
  function isMobileDevice(): boolean {
    return window.innerWidth <= 600 || 
           /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  // Fetch Bing wallpaper with fallback to local
  async function fetchBingWallpaper(): Promise<string | null> {
    try {
      isLoadingBing = true;
      
      // Choose API based on device type
      const isMobile = isMobileDevice();
      const bingApiUrl = isMobile 
        ? `https://bing.img.run/m.php?t=${Date.now()}`           // 手機版 API
        : `https://bing.img.run/1920x1080.php?t=${Date.now()}`;  // 桌面版 API
      
      console.log(`🔍 偵測設備: ${isMobile ? '📱 手機' : '💻 桌面'}`);
      console.log(`🌐 使用 API: ${isMobile ? 'mobile' : 'desktop'} version`);
      
      // Test if the image loads successfully
      const response = await fetch(bingApiUrl, { 
        method: 'HEAD',
        timeout: 5000 
      } as any);
      
      if (response.ok) {
        console.log(`✅ Bing API 載入成功 (${isMobile ? '手機版' : '桌面版'})`);
        return bingApiUrl;
      } else {
        console.warn("⚠️ Bing API 回應異常，使用本地背景");
        return null;
      }
    } catch (error) {
      console.warn("⚠️ Bing API 載入失敗，使用本地背景:", error);
      return null;
    } finally {
      isLoadingBing = false;
    }
  }

  // Set Bing wallpaper with fallback
  async function setBingWallpaper() {
    const bingUrl = await fetchBingWallpaper();
    
    if (bingUrl) {
      // Success - use Bing wallpaper
      bg.style.backgroundImage = `url('${bingUrl}')`;
      useBingApi = true;
      currentBingUrl = bingUrl;
      localStorage.setItem("use-bing-api", "true");
      localStorage.setItem("bing-bg-url", bingUrl);
    } else {
      // Fallback to local background
      useBingApi = false;
      bg.style.backgroundImage = `url('assets/background/bg${id}.jpg')`;
      localStorage.setItem("use-bing-api", "false");
    }
  }

  // Switch to local background
  function useLocalBg(bgId: number) {
    useBingApi = false;
    id = bgId;
    bg.style.backgroundImage = `url('assets/background/bg${id}.jpg')`;
    localStorage.setItem("bg-id", id.toString());
    localStorage.setItem("use-bing-api", "false");
  }

  function randomBg() {
    // Generate random number between 1-10, but different from current
    let newId;
    do {
      newId = Math.floor(Math.random() * 10) + 1;
    } while (newId === parseInt(id));
    
    useLocalBg(newId);
  }

  function nextBg() {
    if (id < 10) {
      // @ts-ignore
      id = new Number(id) + 1;
    } else {
      id = 1;
    }
    useLocalBg(id);
  }

  function prevBg() {
    if (id > 1) {
      id = id - 1;
    } else {
      id = 10;
    }
    useLocalBg(id);
  }

  // Shortcuts to change background using arrow keys
  window.addEventListener("keydown", (e: KeyboardEvent) => {
    // Prevent bg change when targeting inputs
    if (e.target instanceof HTMLElement && !e.target.closest("input")) {
      if (e.key === "ArrowRight") {
        nextBg();
      } else if (e.key === "ArrowLeft") {
        prevBg();
      }
    }
  });
</script>

<div>
  <h4>Background</h4>
  
  <!-- Bing 每日桌布按鈕 -->
  <div class="bing-btn-container">
    <button 
      class="bing-btn" 
      class:active={useBingApi}
      on:click={setBingWallpaper} 
      title="使用 Bing 每日高清桌布（自動偵測手機/桌面版本）"
      disabled={isLoadingBing}
    >
      <IconPhoto size={18} />
      <span>{isLoadingBing ? '載入中...' : useBingApi ? '✓ Bing 每日桌布' : 'Bing 每日桌布'}</span>
    </button>
    {#if useBingApi}
      <div class="bing-hint">
        🌐 Bing 背景 ({isMobileDevice() ? '📱 手機版' : '💻 桌面版'})
      </div>
    {/if}
  </div>

  <!-- 本地背景選擇器 -->
  <div class="local-bg-section">
    <h5>本地背景 (1-10)</h5>
    <div class="container">
      <button on:click={prevBg} title="上一張背景">
        <IconArrowLeft size={20} />
      </button>
      <img id="bg-preview" src="assets/background/bg{id}.jpg" alt="" />
      <button on:click={nextBg} title="下一張背景">
        <IconArrowRight size={20} />
      </button>
    </div>
    <div class="random-btn-container">
      <button class="random-btn" on:click={randomBg} title="隨機本地背景">
        <IconRefresh size={18} />
        <span>隨機本地背景</span>
      </button>
    </div>
  </div>
</div>

<style>
  h5 {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 10px;
    text-align: center;
  }

  .bing-btn-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    margin-bottom: 20px;
    padding-bottom: 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .bing-btn {
    width: auto;
    height: auto;
    padding: 10px 20px;
    border-radius: 10px;
    background: linear-gradient(135deg, rgba(0, 120, 212, 0.3), rgba(0, 178, 148, 0.3));
    border: 1px solid rgba(0, 178, 148, 0.5);
    color: white;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.3s;
    cursor: pointer;
  }

  .bing-btn:hover:not(:disabled) {
    background: linear-gradient(135deg, rgba(0, 120, 212, 0.5), rgba(0, 178, 148, 0.5));
    border-color: rgba(0, 178, 148, 0.8);
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 178, 148, 0.3);
  }

  .bing-btn.active {
    background: linear-gradient(135deg, rgba(0, 120, 212, 0.6), rgba(0, 178, 148, 0.6));
    border-color: rgba(0, 255, 178, 0.8);
    box-shadow: 0 0 20px rgba(0, 178, 148, 0.5);
  }

  .bing-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .bing-hint {
    font-size: 12px;
    color: rgba(0, 255, 178, 0.9);
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }

  .local-bg-section {
    margin-top: 10px;
  }

  .container {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 20px;
    justify-content: center;
  }
  
  #bg-preview {
    width: 200px;
    height: 120px;
    border-radius: 7px;
    margin: 0 10px;
  }
  
  button {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    color: white;
    overflow: hidden;
  }
  
  button:hover {
    backdrop-filter: blur(10px);
    background-color: rgba(0, 0, 0, 10%);
  }

  .random-btn-container {
    display: flex;
    justify-content: center;
    margin-top: 10px;
  }

  .random-btn {
    width: auto;
    height: auto;
    padding: 8px 16px;
    border-radius: 8px;
    background: rgba(102, 126, 234, 0.2);
    border: 1px solid rgba(102, 126, 234, 0.4);
    color: white;
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    transition: all 0.2s;
  }

  .random-btn:hover {
    background: rgba(102, 126, 234, 0.3);
    border-color: rgba(102, 126, 234, 0.6);
    transform: translateY(-1px);
  }

  .random-btn:active {
    transform: translateY(0);
  }

  @media only screen and (max-width: 600px) {
    #bg-preview {
      width: 90px;
      height: 150px;
      aspect-ratio: 16 / 9;
      object-fit: cover;
      background-size: cover;
      background-position: center;
    }
    
    .bing-btn {
      padding: 8px 16px;
      font-size: 13px;
    }
  }
</style>

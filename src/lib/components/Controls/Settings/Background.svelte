<script lang="ts">
  import { IconArrowLeft, IconArrowRight, IconRefresh, IconPhoto, IconHeart } from "@tabler/icons-svelte";

  // Background source types
  type BgSource = 'bing' | 'beauty' | 'local';
  
  // Get settings from localStorage
  let id: any = localStorage.getItem("bg-id");
  let useBingApi: boolean = localStorage.getItem("use-bing-api") === "true";
  let useBeautyApi: boolean = localStorage.getItem("use-beauty-api") === "true";
  let currentBingUrl: string = localStorage.getItem("bing-bg-url") || "";
  let currentBeautyUrl: string = localStorage.getItem("beauty-bg-url") || "";
  let lastBingFetchDate: string = localStorage.getItem("bing-fetch-date") || "";
  let lastBeautyFetchDate: string = localStorage.getItem("beauty-fetch-date") || "";
  
  // Initialize background
  if (!id) {
    // First time load - pick random background
    id = Math.floor(Math.random() * 10) + 1;
    localStorage.setItem("bg-id", id.toString());
  }
  
  const bg = document.getElementById("bg");
  let isLoadingBing = false;
  let isLoadingBeauty = false;
  
  // Check if this is first time user (no API preference set)
  const isFirstTimeUser = localStorage.getItem("use-bing-api") === null && localStorage.getItem("use-beauty-api") === null;
  
  // Check if we need to refresh wallpapers (daily update)
  const today = new Date().toDateString();
  const shouldRefreshBing = useBingApi && currentBingUrl && lastBingFetchDate !== today;
  const shouldRefreshBeauty = useBeautyApi && currentBeautyUrl && lastBeautyFetchDate !== today;
  
  // First time user: randomly choose between Bing or Beauty API
  if (isFirstTimeUser) {
    const randomChoice = Math.random() < 0.5 ? 'bing' : 'beauty';
    console.log(`🎲 首次使用，隨機選擇: ${randomChoice === 'bing' ? 'Bing 桌布' : '美女桌布'}`);
    
    if (randomChoice === 'bing') {
      fetchAndSetBingWallpaper();
    } else {
      fetchAndSetBeautyWallpaper();
    }
  }
  // Load initial background based on priority: Beauty > Bing > Local
  else if (useBeautyApi && currentBeautyUrl && !shouldRefreshBeauty) {
    // Use cached Beauty wallpaper (same day)
    bg.style.backgroundImage = `url('${currentBeautyUrl}')`;
    console.log("📅 使用今日快取的美女桌布");
  } else if (shouldRefreshBeauty) {
    // Auto-refresh Beauty wallpaper (new day)
    console.log("🔄 偵測到新的一天，自動更新美女桌布...");
    fetchAndSetBeautyWallpaper();
  } else if (useBingApi && currentBingUrl && !shouldRefreshBing) {
    // Use cached Bing wallpaper (same day)
    bg.style.backgroundImage = `url('${currentBingUrl}')`;
    console.log("📅 使用今日快取的 Bing 桌布");
  } else if (shouldRefreshBing) {
    // Auto-refresh Bing wallpaper (new day)
    console.log("🔄 偵測到新的一天，自動更新 Bing 桌布...");
    fetchAndSetBingWallpaper();
  } else {
    // Use local background
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
        ? `https://bing.img.run/m.php`           // 手機版 API
        : `https://bing.img.run/1920x1080.php`;  // 桌面版 API
      
      console.log(`🔍 偵測設備: ${isMobile ? '📱 手機' : '💻 桌面'}`);
      
      // 使用 Image 對象預載入測試（CSS background-image 不受 CORS 限制）
      return new Promise((resolve) => {
        const testImg = new Image();
        const uniqueUrl = `${bingApiUrl}?t=${Date.now()}`;
        
        testImg.onload = () => {
          console.log(`✅ Bing API 載入成功 (${isMobile ? '手機版' : '桌面版'})`);
          resolve(uniqueUrl);
        };
        
        testImg.onerror = () => {
          console.warn("⚠️ Bing API 載入失敗，使用本地背景");
          resolve(null);
        };
        
        // 設置 5 秒超時
        setTimeout(() => {
          if (testImg.complete === false) {
            console.warn("⚠️ Bing API 載入超時，使用本地背景");
            resolve(null);
          }
        }, 5000);
        
        testImg.src = uniqueUrl;
      });
      
    } catch (error) {
      console.warn("⚠️ Bing API 載入失敗，使用本地背景:", error);
      return null;
    } finally {
      isLoadingBing = false;
    }
  }

  // Fetch Beauty wallpaper API
  async function fetchBeautyWallpaper(): Promise<string | null> {
    isLoadingBeauty = true;
    
    try {
      const beautyApiUrl = `https://api.liuzhuai.com/img/m.php`;
      console.log("🔍 請求美女桌布 API...");
      
      // 使用 Image 預載入解決 CORS 問題，就像 Bing API 一樣
      return new Promise((resolve) => {
        const testImg = new Image();
        const uniqueUrl = `${beautyApiUrl}?t=${Date.now()}`;
        
        testImg.onload = () => {
          console.log("✅ 美女桌布載入成功:", uniqueUrl);
          resolve(uniqueUrl);
        };
        
        testImg.onerror = () => {
          console.warn("⚠️ 美女 API 載入失敗，使用本地背景");
          resolve(null);
        };
        
        // 設置 5 秒超時
        setTimeout(() => {
          if (testImg.complete === false) {
            console.warn("⚠️ 美女 API 載入超時，使用本地背景");
            resolve(null);
          }
        }, 5000);
        
        testImg.src = uniqueUrl;
      });
      
    } catch (error) {
      console.warn("⚠️ 美女 API 載入失敗:", error);
      return null;
    } finally {
      isLoadingBeauty = false;
    }
  }

  // Set Bing wallpaper with fallback
  async function setBingWallpaper() {
    await fetchAndSetBingWallpaper();
  }

  // Set Beauty wallpaper with fallback
  async function setBeautyWallpaper() {
    await fetchAndSetBeautyWallpaper();
  }

  // Fetch and set Bing wallpaper (separate function for reuse)
  async function fetchAndSetBingWallpaper() {
    const bingUrl = await fetchBingWallpaper();
    
    if (bingUrl) {
      // Success - use Bing wallpaper
      bg.style.backgroundImage = `url('${bingUrl}')`;
      useBingApi = true;
      useBeautyApi = false; // 關閉美女桌布
      currentBingUrl = bingUrl;
      const today = new Date().toDateString();
      localStorage.setItem("use-bing-api", "true");
      localStorage.setItem("use-beauty-api", "false");
      localStorage.setItem("bing-bg-url", bingUrl);
      localStorage.setItem("bing-fetch-date", today);
      console.log(`📅 Bing 桌布已更新 (${today})`);
    } else {
      // Fallback to local background
      console.log("🔄 網路環境失敗，退回到本地背景");
      useBingApi = false;
      useBeautyApi = false;
      bg.style.backgroundImage = `url('assets/background/bg${id}.jpg')`;
      localStorage.setItem("use-bing-api", "false");
      localStorage.setItem("use-beauty-api", "false");
    }
  }

  // Fetch and set Beauty wallpaper
  async function fetchAndSetBeautyWallpaper() {
    const beautyUrl = await fetchBeautyWallpaper();
    
    if (beautyUrl) {
      // Success - use Beauty wallpaper
      bg.style.backgroundImage = `url('${beautyUrl}')`;
      useBeautyApi = true;
      useBingApi = false; // 關閉 Bing 桌布
      currentBeautyUrl = beautyUrl;
      const today = new Date().toDateString();
      localStorage.setItem("use-beauty-api", "true");
      localStorage.setItem("use-bing-api", "false");
      localStorage.setItem("beauty-bg-url", beautyUrl);
      localStorage.setItem("beauty-fetch-date", today);
      console.log(`📅 美女桌布已更新 (${today})`);
    } else {
      // Fallback to local background
      console.log("🔄 網路環境失敗，退回到本地背景");
      useBeautyApi = false;
      useBingApi = false;
      bg.style.backgroundImage = `url('assets/background/bg${id}.jpg')`;
      localStorage.setItem("use-beauty-api", "false");
      localStorage.setItem("use-bing-api", "false");
    }
  }

  // Switch to local background
  function useLocalBg(bgId: number) {
    useBingApi = false;
    useBeautyApi = false;
    id = bgId;
    bg.style.backgroundImage = `url('assets/background/bg${id}.jpg')`;
    localStorage.setItem("bg-id", id.toString());
    localStorage.setItem("use-bing-api", "false");
    localStorage.setItem("use-beauty-api", "false");
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
  
  <!-- API 桌布選項 -->
  <div class="api-wallpaper-section">
    <!-- Bing 每日桌布按鈕 -->
    <button 
      class="api-btn bing-btn" 
      class:active={useBingApi}
      on:click={setBingWallpaper} 
      title="使用 Bing 每日高清桌布（自動偵測手機/桌面版本）"
      disabled={isLoadingBing}
    >
      <IconPhoto size={18} />
      <span>{isLoadingBing ? '載入中...' : useBingApi ? '✓ Bing 每日桌布' : 'Bing 每日桌布'}</span>
    </button>
    
    <!-- 美女桌布按鈕 -->
    <button 
      class="api-btn beauty-btn" 
      class:active={useBeautyApi}
      on:click={setBeautyWallpaper} 
      title="隨機美女真人桌布（高清圖片）"
      disabled={isLoadingBeauty}
    >
      <IconHeart size={18} />
      <span>{isLoadingBeauty ? '載入中...' : useBeautyApi ? '✓ 美女桌布' : '美女桌布'}</span>
    </button>
    
    <!-- API 狀態提示 -->
    {#if useBingApi}
      <div class="api-hint bing-hint">
        🌐 Bing 背景 ({isMobileDevice() ? '📱 手機版' : '💻 桌面版'})
      </div>
    {/if}
    {#if useBeautyApi}
      <div class="api-hint beauty-hint">
        👩 隨機美女桌布
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

  /* API 桌布選項樣式 */
  .api-wallpaper-section {
    margin-bottom: 20px;
  }

  .api-btn {
    width: 100%;
    height: 45px;
    margin-bottom: 8px;
    padding: 8px 15px;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.05);
    color: white;
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    transition: all 0.3s ease;
    backdrop-filter: blur(5px);
  }

  .api-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
  }

  .api-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  .api-btn.active {
    background: rgba(0, 255, 178, 0.2);
    border-color: rgba(0, 255, 178, 0.4);
    color: #00ffb2;
  }

  .bing-btn.active {
    background: rgba(0, 149, 255, 0.2);
    border-color: rgba(0, 149, 255, 0.4);
    color: #0095ff;
  }

  .beauty-btn.active {
    background: rgba(255, 105, 180, 0.2);
    border-color: rgba(255, 105, 180, 0.4);
    color: #ff69b4;
  }

  .api-hint {
    font-size: 12px;
    padding: 4px 8px;
    border-radius: 4px;
    margin-top: 4px;
    animation: pulse 2s ease-in-out infinite;
  }

  .bing-hint {
    color: rgba(0, 149, 255, 0.9);
    background: rgba(0, 149, 255, 0.1);
  }

  .beauty-hint {
    color: rgba(255, 105, 180, 0.9);
    background: rgba(255, 105, 180, 0.1);
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

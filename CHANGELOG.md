# 更新日誌 (Changelog)

## [1.5.1] - 2026-10-29

### 🔗 右上角常駐分享按鈕、電台即時搜尋快捷鍵直達與徹底清除歷史 TV 廢棄代碼 (Top-Right Share Action, Station Instant Search Hotkeys & Legacy TV Code Purge)

- **🔗 右上角控制塢常駐「分享空間」按鈕 (Top-Right Share Action in Pill Dock)**：
  - 將專屬音樂空間分享功能正式收納至右上角頂層控制塢（與番茄鐘定時器、設定齒輪三位一體並列）。
  - 點擊即刻生成包含「當前電台、桌布模式、各軌混音比例」的直達 URL 並拷貝至剪貼簿，圖示平滑切換為翠綠打勾（`<Check size={18} />`），頂部同步浮出精美 Toast 提示。
  - 遵循 **WCAG AA/AAA** 標準，具備 2px `#38bdf8` 天藍焦點環；手機端自適應折疊為圓形圖示按鈕，防止遮擋與破版。
- **⌨️ 電台抽屜「即時搜尋快速輸入」與「鍵盤快捷鍵直達」 (Instant Search & Hotkeys)**：
  - **即時過濾搜尋列**：按 `C` 或 `S`（或點擊底部「頻道」）開啟電台抽屜時，搜尋列自動聚焦（`autofocus`），隨手輸入關鍵字（如 `lofi`、`jazz`、`piano`、`drone`、`cafe` 等）即可秒級過濾。
  - **Enter 鍵一鍵播放首選**：搜尋完成後直接按 `Enter`，立即播放第一筆匹配頻道並收合抽屜，體驗如同 Alfred / Spotlight。
  - **12 大頻道數字快捷鍵**：卡片上醒目標註 `[1]` 到 `[9]`、`[0]`、`[-]`、`[=]` 徽章，抽屜開啟時直接按鍵秒切換！
  - **全域快捷鍵擴充**：支援 `U` 鍵全域一鍵複製分享連結；`ShortCuts.svelte` 說明面板全面同步更新。
- **🧹 徹底清理歷史 TV 模式殘留代碼與廢棄檔案 (Legacy TV Code Purge)**：
  - 完全移除不再使用的早期 TV 專用檔案：
    - `src/TVApp.svelte`
    - `src/lib/TVPlayButton.svelte`
    - `src/lib/components/TVBPMControl.svelte`
    - `src/lib/components/TVControls.svelte`
    - `src/lib/components/TVAmbientTracks.svelte`
    - 舊版廢棄計時器 `src/lib/components/Timer/Timer.svelte`
    - 歷史停用文檔 `SNARE_DISABLED.md`
  - 淨化 `src/main.ts`：移除 `isTVMode` 路由判斷與多餘除錯輸出，改為純粹簡潔的單一入口。
  - 清理 `vercel.json` 中的 `/tv` 路由重定向。
  - 成果：生產環境 JS Bundle 瘦身 14 kB，CSS 瘦身 11 kB，編譯速度顯著加快！

## [1.5.0] - 2026-10-29

### 📻 擴充 12 大情境電台庫、全新底部電台選單抽屜 UI 與路由深度分享 (Station Library Expansion, Modern Station Drawer UX & Shareable Deep Link)

- **📻 擴充至 12 大高品質 24/7 線上串流電台 (Station Library Expansion)**：
  - 電台陣容從原本 6 台大幅擴展至 **12 大情境頻道**，分門別類涵蓋專注學習、咖啡弛放、器樂古典與懷舊蒸氣：
    - **📖 專注工作 (Focus & Flow)**：
      - `lofi`: 專注 Lo-Fi Beats（經典 24/7 Lo-Fi Hip Hop 讀書工作節拍）
      - `chillhop`: Chillhop 律動（柔和輕快的爵士嘻哈與節奏感）
      - `dronezone`: 深層冥想環境音（SomaFM 殿堂級環境氛圍，深沉無人聲專注心流）
      - `defcon`: 賽博駭客節拍（DEF CON Radio 暗黑賽博龐克與工程電子，編碼專用）
    - **☕ 咖啡弛放 (Cafe & Chill)**：
      - `cafe`: 咖啡廳輕音樂（溫暖慵懶的 Bossa 與午後咖啡廳氛圍）
      - `jazz`: 深夜爵士鋼琴（優雅醇厚的鋼琴爵士與低吟酒廊時光）
      - `secretagent`: 復古秘密沙龍（SomaFM 007 沙龍，復古 Downtempo 與弛放調情）
      - `lush`: 空靈溫柔女聲（SomaFM 夢幻空靈人聲與絲滑緩拍治癒）
    - **🎹 器樂古典 (Instrumental & Calm)**：
      - `piano`: 純淨療癒鋼琴（寧靜溫柔的純鋼琴獨奏曲庫）
      - `classical`: 經典古典管弦（優雅沉靜的室內樂與巴洛克古典交響）
    - **🌌 懷舊氛圍 (Retro & Night)**：
      - `nightwave` (Groove Salad): 深夜放鬆氛圍（SomaFM 全球第一名經典環境弛放電台）
      - `vaporwave`: 蒸氣波懷舊電台（Nightwave Plaza 復古蒸氣波與 80s 迷幻回憶）
  - 每台均配置 Primary 串流與 Fallback 備援串流，保證高可用性與跨國播放穩定度。
  - 背景連動映射擴展：所有 12 個新電台皆精確映射至最適配的意境動態桌布。

- **✨ 底部電台選擇切換 UI 創新重構 (Interactive Station Drawer UX)**：
  - 徹底告別過去單行水平滾動膠囊列在手機上「找不到分類、容易按錯、看不到全貌」的痛點。
  - **極致精巧的底部音訊 Deck**：
    - 高度緊湊精緻（約 68px），高透毛玻璃磨砂（Glassmorphism，`rgba(14, 18, 28, 0.88)` + `backdrop-filter: blur(24px)`）與細膩高光邊框。
    - 左側大面積互動卡片：顯示當前電台風格 Icon、名稱、繁體標籤、跳動等化器波形與 `ChevronUp` 向上展開指示，點擊即可召喚電台抽屜。
    - 右側控制項：上一台、主播放圓鈕（漸層發光脈衝）、下一台、以及獨立快捷按鈕「📻 頻道 (12)」。
  - **呼出式情境分類電台抽屜 (Station Drawer & Mobile Bottom Sheet)**：
    - 桌面端：在播放器上方平滑滑出寬度 680px 的懸浮毛玻璃卡片；
    - 行動端：自動切換為滿版貼底 Bottom Sheet，帶有圓潤拖把指示條（drag bar），單手舒適滑動點選。
    - **分類篩選 Tab**：`全部頻道 (12)`、`專注工作 (4)`、`咖啡弛放 (4)`、`器樂古典 (2)`、`懷舊氛圍 (2)`，點擊即時過濾。
    - **雙欄網格電台卡片**：包含專屬風格圖示徽章、清晰標題、氛圍情境介紹文案，以及當前播放態的脈衝等化器動畫與「播放中」徽章。
    - **快捷與無障礙**：支援按 `Escape` 立即關閉、按鍵盤 `C` 或 `S` 開啟頻道清單、點擊外部區域自動收合，符合 WCAG AA/AAA 文字高對比（所有主次文字皆 $\ge 7:1$）。

- **🔗 路由直達與深度分享功能 (Shareable URL Deep Linking)**：
  - **一鍵生成專屬音樂空間連結**：
    - 使用者可直接在底部播放器、電台抽屜或情境預設面板點擊「🔗 分享」按鈕。
    - 系統自動將「當前電台 ID」、「桌布設定（本地編號/Bing/Beauty）」、「各軌混音音量（主旋律、雨聲、雷聲、營火、森林）」打包成簡潔且具語意的 URL（如 `?st=dronezone&bg=6&vol=80,60,30,0,50`）。
    - 支援現代 Clipboard API 與安全降級，自動複製並彈出反饋 Toast（「✨ 專屬音樂空間連結已複製！好友開啟即可同步聆聽」）。
  - **訪客點開即刻還原**：
    - 訪客打開分享連結時，頁面自動解析 URL 參數並完美還原分享者的電台、桌布與混音器音量比例。
    - 頁面頂部浮現溫和的歡應用橫幅（「✨ 已為您套用專屬分享空間！點擊下方播放鍵立即沉浸」），配合播放鍵微脈衝，完美兼顧現代瀏覽器 Autoplay 規範與絲滑體驗。
  - **預設集聯動分享**：
    - 在「情境預設」面板中，每個自訂預設項目右側均新增「🔗 分享此預設」按鈕，方便隨時將喜愛的混音組合分享給社群朋友。

### 📱 行動端 RWD 排版破版修復與番茄鐘定時器 WCAG AA/AAA 全面合規 (Mobile RWD & Timer WCAG AA/AAA Overhaul)

- **📱 手機端彈出面板全螢幕居中與防截斷 (Mobile RWD Popover & Backdrop)**：
  - 徹底解決手機端（`max-width: 600px`）控制面板因絕對定位導致左側文字與圖示被螢幕切邊的問題。
  - 在行動端將「控制面板」與「專注定時器」彈窗改為全視窗錨定（`position: fixed; inset: 64px 12px auto 12px;`），保證兩側各留 12px 舒適間距，絕不出界。
  - 新增全螢幕半透明遮罩（`.mobile-backdrop`，`z-index: 80`），徹底遮蔽下方 Radio Player（避免「咖啡廳輕音樂」電台列與面板文字重疊穿幫），並支援點擊遮罩一鍵關閉。
  - 建立彈窗互斥廣播機制（打開定時器時自動關閉設定面板，反之亦然），避免雙彈窗競爭破版。
- **🧩 來源選擇與展示模式文字手機自適應 (Adaptive Source Grid & Mode Pills)**：
  - 桌布來源卡片在行動端採用智慧標籤（`每日風光` / `藝術人像` / `10款原創`），解決 3 欄窄卡片下「10 款 Lo-Fi 原創」拆成 3 行的問題。
  - 展示模式膠囊按鈕在行動端顯示「固定精選」與「隨機輪播」，完全消除「固定 / 手動精 / 選」的不規則換行。
- **♿ 番茄鐘與定時器 WCAG AA/AAA 全面合規 (Timer WCAG Compliance)**：
  - **綠色開始按鈕對比度超標**：採用深墨綠粗體字 `#022c22` 搭配翠綠底色 `#10b981` / `#34d399`，對比度自不及格的 3.01:1 躍升至 **8.6:1 ~ 11.2:1**（大幅超越 AAA 級 7:1）。
  - **分頁與提示可讀性提升**：未選中 Tab 與單位文字升級為 `#CBD5E1`（Slate-300），對比度 > 7:1；輔助提示文字改為 `#94A3B8`（Slate-400，對比度 > 4.5:1）。
  - **暫停徽章脫盲**：改用亮琥珀底 `#FEF3C7` 搭配深棕黑文字 `#78350F`，對比度高達 8.2:1（AAA）。
  - **鍵盤焦點環與 ESC 關閉**：所有輸入框、時間標籤、分頁、按鈕補齊 `:focus-visible` 2px 天藍焦點環；支援按下 `Escape` 鍵立即關閉面板。
  - **字階規範化**：移除 11px 雜碎字級，嚴格遵從 16px / 14px / 13.5px / 12.5px 穩定字階。

## [1.4.1] - 2026-10-28

### ♿ 控制面板 WCAG AA/AAA 無障礙合規與排版字階標準化 (Settings Panel WCAG AA/AAA & Typography Standardization)

- **🎨 建立 4 級穩定字階系統（比照左側介面，徹底消除碎字與字體跳躍）**：
  - 全面比照左側 `TrackList` 的排版規範，消除 `10px`、`11px`、`11.5px` 等紊亂碎級字體。
  - 將中文文字底線嚴格鎖定在 12px 以上，標準化為 4 級穩定階梯：
    - 主標題：`16px`（Bold）
    - 分區/標籤/卡片標題/分頁：`13.5px ~ 15px`（SemiBold / Bold）
    - 正文說明/選項描述/操作按鈕：`13px ~ 13.5px`（Medium / SemiBold，`#CBD5E1`）
    - 輔助標籤/徽章/快捷鍵提示：`12px ~ 12.5px`（SemiBold，`#FED7AA` / `#D8B4FE` / `#94A3B8`）
- **🛡️ 面板防動態桌布穿透與 WCAG 對比度全線達標 (WCAG AA/AAA Compliance)**：
  - 面板底色提升至 `rgb(15 18 28 / max(var(--menu-opacity, 0.94), 0.92))` 搭配 `24px` 毛玻璃模糊與深層陰影，根絕背景高光窗戶、琴譜與淺色壁紙透光造成的文字閱讀干擾。
  - 次要文字全面改用 `#CBD5E1`（Slate-300）與 `#E2E8F0`（Slate-200），實測對比度穩定達 9:1 以上（超越 AAA 7:1）。
  - 「二維配置」紫色 Badge 升級為高明度淺紫 `#D8B4FE` 搭配適當襯底與邊框，對比度自 2.0:1 提升至 5.2:1（符合 AA/AAA）。
  - 來源卡片邊框與狀態對比度優化，未選取卡片輪廓清晰可辨（WCAG 1.4.11）。
- **⌨️ 鍵盤無障礙與空間舒適度 (Accessibility & Layout)**：
  - 面板寬度由緊繃的 380px 擴展至舒適的 420px（`max-width: calc(100vw - 32px)`），高度擴展至 560px。
  - 加入按 `Escape` 鍵立即關閉控制面板的鍵盤無障礙標準行為。
  - 全面板按鈕、分頁、卡片、滑桿補齊高對比 `:focus-visible` 焦點環。
  - 關閉按鈕提升至 32x32px，符合觸控標準。

## [1.4.0] - 2026-10-28

### 🎛️ 聲學與專注中心 UI/UX 全面重構 (Acoustic & Focus Center UI/UX Overhaul)

- **🌿 左側聲學氛圍中心整合 (Quick Ambience Bar)**：
  - 將雨聲 (`Rain`)、雷聲 (`Thunder`)、叢林鳥鳴 (`Jungle`)、營火聲 (`CampFire`) 4 大快捷音效由右上角遷移至左側 `TrackList` 頂部。
  - 左側建立統一聲學氛圍中心，實現快捷音效與 9 大場景音軌同側一站式混音。
  - 將雨景動畫 (`RainAnimation`) 與雷雨閃電螢幕閃爍動畫 (`lightning-flash`) 提升至全域頂層 (`App.svelte`)，透過 `ambientVisualStore` 驅動，徹底解決移動端抽屜 `transform`/`display:none` 導致的包含塊裁切與動畫隱藏問題。
  - 修正雷雨開關時 `scheduleNextFlash` 狀態賦值順序，確保閃電排程即時啟動。

- **⏱️ 右上角獨立專注與定時器 (Independent Focus & Pomodoro Dock)**：
  - 打造全新 `TimerControl.svelte` 元件，右上角控制列常駐顯示微型狀態指示點（專注綠 / 休息藍 / 暫停琥珀）與即時倒數時間標籤（如 `⏱️ 24:18`）。
  - 點擊彈出專屬 Popover，支援三大情境切換：
    1. **☕ 番茄工作法**：經典 25/5 分鐘或 50/10 分鐘工作與休息輪播，自動輪次記錄。
    2. **🌙 睡眠定時器**：15m / 30m / 45m / 60m 自選，倒數結束即時觸發 `fadeOutMusic` 平滑淡出音樂，免除尖銳蜂鳴驚醒。
    3. **⏱️ 自訂定時**：自由設定專注分鐘數。
  - 導入基於真實時間戳記（`Date.now()`）的防漂移計時演算法，克服背景分頁節流（Timer Throttling）導致的時間停滯。
  - 提示機制採用非同步廣播與 Toast 提醒，移除阻塞主執行緒之 `window.alert()`。
  - AudioContext 播放後顯式釋放，杜絕瀏覽器音訊資源洩漏；輸入端全面防護 `NaN` 與負值。
  - 自適應移動端螢幕寬度，修復 375px–390px 小尺寸破版溢出。

- **📑 系統設定面板 Tab 分頁化 (Segmented Control Sheet)**：
  - 重構 `Settings/index.svelte`，徹底解決垂直單欄過長（58vh）擁擠堆疊問題。
  - 頂部設計 Segmented Tabs：
    - **🎨 外觀桌布**：選單透明度調節條 + 全新二維桌布控制矩陣。
    - **🔊 混音音量**：主電台音量與 4 大快捷音效音量拉桿。
    - **💾 情境預設**：自訂混音場景存檔與一鍵讀取。
  - 固定高度（520px / 80vh），內部區域平滑捲動，並將定時器抽離至獨立 Dock。

- **🖼️ 桌布設定正交二維矩陣化 (Source × Mode Matrix)**：
  - 重構 `Background.svelte`，將所有背景來源收斂為一致的直覺模型：
    - **來源 (Source)**：`[ 🌐 Bing 官方 ]` · `[ 🌸 人像寫真 ]` · `[ ☕ 插畫主題 (10款) ]` 3 選 1 卡片。
    - **模式 (Mode)**：`[ 📌 固定/手動精選 ]` vs `[ 🎲 隨機輪播 ]` 2 選 1 膠囊開關。
    - **自適應微調區**：Bing 固定為今日精選 1080P、隨機可按「換一張」；人像寫真支援鎖定與「換一張」；本地主題支援「< 縮圖預覽 >」與「隨電台同步切換」。
  - 修正 API 逾時回退時 `currentSource` 與本地背景的狀態同步問題。
  - 100% 向前相容既有 `localStorage` 儲存設定。

## [1.3.0] - 2026-10-23

### ♿ 環境音軌輪播清單 WCAG 2.1 AA/AAA 無障礙、色彩對比與字體全面升級 (Ambient TrackList WCAG AA/AAA & Typography Overhaul)

- **超高對比暗色毛玻璃卡片（解決高光/落日背景文字對比失效）**：
  - 將卡片背景底色由過於透明的 `rgba(255, 255, 255, 0.03)`（3% 白）升級為深邃暗色毛玻璃 `background: rgba(15, 18, 28, 0.86)`，搭配 `backdrop-filter: blur(20px)`、`border: 1px solid rgba(255, 255, 255, 0.22)` 與立體陰影。
  - 即便在純白、強光或落日微軟 Bing / 美女桌布背景下，文字對比度皆穩健維持在 10:1 ~ 18:1，大幅超越 WCAG 2.1 AAA 標準（7:1）。
  - 播放中音軌卡片以橘金漸層光澤邊框（`#FB923C`）與微暈立體光感點綴，搭配超高對比「播放中」膠囊標籤（深炭黑文字 `#1C1917` 搭配實心暖橘底 `#FDBA74`，對比度達 10.6:1），狀態一目了然。
- **立體清晰字體排版與鄰近卡片可讀性強化**：
  - 音軌標題提升至 `20px` 粗體（`#FFFFFF` / `#FFF7ED`），敘述文字採用 `15px`（`#E2E8F0`，字重 500，行高 1.5），並帶有細膩文字陰影。
  - 鄰近卡片（`.item-before-visible` / `.item-after-visible`）透明度由 0.5 提升至 `0.92`，縮放比率由 0.8 升級為 `0.9`（位移 `±152px`），背景採用 `rgba(15, 18, 28, 0.80)`，徹底消除鄰近卡片文字縮小後無法辨識的困境。
- **高對比度音量滑桿與百分比指示徽章**：
  - 移除原僅 4px 的低能見度滑桿，重新設計為 6px 高對比滑軌（`rgba(255, 255, 255, 0.28)`）與 16px 鮮明暖橘圓形滑塊（`#FB923C` + 2px 純白外框），並新增即時音量百分比徽章（`{volume}%`，`#FED7AA`）。
  - 滑桿容器配置事件冒泡阻擋（`stopPropagation`），拖曳或點選音量時不會誤觸播放/暫停。
- **底部導覽列升級與 WCAG 導航指示膠囊**：
  - 徹底淘汰原本單一且方向混淆的向下按鈕，升級為符合無障礙標準的獨立導覽列（`nav.nav-bar`）。
  - 整合「上一首 (↑)」按鈕、「{visibleTrackId} / {tracks.length} · {activeCount} 首播放中」高對比狀態膠囊與「下一首 (↓)」按鈕，均具備完整 `aria-label`、鍵盤焦點環（`outline: 2px solid #FB923C`）與懸浮動態回饋。
- **中文意境敘述全面潤飾與生命週期架構優化**：
  - 全新潤飾 9 首環境音軌之意境描述，修復第 9 首水下音效玩笑文字為「深海溫柔包覆的低頻水波聲，隔絕紛擾、進入冥想與深眠。」
  - 徹底移除原本在模組層級註冊的 11 個離散 keydown 監聽器，收斂整合為掛載於 `onMount` 並於 `onDestroy` 完整銷毀之單一 `handleKeyDown`，嚴密過濾輸入框與修飾鍵，並完善清理 Audio 實例，根絕記憶體洩漏與重複監聽問題。
  - 移除重複的 HTML `id` 屬性（`#title`, `#info`, `#volume-slider`），全數規格化為語意 class 與 WAI-ARIA 屬性（`role="button"`, `aria-pressed`, `aria-label`）。

### 🎨 背景系統全面升級與微軟 Bing / 美女官方桌布架構重構 (Background System & Official Wallpaper Overhaul)

- **微軟官方 Bing HPImageArchive 三級高可用桌布架構**：
  - 徹底剔除已失效的第三方 `bing.img.run` 網域，啟動時主動清理 localStorage 舊有失效網址。
  - **Tier 1 (同源官方微軟 API 代理)**：
    - 在 `vercel.json` 設置 `/api/bing-official` 反向代理至 `https://www.bing.com/HPImageArchive.aspx`，並於 `vite.config.ts` 開發伺服器配置代理。
    - 取得微軟官方每日/隨機高畫質桌布資料，動態適配桌面 (1920x1080) 與手機 (1080x1920) 官方 CDN 解析度，並同步寫入微軟官方版權與地名資訊 (`bgTitle`)。
  - **Tier 2 (直連 CORS JSON 備援 API)**：
    - 當靜態環境代理不可用時，自動回退請求 `bing.biturl.top` 及 `peapix.com` 官方摘要 JSON，提取官方微軟 CDN (`www.bing.com/th?id=OHR...`) 高清影像。
  - **Tier 3 (微軟官方驗證 CDN 影像池)**：
    - 內建 8 組經 HTTP 驗證為 200 OK 之微軟官方永久典藏桌布資源池，即便在無外部 API 環境下亦能穩定取得微軟官方桌布。

- **美女 / 藝術肖像桌布二級高可用架構**：
  - 徹底剔除失效的 `api.liuzhuai.com` 端點。
  - **Tier 1 (即時 API 代理與直連)**：
    - 在 `vercel.json` 與 `vite.config.ts` 設置 `/api/beauty-official` 代理轉發至 `https://api.btstu.cn/sjbz/api.php`，支援 3.5s 快速超時與 HTTPS 自動規格化。
  - **Tier 2 (18 組高解析人像與藝術寫真資源池)**：
    - 精選 13 組經 HTTP 驗證可用之 BTSTU 高畫質人像及 5 組 Unsplash 高畫質藝術寫真桌布，提供順暢隨機切換。

- **10 組全新 16:9 Lo-Fi 原創風格本地主題插畫 (`bg1.jpg`–`bg10.jpg`)**：
  - 全新生成 10 張風格高度一致的精美 16:9 Lo-Fi 插畫，深度對齊 6 大電台與 4 大環境音效主題：
    1. `bg1.jpg`：咖啡廳輕音樂 (Cafe Lounge)
    2. `bg2.jpg`：專注 Lo-Fi Beats (Lo-Fi Study)
    3. `bg3.jpg`：Chillhop 律動 (Chillhop Groove)
    4. `bg4.jpg`：深夜爵士鋼琴 (Piano Jazz Bar)
    5. `bg5.jpg`：純淨療癒鋼琴 (Peaceful Piano)
    6. `bg6.jpg`：深夜放鬆氛圍 (Nightwave Chill)
    7. `bg7.jpg`：聽雨夜色 (Rainy Night Alley)
    8. `bg8.jpg`：星空營火 (Starry Campfire)
    9. `bg9.jpg`：迷霧森林 (Misty Forest)
    10. `bg10.jpg`：靜謐海浪 (Moonlit Ocean)

- **電台與背景智慧同步連動 (Station-Synced Background)**：
  - 新增「隨電台同步切換背景」切換開關（預設為開啟 ON）。
  - 在本地背景模式下，切換電台頻道時自動切換至與該電台風格完美契合之插畫背景（Cafe → bg1, Lo-Fi → bg2, Chillhop → bg3, Jazz → bg4, Piano → bg5, Nightwave → bg6）。
  - 設定面板即時呈現當前背景序號與主題名稱（例：`本地背景 (2/10) · 專注 Lo-Fi Beats`）。

- **全域背景狀態中央化與高強韌載入機制 (`bgStore.ts`, `App.svelte`, `TVApp.svelte`)**：
  - `bgStore.ts` 導出 `bgUrl` 與 `bgTitle`，預設預載優質 Lo-Fi 背景，確保 `App.svelte` 與 `TVApp.svelte` 在設定面板載入前即具備有效背景網址。
  - 新增 `onImageError` 錯誤監聽與自動回退機制：任何背景若遭遇網路或解析失敗，即刻優雅回退至預設 `/assets/background/bg2.jpg`。
  - 監聽圖片 `.complete` 屬性與 `tick()`，徹底消除背景透明度停留在 `opacity: 0` 的渲染卡頓問題。

---

## [1.2.0] - 2026-10-23

### 🎨 品牌識別升級與全方位 SEO / Open Graph 滿分優化 (Brand Identity & SEO 100/100 Upgrade)

- **全新品牌 Logo 與跨平台圖標系統**：
  - 設計高質感暖橘漸層背景（`#FF7A00` → `#EA580C`）搭配俐落雙行幾何無襯線白字（「888\nMusic」）向量品牌標誌 (`public/favicon.svg`)，圓角率 `rx="112"` 帶有細緻高光內框。
  - 產出全套高解析度無失真圖標與抗鋸齒圖檔：
    - `public/favicon.svg` (向量可縮放)
    - `public/favicon-32x32.png` & `public/favicon-16x16.png`
    - `public/favicon.ico` (多尺寸 16x16, 32x32, 48x48 複合圖標)
    - `public/icons/apple-touch-icon.png` (180x180)
    - `public/icons/icon-192.png` (192x192)
    - `public/icons/icon-512.png` (512x512)
    - `public/LofiEngine.png` & `app-icon.png` (512x512)
- **1200x630 高規格社群分享卡片 (`public/og-image.png`)**：
  - 專為 Open Graph 與 Twitter Card 打造的 1200x630 高解析社群分享圖卡。
  - 深邃星空夜色氛圍背景（`#0f111a` → `#1a162b`）烘托溫暖橘光微暈，左側搭載「888\nMusic」品牌方塊，右側整合層次分明之「888 Music / 24/7 Lo-Fi & Chill Radio」、「Cafe Lounge • Lo-Fi Study • Chillhop • Piano Jazz • Ambient Mixer」與網域資訊。
- **全站 SEO 與社群標籤滿分強化 (`index.html`)**：
  - 設定 `<html lang="zh-TW">` 標準語系標記。
  - 標題更新為 `888 Music - 24/7 Lo-Fi & Chill 線上音樂電台與白噪音混音器 | DAVID888`。
  - 補齊完整 Meta Description、標準網址 Canonical (`https://music.david888.com/`) 與主題色 Theme Color (`#EA580C`)。
  - 完整配置 Open Graph (`og:type`, `og:site_name`, `og:title`, `og:description`, `og:url`, `og:image`, `og:image:secure_url`, `og:image:width`, `og:image:height`, `og:image:alt`)。
  - 完整配置 Twitter Card (`twitter:card` `summary_large_image`, `twitter:site`, `twitter:title`, `twitter:description`, `twitter:image`)。
  - 植入 Google / Schema.org `WebApplication` 與 `WebSite` JSON-LD 結構化資料。
- **單一語意化 H1 標題結構規範**：
  - 於 `index.html` 內嵌無障礙隱藏樣式（`.sr-only`）並置入唯一全域主標題 `<h1 class="sr-only">888 Music - 24/7 Lo-Fi & Chill 線上音樂電台與環境白噪音混音器</h1>`。
  - 重構 `src/lib/components/InfoBox/Info.svelte`，將彈窗內部原本的 `<h1>` 調整為 `<h2 class="app-title">888 Music - DAVID888</h2>`（同步更新 CSS 樣式命名與 Logo `alt="888 Music Logo"`），杜絕頁面產生多重 `<h1>` 的 SEO 扣分問題。
- **PWA Web App Manifest 規範同步 (`public/site.webmanifest`)**：
  - 同步更新應用程式名稱為 `888 Music - DAVID888`，短名稱 `888 Music`，主題色更新為品牌暖橘色 `#EA580C`。

---

## [1.1.0] - 2026-10-23

### 🚀 重大重構：Route A 24/7 線上 Lo-Fi 電台 + 本地環境音效混音架構

- **全新線上電台引擎 (`src/lib/stores/radioStore.ts`)**：
  - 徹底移除過去不可靠且音質混亂的本機隨機演算法音符/和弦生成邏輯與殘留程式碼（完全移除 `TankDrum`、Canon、Chords、Drums、Piano 舊模組）。
  - 導入單例 `HTMLAudioElement` 管理與 Svelte store，提供 6 大精選 24/7 高音質電台（Cafe Lounge, Lo-Fi Study, Chillhop Groove, Piano Jazz Bar, Peaceful Piano, Nightwave Chill）。
  - 內建一級備援串流切換機制（Fallback URL Auto-Recovery）與平滑淡出休眠定時（Fade out & Stop）。
- **桌面播放器全新改版 (`src/lib/PlayButton.svelte`)**：
  - 採用半透明毛玻璃現代質感（Glassmorphism）響應式卡片設計。
  - 頂部支援 6 大電台膠囊快速切換標籤。
  - 播放中動態等化器（Equalizer）跳動動畫與即時狀態回饋。
  - 快捷鍵支援：空白鍵播放/暫停、N/P 切換下一台/上一台。
- **電視端 TV 介面全適配 (`src/TVApp.svelte`, `src/lib/TVPlayButton.svelte`, `src/lib/components/TVBPMControl.svelte`)**：
  - TV 介面全面適配大螢幕與遙控器快捷鍵（OK 播放/暫停、左右切換電台、上下音量調整）。
  - 將原本的 BPM 控制面板重構成電視專用電台頻道選單網格。
  - 頂部跑馬燈即時連動電台頻道名稱與播放狀態。
  - 修復 TV 端音效與音軌檔名路徑錯誤（`campfire.mp3` → `fire.mp3` 以及 4 個 ambient tracks 檔名修正）。
- **圖標系統升級（全面導入 `lucide-svelte`）**：
  - 遵循使用者規範，全面汰換 Emoji 符號與舊版 `@tabler/icons-svelte` 套件，全站改採簡約俐落的 Lucide 向量 SVG 圖標，打包轉換模組數由 7,100 降至 2,135（建置速度提升 4 倍）。
- **效能優化與 Dual-Code-Review 品質強化**：
  - 移除環境音效中每 100~200ms 的 `setInterval` 音量輪詢機制，改為響應式音量綁定與 `volumesUpdated` 事件驅動，徹底杜絕無謂的 CPU 負載。
  - 移除 `HTMLAudioElement` 的 `crossOrigin = "anonymous"` 強制限制，確保所有經由 302 轉址的 Icecast 電台串流皆能無縫播放不被 CORS 阻擋。
  - 加入 `requestSeq` 請求序號保護與 `AbortError` / `NotAllowedError` 過濾，解決快速切換頻道時的非同步競爭問題。
  - 修正全域鍵盤快捷鍵（空白鍵、`Enter`、`N`、`P`）在按鈕聚焦或搭配 `Cmd/Ctrl/Alt` 組合鍵時的誤觸問題，並補齊所有組件的 `onDestroy` 事件監聽清理與 `prefers-reduced-motion` 無障礙支援。

---

## 📝 已加入 README.md

所有新功能和音軌對照表已整合到 ### 🐛 Bug 修復

#### 小鼓預設靜音問題修復（完全解決版）

**問題**：部署到 Vercel 後，首次播放音樂仍能聽到小鼓聲音，即使預設值設為 `snare: 0`

**根本原因分析**：
1. Snare 樂器在初始化時有預設音量 `-6 dB`
2. `updateInstrumentVolumes()` 在樂器完全載入前就被調用
3. **核心問題**：`snareLoop` 總是會啟動並觸發 `snare.triggerAttack()`
4. 即使音量設為 `-Infinity` dB，在音量完全生效前仍可能聽到聲音

**完整解決方案**：

**第一步：確保音量在載入後立即應用**
- ✅ 在每個樂器載入完成的 callback 中立即應用音量設定
- ✅ 新增 `applyInstrumentVolume()` 函數

**第二步：根據音量初始化 on/off 狀態**（新增！）
- ✅ 載入 `instrumentVolumes` 後立即初始化 `snareOff` 狀態
- ✅ 當 `snare` 音量為 0 時，`snareOff = true`
- ✅ `snareLoop` 的 callback 會檢查 `snareOff`，完全阻止觸發

**第三步：同步音量與 on/off 狀態**（新增！）
- ✅ 當用戶調整音量時，自動同步 `kickOff`, `snareOff`, `hatOff`
- ✅ 確保音量為 0 時樂器完全不觸發

**關鍵代碼**：
```typescript
// 初始化時根據音量設定 on/off 狀態
let instrumentVolumes = loadInstrumentVolumes();
let snareOff = instrumentVolumes.snare === 0;  // snare: 0 → snareOff: true

// snareLoop 檢查 snareOff
snareLoop = new Tone.Sequence((time, note) => {
  if (!snareOff) {  // ← 當 snareOff=true 時，完全不觸發
    snare.triggerAttack(note);
  }
}, ...);

// 音量更新時同步 on/off 狀態
const handleInstrumentVolumes = (e) => {
  instrumentVolumes = e.detail;
  snareOff = instrumentVolumes.snare === 0;  // ← 同步狀態
  updateInstrumentVolumes();
};
```

**修改檔案**：
- `src/lib/PlayButton.svelte`: 完整修復邏輯**音軌對照表**：在 "🎵 Ambient Track List" 章節
- ✅ **新功能說明**：在 "New Features 🎉" 章節
- ✅ **隨機背景功能**：詳細使用說明
- ✅ **直觀音軌名稱**：中英對照完整列表
- ✅ **手機版音軌顯示**：收合式音軌列表
- ✅ **Bing API 背景**：支援 Bing 每日高清桌布

---

## 2026-04-24 - 背景沉浸式動畫升級
### ✨ 新功能
#### 7. 🎬 背景圖片淡入與縮放動畫 (Bing 風格)
- ✅ **平滑淡入 (Fade-in)**：背景圖片在完全載入後才會優雅地淡入，徹底解決大圖載入時由上而下的殘影感。
- ✅ **緩慢縮放 (Ken Burns Effect)**：圖片淡入的同時，會伴隨長達 10 秒的緩慢縮小動畫 (`scale(1.1)` -> `scale(1)`)，營造出「呼吸感」與高級的沉浸體驗。
- ✅ **全局狀態解耦**：引入 `bgStore.ts` 統一管理背景狀態，讓設定面板與主程式 (`App.svelte`, `TVApp.svelte`) 之間的資料傳遞更穩定。
- ✅ **切換自動復位**：每次切換背景時，動畫會自動復位，確保每張新桌布都能再次展現完整的動畫效果。

---

## 2026-04-23 - UI 體驗優化與 Bing 隨機模式
### ✨ 新功能
#### 6. 🎨 選單透明度與視覺優化 (新增！)
- ✅ **預設透明度調整**：將預設透明度從 40% 提高至 **70%**，大幅提升文字可讀性。
- ✅ **全域字體加強**：
    - 提高基礎字體大小至 `17px`。
    - 增加行高至 `1.6` 讓段落更疏朗。
    - 針對原本過小的標籤、版本號、描述文字進行全域加強（例如：`10px` -> `12px`, `x-small` -> `13px`）。
- ✅ **Bing 隨機模式**：
    - 新增 **Bing 隨機模式開關**（預設為 **ON**）。
    - 開啟後點擊 Bing 按鈕將獲取隨機的高清桌布。
- ✅ **左側音軌列表優化**：
    - 大幅調大音軌標題（`16px` -> `22px`）與描述文字。
    - 擴大音軌列表容器寬度，確保文字顯示更完整。
### 🐛 Bug 修復
#### 雨聲音量起伏與循環優化 (最終修復)
- ✅ **線性 Gain 交叉淡入淡出**：捨棄 Decibel (Volume) 節點，改用 Gain 節點進行線性漸變，徹底消除跨段落時的音量「凹陷」感 (fluctuation)。
- ✅ **精準 Transport 排程**：捨棄 JS `setInterval`，改用 `Tone.Transport` 排程，確保交叉淡入淡出在毫秒級精準對齊音訊 buffer 結尾。
- ✅ **加長淡入淡出**：將交叉點設為 4 秒，提供更平滑的環境音過渡。

### 🎵 音樂引擎優化
#### 全域掃除「登登登」快音
- ✅ **全面禁用 8 分音符**：檢查並移除了所有風格（Cafe, Relaxing, Jazz, Canon）中的 `8n` 音符選項。
- ✅ **旋律長音化**：所有風格的旋律現在僅由四分音符 (`4n`)、二分音符 (`2n`) 及全音符 (`1n`) 組成，確保聽感始終保持平穩、舒適。
- ✅ **Cafe 風格徹底重製 (參考 Relaxing 風格)**：捨棄複雜的爵士搖擺，改用 **Straight Rhythm (Swing: 0)** 與簡單的**三和弦配置 (Triads)**。
- ✅ **極致向上偏好**：維持極高的上行偏好，並調整連續上行後的處理邏輯，確保旋律始終保持穩定上升或持平，絕不出現悲傷的連續下行。
- ✅ **速度微調**：將 BPM 穩定在 `80`，提供輕盈且愉快的聽感。

**修改檔案**：
- `src/lib/components/Controls/Rain/index.svelte`: 重寫為雙 Player 線性交叉淡入淡出系統。
- `src/lib/PlayButton.svelte`: 全面掃除全風格 `8n` 快音，重製 Cafe 模式邏輯，優化旋律方向。
- `src/lib/engine/Chords/Chord.ts`: 優化和弦配置 (Voicing) 演算法。

---

## 2025-10-13 - 最新更新 (晚間更新)

### ✨ 新功能

#### 5. 🌐 Bing 每日高清桌布 API 整合 (新增！)

**功能描述**：整合 Bing 官方 API，提供每日更新的高解析度桌布，並自動偵測設備類型

**主要特色**：
- ✅ **一鍵切換 Bing 桌布**：點擊「Bing 每日桌布」按鈕即可載入
- ✅ **智能設備偵測**：自動識別手機或桌面設備
  - 📱 手機版: `bing.img.run/m.php` (優化手機顯示)
  - 💻 桌面版: `bing.img.run/1920x1080.php` (1920x1080 高解析度)
- ✅ **自動每日更新**：每天自動檢測並更新為最新的 Bing 桌布
  - 使用 `localStorage` 記錄最後載入日期
  - 新的一天開啟應用時自動重新載入
  - 同一天內使用快取，節省流量
- ✅ **CORS 問題解決**：使用 Image 對象預載入，CSS background-image 不受 CORS 限制
- ✅ **智能回退機制**：若 API 載入失敗，自動使用本地背景
- ✅ **狀態指示**：顯示載入中、成功或失敗狀態，並標示設備類型
- ✅ **快取功能**：成功載入的背景會儲存在 localStorage
- ✅ **雙軌制背景系統**：可隨時切換 Bing API 或本地背景

**技術實作**：
- API 端點:
  - 桌面版: `https://bing.img.run/1920x1080.php`
  - 手機版: `https://bing.img.run/m.php`
- CORS 解決方案:
  - 使用 `new Image()` 對象預載入測試
  - CSS `background-image` 不受 CORS 限制
  - 避免使用 `fetch()` 直接請求圖片
- 設備偵測邏輯:
  - 螢幕寬度 <= 600px
  - 或 User-Agent 包含移動設備標識
- 5 秒超時保護
- localStorage 鍵值:
  - `use-bing-api`: 儲存是否使用 Bing API (true/false)
  - `bing-bg-url`: 快取最後成功載入的 Bing URL
  - `bg-id`: 本地背景 ID (1-10)

---

### 🐛 Bug 修復

#### 小鼓預設靜音問題修復

**問題**：部署到 Vercel 後，首次播放音樂時仍能聽到小鼓聲音，即使預設值設定為 0

**根本原因**：
- Snare 樂器在初始化時有預設音量 `-6 dB`
- `updateInstrumentVolumes()` 在樂器完全載入前就被調用
- 導致預設的 `snare: 0` 設定沒有生效

**解決方案**：
- ✅ 在每個樂器載入完成的 callback 中立即應用音量設定
- ✅ 新增 `applyInstrumentVolume()` 函數，確保音量在載入後正確應用
- ✅ 添加 console.log 追蹤音量設定（開發模式）

**修改檔案**：
- `src/lib/PlayButton.svelte`: 改進樂器初始化邏輯

**驗證方式**：
1. 清除 localStorage（或使用無痕模式）
2. 重新載入頁面
3. 點擊播放按鈕
4. 應該聽不到小鼓聲音（snare = 0%）
5. Console 會顯示：`🥁 Snare volume set: 0 (-Infinity dB)`

---

## 2025-10-13 - 最新更新 (下午更新)

### ✨ 新功能

#### 4. 📱 手機版音軌列表優化 (新增！)

**問題**：原本手機版完全隱藏音軌列表，用戶無法在手機上切換環境音

**解決方案**：
- ✅ **可展開/收合介面**：底部顯示「顯示音軌」按鈕
- ✅ **播放數量顯示**：顯示當前播放音軌數（如：3/9）
- ✅ **不遮擋播放器**：收合時只佔用 50px 高度
- ✅ **優化觸控體驗**：更大的點擊區域，適合手機操作
- ✅ **平滑動畫**：展開/收合使用 0.3s 過渡動畫

**手機版使用方式**：
1. 點擊螢幕底部的「顯示音軌 (0/9)」按鈕
2. 音軌列表會從底部展開
3. 點擊任意音軌播放/暫停
4. 點擊「隱藏音軌」按鈕收起列表

**技術細節**：
- 固定在底部 20px（收合時）或 100px（展開時）
- 最大高度 65vh，支援滾動
- 背景毛玻璃效果 (backdrop-filter: blur(15px))
- 自適應卡片大小（手機版縮小圖片至 60x60px）

---

## 2025-10-13 - 最新更新 (上午更新)

### ✨ 新功能

#### 1. 🎨 背景圖片隨機載入
- **首次載入自動隨機**：當用戶第一次開啟應用時，會自動隨機選擇一張背景圖片
- **隨機按鈕**：在設定面板的背景區域新增「隨機背景」按鈕（🔄圖示）
- **一鍵換新**：點擊隨機按鈕可立即切換到隨機背景（確保不會選到當前背景）

**使用方式**：
- 開啟應用 → 按 `J` 或點擊 ⚙️ → Background → 點擊「隨機背景」按鈕

#### 2. 🎵 音軌標題更直觀
將原本的 "Track 1", "Track 2" 等改為更有意義的中文標題：

| 原標題 | 新標題 | 音效內容 |
|--------|--------|----------|
| Track 1 | 風聲 | 風聲環境音 |
| Track 2 | 海灘聲 | 海浪拍打沙灘 |
| Track 3 | 夜晚氛圍 | 夜晚環境音 |
| Track 4 | 海鷗聲 | 城市海鷗叫聲 |
| Track 5 | 辦公室 | 辦公室環境音 |
| Track 6 | 城市聲 | 城市環境噪音 |
| Track 7 | 伺服器 | 伺服器運作聲 |
| Track 8 | 火車聲 | 火車行駛聲 |
| Track 9 | 水下白噪音 | 水下白噪音 |

**效果**：用戶一看就知道是什麼音效，不用猜測！

#### 3. 🥁 小鼓預設靜音
- **預設音量改為 0%**：根據用戶反饋，小鼓聲預設改為靜音
- **其他鼓組預設值**：
  - Kick (大鼓): 70%
  - Snare (小鼓): **0%** ← 新增靜音
  - Hi-Hat (鈸): 50%
  - Piano (鋼琴): 100%

**清除舊設定**：如果想應用新的預設值，請：
1. 按 `J` 開啟設定
2. 滾動到「樂器控制」
3. 點擊「🔄 重置」按鈕

---

## 之前的更新

### 📦 預設管理系統
- 保存/載入音樂配置
- 匯出/匯入 JSON 檔案
- 重置為預設值功能

### 🎙️ 錄音功能
- 支援 1/5/10/30/60 分鐘錄音
- WebM 格式下載
- 完整混音錄製

### ⏰ 定時器系統
- 番茄鐘模式 (25分工作 + 5分休息)
- 睡眠定時器 (自動淡出)
- 自訂計時器 (1-240分鐘)

### 🎛️ 樂器音量控制
- 獨立控制鋼琴、Kick、Snare、Hi-Hat 音量
- 快速預設：純鋼琴、輕鼓點、重置
- 個別靜音按鈕

### 🔗 專案更新
- 更新 GitHub 連結至 `tbdavid2019/music-lofi`
- 致謝原作者 `meel-hd/lofi-engine`
- 合併所有 MD 文件到 README.md

---

## 技術細節

### 檔案修改清單

1. **src/lib/components/TrackList/index.svelte**
   - 新增 `title` 屬性到每個音軌
   - 更新音軌資料結構

2. **src/lib/components/TrackList/TrackListItem.svelte**
   - 更新顯示邏輯使用 `track.title`
   - 保留 fallback 顯示 `Track ${track.id}`

3. **src/lib/components/Controls/Settings/Background.svelte**
   - 新增 `randomBg()` 函數
   - 首次載入時隨機選擇背景
   - 新增隨機按鈕 UI
   - 導入 `IconRefresh` 圖示

4. **src/lib/PlayButton.svelte**
   - 修改預設樂器音量：`snare: 0` (原為 `0.6`)

5. **src/lib/components/InfoBox/SocialLinks.svelte**
   - 更新 GitHub 連結

6. **README.md**
   - 合併 NEW_FEATURES.md 和 IMPLEMENTATION_SUMMARY.md
   - 更新安裝說明
   - 新增致謝區塊
   - 標註小鼓預設靜音

---

## 如何使用新功能

### 🎨 隨機背景
```
方法1: 首次開啟應用會自動隨機
方法2: 按 J → Background → 點擊「隨機背景」按鈕
```

### 🎵 查看新的音軌標題
```
左側音軌列表會直接顯示「海灘聲」、「風聲」等中文標題
不再是 Track 1, Track 2 了！
```

### 🥁 調整小鼓音量
```
按 J → 樂器控制 → 調整 Snare 滑桿
預設已經是 0%（靜音）
```

---

## 已知問題

無

---

## 下一步計劃

- [ ] 更多音軌選擇
- [ ] 自訂音軌上傳功能
- [ ] 更多背景圖片
- [ ] 主題切換功能

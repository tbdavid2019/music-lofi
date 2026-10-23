# 更新日誌 (Changelog)

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

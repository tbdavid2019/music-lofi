# 🚀 部署指南

本專案支援多種部署方式，選擇最適合你的方案：

---

## 方案一：Vercel 部署 ⚡（推薦）

### 為什麼選擇 Vercel？
- ✅ 自動 CI/CD（push 即部署）
- ✅ 免費 SSL 憑證
- ✅ 全球 CDN 加速
- ✅ 零配置，開箱即用
- ✅ 預覽部署（每個 PR 都有獨立預覽）

### 部署步驟：

#### 方法 A：網頁介面（最簡單）

1. 前往 [vercel.com](https://vercel.com)
2. 使用 GitHub 帳號登入
3. 點擊 "Import Project"
4. 選擇這個 repository（`lofi-engine`）
5. Vercel 會自動檢測配置：
   - Framework Preset: Vite
   - Build Command: `pnpm build`
   - Output Directory: `dist`
6. 點擊 **Deploy** 🚀

完成！你的網站會在幾分鐘內上線，網址類似：
```
https://lofi-engine-[你的用戶名].vercel.app
```

#### 方法 B：命令行部署

```bash
# 1. 安裝 Vercel CLI
npm install -g vercel

# 2. 登入 Vercel
vercel login

# 3. 部署
vercel

# 4. 部署到生產環境
vercel --prod
```

### 自訂域名（可選）

在 Vercel Dashboard → Settings → Domains 可以添加自己的域名。

---

## 方案二：GitHub Pages 部署 📄

### 為什麼選擇 GitHub Pages？
- ✅ 完全免費
- ✅ 與 GitHub 原生整合
- ✅ 簡單穩定
- ✅ 已配置自動部署 workflow

### 部署步驟：

#### 1. 啟用 GitHub Pages

1. 進入 GitHub repository 設定
2. 左側選單點擊 **Pages**
3. Source 選擇：**GitHub Actions**

#### 2. 推送代碼觸發部署

```bash
git add .
git commit -m "Setup deployment"
git push origin master
```

#### 3. 查看部署狀態

- 前往 repository 的 **Actions** 標籤
- 查看 "Deploy to GitHub Pages" workflow
- 等待綠色勾勾 ✅

#### 4. 訪問你的網站

部署完成後，網站會在：
```
https://[你的用戶名].github.io/lofi-engine/
```

或者如果你的 repository 名稱是 `[用戶名].github.io`：
```
https://[你的用戶名].github.io/
```

---

## 方案三：Netlify 部署 🎯

### 部署步驟：

1. 前往 [netlify.com](https://netlify.com)
2. 點擊 "Import from Git"
3. 選擇 GitHub repository
4. 配置：
   - Build command: `pnpm build`
   - Publish directory: `dist`
5. 點擊 **Deploy**

---

## 本地測試生產構建 🧪

在部署前，建議先在本地測試：

```bash
# 構建生產版本
pnpm build

# 預覽構建結果
pnpm preview
```

然後訪問 `http://localhost:4173` 檢查是否正常運行。

---

## 環境變數設置（如需要）

如果專案需要環境變數，在各平台添加：

### Vercel
Dashboard → Settings → Environment Variables

### GitHub Pages
Settings → Secrets and variables → Actions

### Netlify
Site settings → Environment variables

---

## 故障排除 🔧

### 1. GitHub Pages 404 錯誤

確認 `vite.config.ts` 中的 `base` 路徑：
- 專案頁面（`username.github.io/repo-name/`）：`base: '/lofi-engine/'`
- 用戶頁面（`username.github.io`）：`base: '/'`

當前配置為 `base: './'`（相對路徑），適用於大多數情況。

### 2. 資源加載失敗

檢查 `public/` 資料夾的資源路徑是否正確。

### 3. Build 失敗

檢查 Node.js 版本，建議使用 v18 或更高版本：
```bash
node -v
```

---

## 更新部署 🔄

### Vercel / Netlify
直接 push 到 GitHub，會自動重新部署。

### GitHub Pages
推送到 master 分支會自動觸發 workflow。

---

## 推薦部署方案總結

| 平台 | 速度 | 配置 | CDN | 免費額度 | 推薦指數 |
|------|------|------|-----|---------|---------|
| **Vercel** | ⚡⚡⚡ | 零配置 | ✅ 全球 | 慷慨 | ⭐⭐⭐⭐⭐ |
| **GitHub Pages** | ⚡⚡ | 已配置 | ✅ 有限 | 無限 | ⭐⭐⭐⭐ |
| **Netlify** | ⚡⚡⚡ | 簡單 | ✅ 全球 | 慷慨 | ⭐⭐⭐⭐ |

**個人建議：** 
- 🥇 **Vercel**：最佳開發體驗，適合需要頻繁更新的專案
- 🥈 **GitHub Pages**：完全免費，適合開源專案展示
- 🥉 **Netlify**：功能全面，介於兩者之間

---

## 📝 相關文件

- [Vercel 文檔](https://vercel.com/docs)
- [GitHub Pages 文檔](https://docs.github.com/pages)
- [Vite 部署指南](https://vitejs.dev/guide/static-deploy.html)

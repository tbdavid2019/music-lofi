<script lang="ts">
  import { IconDeviceFloppy, IconTrash, IconDownload, IconUpload, IconRefresh } from "@tabler/icons-svelte";

  const PRESETS_STORAGE_KEY = "LofiEngine_Presets";
  const CURRENT_STATE_KEY = "LofiEngine_CurrentState";

  interface Preset {
    id: string;
    name: string;
    timestamp: number;
    state: {
      key: string;
      bpm: number;
      volumes: any;
      kickOff: boolean;
      snareOff: boolean;
      hatOff: boolean;
      melodyDensity: number;
      melodyOff: boolean;
      background: number;
    };
  }

  let presets: Preset[] = loadPresets();
  let newPresetName = "";
  let showSaveDialog = false;

  function loadPresets(): Preset[] {
    try {
      const stored = localStorage.getItem(PRESETS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error("Failed to load presets:", e);
      return [];
    }
  }

  function savePresets() {
    localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(presets));
  }

  function getCurrentState() {
    try {
      const stored = localStorage.getItem(CURRENT_STATE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      console.error("Failed to get current state:", e);
      return null;
    }
  }

  function saveCurrentPreset() {
    if (!newPresetName.trim()) {
      alert("請輸入預設名稱");
      return;
    }

    const currentState = getCurrentState();
    if (!currentState) {
      alert("無法獲取當前狀態");
      return;
    }

    const newPreset: Preset = {
      id: Date.now().toString(),
      name: newPresetName.trim(),
      timestamp: Date.now(),
      state: currentState,
    };

    presets = [...presets, newPreset];
    savePresets();
    newPresetName = "";
    showSaveDialog = false;
  }

  function loadPreset(preset: Preset) {
    // 儲存狀態到 localStorage，由 PlayButton 監聽並載入
    localStorage.setItem(CURRENT_STATE_KEY, JSON.stringify(preset.state));
    
    // 觸發自訂事件通知 PlayButton 載入預設
    window.dispatchEvent(new CustomEvent("loadPreset", { detail: preset.state }));
    
    alert(`已載入預設：${preset.name}`);
  }

  function deletePreset(id: string) {
    if (confirm("確定要刪除此預設嗎？")) {
      presets = presets.filter(p => p.id !== id);
      savePresets();
    }
  }

  function exportPresets() {
    const data = JSON.stringify(presets, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lofi-engine-presets-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function importPresets() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event: any) => {
          try {
            const imported = JSON.parse(event.target.result);
            if (Array.isArray(imported)) {
              presets = [...presets, ...imported];
              savePresets();
              alert(`成功匯入 ${imported.length} 個預設`);
            }
          } catch (e) {
            alert("匯入失敗：檔案格式錯誤");
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }

  function formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleString("zh-TW", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function resetToDefault() {
    if (confirm("確定要重置所有設定為預設值嗎？這將清除當前的音樂狀態。")) {
      // 清除當前狀態
      localStorage.removeItem(CURRENT_STATE_KEY);
      
      // 重置為預設狀態 - 純鋼琴模式
      const defaultState = {
        key: "C",
        bpm: 156,
        volumes: {
          rain: 1,
          thunder: 1,
          campfire: 1,
          jungle: 1,
          main_track: 1,
        },
        kickOff: true,    // 預設關閉鼓類樂器
        snareOff: true,   // 預設關閉
        hatOff: true,     // 預設關閉
        melodyDensity: 0.33,
        melodyOff: false,
        background: 1,
      };
      
      localStorage.setItem(CURRENT_STATE_KEY, JSON.stringify(defaultState));
      window.dispatchEvent(new CustomEvent("loadPreset", { detail: defaultState }));
      
      alert("✅ 已重置為預設值！");
    }
  }
</script>

<div class="preset-manager">
  <h3>🎵 預設管理</h3>
  
  <!-- 保存新預設 -->
  <div class="save-section">
    {#if !showSaveDialog}
      <button class="btn-primary" on:click={() => showSaveDialog = true}>
        <IconDeviceFloppy size={18} />
        保存當前設定
      </button>
    {:else}
      <div class="save-dialog">
        <input
          type="text"
          placeholder="輸入預設名稱..."
          bind:value={newPresetName}
          maxlength="30"
          on:keydown={(e) => e.key === 'Enter' && saveCurrentPreset()}
        />
        <button class="btn-save" on:click={saveCurrentPreset}>保存</button>
        <button class="btn-cancel" on:click={() => showSaveDialog = false}>取消</button>
      </div>
    {/if}
  </div>

  <!-- 預設列表 -->
  <div class="presets-list">
    {#if presets.length === 0}
      <p class="empty-message">尚無儲存的預設</p>
    {:else}
      {#each presets as preset (preset.id)}
        <div class="preset-item">
          <div class="preset-info">
            <div class="preset-name">{preset.name}</div>
            <div class="preset-details">
              調性: {preset.state.key} | BPM: {preset.state.bpm || 156}
            </div>
            <div class="preset-date">{formatDate(preset.timestamp)}</div>
          </div>
          <div class="preset-actions">
            <button
              class="btn-load"
              on:click={() => loadPreset(preset)}
              title="載入此預設"
            >
              載入
            </button>
            <button
              class="btn-delete"
              on:click={() => deletePreset(preset.id)}
              title="刪除此預設"
            >
              <IconTrash size={16} />
            </button>
          </div>
        </div>
      {/each}
    {/if}
  </div>

  <!-- 匯入匯出 -->
  <div class="import-export">
    <button class="btn-secondary" on:click={exportPresets} disabled={presets.length === 0}>
      <IconDownload size={16} />
      匯出預設
    </button>
    <button class="btn-secondary" on:click={importPresets}>
      <IconUpload size={16} />
      匯入預設
    </button>
  </div>

  <!-- 重置按鈕 -->
  <div class="reset-section">
    <button class="btn-reset-all" on:click={resetToDefault}>
      <IconRefresh size={16} />
      重置為預設值
    </button>
  </div>
</div>

<style>
  .preset-manager {
    margin-top: 20px;
    padding: 15px 0;
  }

  h3 {
    margin: 0 0 15px 0;
    font-size: 16px;
    font-weight: 600;
  }

  .save-section {
    margin-bottom: 15px;
  }

  .btn-primary {
    width: 100%;
    padding: 10px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: transform 0.2s;
  }

  .btn-primary:hover {
    transform: translateY(-2px);
  }

  .save-dialog {
    display: flex;
    gap: 5px;
    animation: slideDown 0.3s ease;
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .save-dialog input {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    font-size: 14px;
  }

  .save-dialog input::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }

  .save-dialog input:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.6);
  }

  .btn-save, .btn-cancel {
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    transition: opacity 0.2s;
  }

  .btn-save {
    background: #10b981;
    color: white;
  }

  .btn-cancel {
    background: rgba(255, 255, 255, 0.2);
    color: white;
  }

  .btn-save:hover, .btn-cancel:hover {
    opacity: 0.8;
  }

  .presets-list {
    max-height: 300px;
    overflow-y: auto;
    margin-bottom: 15px;
    padding-right: 5px;
  }

  .presets-list::-webkit-scrollbar {
    width: 6px;
  }

  .presets-list::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }

  .presets-list::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 3px;
  }

  .empty-message {
    text-align: center;
    color: rgba(255, 255, 255, 0.5);
    padding: 20px;
    font-size: 14px;
  }

  .preset-item {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all 0.2s;
  }

  .preset-item:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.4);
  }

  .preset-info {
    flex: 1;
  }

  .preset-name {
    font-weight: 600;
    font-size: 14px;
    margin-bottom: 4px;
  }

  .preset-details {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 2px;
  }

  .preset-date {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.5);
  }

  .preset-actions {
    display: flex;
    gap: 5px;
    align-items: center;
  }

  .btn-load {
    padding: 6px 12px;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 12px;
    transition: background 0.2s;
  }

  .btn-load:hover {
    background: #2563eb;
  }

  .btn-delete {
    padding: 6px;
    background: rgba(239, 68, 68, 0.8);
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
  }

  .btn-delete:hover {
    background: rgba(220, 38, 38, 0.9);
  }

  .import-export {
    display: flex;
    gap: 10px;
    padding-top: 10px;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
  }

  .btn-secondary {
    flex: 1;
    padding: 8px;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 6px;
    cursor: pointer;
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    transition: all 0.2s;
  }

  .btn-secondary:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.5);
  }

  .btn-secondary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .reset-section {
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
  }

  .btn-reset-all {
    width: 100%;
    padding: 10px;
    background: rgba(239, 68, 68, 0.2);
    color: #fca5a5;
    border: 1px solid rgba(239, 68, 68, 0.5);
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    transition: all 0.2s;
  }

  .btn-reset-all:hover {
    background: rgba(239, 68, 68, 0.3);
    border-color: rgba(239, 68, 68, 0.7);
    color: #fee2e2;
  }
</style>

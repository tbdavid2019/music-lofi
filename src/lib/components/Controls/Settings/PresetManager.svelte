<script lang="ts">
  import {
    Save,
    Trash2,
    Download,
    Upload,
    RotateCcw,
    Sliders,
    Check,
    Share2,
  } from "@lucide/svelte";
  import { STATIONS } from "../../../stores/radioStore";
  import { copyShareLink } from "../../../utils/shareUtils";

  const PRESETS_STORAGE_KEY = "LofiEngine_Presets";
  const CURRENT_STATE_KEY = "LofiEngine_CurrentState";

  interface Preset {
    id: string;
    name: string;
    timestamp: number;
    state: {
      stationId: string;
      volumes: {
        rain: number;
        thunder: number;
        campfire: number;
        jungle: number;
        main_track: number;
      };
      background: number;
    };
  }

  let presets: Preset[] = loadPresets();
  let newPresetName = "";
  let showSaveDialog = false;
  let sharedPresetId: string | null = null;
  let currentShareToast = false;

  async function shareCurrent() {
    const success = await copyShareLink();
    if (success) {
      currentShareToast = true;
      setTimeout(() => {
        currentShareToast = false;
      }, 2200);
    }
  }

  async function sharePreset(preset: Preset) {
    const success = await copyShareLink({
      stationId: preset.state.stationId,
      bg: preset.state.background,
      volumes: preset.state.volumes,
    });
    if (success) {
      sharedPresetId = preset.id;
      setTimeout(() => {
        if (sharedPresetId === preset.id) sharedPresetId = null;
      }, 2000);
    }
  }

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
      const currentStationId = localStorage.getItem("LofiEngine_Station") || "lofi";
      let volumes = {
        rain: 1,
        thunder: 1,
        campfire: 1,
        jungle: 1,
        main_track: 1,
      };
      const rawVols = localStorage.getItem("Volumes");
      if (rawVols) {
        volumes = { ...volumes, ...JSON.parse(rawVols) };
      }

      let background = 1;
      const rawBg = localStorage.getItem("activeBg");
      if (rawBg) {
        background = parseInt(rawBg, 10);
      }

      return {
        stationId: currentStationId,
        volumes,
        background,
      };
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
    localStorage.setItem(CURRENT_STATE_KEY, JSON.stringify(preset.state));
    window.dispatchEvent(new CustomEvent("loadPreset", { detail: preset.state }));
    alert(`已載入預設：${preset.name}`);
  }

  function deletePreset(id: string) {
    if (confirm("確定要刪除此預設嗎？")) {
      presets = presets.filter((p) => p.id !== id);
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
              const validPresets = imported.filter(
                (item): item is Preset =>
                  item &&
                  typeof item.id === "string" &&
                  typeof item.name === "string" &&
                  item.state &&
                  typeof item.state.stationId === "string"
              );
              if (validPresets.length === 0) {
                alert("匯入失敗：找不到有效格式的預設項目");
                return;
              }
              presets = [...presets, ...validPresets];
              savePresets();
              alert(`成功匯入 ${validPresets.length} 個預設`);
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
    if (confirm("確定要重置所有設定為預設值嗎？")) {
      localStorage.removeItem(CURRENT_STATE_KEY);
      const defaultState = {
        stationId: "lofi",
        volumes: {
          rain: 1,
          thunder: 1,
          campfire: 1,
          jungle: 1,
          main_track: 1,
        },
        background: 1,
      };

      localStorage.setItem(CURRENT_STATE_KEY, JSON.stringify(defaultState));
      window.dispatchEvent(new CustomEvent("loadPreset", { detail: defaultState }));
      alert("已重置為預設值！");
    }
  }

  function getStationLabel(id: string): string {
    const found = STATIONS.find((s) => s.id === id);
    return found ? found.label : id;
  }
</script>

<div class="preset-manager">
  <div class="header-row">
    <Sliders size={18} class="section-icon" />
    <h3>預設管理 (Presets)</h3>
  </div>

  <!-- 保存新預設與分享當前 -->
  <div class="save-section">
    {#if !showSaveDialog}
      <div class="action-buttons-group">
        <button type="button" class="btn-primary" on:click={() => (showSaveDialog = true)}>
          <Save size={16} />
          保存當前設定
        </button>

        <button
          type="button"
          class="btn-share-current"
          class:copied={currentShareToast}
          on:click={shareCurrent}
          title="複製當前空間直達分享連結"
        >
          {#if currentShareToast}
            <Check size={16} />
            <span>已複製！</span>
          {:else}
            <Share2 size={16} />
            <span>分享當前空間</span>
          {/if}
        </button>
      </div>
    {:else}
      <div class="save-dialog">
        <input
          type="text"
          placeholder="輸入預設名稱..."
          bind:value={newPresetName}
          maxlength="30"
          on:keydown={(e) => e.key === "Enter" && saveCurrentPreset()}
        />
        <button type="button" class="btn-save" on:click={saveCurrentPreset}>保存</button>
        <button type="button" class="btn-cancel" on:click={() => (showSaveDialog = false)}>取消</button>
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
              電台: {getStationLabel(preset.state.stationId)} | 音量: {Math.round((preset.state.volumes?.main_track ?? 1) * 100)}%
            </div>
            <div class="preset-date">{formatDate(preset.timestamp)}</div>
          </div>
          <div class="preset-actions">
            <button
              type="button"
              class="btn-share-preset"
              class:copied={sharedPresetId === preset.id}
              on:click={() => sharePreset(preset)}
              title="複製此預設的分享連結"
              aria-label="Share preset"
            >
              {#if sharedPresetId === preset.id}
                <Check size={15} />
              {:else}
                <Share2 size={15} />
              {/if}
            </button>
            <button
              type="button"
              class="btn-load"
              on:click={() => loadPreset(preset)}
              title="載入此預設"
            >
              載入
            </button>
            <button
              type="button"
              class="btn-delete"
              on:click={() => deletePreset(preset.id)}
              title="刪除此預設"
              aria-label="Delete preset"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      {/each}
    {/if}
  </div>

  <!-- 匯入匯出 -->
  <div class="import-export">
    <button type="button" class="btn-secondary" on:click={exportPresets} disabled={presets.length === 0}>
      <Download size={15} />
      匯出預設
    </button>
    <button type="button" class="btn-secondary" on:click={importPresets}>
      <Upload size={15} />
      匯入預設
    </button>
  </div>

  <!-- 重置按鈕 -->
  <div class="reset-section">
    <button type="button" class="btn-reset-all" on:click={resetToDefault}>
      <RotateCcw size={15} />
      重置為預設值
    </button>
  </div>
</div>

<style>
  .preset-manager {
    margin-top: 20px;
    padding: 15px 0;
  }

  .header-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
  }

  :global(.section-icon) {
    color: #a855f7;
  }

  h3 {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
  }

  .save-section {
    margin-bottom: 15px;
  }

  .action-buttons-group {
    display: flex;
    gap: 8px;
  }

  .action-buttons-group .btn-primary {
    flex: 1.2;
  }

  .btn-share-current {
    flex: 1;
    padding: 10px 14px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.18);
    color: #f1f5f9;
    border-radius: 8px;
    cursor: pointer;
    font-size: 13.5px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    transition: all 0.2s ease;
  }

  .btn-share-current:hover {
    background: rgba(168, 85, 247, 0.25);
    border-color: rgba(168, 85, 247, 0.5);
    color: #ffffff;
    transform: translateY(-1px);
  }

  .btn-share-current.copied {
    background: rgba(16, 185, 129, 0.25);
    border-color: rgba(16, 185, 129, 0.5);
    color: #34d399;
  }

  .btn-share-preset {
    padding: 6px 8px;
    background: rgba(255, 255, 255, 0.08);
    color: #cbd5e1;
    border: 1px solid rgba(255, 255, 255, 0.16);
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }

  .btn-share-preset:hover {
    background: rgba(168, 85, 247, 0.25);
    border-color: rgba(168, 85, 247, 0.5);
    color: #ffffff;
  }

  .btn-share-preset.copied {
    background: rgba(16, 185, 129, 0.25);
    border-color: rgba(16, 185, 129, 0.5);
    color: #34d399;
  }

  .btn-share-preset:focus-visible,
  .btn-share-current:focus-visible {
    outline: 2px solid #38bdf8;
    outline-offset: 2px;
  }

  .btn-primary {
    width: 100%;
    padding: 10px 14px;
    background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 13.5px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: transform 0.2s;
  }

  .btn-primary:hover {
    transform: translateY(-1px);
  }

  .btn-primary:focus-visible {
    outline: 2px solid #38bdf8;
    outline-offset: 2px;
  }

  .save-dialog {
    display: flex;
    gap: 6px;
  }

  .save-dialog input {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.08);
    color: white;
    font-size: 13.5px;
  }

  .save-dialog input:focus-visible {
    outline: 2px solid #38bdf8;
    outline-offset: 2px;
  }

  .btn-save,
  .btn-cancel {
    padding: 8px 14px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
  }

  .btn-save:focus-visible,
  .btn-cancel:focus-visible {
    outline: 2px solid #38bdf8;
    outline-offset: 2px;
  }

  .btn-save {
    background: #10b981;
    color: white;
  }

  .btn-cancel {
    background: rgba(255, 255, 255, 0.15);
    color: white;
  }

  .presets-list {
    max-height: 240px;
    overflow-y: auto;
    margin-bottom: 12px;
    padding-right: 4px;
  }

  .empty-message {
    text-align: center;
    color: #cbd5e1;
    padding: 16px;
    font-size: 13px;
    font-weight: 500;
  }

  .preset-item {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.16);
    border-radius: 12px;
    padding: 11px 12px;
    margin-bottom: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .preset-info {
    flex: 1;
    min-width: 0;
  }

  .preset-name {
    font-weight: 600;
    font-size: 14px;
    color: #ffffff;
    margin-bottom: 3px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .preset-details {
    font-size: 12.5px;
    color: #cbd5e1;
    margin-bottom: 2px;
  }

  .preset-date {
    font-size: 12px;
    color: #94a3b8;
  }

  .preset-actions {
    display: flex;
    gap: 6px;
    align-items: center;
    flex-shrink: 0;
  }

  .btn-load {
    padding: 6px 12px;
    background: #6366f1;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 12.5px;
    font-weight: 600;
  }

  .btn-load:hover {
    background: #4f46e5;
  }

  .btn-load:focus-visible {
    outline: 2px solid #38bdf8;
    outline-offset: 2px;
  }

  .btn-delete {
    padding: 6px;
    background: rgba(239, 68, 68, 0.25);
    color: #fca5a5;
    border: 1px solid rgba(239, 68, 68, 0.45);
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .btn-delete:hover {
    background: rgba(239, 68, 68, 0.45);
  }

  .btn-delete:focus-visible {
    outline: 2px solid #38bdf8;
    outline-offset: 2px;
  }

  .import-export {
    display: flex;
    gap: 8px;
    padding-top: 10px;
    border-top: 1px solid rgba(255, 255, 255, 0.12);
  }

  .btn-secondary {
    flex: 1;
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.08);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.18);
    border-radius: 8px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }

  .btn-secondary:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.16);
  }

  .btn-secondary:focus-visible {
    outline: 2px solid #38bdf8;
    outline-offset: 2px;
  }

  .btn-secondary:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .reset-section {
    margin-top: 8px;
    padding-top: 8px;
  }

  .btn-reset-all {
    width: 100%;
    padding: 9px 12px;
    background: rgba(239, 68, 68, 0.15);
    color: #fca5a5;
    border: 1px solid rgba(239, 68, 68, 0.35);
    border-radius: 8px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }

  .btn-reset-all:hover {
    background: rgba(239, 68, 68, 0.3);
  }

  .btn-reset-all:focus-visible {
    outline: 2px solid #38bdf8;
    outline-offset: 2px;
  }
</style>

<script lang="ts">
  import { IconMicrophone, IconPlayerStop, IconDownload, IconLoader } from "@tabler/icons-svelte";
  import * as Tone from "tone";
  import { onDestroy } from "svelte";

  let recorder: Tone.Recorder | null = null;
  let isRecording = false;
  let recordedBlob: Blob | null = null;
  let recordingDuration = 0;
  let recordingInterval: any = null;
  let recordingTime = "00:00";
  let isProcessing = false;

  // 預設錄音時長（分鐘）
  let maxDuration = 5;
  const durationOptions = [1, 5, 10, 30, 60];

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  async function startRecording() {
    try {
      isProcessing = true;
      
      // 創建 Recorder
      recorder = new Tone.Recorder();
      Tone.getDestination().connect(recorder);
      
      // 開始錄音
      await recorder.start();
      isRecording = true;
      recordedBlob = null;
      recordingDuration = 0;
      isProcessing = false;

      // 開始計時
      recordingInterval = setInterval(() => {
        recordingDuration++;
        recordingTime = formatTime(recordingDuration);

        // 達到最大時長自動停止
        if (recordingDuration >= maxDuration * 60) {
          stopRecording();
        }
      }, 1000);

    } catch (error) {
      console.error("開始錄音失敗:", error);
      alert("錄音失敗，請確保已開始播放音樂");
      isProcessing = false;
      isRecording = false;
    }
  }

  async function stopRecording() {
    if (!recorder || !isRecording) return;

    try {
      isProcessing = true;
      
      // 停止計時
      if (recordingInterval) {
        clearInterval(recordingInterval);
        recordingInterval = null;
      }

      // 停止錄音並獲取音訊
      const recording = await recorder.stop();
      recordedBlob = recording;
      
      isRecording = false;
      isProcessing = false;

      // 斷開連接
      Tone.getDestination().disconnect(recorder);
      recorder.dispose();
      recorder = null;

    } catch (error) {
      console.error("停止錄音失敗:", error);
      alert("停止錄音時發生錯誤");
      isProcessing = false;
    }
  }

  function downloadRecording() {
    if (!recordedBlob) return;

    const url = URL.createObjectURL(recordedBlob);
    const a = document.createElement("a");
    a.href = url;
    
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
    a.download = `lofi-engine-recording-${timestamp}.webm`;
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    URL.revokeObjectURL(url);
  }

  function discardRecording() {
    recordedBlob = null;
    recordingDuration = 0;
    recordingTime = "00:00";
  }

  onDestroy(() => {
    if (isRecording && recorder) {
      stopRecording();
    }
    if (recordingInterval) {
      clearInterval(recordingInterval);
    }
  });
</script>

<div class="recorder">
  <div class="recorder-header">
    <h3>🎙️ 錄音功能</h3>
    <p class="description">錄製當前播放的 Lo-Fi 音樂</p>
  </div>

  {#if !isRecording && !recordedBlob}
    <!-- 錄音設定 -->
    <div class="duration-selector">
      <label>最大錄音時長：</label>
      <div class="duration-options">
        {#each durationOptions as duration}
          <button
            class="duration-btn"
            class:active={maxDuration === duration}
            on:click={() => maxDuration = duration}
          >
            {duration} 分鐘
          </button>
        {/each}
      </div>
    </div>

    <button 
      class="btn-record" 
      on:click={startRecording}
      disabled={isProcessing}
    >
      {#if isProcessing}
        <IconLoader size={20} class="spinning" />
        準備中...
      {:else}
        <IconMicrophone size={20} />
        開始錄音
      {/if}
    </button>
  {:else if isRecording}
    <!-- 錄音中 -->
    <div class="recording-status">
      <div class="recording-indicator">
        <span class="recording-dot"></span>
        <span class="recording-text">錄音中...</span>
      </div>
      <div class="recording-time">{recordingTime}</div>
      <div class="max-duration-info">
        最長 {formatTime(maxDuration * 60)}
      </div>
    </div>

    <button 
      class="btn-stop" 
      on:click={stopRecording}
      disabled={isProcessing}
    >
      {#if isProcessing}
        <IconLoader size={20} class="spinning" />
        處理中...
      {:else}
        <IconPlayerStop size={20} />
        停止錄音
      {/if}
    </button>
  {:else if recordedBlob}
    <!-- 錄音完成 -->
    <div class="recording-complete">
      <div class="success-icon">✓</div>
      <p class="success-text">錄音完成！</p>
      <p class="duration-text">時長: {recordingTime}</p>
      
      <div class="actions">
        <button class="btn-download" on:click={downloadRecording}>
          <IconDownload size={18} />
          下載錄音
        </button>
        <button class="btn-new" on:click={discardRecording}>
          重新錄音
        </button>
      </div>
    </div>
  {/if}

  <div class="recorder-info">
    <p>💡 提示：</p>
    <ul>
      <li>請先開始播放音樂再開始錄音</li>
      <li>錄音將包含主音軌和所有環境音效</li>
      <li>錄音格式：WebM（瀏覽器支援）</li>
      <li>達到最大時長會自動停止</li>
    </ul>
  </div>
</div>

<style>
  .recorder {
    margin-top: 20px;
    padding: 15px 0;
  }

  .recorder-header {
    margin-bottom: 15px;
  }

  .recorder-header h3 {
    margin: 0 0 5px 0;
    font-size: 16px;
    font-weight: 600;
  }

  .description {
    margin: 0;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.7);
  }

  .duration-selector {
    margin-bottom: 15px;
  }

  .duration-selector label {
    display: block;
    font-size: 13px;
    margin-bottom: 8px;
    color: rgba(255, 255, 255, 0.9);
  }

  .duration-options {
    display: flex;
    gap: 5px;
    flex-wrap: wrap;
  }

  .duration-btn {
    padding: 6px 12px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    color: white;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .duration-btn:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  .duration-btn.active {
    background: #3b82f6;
    border-color: #3b82f6;
  }

  .btn-record {
    width: 100%;
    padding: 12px;
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: transform 0.2s;
  }

  .btn-record:hover:not(:disabled) {
    transform: translateY(-2px);
  }

  .btn-record:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .recording-status {
    background: rgba(239, 68, 68, 0.1);
    border: 2px solid #ef4444;
    border-radius: 10px;
    padding: 15px;
    margin-bottom: 15px;
    text-align: center;
  }

  .recording-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-bottom: 10px;
  }

  .recording-dot {
    width: 12px;
    height: 12px;
    background: #ef4444;
    border-radius: 50%;
    animation: pulse 1.5s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.5;
      transform: scale(1.2);
    }
  }

  .recording-text {
    font-weight: 600;
    color: #ef4444;
  }

  .recording-time {
    font-size: 24px;
    font-weight: 700;
    color: white;
    margin: 5px 0;
    font-variant-numeric: tabular-nums;
  }

  .max-duration-info {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
  }

  .btn-stop {
    width: 100%;
    padding: 12px;
    background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: transform 0.2s;
  }

  .btn-stop:hover:not(:disabled) {
    transform: translateY(-2px);
  }

  .btn-stop:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .recording-complete {
    background: rgba(16, 185, 129, 0.1);
    border: 2px solid #10b981;
    border-radius: 10px;
    padding: 20px;
    text-align: center;
    margin-bottom: 15px;
  }

  .success-icon {
    width: 50px;
    height: 50px;
    background: #10b981;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 30px;
    color: white;
    margin: 0 auto 10px;
  }

  .success-text {
    font-size: 16px;
    font-weight: 600;
    color: white;
    margin: 10px 0 5px;
  }

  .duration-text {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.7);
    margin: 0 0 15px;
  }

  .actions {
    display: flex;
    gap: 10px;
  }

  .btn-download, .btn-new {
    flex: 1;
    padding: 10px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    transition: transform 0.2s;
  }

  .btn-download {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
  }

  .btn-new {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.3);
  }

  .btn-download:hover, .btn-new:hover {
    transform: translateY(-2px);
  }

  .recorder-info {
    margin-top: 15px;
    padding: 12px;
    background: rgba(59, 130, 246, 0.1);
    border: 1px solid rgba(59, 130, 246, 0.3);
    border-radius: 8px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.8);
  }

  .recorder-info p {
    margin: 0 0 8px 0;
    font-weight: 600;
  }

  .recorder-info ul {
    margin: 0;
    padding-left: 20px;
  }

  .recorder-info li {
    margin-bottom: 4px;
    line-height: 1.4;
  }

  :global(.spinning) {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
</style>

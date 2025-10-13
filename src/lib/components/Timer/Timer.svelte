<script lang="ts">
  import { IconClock, IconPlayerPlay, IconPlayerStop, IconRefresh } from "@tabler/icons-svelte";
  import { onDestroy } from "svelte";

  // 定時器類型
  type TimerMode = "pomodoro" | "sleep" | "custom";

  let timerMode: TimerMode = "pomodoro";
  let isTimerActive = false;
  let remainingSeconds = 0;
  let totalSeconds = 0;
  let timerInterval: any = null;
  let displayTime = "00:00";

  // 番茄鐘設定
  let pomodoroWork = 25; // 工作時間（分鐘）
  let pomodoroBreak = 5; // 休息時間（分鐘）
  let isPomodoroBreak = false;
  let pomodoroRound = 0;

  // 睡眠定時器設定
  let sleepDuration = 30; // 分鐘

  // 自訂定時器設定
  let customMinutes = 60;

  function formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  function startTimer() {
    if (isTimerActive) return;

    // 設定初始時間
    switch (timerMode) {
      case "pomodoro":
        totalSeconds = isPomodoroBreak ? pomodoroBreak * 60 : pomodoroWork * 60;
        break;
      case "sleep":
        totalSeconds = sleepDuration * 60;
        break;
      case "custom":
        totalSeconds = customMinutes * 60;
        break;
    }

    remainingSeconds = totalSeconds;
    isTimerActive = true;
    displayTime = formatTime(remainingSeconds);

    // 啟動計時器
    timerInterval = setInterval(() => {
      remainingSeconds--;
      displayTime = formatTime(remainingSeconds);

      if (remainingSeconds <= 0) {
        onTimerComplete();
      }
    }, 1000);
  }

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    isTimerActive = false;
  }

  function resetTimer() {
    stopTimer();
    remainingSeconds = 0;
    displayTime = "00:00";
    isPomodoroBreak = false;
    pomodoroRound = 0;
  }

  function onTimerComplete() {
    stopTimer();

    // 播放提示音（可選）
    playNotificationSound();

    if (timerMode === "pomodoro") {
      // 番茄鐘模式：工作和休息交替
      if (!isPomodoroBreak) {
        // 完成工作時段，開始休息
        isPomodoroBreak = true;
        pomodoroRound++;
        alert(`🎉 工作時段完成！開始休息 ${pomodoroBreak} 分鐘`);
        startTimer(); // 自動開始休息
      } else {
        // 完成休息時段，準備下一輪工作
        isPomodoroBreak = false;
        alert(`✨ 休息完畢！準備開始第 ${pomodoroRound + 1} 輪工作`);
      }
    } else if (timerMode === "sleep") {
      // 睡眠定時器：停止播放並淡出
      alert("😴 睡眠定時器結束，音樂將停止");
      fadeOutAndStop();
    } else {
      // 自訂定時器
      alert("⏰ 定時器時間到！");
    }
  }

  function playNotificationSound() {
    // 簡單的提示音
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  }

  function fadeOutAndStop() {
    // 觸發音樂淡出並停止的事件
    window.dispatchEvent(new CustomEvent("fadeOutMusic"));
  }

  $: progressPercentage = totalSeconds > 0 ? ((totalSeconds - remainingSeconds) / totalSeconds) * 100 : 0;

  onDestroy(() => {
    if (timerInterval) {
      clearInterval(timerInterval);
    }
  });
</script>

<div class="timer-container">
  <div class="timer-header">
    <h3>⏰ 定時器</h3>
    <p class="description">專注工作或睡眠輔助</p>
  </div>

  <!-- 定時器模式選擇 -->
  {#if !isTimerActive}
    <div class="mode-selector">
      <button
        class="mode-btn"
        class:active={timerMode === "pomodoro"}
        on:click={() => timerMode = "pomodoro"}
      >
        🍅 番茄鐘
      </button>
      <button
        class="mode-btn"
        class:active={timerMode === "sleep"}
        on:click={() => timerMode = "sleep"}
      >
        😴 睡眠
      </button>
      <button
        class="mode-btn"
        class:active={timerMode === "custom"}
        on:click={() => timerMode = "custom"}
      >
        ⏱️ 自訂
      </button>
    </div>

    <!-- 模式設定 -->
    <div class="mode-settings">
      {#if timerMode === "pomodoro"}
        <div class="setting-group">
          <label>工作時間（分鐘）</label>
          <input type="number" bind:value={pomodoroWork} min="1" max="60" />
        </div>
        <div class="setting-group">
          <label>休息時間（分鐘）</label>
          <input type="number" bind:value={pomodoroBreak} min="1" max="30" />
        </div>
        <p class="mode-description">
          📚 專注工作 {pomodoroWork} 分鐘，然後休息 {pomodoroBreak} 分鐘
        </p>
      {:else if timerMode === "sleep"}
        <div class="setting-group">
          <label>睡眠時長（分鐘）</label>
          <input type="number" bind:value={sleepDuration} min="5" max="120" />
        </div>
        <p class="mode-description">
          🌙 {sleepDuration} 分鐘後音樂將自動淡出停止
        </p>
      {:else if timerMode === "custom"}
        <div class="setting-group">
          <label>倒數時間（分鐘）</label>
          <input type="number" bind:value={customMinutes} min="1" max="240" />
        </div>
        <p class="mode-description">
          ⏱️ 自訂 {customMinutes} 分鐘倒數計時
        </p>
      {/if}
    </div>

    <button class="btn-start" on:click={startTimer}>
      <IconPlayerPlay size={18} />
      開始計時
    </button>
  {:else}
    <!-- 計時器運行中 -->
    <div class="timer-display">
      <div class="timer-info">
        {#if timerMode === "pomodoro"}
          <div class="pomodoro-status">
            {isPomodoroBreak ? "☕ 休息時間" : "💪 工作時間"}
            <span class="round">第 {pomodoroRound + 1} 輪</span>
          </div>
        {:else if timerMode === "sleep"}
          <div class="timer-label">😴 睡眠定時器</div>
        {:else}
          <div class="timer-label">⏱️ 倒數計時</div>
        {/if}
      </div>

      <div class="timer-time">{displayTime}</div>

      <div class="progress-bar">
        <div class="progress-fill" style="width: {progressPercentage}%"></div>
      </div>

      <div class="timer-actions">
        <button class="btn-stop" on:click={stopTimer}>
          <IconPlayerStop size={18} />
          暫停
        </button>
        <button class="btn-reset" on:click={resetTimer}>
          <IconRefresh size={18} />
          重置
        </button>
      </div>
    </div>
  {/if}

  <div class="timer-tips">
    <p>💡 小提示：</p>
    <ul>
      <li><strong>番茄鐘：</strong>提升專注力的經典方法</li>
      <li><strong>睡眠定時器：</strong>自動淡出音樂助眠</li>
      <li><strong>自訂定時器：</strong>靈活設定任意時長</li>
    </ul>
  </div>
</div>

<style>
  .timer-container {
    margin-top: 20px;
    padding: 15px 0;
  }

  .timer-header {
    margin-bottom: 15px;
  }

  .timer-header h3 {
    margin: 0 0 5px 0;
    font-size: 16px;
    font-weight: 600;
  }

  .description {
    margin: 0;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.7);
  }

  .mode-selector {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    margin-bottom: 15px;
  }

  .mode-btn {
    padding: 10px 8px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    color: white;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .mode-btn:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  .mode-btn.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-color: transparent;
  }

  .mode-settings {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 15px;
  }

  .setting-group {
    margin-bottom: 10px;
  }

  .setting-group:last-of-type {
    margin-bottom: 12px;
  }

  .setting-group label {
    display: block;
    font-size: 13px;
    margin-bottom: 6px;
    color: rgba(255, 255, 255, 0.9);
  }

  .setting-group input {
    width: 100%;
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    color: white;
    font-size: 14px;
  }

  .setting-group input:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.4);
  }

  .mode-description {
    margin: 0;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.7);
    line-height: 1.4;
  }

  .btn-start {
    width: 100%;
    padding: 12px;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
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

  .btn-start:hover {
    transform: translateY(-2px);
  }

  .timer-display {
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    padding: 20px;
    text-align: center;
  }

  .timer-info {
    margin-bottom: 15px;
  }

  .pomodoro-status {
    font-size: 16px;
    font-weight: 600;
    color: white;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
  }

  .round {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.7);
    font-weight: normal;
  }

  .timer-label {
    font-size: 16px;
    font-weight: 600;
    color: white;
  }

  .timer-time {
    font-size: 48px;
    font-weight: 700;
    color: white;
    margin: 15px 0;
    font-variant-numeric: tabular-nums;
    letter-spacing: 2px;
  }

  .progress-bar {
    width: 100%;
    height: 8px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    overflow: hidden;
    margin: 20px 0;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
    transition: width 0.5s linear;
    border-radius: 4px;
  }

  .timer-actions {
    display: flex;
    gap: 10px;
  }

  .btn-stop, .btn-reset {
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

  .btn-stop {
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    color: white;
  }

  .btn-reset {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.3);
  }

  .btn-stop:hover, .btn-reset:hover {
    transform: translateY(-2px);
  }

  .timer-tips {
    margin-top: 15px;
    padding: 12px;
    background: rgba(102, 126, 234, 0.1);
    border: 1px solid rgba(102, 126, 234, 0.3);
    border-radius: 8px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.8);
  }

  .timer-tips p {
    margin: 0 0 8px 0;
    font-weight: 600;
  }

  .timer-tips ul {
    margin: 0;
    padding-left: 20px;
  }

  .timer-tips li {
    margin-bottom: 4px;
    line-height: 1.4;
  }
</style>

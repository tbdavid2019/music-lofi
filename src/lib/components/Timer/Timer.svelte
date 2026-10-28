<script lang="ts">
  import {
    Clock,
    Play,
    Square,
    RotateCcw,
    Coffee,
    Moon,
    Timer as TimerIcon,
    Info,
  } from "@lucide/svelte";
  import { onDestroy } from "svelte";

  type TimerMode = "pomodoro" | "sleep" | "custom";

  let timerMode: TimerMode = "pomodoro";
  let isTimerActive = false;
  let remainingSeconds = 0;
  let totalSeconds = 0;
  let timerInterval: any = null;
  let displayTime = "00:00";

  let pomodoroWork = 25;
  let pomodoroBreak = 5;
  let isPomodoroBreak = false;
  let pomodoroRound = 0;

  let sleepDuration = 30;
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
    playNotificationSound();

    if (timerMode === "pomodoro") {
      if (!isPomodoroBreak) {
        isPomodoroBreak = true;
        pomodoroRound++;
        alert(`工作時段完成！開始休息 ${pomodoroBreak} 分鐘`);
        startTimer();
      } else {
        isPomodoroBreak = false;
        alert(`休息完畢！準備開始第 ${pomodoroRound + 1} 輪工作`);
      }
    } else if (timerMode === "sleep") {
      alert("睡眠定時器結束，音樂將自動淡出停止");
      fadeOutAndStop();
    } else {
      alert("定時器時間到！");
    }
  }

  function playNotificationSound() {
    try {
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
    } catch (e) {}
  }

  function fadeOutAndStop() {
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
    <div class="header-title-row">
      <Clock size={18} class="timer-header-icon" />
      <h3>定時器 (Focus Timer)</h3>
    </div>
    <p class="description">專注工作與睡眠定時輔助</p>
  </div>

  <!-- 定時器模式選擇 -->
  {#if !isTimerActive}
    <div class="mode-selector">
      <button
        type="button"
        class="mode-btn"
        class:active={timerMode === "pomodoro"}
        on:click={() => (timerMode = "pomodoro")}
      >
        <Coffee size={14} />
        番茄鐘
      </button>
      <button
        type="button"
        class="mode-btn"
        class:active={timerMode === "sleep"}
        on:click={() => (timerMode = "sleep")}
      >
        <Moon size={14} />
        睡眠
      </button>
      <button
        type="button"
        class="mode-btn"
        class:active={timerMode === "custom"}
        on:click={() => (timerMode = "custom")}
      >
        <TimerIcon size={14} />
        自訂
      </button>
    </div>

    <!-- 模式設定 -->
    <div class="mode-settings">
      {#if timerMode === "pomodoro"}
        <div class="setting-group">
          <label for="pomo-work">工作時間（分鐘）</label>
          <input id="pomo-work" type="number" bind:value={pomodoroWork} min="1" max="60" />
        </div>
        <div class="setting-group">
          <label for="pomo-break">休息時間（分鐘）</label>
          <input id="pomo-break" type="number" bind:value={pomodoroBreak} min="1" max="30" />
        </div>
        <p class="mode-description">
          專注工作 {pomodoroWork} 分鐘，然後休息 {pomodoroBreak} 分鐘
        </p>
      {:else if timerMode === "sleep"}
        <div class="setting-group">
          <label for="sleep-dur">睡眠時長（分鐘）</label>
          <input id="sleep-dur" type="number" bind:value={sleepDuration} min="5" max="120" />
        </div>
        <p class="mode-description">
          {sleepDuration} 分鐘後音樂將自動淡出停止
        </p>
      {:else if timerMode === "custom"}
        <div class="setting-group">
          <label for="custom-dur">倒數時間（分鐘）</label>
          <input id="custom-dur" type="number" bind:value={customMinutes} min="1" max="240" />
        </div>
        <p class="mode-description">
          自訂 {customMinutes} 分鐘倒數計時
        </p>
      {/if}
    </div>

    <button type="button" class="btn-start" on:click={startTimer}>
      <Play size={16} />
      開始計時
    </button>
  {:else}
    <!-- 計時器運行中 -->
    <div class="timer-display">
      <div class="timer-info">
        {#if timerMode === "pomodoro"}
          <div class="pomodoro-status">
            <span>{isPomodoroBreak ? "休息時間" : "工作時間"}</span>
            <span class="round">第 {pomodoroRound + 1} 輪</span>
          </div>
        {:else if timerMode === "sleep"}
          <div class="timer-label">睡眠定時器</div>
        {:else}
          <div class="timer-label">倒數計時</div>
        {/if}
      </div>

      <div class="timer-time">{displayTime}</div>

      <div class="progress-bar">
        <div class="progress-fill" style="width: {progressPercentage}%"></div>
      </div>

      <div class="timer-actions">
        <button type="button" class="btn-stop" on:click={stopTimer}>
          <Square size={16} />
          暫停
        </button>
        <button type="button" class="btn-reset" on:click={resetTimer}>
          <RotateCcw size={16} />
          重置
        </button>
      </div>
    </div>
  {/if}

  <div class="timer-tips">
    <div class="tips-header">
      <Info size={14} />
      <span>提示說明</span>
    </div>
    <ul>
      <li><strong>番茄鐘：</strong>提升專注力的工作休息循環法</li>
      <li><strong>睡眠定時器：</strong>時間到自動淡出音樂助眠</li>
      <li><strong>自訂定時器：</strong>靈活設定任意倒數時長</li>
    </ul>
  </div>
</div>

<style>
  .timer-container {
    margin-top: 15px;
    padding: 10px 0;
  }

  .timer-header {
    margin-bottom: 12px;
  }

  .header-title-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 2px;
  }

  :global(.timer-header-icon) {
    color: #a855f7;
  }

  .timer-header h3 {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
  }

  .description {
    margin: 0;
    font-size: 11px;
    color: rgba(255, 255, 255, 0.6);
  }

  .mode-selector {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
    margin-bottom: 12px;
  }

  .mode-btn {
    padding: 8px 6px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 8px;
    color: white;
    font-size: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    transition: all 0.2s;
  }

  .mode-btn:hover {
    background: rgba(255, 255, 255, 0.15);
  }

  .mode-btn.active {
    background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
    border-color: transparent;
  }

  .mode-settings {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 10px;
    margin-bottom: 12px;
  }

  .setting-group {
    margin-bottom: 8px;
  }

  .setting-group:last-of-type {
    margin-bottom: 10px;
  }

  .setting-group label {
    display: block;
    font-size: 12px;
    margin-bottom: 4px;
    color: rgba(255, 255, 255, 0.85);
  }

  .setting-group input {
    width: 100%;
    padding: 6px 10px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.18);
    border-radius: 6px;
    color: white;
    font-size: 13px;
    box-sizing: border-box;
  }

  .setting-group input:focus {
    outline: none;
    border-color: #a855f7;
  }

  .mode-description {
    margin: 0;
    font-size: 11px;
    color: rgba(255, 255, 255, 0.65);
    line-height: 1.4;
  }

  .btn-start {
    width: 100%;
    padding: 10px;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
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

  .btn-start:hover {
    transform: translateY(-1px);
  }

  .timer-display {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 12px;
    padding: 16px;
    text-align: center;
  }

  .timer-info {
    margin-bottom: 10px;
  }

  .pomodoro-status {
    font-size: 14px;
    font-weight: 600;
    color: white;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }

  .round {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.6);
    font-weight: normal;
  }

  .timer-label {
    font-size: 14px;
    font-weight: 600;
    color: white;
  }

  .timer-time {
    font-size: 40px;
    font-weight: 700;
    color: white;
    margin: 10px 0;
    font-variant-numeric: tabular-nums;
    letter-spacing: 2px;
  }

  .progress-bar {
    width: 100%;
    height: 6px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    overflow: hidden;
    margin: 14px 0;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #6366f1 0%, #a855f7 100%);
    transition: width 0.5s linear;
    border-radius: 3px;
  }

  .timer-actions {
    display: flex;
    gap: 8px;
  }

  .btn-stop,
  .btn-reset {
    flex: 1;
    padding: 8px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }

  .btn-stop {
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    color: white;
  }

  .btn-reset {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.25);
  }

  .timer-tips {
    margin-top: 12px;
    padding: 10px;
    background: rgba(99, 102, 241, 0.1);
    border: 1px solid rgba(99, 102, 241, 0.25);
    border-radius: 8px;
    font-size: 11px;
    color: rgba(255, 255, 255, 0.75);
  }

  .tips-header {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 6px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
  }

  .timer-tips ul {
    margin: 0;
    padding-left: 16px;
  }

  .timer-tips li {
    margin-bottom: 3px;
    line-height: 1.4;
  }
</style>

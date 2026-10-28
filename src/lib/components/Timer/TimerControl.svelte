<script lang="ts">
  import {
    Clock,
    Timer as TimerIcon,
    Play,
    Pause,
    RotateCcw,
    Coffee,
    Moon,
    X,
    Info,
    Check,
  } from "@lucide/svelte";
  import { onMount, onDestroy } from "svelte";

  type TimerMode = "pomodoro" | "sleep" | "custom";

  let isOpen = false;
  let timerMode: TimerMode = "pomodoro";
  let isTimerActive = false;
  let isPaused = false;
  let remainingSeconds = 0;
  let totalSeconds = 0;
  let targetEndTime = 0;
  let timerInterval: any = null;
  let displayTime = "25:00";
  let notificationToast = "";
  let toastTimeout: any = null;

  // Pomodoro config
  let pomodoroWork = 25;
  let pomodoroBreak = 5;
  let isPomodoroBreak = false;
  let pomodoroRound = 0;

  // Sleep timer config
  let sleepDuration = 30;

  // Custom timer config
  let customMinutes = 45;

  let containerEl: HTMLElement | null = null;

  function toggleOpen() {
    isOpen = !isOpen;
  }

  function formatTime(seconds: number): string {
    const s = Math.max(0, Math.floor(seconds || 0));
    const hours = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const secs = s % 60;

    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  function sanitizeInputs() {
    pomodoroWork = Math.max(1, Math.min(180, Math.floor(Number(pomodoroWork)) || 25));
    pomodoroBreak = Math.max(1, Math.min(60, Math.floor(Number(pomodoroBreak)) || 5));
    sleepDuration = Math.max(1, Math.min(240, Math.floor(Number(sleepDuration)) || 30));
    customMinutes = Math.max(1, Math.min(360, Math.floor(Number(customMinutes)) || 45));
  }

  function initDurationForMode() {
    if (isTimerActive) return;
    sanitizeInputs();
    switch (timerMode) {
      case "pomodoro":
        totalSeconds = (isPomodoroBreak ? pomodoroBreak : pomodoroWork) * 60;
        break;
      case "sleep":
        totalSeconds = sleepDuration * 60;
        break;
      case "custom":
        totalSeconds = customMinutes * 60;
        break;
    }
    remainingSeconds = totalSeconds;
    displayTime = formatTime(remainingSeconds);
  }

  function setMode(mode: TimerMode) {
    if (isTimerActive) return;
    timerMode = mode;
    initDurationForMode();
  }

  function startTimer() {
    sanitizeInputs();
    if (isPaused) {
      // Resume from paused remainingSeconds
      isPaused = false;
      targetEndTime = Date.now() + remainingSeconds * 1000;
    } else {
      initDurationForMode();
      isTimerActive = true;
      isPaused = false;
      targetEndTime = Date.now() + remainingSeconds * 1000;
    }

    if (timerInterval) clearInterval(timerInterval);

    // Immediate first tick calculation
    const tickCalc = () => {
      const now = Date.now();
      remainingSeconds = Math.max(0, Math.round((targetEndTime - now) / 1000));
      displayTime = formatTime(remainingSeconds);

      if (remainingSeconds <= 0) {
        onTimerComplete();
      }
    };

    tickCalc();
    timerInterval = setInterval(tickCalc, 1000);
  }

  function pauseTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    // Calculate exact remaining seconds upon pause
    remainingSeconds = Math.max(0, Math.round((targetEndTime - Date.now()) / 1000));
    displayTime = formatTime(remainingSeconds);
    isPaused = true;
  }

  function resetTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    isTimerActive = false;
    isPaused = false;
    isPomodoroBreak = false;
    pomodoroRound = 0;
    initDurationForMode();
  }

  function showNotification(msg: string) {
    notificationToast = msg;
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      notificationToast = "";
    }, 7000);

    try {
      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
        new Notification("Music Lo-Fi", { body: msg, icon: "/app-icon.png" });
      }
    } catch {}
  }

  function onTimerComplete() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    isTimerActive = false;
    isPaused = false;

    if (timerMode === "sleep") {
      // For sleep mode: immediately trigger fadeOut, NO harsh beep!
      window.dispatchEvent(new CustomEvent("fadeOutMusic"));
      showNotification("🌙 睡眠定時結束，音樂正自動淡出停止。祝你好眠！");
      initDurationForMode();
    } else if (timerMode === "pomodoro") {
      playNotificationTone();
      if (!isPomodoroBreak) {
        isPomodoroBreak = true;
        pomodoroRound++;
        displayTime = formatTime(pomodoroBreak * 60);
        showNotification(`🎉 工作時段完成！好好放鬆 ${pomodoroBreak} 分鐘休息`);
        startTimer();
      } else {
        isPomodoroBreak = false;
        displayTime = formatTime(pomodoroWork * 60);
        showNotification(`🔔 休息時間結束！準備開始第 ${pomodoroRound + 1} 輪專注`);
        initDurationForMode();
      }
    } else {
      playNotificationTone();
      showNotification("⏱️ 自訂定時倒數完成！");
      initDurationForMode();
    }
  }

  function playNotificationTone() {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.2); // A5

      gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.6);

      // Explicitly close AudioContext to prevent resource leaks
      setTimeout(() => {
        try {
          audioCtx.close().catch(() => {});
        } catch {}
      }, 700);
    } catch {
      // AudioContext unavailable
    }
  }

  function handleClickOutside(event: MouseEvent) {
    if (
      isOpen &&
      containerEl &&
      event.target instanceof Node &&
      !containerEl.contains(event.target)
    ) {
      isOpen = false;
    }
  }

  $: progressPercent =
    totalSeconds > 0
      ? Math.min(100, Math.max(0, ((totalSeconds - remainingSeconds) / totalSeconds) * 100))
      : 0;

  $: if (!isTimerActive) {
    initDurationForMode();
  }

  onMount(() => {
    initDurationForMode();
    document.addEventListener("click", handleClickOutside);
  });

  onDestroy(() => {
    if (typeof document !== "undefined") {
      document.removeEventListener("click", handleClickOutside);
    }
    if (timerInterval) {
      clearInterval(timerInterval);
    }
  });
</script>

<div class="timer-control-wrapper" bind:this={containerEl}>
  <!-- Trigger Button in System Dock -->
  <button
    type="button"
    class="timer-trigger-btn"
    class:active={isOpen}
    class:running={isTimerActive && !isPaused}
    class:paused={isTimerActive && isPaused}
    on:click={toggleOpen}
    title={isTimerActive
      ? `專注計時中：${displayTime} (${timerMode})`
      : "開啟定時器 / 番茄鐘"}
    aria-label="Timer"
    aria-expanded={isOpen}
  >
    {#if isTimerActive}
      <span
        class="status-indicator-dot"
        class:break-dot={isPomodoroBreak}
        class:paused-dot={isPaused}
      ></span>
      <span class="timer-running-label">
        <TimerIcon size={15} />
        <span class="tabular-time">{displayTime}</span>
      </span>
    {:else}
      <Clock size={20} />
    {/if}
  </button>

  <!-- Timer Popover Panel -->
  {#if isOpen}
    <div class="timer-popover" role="dialog" aria-label="專注計時器面板">
      <!-- Header -->
      <div class="popover-header">
        <div class="title-with-icon">
          <Clock size={16} class="accent-icon" />
          <h4>專注與定時</h4>
        </div>
        <button
          type="button"
          class="close-popover-btn"
          on:click={() => (isOpen = false)}
          aria-label="關閉"
          title="關閉"
        >
          <X size={16} />
        </button>
      </div>

      {#if notificationToast}
        <div class="notification-toast" role="status" aria-live="polite">
          <span>{notificationToast}</span>
        </div>
      {/if}

      <!-- Segmented Mode Tabs -->
      <div class="mode-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          class="mode-tab"
          class:selected={timerMode === "pomodoro"}
          aria-selected={timerMode === "pomodoro"}
          disabled={isTimerActive}
          on:click={() => setMode("pomodoro")}
        >
          <Coffee size={13} />
          <span>番茄鐘</span>
        </button>
        <button
          type="button"
          role="tab"
          class="mode-tab"
          class:selected={timerMode === "sleep"}
          aria-selected={timerMode === "sleep"}
          disabled={isTimerActive}
          on:click={() => setMode("sleep")}
        >
          <Moon size={13} />
          <span>睡眠</span>
        </button>
        <button
          type="button"
          role="tab"
          class="mode-tab"
          class:selected={timerMode === "custom"}
          aria-selected={timerMode === "custom"}
          disabled={isTimerActive}
          on:click={() => setMode("custom")}
        >
          <TimerIcon size={13} />
          <span>自訂</span>
        </button>
      </div>

      <!-- Content Area -->
      {#if !isTimerActive}
        <!-- Mode Configuration -->
        <div class="mode-config-card">
          {#if timerMode === "pomodoro"}
            <div class="config-row">
              <label for="pomo-work-input">專注工作</label>
              <div class="number-input-wrap">
                <input
                  id="pomo-work-input"
                  type="number"
                  bind:value={pomodoroWork}
                  on:input={() => { if (!isTimerActive) initDurationForMode(); }}
                  min="1"
                  max="180"
                />
                <span class="unit">分鐘</span>
              </div>
            </div>
            <div class="config-row">
              <label for="pomo-break-input">休息放鬆</label>
              <div class="number-input-wrap">
                <input
                  id="pomo-break-input"
                  type="number"
                  bind:value={pomodoroBreak}
                  on:input={() => { if (!isTimerActive) initDurationForMode(); }}
                  min="1"
                  max="60"
                />
                <span class="unit">分鐘</span>
              </div>
            </div>
            <div class="quick-pills">
              <button
                type="button"
                class="quick-pill"
                on:click={() => {
                  pomodoroWork = 25;
                  pomodoroBreak = 5;
                  initDurationForMode();
                }}>25 / 5m (經典)</button
              >
              <button
                type="button"
                class="quick-pill"
                on:click={() => {
                  pomodoroWork = 50;
                  pomodoroBreak = 10;
                  initDurationForMode();
                }}>50 / 10m (深度)</button
              >
            </div>
          {:else if timerMode === "sleep"}
            <div class="config-row">
              <label for="sleep-dur-input">定時長度</label>
              <div class="number-input-wrap">
                <input
                  id="sleep-dur-input"
                  type="number"
                  bind:value={sleepDuration}
                  on:input={() => { if (!isTimerActive) initDurationForMode(); }}
                  min="5"
                  max="240"
                />
                <span class="unit">分鐘</span>
              </div>
            </div>
            <p class="config-hint">倒數結束後音樂將平滑淡出並自動靜音。</p>
            <div class="quick-pills">
              <button type="button" class="quick-pill" on:click={() => { sleepDuration = 15; initDurationForMode(); }}>15m</button>
              <button type="button" class="quick-pill" on:click={() => { sleepDuration = 30; initDurationForMode(); }}>30m</button>
              <button type="button" class="quick-pill" on:click={() => { sleepDuration = 45; initDurationForMode(); }}>45m</button>
              <button type="button" class="quick-pill" on:click={() => { sleepDuration = 60; initDurationForMode(); }}>60m</button>
            </div>
          {:else}
            <div class="config-row">
              <label for="custom-dur-input">自訂倒數</label>
              <div class="number-input-wrap">
                <input
                  id="custom-dur-input"
                  type="number"
                  bind:value={customMinutes}
                  on:input={() => { if (!isTimerActive) initDurationForMode(); }}
                  min="1"
                  max="360"
                />
                <span class="unit">分鐘</span>
              </div>
            </div>
            <div class="quick-pills">
              <button type="button" class="quick-pill" on:click={() => { customMinutes = 10; initDurationForMode(); }}>10m</button>
              <button type="button" class="quick-pill" on:click={() => { customMinutes = 25; initDurationForMode(); }}>25m</button>
              <button type="button" class="quick-pill" on:click={() => { customMinutes = 45; initDurationForMode(); }}>45m</button>
              <button type="button" class="quick-pill" on:click={() => { customMinutes = 90; initDurationForMode(); }}>90m</button>
            </div>
          {/if}
        </div>

        <button type="button" class="primary-action-btn start-btn" on:click={startTimer}>
          <Play size={16} />
          <span>開始計時</span>
        </button>
      {:else}
        <!-- Active Running Timer Display -->
        <div class="active-timer-view">
          <div class="state-badge-row">
            {#if timerMode === "pomodoro"}
              <span class="state-pill" class:break={isPomodoroBreak}>
                {isPomodoroBreak ? "☕ 休息時間" : "🎯 專注工作中"} · 第 {pomodoroRound + 1} 輪
              </span>
            {:else if timerMode === "sleep"}
              <span class="state-pill sleep">🌙 睡眠定時中</span>
            {:else}
              <span class="state-pill custom">⏱️ 自訂倒數中</span>
            {/if}

            {#if isPaused}
              <span class="paused-badge">已暫停</span>
            {/if}
          </div>

          <div class="big-countdown-display" class:is-break={isPomodoroBreak} class:paused={isPaused}>
            {displayTime}
          </div>

          <!-- Progress Bar -->
          <div class="progress-track" aria-hidden="true">
            <div
              class="progress-fill"
              class:break={isPomodoroBreak}
              style="width: {progressPercent}%"
            ></div>
          </div>

          <!-- Action Controls -->
          <div class="active-actions-row">
            {#if isPaused}
              <button type="button" class="btn-ctrl resume-btn" on:click={startTimer}>
                <Play size={16} />
                <span>繼續</span>
              </button>
            {:else}
              <button type="button" class="btn-ctrl pause-btn" on:click={pauseTimer}>
                <Pause size={16} />
                <span>暫停</span>
              </button>
            {/if}
            <button type="button" class="btn-ctrl reset-btn" on:click={resetTimer}>
              <RotateCcw size={15} />
              <span>重置</span>
            </button>
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .timer-control-wrapper {
    position: relative;
    display: inline-flex;
    align-items: center;
  }

  .timer-trigger-btn {
    color: white;
    background-color: transparent;
    border: none;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    height: 38px;
    min-width: 38px;
    padding: 0 8px;
    border-radius: 999px;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    user-select: none;
  }

  .timer-trigger-btn:hover {
    background-color: rgba(255, 255, 255, 0.12);
    color: #ffffff;
  }

  .timer-trigger-btn.active {
    background-color: rgba(255, 255, 255, 0.18);
  }

  .timer-trigger-btn.running {
    background: rgba(16, 185, 129, 0.18);
    border: 1px solid rgba(16, 185, 129, 0.4);
    color: #a7f3d0;
    padding: 0 12px;
  }

  .timer-trigger-btn.paused {
    background: rgba(245, 158, 11, 0.18);
    border: 1px solid rgba(245, 158, 11, 0.4);
    color: #fde68a;
    padding: 0 12px;
  }

  .status-indicator-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background-color: #10b981;
    box-shadow: 0 0 8px #10b981;
    animation: pulse-dot 1.8s infinite;
  }

  .status-indicator-dot.break-dot {
    background-color: #38bdf8;
    box-shadow: 0 0 8px #38bdf8;
  }

  .status-indicator-dot.paused-dot {
    background-color: #f59e0b;
    box-shadow: 0 0 8px #f59e0b;
    animation: none;
  }

  @keyframes pulse-dot {
    0%,
    100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.4;
      transform: scale(0.85);
    }
  }

  .timer-running-label {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 13px;
    font-weight: 600;
  }

  .tabular-time {
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.5px;
  }

  .notification-toast {
    margin-bottom: 12px;
    padding: 8px 12px;
    border-radius: 10px;
    background: rgba(56, 189, 248, 0.2);
    border: 1px solid rgba(56, 189, 248, 0.4);
    color: #e0f2fe;
    font-size: 12px;
    font-weight: 500;
    line-height: 1.4;
    text-align: center;
    animation: pop-in 0.2s ease-out;
  }

  /* Popover */
  .timer-popover {
    position: absolute;
    top: 50px;
    right: 0;
    width: 320px;
    max-width: calc(100vw - 28px);
    box-sizing: border-box;
    padding: 16px;
    border-radius: 18px;
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    background-color: rgb(15 18 28 / var(--menu-opacity, 0.94));
    border: 1px solid rgba(255, 255, 255, 0.16);
    box-shadow: 0 20px 48px rgba(0, 0, 0, 0.65), 0 0 1px rgba(255, 255, 255, 0.2);
    z-index: 70;
    color: #ffffff;
    user-select: none;
    animation: pop-in 0.18s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @media only screen and (max-width: 600px) {
    .timer-popover {
      right: -12px;
      width: min(320px, calc(100vw - 24px));
    }
  }

  @keyframes pop-in {
    from {
      opacity: 0;
      transform: translateY(-6px) scale(0.97);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .popover-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
  }

  .title-with-icon {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  :global(.accent-icon) {
    color: #38bdf8;
  }

  .popover-header h4 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: #ffffff;
  }

  .close-popover-btn {
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    transition: all 0.2s;
  }

  .close-popover-btn:hover {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.1);
  }

  /* Mode Tabs */
  .mode-tabs {
    display: flex;
    background: rgba(0, 0, 0, 0.35);
    border-radius: 10px;
    padding: 3px;
    gap: 3px;
    margin-bottom: 14px;
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .mode-tab {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    padding: 6px 8px;
    border-radius: 8px;
    border: 1px solid transparent;
    background: transparent;
    color: rgba(255, 255, 255, 0.7);
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .mode-tab:hover:not(:disabled) {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.08);
  }

  .mode-tab.selected {
    background: rgba(255, 255, 255, 0.16);
    border-color: rgba(255, 255, 255, 0.18);
    color: #ffffff;
    font-weight: 600;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
  }

  .mode-tab:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Mode Config Card */
  .mode-config-card {
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 12px;
    margin-bottom: 14px;
  }

  .config-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  .config-row:last-of-type {
    margin-bottom: 8px;
  }

  .config-row label {
    font-size: 13px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.9);
  }

  .number-input-wrap {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .number-input-wrap input {
    width: 60px;
    background: rgba(0, 0, 0, 0.45);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    color: #ffffff;
    padding: 4px 8px;
    text-align: center;
    font-size: 13px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }

  .number-input-wrap input:focus {
    outline: 2px solid #38bdf8;
    border-color: transparent;
  }

  .unit {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
  }

  .config-hint {
    margin: 4px 0 10px 0;
    font-size: 11px;
    color: rgba(255, 255, 255, 0.65);
    line-height: 1.4;
  }

  .quick-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 6px;
  }

  .quick-pill {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 6px;
    color: rgba(255, 255, 255, 0.85);
    font-size: 11px;
    font-weight: 500;
    padding: 3px 8px;
    cursor: pointer;
    transition: all 0.15s;
  }

  .quick-pill:hover {
    background: rgba(255, 255, 255, 0.16);
    color: #ffffff;
    border-color: rgba(255, 255, 255, 0.25);
  }

  .primary-action-btn {
    width: 100%;
    padding: 10px;
    border-radius: 10px;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .start-btn {
    background: linear-gradient(135deg, #059669 0%, #10b981 100%);
    color: #ffffff;
    box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);
  }

  .start-btn:hover {
    background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
    box-shadow: 0 6px 18px rgba(16, 185, 129, 0.5);
    transform: translateY(-1px);
  }

  /* Active Timer View */
  .active-timer-view {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px 0 4px 0;
  }

  .state-badge-row {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 8px;
  }

  .state-pill {
    font-size: 12px;
    font-weight: 600;
    padding: 3px 10px;
    border-radius: 999px;
    background: rgba(16, 185, 129, 0.2);
    border: 1px solid rgba(16, 185, 129, 0.4);
    color: #6ee7b7;
  }

  .state-pill.break {
    background: rgba(56, 189, 248, 0.2);
    border-color: rgba(56, 189, 248, 0.4);
    color: #7dd3fc;
  }

  .state-pill.sleep {
    background: rgba(129, 140, 248, 0.2);
    border-color: rgba(129, 140, 248, 0.4);
    color: #a5b4fc;
  }

  .state-pill.custom {
    background: rgba(168, 85, 247, 0.2);
    border-color: rgba(168, 85, 247, 0.4);
    color: #d8b4fe;
  }

  .paused-badge {
    font-size: 11px;
    font-weight: 600;
    padding: 3px 8px;
    border-radius: 999px;
    background: rgba(245, 158, 11, 0.25);
    border: 1px solid rgba(245, 158, 11, 0.4);
    color: #fde68a;
  }

  .big-countdown-display {
    font-size: 42px;
    font-weight: 700;
    letter-spacing: 2px;
    font-variant-numeric: tabular-nums;
    color: #ffffff;
    margin: 4px 0 14px 0;
    text-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
  }

  .big-countdown-display.is-break {
    color: #7dd3fc;
  }

  .big-countdown-display.paused {
    opacity: 0.65;
  }

  .progress-track {
    width: 100%;
    height: 6px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.1);
    overflow: hidden;
    margin-bottom: 16px;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #10b981 0%, #34d399 100%);
    border-radius: 999px;
    transition: width 0.3s ease;
  }

  .progress-fill.break {
    background: linear-gradient(90deg, #0284c7 0%, #38bdf8 100%);
  }

  .active-actions-row {
    display: flex;
    gap: 8px;
    width: 100%;
  }

  .btn-ctrl {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 8px 12px;
    border-radius: 8px;
    border: none;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .pause-btn {
    background: rgba(245, 158, 11, 0.2);
    border: 1px solid rgba(245, 158, 11, 0.4);
    color: #fde68a;
  }

  .pause-btn:hover {
    background: rgba(245, 158, 11, 0.3);
    color: #ffffff;
  }

  .resume-btn {
    background: rgba(16, 185, 129, 0.2);
    border: 1px solid rgba(16, 185, 129, 0.4);
    color: #a7f3d0;
  }

  .resume-btn:hover {
    background: rgba(16, 185, 129, 0.3);
    color: #ffffff;
  }

  .reset-btn {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.16);
    color: rgba(255, 255, 255, 0.85);
  }

  .reset-btn:hover {
    background: rgba(255, 255, 255, 0.16);
    color: #ffffff;
  }
</style>

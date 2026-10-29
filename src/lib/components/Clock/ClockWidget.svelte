<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { isIdleStore } from "../../stores/idleStore";

  type ClockMode = "digital" | "chinese";

  let mode: ClockMode = "digital";
  let now = new Date();
  let timer: any = null;

  let timeZone = "Asia/Taipei";
  let timeZoneCity = "台北";

  // Chinese numeral mapping (888tools style)
  const CN_DIGITS = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];

  function getChineseDigits(n: number, isHour = false): [string, string] {
    const s = n.toString().padStart(2, "0");
    const d1 = parseInt(s[0], 10);
    const d2 = parseInt(s[1], 10);
    // In Chinese clocks (e.g. 888tools), 14 hours is "十四時", while 14 minutes is "一四分"
    const char1 = isHour && d1 === 1 ? "十" : CN_DIGITS[d1];
    const char2 = CN_DIGITS[d2];
    return [char1, char2];
  }

  function updateTime() {
    now = new Date();
  }

  function toggleMode() {
    mode = mode === "digital" ? "chinese" : "digital";
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("lofi_clock_mode", mode);
    }
  }

  $: hours = now.getHours();
  $: minutes = now.getMinutes();
  $: seconds = now.getSeconds();

  $: strHours = hours.toString().padStart(2, "0");
  $: strMinutes = minutes.toString().padStart(2, "0");
  $: strSeconds = seconds.toString().padStart(2, "0");

  $: [cnH1, cnH2] = getChineseDigits(hours, true);
  $: [cnM1, cnM2] = getChineseDigits(minutes, false);
  $: [cnS1, cnS2] = getChineseDigits(seconds, false);

  // Formatted date string (e.g., "10月29日 週四")
  $: dateStr = new Intl.DateTimeFormat("zh-TW", {
    month: "numeric",
    day: "numeric",
    weekday: "short",
  }).format(now);

  onMount(() => {
    if (typeof localStorage !== "undefined") {
      const saved = localStorage.getItem("lofi_clock_mode") as ClockMode;
      if (saved === "digital" || saved === "chinese") {
        mode = saved;
      }
    }

    if (typeof Intl !== "undefined") {
      try {
        timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Taipei";
        const parts = timeZone.split("/");
        const rawCity = parts[parts.length - 1].replace(/_/g, " ");
        const cityMap: Record<string, string> = {
          Taipei: "台北",
          Tokyo: "東京",
          "Hong Kong": "香港",
          Shanghai: "上海",
          Singapore: "新加坡",
          London: "倫敦",
          Paris: "巴黎",
          "New York": "紐約",
          "Los Angeles": "洛杉磯",
          Seoul: "首爾",
          Sydney: "雪梨",
        };
        timeZoneCity = cityMap[rawCity] || rawCity;
      } catch {}
    }

    updateTime();
    timer = setInterval(updateTime, 1000);
  });

  onDestroy(() => {
    if (timer) clearInterval(timer);
  });
</script>

<!-- Ambient TV Clock Widget -->
<div
  class="ambient-clock-widget"
  class:ambient-mode={$isIdleStore}
  on:click={toggleMode}
  title="點擊切換時鐘樣式 (數位 / 中文字)"
  role="button"
  tabindex="0"
  on:keydown={(e) => (e.key === "Enter" || e.key === " ") && toggleMode()}
  aria-label={`目前時間：${strHours}:${strMinutes}，時區：${timeZoneCity}`}
>
  {#if mode === "digital"}
    <!-- Digital Mode (JetBrains Mono) -->
    <div class="digital-clock-container">
      <div class="time-row">
        <span class="digits hours">{strHours}</span>
        <span class="colon">:</span>
        <span class="digits minutes">{strMinutes}</span>
        {#if $isIdleStore}
          <span class="colon sec-colon">:</span>
          <span class="digits seconds">{strSeconds}</span>
        {/if}
      </div>

      {#if $isIdleStore}
        <div class="meta-row">
          <span class="date-tag">{dateStr}</span>
          <span class="tz-tag">{timeZoneCity}</span>
        </div>
      {/if}
    </div>
  {:else}
    <!-- Chinese Characters Block Mode (888tools Gen Jyuu Gothic Style) -->
    <div class="chinese-clock-container">
      <div class="cn-grid">
        <span class="cn-tile tile-cream">{cnH1}</span>
        <span class="cn-tile tile-navy">{cnH2}</span>
        <span class="cn-unit">時</span>
        <span class="cn-tile tile-navy">{cnM1}</span>
        <span class="cn-tile tile-cream">{cnM2}</span>
        <span class="cn-unit">分</span>
        {#if $isIdleStore}
          <span class="cn-tile tile-cream cn-sec-tile">{cnS1}</span>
          <span class="cn-tile tile-navy cn-sec-tile">{cnS2}</span>
          <span class="cn-unit">秒</span>
        {/if}
      </div>

      {#if $isIdleStore}
        <div class="meta-row">
          <span class="date-tag">{dateStr}</span>
          <span class="tz-tag">{timeZoneCity}</span>
        </div>
      {/if}
    </div>
  {/if}

  <span class="dock-tooltip">
    {mode === "digital" ? "時鐘：數位模式 (點擊換中文字鐘)" : "時鐘：中文字模式 (點擊換數位時鐘)"}
  </span>
</div>

<style>
  .ambient-clock-widget {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: rgba(14, 18, 28, 0.65);
    border: 1px solid rgba(255, 255, 255, 0.14);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-radius: 50px;
    height: 48px;
    padding: 0 16px;
    color: #f1f5f9;
    cursor: pointer;
    user-select: none;
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
    pointer-events: auto;
  }

  .ambient-clock-widget:hover {
    background: rgba(14, 18, 28, 0.82);
    border-color: rgba(168, 85, 247, 0.4);
    transform: translateY(-1px);
  }

  .ambient-clock-widget:focus-visible {
    outline: 2px solid #38bdf8;
    outline-offset: 2px;
  }

  /* Digital Mode Typography (JetBrains Mono) */
  .digital-clock-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-family: var(--font-mono, "JetBrains Mono", monospace);
  }

  .time-row {
    display: flex;
    align-items: baseline;
    font-size: 1.05rem;
    font-weight: 600;
    letter-spacing: 0.5px;
    color: #ffffff;
    line-height: 1;
  }

  .colon {
    color: #c084fc;
    margin: 0 1px;
    animation: blinkColon 2s infinite ease-in-out;
  }

  @keyframes blinkColon {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.35; }
  }

  .sec-colon {
    font-size: 0.85em;
  }

  .seconds {
    font-size: 0.85em;
    color: #cbd5e1;
  }

  /* Chinese Mode Typography (Gen Jyuu Gothic & 888tools aesthetic) */
  .chinese-clock-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-family: var(--font-sans, "Gen Jyuu Gothic", sans-serif);
  }

  .cn-grid {
    display: flex;
    align-items: center;
    gap: 3px;
    line-height: 1;
  }

  .cn-tile {
    width: 22px;
    height: 24px;
    border-radius: 5px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 0.82rem;
    font-weight: 700;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.25);
    transition: all 0.3s ease;
  }

  /* Alternating cream & navy tiles based on 888tools design */
  .cn-tile.tile-cream {
    background: #fef3c7;
    border: 1px solid rgba(15, 23, 42, 0.45);
    color: #291c10;
  }

  .cn-tile.tile-navy {
    background: #1e293b;
    border: 1px solid rgba(255, 255, 255, 0.22);
    color: #ffffff;
  }

  .cn-unit {
    font-size: 0.75rem;
    color: #fb923c; /* 888tools warm terracotta amber */
    font-weight: 700;
    margin: 0 2px;
  }

  .meta-row {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 4px;
    font-size: 0.72rem;
    color: #94a3b8;
  }

  .date-tag {
    color: #e2e8f0;
    font-weight: 500;
  }

  .tz-tag {
    color: #c084fc;
    font-size: 0.68rem;
    padding: 1px 5px;
    border-radius: 4px;
    background: rgba(168, 85, 247, 0.16);
    border: 1px solid rgba(168, 85, 247, 0.25);
  }

  /* Shared dock tooltip */
  .dock-tooltip {
    position: absolute;
    top: 54px;
    left: 50%;
    transform: translateX(-50%) translateY(4px);
    background: rgba(14, 18, 28, 0.94);
    border: 1px solid rgba(255, 255, 255, 0.14);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    padding: 4px 8px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 500;
    color: #f1f5f9;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
    z-index: 60;
  }

  .ambient-clock-widget:hover .dock-tooltip {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }

  /* TV Ambient Screen Saver Expansion Mode */
  .ambient-clock-widget.ambient-mode {
    height: auto;
    padding: 12px 26px;
    border-radius: 20px;
    background: rgba(10, 14, 24, 0.88);
    border-color: rgba(168, 85, 247, 0.35);
    box-shadow:
      0 16px 40px rgba(0, 0, 0, 0.6),
      0 0 24px rgba(168, 85, 247, 0.2);
    animation: ambientPulse 4s infinite alternate ease-in-out;
  }

  .ambient-clock-widget.ambient-mode .time-row {
    font-size: 1.8rem;
    letter-spacing: 1px;
  }

  .ambient-clock-widget.ambient-mode .cn-tile {
    width: 32px;
    height: 36px;
    font-size: 1.15rem;
    border-radius: 7px;
  }

  .ambient-clock-widget.ambient-mode .cn-unit {
    font-size: 0.92rem;
    margin: 0 3px;
  }

  .ambient-clock-widget.ambient-mode .meta-row {
    margin-top: 6px;
    font-size: 0.82rem;
    gap: 8px;
  }

  .ambient-clock-widget.ambient-mode .dock-tooltip {
    display: none;
  }

  @keyframes ambientPulse {
    0% {
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6), 0 0 16px rgba(168, 85, 247, 0.15);
    }
    100% {
      box-shadow: 0 16px 45px rgba(0, 0, 0, 0.7), 0 0 30px rgba(168, 85, 247, 0.35);
    }
  }

  @media only screen and (max-width: 600px) {
    .ambient-clock-widget {
      height: 42px;
      padding: 0 10px;
    }

    .time-row {
      font-size: 0.92rem;
    }

    .cn-tile {
      width: 17px;
      height: 20px;
      font-size: 0.72rem;
    }

    .ambient-clock-widget.ambient-mode .time-row {
      font-size: 1.25rem;
    }

    .ambient-clock-widget.ambient-mode .cn-tile {
      width: 24px;
      height: 26px;
      font-size: 0.9rem;
    }

    .dock-tooltip {
      display: none;
    }
  }
</style>

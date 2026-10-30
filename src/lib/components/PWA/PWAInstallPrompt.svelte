<script lang="ts">
  import {
    pwaStore,
    installPWA,
    dismissPWAPrompt,
    closeIOSGuide,
  } from "../../stores/pwaStore";
  import { Download, Sparkles, X, Share2, Plus, Smartphone, Monitor } from "@lucide/svelte";

  let isInstalling = false;

  async function handleInstall() {
    isInstalling = true;
    try {
      await installPWA();
    } finally {
      isInstalling = false;
    }
  }

  function handleDismiss() {
    dismissPWAPrompt(3); // Snooze for 3 days
  }

  function handleCloseIOS() {
    closeIOSGuide();
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      handleCloseIOS();
    }
  }
</script>

<!-- Active Install Floating Banner / Prompt -->
{#if $pwaStore.showPrompt && !$pwaStore.isStandalone}
  <div
    class="pwa-install-banner"
    role="region"
    aria-labelledby="pwa-title"
    aria-describedby="pwa-desc"
  >
    <!-- Close button -->
    <button
      type="button"
      class="pwa-close-btn"
      on:click={handleDismiss}
      aria-label="關閉安裝提示"
      title="稍後再說"
    >
      <X size={16} />
    </button>

    <div class="pwa-content">
      <!-- App Icon with breathing glow -->
      <div class="pwa-app-icon-wrap">
        <img
          src="/icons/icon-192.png"
          alt="888 Music App Icon"
          class="pwa-app-icon"
          width="48"
          height="48"
        />
        <div class="pwa-icon-badge" aria-hidden="true">
          <Sparkles size={11} />
        </div>
      </div>

      <!-- Main Copy -->
      <div class="pwa-text-block">
        <div class="pwa-title-row">
          <h3 id="pwa-title" class="pwa-title">安裝 888 Music App</h3>
          <span class="pwa-pill-badge">PWA</span>
        </div>
        <p id="pwa-desc" class="pwa-desc">
          {$pwaStore.isIOS
            ? "加入 iPhone 主畫面，享受無網址列全螢幕純淨聆聽！"
            : "像原生桌面 / 手機 App 一樣秒開，支援離線快取與獨立視窗。"}
        </p>

        <!-- Feature Points -->
        <ul class="pwa-features-list">
          <li>
            <span class="pwa-bullet">✦</span> 獨立全螢幕・無網址列干擾
          </li>
          <li>
            <span class="pwa-bullet">✦</span> 桌面 / 主畫面一鍵快捷秒開
          </li>
          <li>
            <span class="pwa-bullet">✦</span> 離線快取與不中斷音訊串流
          </li>
        </ul>
      </div>
    </div>

    <!-- Actions -->
    <div class="pwa-actions">
      <button
        type="button"
        class="pwa-btn-dismiss"
        on:click={handleDismiss}
      >
        稍後再說
      </button>

      <button
        type="button"
        class="pwa-btn-install"
        disabled={isInstalling}
        on:click={handleInstall}
      >
        {#if isInstalling}
          <span class="pwa-spinner"></span>
          <span>安裝中...</span>
        {:else}
          <Download size={16} />
          <span>{$pwaStore.isIOS ? "查看安裝教學" : "立即主動安裝"}</span>
        {/if}
      </button>
    </div>
  </div>
{/if}

<!-- iOS Safari Manual Installation Guide Modal -->
{#if $pwaStore.showIOSGuide && !$pwaStore.isStandalone}
  <div
    class="ios-guide-backdrop"
    on:click={handleBackdropClick}
    on:keydown={(e) => (e.key === "Escape" || e.key === "Enter") && handleCloseIOS()}
    role="button"
    tabindex="0"
    aria-label="點擊背景關閉教學"
  >
    <div
      class="ios-guide-modal"
      role="dialog"
      aria-modal="true"
      tabindex="-1"
      aria-labelledby="ios-guide-title"
    >
      <div class="ios-modal-header">
        <div class="ios-header-icon">
          <Smartphone size={24} />
        </div>
        <div>
          <h3 id="ios-guide-title" class="ios-modal-title">
            安裝至 iPhone / iPad 主畫面
          </h3>
          <p class="ios-modal-subtitle">只需三步即可將 888 Music 變成原生 App</p>
        </div>
        <button
          type="button"
          class="pwa-close-btn in-modal"
          on:click={handleCloseIOS}
          aria-label="關閉教學"
        >
          <X size={18} />
        </button>
      </div>

      <div class="ios-steps">
        <div class="ios-step-item">
          <div class="step-num">1</div>
          <div class="step-body">
            <p class="step-text">
              在 Safari 瀏覽器底部工具列中，點選 <strong>「分享」按鈕</strong>
            </p>
            <div class="step-tag">
              <Share2 size={16} />
              <span>點擊分享圖示</span>
            </div>
          </div>
        </div>

        <div class="ios-step-item">
          <div class="step-num">2</div>
          <div class="step-body">
            <p class="step-text">
              在彈出的選單中向下滑動，找到並點擊 <strong>「加入主畫面」</strong>
            </p>
            <div class="step-tag">
              <Plus size={16} />
              <span>加入主畫面</span>
            </div>
          </div>
        </div>

        <div class="ios-step-item">
          <div class="step-num">3</div>
          <div class="step-body">
            <p class="step-text">
              點擊右上角的 <strong>「新增」</strong>，即可完成安裝！
            </p>
            <p class="step-subtext">完成後隨時從手機桌面一鍵啟動 888 Music。</p>
          </div>
        </div>
      </div>

      <div class="ios-modal-footer">
        <button
          type="button"
          class="pwa-btn-install full-width"
          on:click={handleCloseIOS}
        >
          我知道了，立即體驗
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  /* Floating PWA Card */
  .pwa-install-banner {
    position: fixed;
    bottom: 24px;
    right: 24px;
    max-width: 380px;
    width: calc(100vw - 48px);
    background: rgba(14, 18, 28, 0.92);
    border: 1px solid rgba(234, 88, 12, 0.35);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-radius: 20px;
    padding: 20px;
    box-shadow:
      0 16px 36px rgba(0, 0, 0, 0.6),
      0 0 24px rgba(234, 88, 12, 0.18),
      inset 0 1px 0 rgba(255, 255, 255, 0.12);
    z-index: 1000;
    color: #f8fafc;
    animation: pwaSlideUp 0.38s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    user-select: none;
  }

  @keyframes pwaSlideUp {
    from {
      opacity: 0;
      transform: translateY(24px) scale(0.96);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .pwa-close-btn {
    position: absolute;
    top: 14px;
    right: 14px;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #94a3b8;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .pwa-close-btn:hover {
    background: rgba(255, 255, 255, 0.18);
    color: #ffffff;
    transform: scale(1.05);
  }

  .pwa-close-btn.in-modal {
    position: static;
  }

  .pwa-content {
    display: flex;
    gap: 16px;
    align-items: flex-start;
  }

  .pwa-app-icon-wrap {
    position: relative;
    flex-shrink: 0;
  }

  .pwa-app-icon {
    width: 52px;
    height: 52px;
    border-radius: 14px;
    box-shadow: 0 4px 14px rgba(234, 88, 12, 0.35);
    display: block;
    object-fit: cover;
  }

  .pwa-icon-badge {
    position: absolute;
    bottom: -4px;
    right: -4px;
    width: 18px;
    height: 18px;
    background: linear-gradient(135deg, #ff7a00, #ea580c);
    border: 2px solid #0e121c;
    border-radius: 50%;
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .pwa-text-block {
    flex: 1;
    min-width: 0;
    padding-right: 14px;
  }

  .pwa-title-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
  }

  .pwa-title {
    margin: 0;
    font-size: 16px;
    font-weight: 700;
    color: #ffffff;
    letter-spacing: -0.2px;
  }

  .pwa-pill-badge {
    background: rgba(234, 88, 12, 0.22);
    border: 1px solid rgba(234, 88, 12, 0.45);
    color: #ff9d42;
    font-size: 10px;
    font-weight: 700;
    padding: 1px 6px;
    border-radius: 10px;
    letter-spacing: 0.5px;
  }

  .pwa-desc {
    margin: 0 0 10px 0;
    font-size: 13px;
    line-height: 1.45;
    color: #94a3b8;
  }

  .pwa-features-list {
    list-style: none;
    padding: 0;
    margin: 0 0 16px 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 12px;
    color: #cbd5e1;
  }

  .pwa-features-list li {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .pwa-bullet {
    color: #ea580c;
    font-size: 10px;
  }

  .pwa-actions {
    display: flex;
    gap: 10px;
    align-items: center;
    justify-content: flex-end;
  }

  .pwa-btn-dismiss {
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.14);
    color: #94a3b8;
    padding: 8px 14px;
    font-size: 13px;
    font-weight: 500;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .pwa-btn-dismiss:hover {
    background: rgba(255, 255, 255, 0.08);
    color: #ffffff;
  }

  .pwa-btn-install {
    background: linear-gradient(135deg, #ff7a00, #ea580c);
    border: none;
    color: #ffffff;
    padding: 8px 16px;
    font-size: 13px;
    font-weight: 600;
    border-radius: 10px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    box-shadow: 0 4px 14px rgba(234, 88, 12, 0.4);
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .pwa-btn-install:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 18px rgba(234, 88, 12, 0.55);
    filter: brightness(1.08);
  }

  .pwa-btn-install:active:not(:disabled) {
    transform: translateY(0);
  }

  .pwa-btn-install:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .pwa-btn-install.full-width {
    width: 100%;
    justify-content: center;
    padding: 12px 18px;
    font-size: 14px;
  }

  .pwa-spinner {
    width: 14px;
    height: 14px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: #ffffff;
    border-radius: 50%;
    animation: pwaSpin 0.7s linear infinite;
  }

  @keyframes pwaSpin {
    to {
      transform: rotate(360deg);
    }
  }

  /* iOS Guide Modal Backdrop */
  .ios-guide-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.72);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    z-index: 2000;
    animation: pwaFadeIn 0.25s ease-out forwards;
  }

  @keyframes pwaFadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .ios-guide-modal {
    background: rgba(18, 22, 34, 0.96);
    border: 1px solid rgba(234, 88, 12, 0.4);
    box-shadow:
      0 24px 48px rgba(0, 0, 0, 0.7),
      0 0 32px rgba(234, 88, 12, 0.2);
    border-radius: 22px;
    max-width: 440px;
    width: 100%;
    padding: 24px;
    color: #ffffff;
    animation: pwaScaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  @keyframes pwaScaleUp {
    from {
      opacity: 0;
      transform: scale(0.94);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  .ios-modal-header {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    margin-bottom: 20px;
  }

  .ios-header-icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: rgba(234, 88, 12, 0.2);
    border: 1px solid rgba(234, 88, 12, 0.4);
    color: #ff8c2a;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .ios-modal-title {
    margin: 0 0 4px 0;
    font-size: 18px;
    font-weight: 700;
    color: #ffffff;
  }

  .ios-modal-subtitle {
    margin: 0;
    font-size: 13px;
    color: #94a3b8;
  }

  .ios-steps {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 24px;
  }

  .ios-step-item {
    display: flex;
    gap: 14px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 14px;
    padding: 12px 14px;
  }

  .step-num {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #ea580c;
    color: #ffffff;
    font-size: 12px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .step-body {
    flex: 1;
  }

  .step-text {
    margin: 0 0 6px 0;
    font-size: 13px;
    line-height: 1.4;
    color: #e2e8f0;
  }

  .step-text strong {
    color: #ff9d42;
  }

  .step-subtext {
    margin: 0;
    font-size: 12px;
    color: #94a3b8;
  }

  .step-tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 6px;
    padding: 3px 8px;
    font-size: 12px;
    color: #38bdf8;
  }

  .ios-modal-footer {
    display: flex;
    justify-content: center;
  }

  /* Mobile Responsive */
  @media only screen and (max-width: 600px) {
    .pwa-install-banner {
      bottom: 74px; /* Above mobile dock controls */
      right: 14px;
      left: 14px;
      width: auto;
      max-width: none;
      padding: 16px;
      border-radius: 18px;
    }

    .pwa-app-icon {
      width: 44px;
      height: 44px;
    }

    .pwa-title {
      font-size: 15px;
    }

    .pwa-desc {
      font-size: 12px;
      margin-bottom: 8px;
    }

    .pwa-features-list {
      display: none; /* Keep mobile banner compact */
    }

    .pwa-actions {
      margin-top: 8px;
    }
  }
</style>

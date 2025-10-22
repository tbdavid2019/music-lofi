<script lang="ts">
  // 導入 Tone.js 和音樂引擎組件 (簡化版)
  // @ts-ignore
  import * as Tone from "tone";
  import ChordProgression from "./engine/Chords/ChordProgression";
  import Keys from "./engine/Chords/Keys";
  import { fiveToFive } from "./engine/Chords/MajorScale";
  import Piano from "./engine/Piano/Piano";
  import {
    createCanonMelodyPattern,
    generateCanonState,
    type CanonMelodyStep,
    type CanonState,
  } from "./engine/Canon/style";
  
  console.log('🎵 TVPlayButton component loaded');
  
  let isPlaying = false;
  let contextStarted = false;
  let genChordsOnce = false;
  let autoPlayReady = false;
  
  // 響應式 BPM 顯示 - 初始化時讀取 localStorage
  let currentBPM = 160;
  let grooveStyle: GrooveStyle = "relaxing";

  function updateTransportBpm(newBpm: number, persist = false) {
    if (typeof newBpm !== 'number' || Number.isNaN(newBpm)) {
      return;
    }

    currentBPM = newBpm;
    Tone.Transport.bpm.rampTo(newBpm, 0.01);

    if (persist && typeof window !== 'undefined') {
      localStorage.setItem('LofiEngine_BPM', newBpm.toString());
    }
  }

  // 音樂狀態
  let key = "C";
  let progression = [];
  let scale = [];
  let progress = 0;
  let scalePos = 0;
  let activeProgressionIndex = 0;
  let melodyDensity = 0.26;
  let melodyOff = false;
  let melodyDirectionPreference: -1 | 0 | 1 = 0;
  let melodyLeapPreference = 0;
  let melodyUpStreak = 0;
  let loopsRemainingForProgression = 0;
  let loopsCompletedForProgression = 0;
  
  // 簡化的樂器
  let pianoLoaded = false;
  let pn: any;
  let chords: any, melody: any;
  let canonPad: Tone.PolySynth | null = null;
  let canonPadGain: Tone.Volume | null = null;
  let canonPadFilter: Tone.Filter | null = null;
  let canonPadLfo: Tone.LFO | null = null;
  let canonPadHoldCounter = 0;
  
  // 音量控制 - LoFi 適中音量
  const MASTER_GAIN_DB = 12;
  let volume = 0.8; // 調整為 0.8，平衡音量和 LoFi 感覺
  const linearToDb = (value: number) =>
    value === 0 ? -Infinity : 20 * Math.log10(value);
  
  // 音量節點引用 (在 startAudioContext 中初始化)
  let volumeNode: any = null;

  type GrooveStyle = "cafe" | "jazz" | "relaxing" | "canon";

  type StrumPattern = {
    offsets: number[];
    release: string;
    velocityRange: [number, number];
    invertChance?: number;
    tailSpacing?: number;
  };

  type MelodyDurationOption = {
    duration: string;
    weight: number;
  };

  type GrooveStyleConfig = {
    displayName: string;
    defaultBpm: number;
    swing: number;
    swingSubdivision: string;
    strumPatterns: StrumPattern[];
    chordTriadChance: number;
    melodyDensityRange: [number, number];
    melodyOffChance: number;
    melodyVelocityRange: [number, number];
    melodyDurationOptions: MelodyDurationOption[];
    rotation: {
      loopsRange?: [number, number];
      reuseProbability: number;
      poolSize?: number;
      durationRangeSeconds: [number, number];
    };
  };

  const GROOVE_STYLE_KEY = "LofiEngine_TV_GrooveStyle";

  const KEY_RING = [
    "C",
    "G",
    "D",
    "A",
    "E",
    "B",
    "Gb",
    "Db",
    "Ab",
    "Eb",
    "Bb",
    "F",
  ];

const grooveStyles: Record<GrooveStyle, GrooveStyleConfig> = {
  cafe: {
    displayName: "Cafe",
    defaultBpm: 84,
    swing: 0.45,
    swingSubdivision: "8n",
    strumPatterns: [
      {
        offsets: [0, 0.24, 0.46, 0.74],
        release: "1n",
        velocityRange: [0.32, 0.46],
        invertChance: 0.55,
        tailSpacing: 0.22,
      },
      {
        offsets: [0, 0.32, 0.66],
        release: "1n",
        velocityRange: [0.3, 0.42],
        invertChance: 0.4,
        tailSpacing: 0.2,
      },
      {
        offsets: [0, 0.2, 0.48, 0.88],
        release: "2n",
        velocityRange: [0.28, 0.4],
        invertChance: 0.5,
        tailSpacing: 0.18,
      },
      {
        offsets: [0],
        release: "2n",
        velocityRange: [0.26, 0.38],
        invertChance: 0.35,
        tailSpacing: 0.24,
      },
    ],
    chordTriadChance: 0.6,
    melodyDensityRange: [0.18, 0.33],
    melodyOffChance: 0.32,
    melodyVelocityRange: [0.2, 0.35],
    melodyDurationOptions: [
      { duration: "8n", weight: 1 },
      { duration: "4n", weight: 2 },
      { duration: "2n", weight: 1 },
    ],
    rotation: {
      loopsRange: [3, 5],
      reuseProbability: 0.55,
      poolSize: 3,
      durationRangeSeconds: [280, 320],
    },
  },
  jazz: {
    displayName: "Jazz",
    defaultBpm: 112,
    swing: 0.58,
    swingSubdivision: "8n",
    strumPatterns: [
      {
        offsets: [0, 0.18, 0.34, 0.58, 0.82],
        release: "1n",
        velocityRange: [0.34, 0.52],
        invertChance: 0.45,
        tailSpacing: 0.18,
      },
      {
        offsets: [0, 0.22, 0.41, 0.63],
        release: "1n",
        velocityRange: [0.36, 0.54],
        invertChance: 0.6,
        tailSpacing: 0.18,
      },
      {
        offsets: [0, 0.27, 0.5],
        release: "2n",
        velocityRange: [0.3, 0.48],
        invertChance: 0.4,
        tailSpacing: 0.24,
      },
      {
        offsets: [0, 0.15, 0.44, 0.74],
        release: "1n",
        velocityRange: [0.35, 0.5],
        invertChance: 0.5,
        tailSpacing: 0.2,
      },
    ],
    chordTriadChance: 0.35,
    melodyDensityRange: [0.28, 0.48],
    melodyOffChance: 0.18,
    melodyVelocityRange: [0.28, 0.48],
    melodyDurationOptions: [
      { duration: "8n", weight: 2.5 },
      { duration: "4n", weight: 2 },
      { duration: "2n", weight: 0.8 },
    ],
    rotation: {
      loopsRange: [3, 4],
      reuseProbability: 0.45,
      poolSize: 4,
      durationRangeSeconds: [260, 310],
    },
  },
  relaxing: {
    displayName: "Relaxing",
    defaultBpm: 160,
    swing: 0,
    swingSubdivision: "4n",
    strumPatterns: [
      {
        offsets: [0],
        release: "2n",
        velocityRange: [0.24, 0.32],
        invertChance: 0.15,
        tailSpacing: 0.4,
      },
      {
        offsets: [0, 0.55],
        release: "1n",
        velocityRange: [0.22, 0.3],
        invertChance: 0.05,
        tailSpacing: 0.38,
      },
    ],
    chordTriadChance: 0.85,
    melodyDensityRange: [0.1, 0.2],
    melodyOffChance: 0.5,
    melodyVelocityRange: [0.16, 0.28],
    melodyDurationOptions: [
      { duration: "2n", weight: 2.8 },
      { duration: "1n", weight: 1.5 },
      { duration: "4n", weight: 1.2 },
    ],
    rotation: {
      durationRangeSeconds: [360, 450],
      reuseProbability: 0.6,
      poolSize: 2,
    },
  },
  canon: {
    displayName: "🎼 Canon",
    defaultBpm: 72,
    swing: 0.12,
    swingSubdivision: "8n",
    strumPatterns: [
      {
        offsets: [0, 0.48, 0.92, 1.32],
        release: "1n",
        velocityRange: [0.22, 0.32],
        invertChance: 0.18,
        tailSpacing: 0.24,
      },
      {
        offsets: [0, 0.36, 0.68, 1.08],
        release: "1n",
        velocityRange: [0.2, 0.3],
        invertChance: 0.12,
        tailSpacing: 0.26,
      },
      {
        offsets: [0, 0.52, 1],
        release: "2n",
        velocityRange: [0.24, 0.34],
        invertChance: 0.22,
        tailSpacing: 0.3,
      },
    ],
    chordTriadChance: 0.95,
    melodyDensityRange: [0.22, 0.28],
    melodyOffChance: 0.08,
    melodyVelocityRange: [0.18, 0.32],
    melodyDurationOptions: [
      { duration: "8n", weight: 3.4 },
      { duration: "4n", weight: 2.1 },
      { duration: "2n", weight: 0.9 },
    ],
    rotation: {
      durationRangeSeconds: [360, 520],
      reuseProbability: 0.7,
      poolSize: 2,
    },
  },
};

if (typeof window !== 'undefined') {
  const savedBPM = localStorage.getItem('LofiEngine_BPM');
  if (savedBPM) {
    currentBPM = parseInt(savedBPM);
  }
  const savedStyle = localStorage.getItem(GROOVE_STYLE_KEY) as GrooveStyle | null;
  if (savedStyle && ["cafe", "relaxing", "jazz", "canon"].includes(savedStyle)) {
    grooveStyle = savedStyle;
  }
}

const initialConfig = grooveStyles[grooveStyle];
const [initialDensityMin, initialDensityMax] = initialConfig.melodyDensityRange;
melodyDensity = initialDensityMin + (initialDensityMax - initialDensityMin) * 0.5;

  type CanonMeta = {
    melodyPattern: CanonMelodyStep[];
    baseScaleIndex: number;
    voice: CanonState["voiceSettings"];
    variationName: string;
    anchorTrend: number[];
    degrees: number[];
    scaleLength: number;
  };

  type ProgressionState = {
    key: string;
    progression: ReturnType<typeof ChordProgression.generate>;
    scale: string[];
    scalePos: number;
    style: GrooveStyle;
    meta?: {
      canon?: CanonMeta;
    };
  };

  let progressionPool: ProgressionState[] = [];
  let progressionPoolIndex = -1;
  let canonMeta: CanonMeta | null = null;
  let canonMelodyIndex = 0;

  function randomIntInRange([min, max]: [number, number]) {
    if (max <= min) return min;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function randomInRange([min, max]: [number, number]) {
    if (max <= min) return min;
    return Math.random() * (max - min) + min;
  }

  function clamp(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value));
  }

  function pickKeyForStyle(style: GrooveStyle, previous?: ProgressionState) {
    const fallback = Keys[Math.floor(Math.random() * Keys.length)];

    if (!previous) return fallback;

    if (style === "jazz") {
      const stayChance = 0.6;
      const neighborChance = 0.8;
      if (Math.random() < stayChance) {
        return previous.key;
      }
      const ringIndex = KEY_RING.indexOf(previous.key);
      if (ringIndex !== -1 && Math.random() < neighborChance) {
        const left = KEY_RING[(ringIndex + KEY_RING.length - 1) % KEY_RING.length];
        const right = KEY_RING[(ringIndex + 1) % KEY_RING.length];
        return Math.random() < 0.5 ? left : right;
      }
      return fallback;
    }

    if (style === "canon") {
      const stayProbability = 0.78;
      if (Math.random() < stayProbability) {
        return previous.key;
      }

      const ringIndex = KEY_RING.indexOf(previous.key);
      if (ringIndex !== -1) {
        const candidates = [
          KEY_RING[(ringIndex + KEY_RING.length - 1) % KEY_RING.length],
          KEY_RING[(ringIndex + 1) % KEY_RING.length],
        ];
        return candidates[Math.floor(Math.random() * candidates.length)];
      }

      return fallback;
    }

    if (Math.random() < 0.45) {
      return previous.key;
    }

    const idx = Keys.indexOf(previous.key);
    if (idx !== -1 && Keys.length > 2) {
      const neighborOffsets = [-2, -1, 1, 2];
      const offset = neighborOffsets[Math.floor(Math.random() * neighborOffsets.length)];
      const nextIdx = (idx + Keys.length + offset) % Keys.length;
      return Keys[nextIdx];
    }

    return fallback;
  }

  function createProgressionState(style: GrooveStyle, previous?: ProgressionState): ProgressionState {
    const _scale = fiveToFive;
    const nextKey = pickKeyForStyle(style, previous);
    const nextScale = Tone.Frequency(nextKey + "5")
      .harmonize(_scale)
      .map((f: any) => Tone.Frequency(f).toNote());
    let nextProgression = ChordProgression.generate(8);
    let canonMetadata: CanonMeta | undefined;

    let nextScalePos = Math.floor(Math.random() * _scale.length);
    if (style === "canon") {
      const canonState = generateCanonState();
      nextProgression = canonState.chords;
      const baseIndexFromTop = clamp(canonState.baseScaleOffset, 0, _scale.length - 1);
      const baseIndex = clamp(_scale.length - 1 - baseIndexFromTop, 0, _scale.length - 1);
      nextScalePos = baseIndex;
      const melodyPattern = createCanonMelodyPattern({
        variationName: canonState.variationName,
        anchorTrend: canonState.anchorTrend,
        baseScaleIndex: baseIndex,
        scaleLength: _scale.length,
        degrees: canonState.degrees,
      });
      canonMetadata = {
        melodyPattern,
        baseScaleIndex: baseIndex,
        voice: {
          entryInterval: canonState.voiceSettings.entryInterval,
          velocityProfile: [...canonState.voiceSettings.velocityProfile],
          transpose: [...canonState.voiceSettings.transpose],
          voices: canonState.voiceSettings.voices,
        },
        variationName: canonState.variationName,
        anchorTrend: [...canonState.anchorTrend],
        degrees: [...canonState.degrees],
        scaleLength: _scale.length,
      };
    } else if (previous && previous.key === nextKey) {
      const deltaCandidates = [-2, -1, 0, 1, 2];
      const delta = deltaCandidates[Math.floor(Math.random() * deltaCandidates.length)];
      nextScalePos = clamp(previous.scalePos + delta, 0, _scale.length - 1);
    }

    return {
      key: nextKey,
      progression: nextProgression,
      scale: nextScale,
      scalePos: nextScalePos,
      style,
      meta: canonMetadata ? { canon: canonMetadata } : undefined,
    };
  }

  function captureProgression(): ProgressionState {
    return {
      key,
      progression,
      scale,
      scalePos,
      style: grooveStyle,
      meta: canonMeta
        ? {
            canon: {
              melodyPattern: canonMeta.melodyPattern.map((step) => ({ ...step })),
              baseScaleIndex: canonMeta.baseScaleIndex,
              voice: {
                entryInterval: canonMeta.voice.entryInterval,
                velocityProfile: [...canonMeta.voice.velocityProfile],
                transpose: [...canonMeta.voice.transpose],
                voices: canonMeta.voice.voices,
              },
              variationName: canonMeta.variationName,
              anchorTrend: [...canonMeta.anchorTrend],
              degrees: [...canonMeta.degrees],
              scaleLength: canonMeta.scaleLength,
            },
          }
        : undefined,
    };
  }

  function applyProgression(state: ProgressionState, persist = true) {
    key = state.key;
    progression = state.progression;
    scale = state.scale;
    scalePos = state.scalePos;
    progress = 0;
    genChordsOnce = true;
    activeProgressionIndex = 0;
    canonPadHoldCounter = 0;

    const incomingCanon = state.meta?.canon;
    canonMeta = incomingCanon
      ? {
          melodyPattern: incomingCanon.melodyPattern.map((step) => ({ ...step })),
          baseScaleIndex: clamp(incomingCanon.baseScaleIndex, 0, scale.length - 1),
          voice: {
            entryInterval: incomingCanon.voice.entryInterval,
            velocityProfile: [...incomingCanon.voice.velocityProfile],
            transpose: [...incomingCanon.voice.transpose],
            voices: incomingCanon.voice.voices,
          },
          variationName: incomingCanon.variationName,
          anchorTrend: [...incomingCanon.anchorTrend],
          degrees: [...incomingCanon.degrees],
          scaleLength: scale.length,
        }
      : null;
    canonMelodyIndex = 0;

    if (canonMeta && grooveStyle === "canon") {
      scalePos = canonMeta.baseScaleIndex;
      updateCanonPadDynamics(grooveStyle);
    }

    if (persist && typeof window !== 'undefined') {
      // Persist key to keep UI consistent with Play version expectations
      window.dispatchEvent(new CustomEvent('keyChange', { detail: key }));
    }

    const config = grooveStyles[grooveStyle];
    const [densityMin, densityMax] = config.melodyDensityRange;
    melodyDensity = densityMin + (densityMax - densityMin) * 0.5;
    melodyOff = false;
    const directionChoices: Array<-1 | 0 | 1> =
      grooveStyle === "jazz" ? [-1, 0, 1, 1, 1, 1] : [-1, 0, 1, 1, 1];
    melodyDirectionPreference =
      directionChoices[Math.floor(Math.random() * directionChoices.length)];
    const leapBias = grooveStyle === "jazz" ? 0.55 : 0.4;
    melodyLeapPreference = Math.random() < leapBias ? 1 : 0;
    melodyUpStreak = 0;
  }

  function updateCanonPadDynamics(style: GrooveStyle) {
    if (!canonPadGain) {
      return;
    }
    if (style === "canon") {
      const targetVolume = -20 + Math.random() * 6;
      canonPadGain.volume.rampTo(targetVolume, 0.8);
      canonPadHoldCounter = 0;
    } else {
      canonPadGain.volume.rampTo(-Infinity, 0.5);
      canonPad?.releaseAll();
      canonPadHoldCounter = 0;
    }
  }

  function regenerateCanonMelodyPattern() {
    if (!canonMeta || !canonMeta.anchorTrend.length) {
      return;
    }

    const scaleLength = scale.length;
    if (scaleLength <= 0) {
      return;
    }

    if (Math.random() < 0.35) {
      const delta = Math.random() < 0.5 ? -1 : 1;
      canonMeta.baseScaleIndex = clamp(
        canonMeta.baseScaleIndex + delta,
        1,
        Math.max(1, scaleLength - 2),
      );
    }

    if (Math.random() < 0.25) {
      const trendDelta = Math.random() < 0.5 ? -1 : 1;
      canonMeta.anchorTrend = canonMeta.anchorTrend.map((value) =>
        clamp(value + trendDelta, 0, scaleLength - 2),
      );
    }

    const refreshedPattern = createCanonMelodyPattern({
      variationName: canonMeta.variationName,
      anchorTrend: canonMeta.anchorTrend,
      baseScaleIndex: canonMeta.baseScaleIndex,
      scaleLength,
      degrees: canonMeta.degrees,
    });

    canonMeta = {
      ...canonMeta,
      melodyPattern: refreshedPattern,
      scaleLength,
    };
  }

  function ensureLoopsTarget(style: GrooveStyle = grooveStyle) {
    const config = grooveStyles[style];
    loopsCompletedForProgression = 0;
    const rotation = config.rotation;
    if (rotation.durationRangeSeconds) {
      const targetSeconds = randomInRange(rotation.durationRangeSeconds);
      const barsPerLoop = Math.max(1, progression?.length ?? 8);
      const barDuration = (60 / Tone.Transport.bpm.value) * 4;
      const loopDurationSeconds = barDuration * barsPerLoop;
      loopsRemainingForProgression = Math.max(
        1,
        Math.round(targetSeconds / loopDurationSeconds),
      );
    } else if (rotation.loopsRange) {
      loopsRemainingForProgression = Math.max(
        1,
        randomIntInRange(rotation.loopsRange),
      );
    } else {
      loopsRemainingForProgression = 4;
    }
  }

  function registerProgression(state: ProgressionState) {
    progressionPool.push(state);
    const config = grooveStyles[state.style];
    const maxSize = config.rotation.poolSize ?? 3;
    while (progressionPool.length > maxSize) {
      progressionPool.shift();
      progressionPoolIndex = Math.max(-1, progressionPoolIndex - 1);
    }
    progressionPoolIndex = progressionPool.length - 1;
  }

  function rotateProgression(forceNew = false) {
    const config = grooveStyles[grooveStyle];
    const currentSnapshot = progression.length ? captureProgression() : undefined;

    const candidates = progressionPool
      .map((state, idx) => ({ state, idx }))
      .filter(({ state, idx }) => idx !== progressionPoolIndex && state.style === grooveStyle);

    let nextState: ProgressionState | undefined;

    const canReuse = candidates.length > 0 && Math.random() < config.rotation.reuseProbability;

    if (!forceNew && canReuse) {
      const reusePick = candidates[Math.floor(Math.random() * candidates.length)];
      nextState = reusePick.state;
      progressionPoolIndex = reusePick.idx;
    }

    if (!nextState) {
      nextState = createProgressionState(grooveStyle, currentSnapshot);
      registerProgression(nextState);
    }

    applyProgression(nextState, true);
    if (grooveStyle === "canon") {
      regenerateCanonMelodyPattern();
    }
    ensureLoopsTarget(grooveStyle);

    return nextState;
  }

  function handleProgressionLoopComplete() {
    loopsCompletedForProgression += 1;
    if (loopsRemainingForProgression > 0) {
      loopsRemainingForProgression -= 1;
    }

    if (loopsRemainingForProgression <= 0) {
      const nextState = rotateProgression(false);
      previewNextSegment(nextState);
    }
  }

  function previewNextSegment(nextState?: ProgressionState) {
    if (!nextState || !nextState.progression?.length || !pn) {
      return;
    }

    const barDuration = (60 / Tone.Transport.bpm.value) * 4;
    const previewTime = Tone.now() + Math.max(0.05, barDuration - PREVIEW_OFFSET_SECONDS);
    const previewChord = nextState.progression[0];
    strumChord(previewChord, {
      time: previewTime,
      velocityScale: 0.65,
      releaseOverride: "2n",
      jitterRange: 0.03,
    });
  }

  function setGrooveStyle(
    style: GrooveStyle,
    options: { resetBpm?: boolean; persist?: boolean; preserveDynamics?: boolean } = {},
  ) {
    const { resetBpm = false, persist = true, preserveDynamics = false } = options;

    const previous = grooveStyle;
    grooveStyle = style;
    const config = grooveStyles[style];

    Tone.Transport.swing = config.swing;
    Tone.Transport.swingSubdivision = config.swingSubdivision as any;

    if (resetBpm) {
      updateTransportBpm(config.defaultBpm, true);
    }

    if (!preserveDynamics) {
      const [densityMin, densityMax] = config.melodyDensityRange;
      melodyDensity = densityMin + (densityMax - densityMin) * 0.5;
      melodyOff = false;
    }

    melodyUpStreak = 0;

    const needFreshPool = previous !== style || progressionPool.length === 0;

    if (needFreshPool) {
      progressionPool = [];
      progressionPoolIndex = -1;
      loopsRemainingForProgression = 0;
      loopsCompletedForProgression = 0;
      rotateProgression(true);
    } else {
      ensureLoopsTarget(style);
    }

    if (persist && typeof window !== 'undefined') {
      localStorage.setItem(GROOVE_STYLE_KEY, style);
    }
  }

  function toggleGrooveStyle() {
    const order: GrooveStyle[] = ["cafe", "relaxing", "jazz", "canon"];
    const currentIdx = order.indexOf(grooveStyle);
    const nextStyle = order[(currentIdx + 1) % order.length];
    setGrooveStyle(nextStyle, { resetBpm: true });
  }

  // 初始化 Tone.js 音樂引擎
  async function startAudioContext() {
    if (contextStarted) return;
    
    try {
      await Tone.start();
      contextStarted = true;
      
      // 初始化鋼琴
      pn = new Piano(() => {
        pianoLoaded = true;
        console.log("🎹 鋼琴載入完成");
      }).sampler;
      
      // 設置音頻處理鏈 - 原作者版本
      const cmp = new Tone.Compressor({
        threshold: -6,
        ratio: 3,
        attack: 0.5,
        release: 0.1,
      });
      const lpf = new Tone.Filter(2000, "lowpass");
      volumeNode = new Tone.Volume(linearToDb(volume) + MASTER_GAIN_DB);
      Tone.Master.chain(cmp, lpf, volumeNode);

      const padChorus = new Tone.Chorus(0.35, 1.8, 0.35).start();
      padChorus.wet.value = 0.45;
      canonPadFilter = new Tone.Filter(1500, "lowpass");
      const padReverb = new Tone.Reverb({ decay: 6.5, wet: 0.5 });
      // @ts-ignore
      padReverb.generate?.().catch?.(() => {});
      canonPadGain = new Tone.Volume(-Infinity);
      canonPad = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "triangle" },
        envelope: { attack: 0.85, decay: 0.32, sustain: 0.6, release: 5 },
      });
      canonPad.chain(padChorus, canonPadFilter, padReverb, canonPadGain, volumeNode);
      canonPadLfo = new Tone.LFO({ frequency: 0.045, min: 900, max: 1800 }).start();
      canonPadLfo.connect(canonPadFilter.frequency);

      // 初始化 BPM (從 localStorage 讀取或使用默認值)
      let savedBPM = 84;
      if (typeof window !== 'undefined') {
        const bpmFromStorage = localStorage.getItem('LofiEngine_BPM');
        if (bpmFromStorage) {
          savedBPM = parseInt(bpmFromStorage);
        }
      }
      currentBPM = savedBPM; // 更新顯示的 BPM
      updateTransportBpm(savedBPM);
      console.log(`🎵 TV版音頻初始化 BPM: ${savedBPM}`);
      
      setupSequences();
      setGrooveStyle(grooveStyle, { persist: false, preserveDynamics: true });

      updateCanonPadDynamics(grooveStyle);
      
      // 初始化完成後，再次檢查最新的 BPM 設定
      setTimeout(() => {
        const latestBPM = localStorage.getItem('LofiEngine_BPM');
        if (latestBPM && parseInt(latestBPM) !== savedBPM) {
          updateTransportBpm(parseInt(latestBPM));
          console.log(`🎵 TV版 BPM 更新為最新值: ${latestBPM}`);
        }
      }, 100);
      
    } catch (error) {
      console.error("音頻初始化失敗:", error);
    }
  }
  
  function setupSequences() {
    // 和弦序列 - 原作者版本
    chords = new Tone.Sequence(
      (time, note) => {
        playChord(time);
      },
      [""],
      "1n",
    );
    
    // 旋律序列 (簡化版) 
    melody = new Tone.Sequence(
      (time, note) => {
        playMelody(time);
      },
      [""],
      "8n",
    );
    
    chords.humanize = true;
    melody.humanize = true;
  }
  
  async function togglePlay() {
    if (!contextStarted) {
      await startAudioContext();
      // 初始化完成後立即開始播放
      setTimeout(() => {
        if (contextStarted) {
          startMusic();
        }
      }, 100);
      return;
    }
    
    if (Tone.Transport.state === "started") {
      Tone.Transport.stop();
      isPlaying = false;
      canonPad?.releaseAll();
      updateCanonPadDynamics(grooveStyle);
      // 發送播放狀態變更事件
      window.dispatchEvent(new CustomEvent('playStateChange', { detail: false }));
    } else {
      startMusic();
    }
  }

  function startMusic() {
    if (!genChordsOnce) {
      rotateProgression(true);
    }
    Tone.Transport.start();
    chords.start(0);
    melody.start(0);
    isPlaying = true;
    updateCanonPadDynamics(grooveStyle);
    
    // 發送播放狀態變更事件
    window.dispatchEvent(new CustomEvent('playStateChange', { detail: true }));
  }
  
  function generateProgression() {
    rotateProgression(true);
    console.log(`🎵 新的進行生成: ${key} 調`);
  }
  
  function strumChord(
    chord: any,
    options: {
      time?: number;
      velocityScale?: number;
      patternOverride?: StrumPattern;
      releaseOverride?: string;
      jitterRange?: number;
    } = {},
  ) {
    if (!pianoLoaded || !progression[progress] || !chord || !pn) return;

    const {
      time = Tone.now(),
      velocityScale = 1,
      patternOverride,
      releaseOverride,
      jitterRange = 0.05,
    } = options;

    const config = grooveStyles[grooveStyle];
    const patterns = config.strumPatterns;
    const pattern = patternOverride ?? patterns[Math.floor(Math.random() * patterns.length)];
    // @ts-ignore
    const root = Tone.Frequency(key + "3").transpose(chord.semitoneDist);
    const chordSize = grooveStyle === "canon"
      ? 3
      : Math.random() < config.chordTriadChance
        ? 3
        : 4;
    // @ts-ignore
    const voicing = chord.generateVoicing(chordSize);
    // @ts-ignore
    const notes = Tone.Frequency(root)
      .harmonize(voicing)
      .map((f: any) => Tone.Frequency(f).toNote());

    const localJitterRange = grooveStyle === "canon" ? Math.min(jitterRange, 0.03) : jitterRange;
    const styleVelocityScale = grooveStyle === "canon" ? velocityScale * 0.92 : velocityScale;

    const strumNotes = Math.random() < (pattern.invertChance ?? 0) ? [...notes].reverse() : [...notes];
    strumNotes.forEach((note, idx) => {
      const baseOffset =
        pattern.offsets[idx] !== undefined
          ? pattern.offsets[idx]
          : pattern.offsets[pattern.offsets.length - 1] +
            (idx - pattern.offsets.length + 1) * (pattern.tailSpacing ?? 0.22);
      const jitter = idx === 0 ? 0 : (Math.random() * localJitterRange) - localJitterRange / 2;
      const velocityMin = pattern.velocityRange?.[0] ?? 0.32;
      const velocityMax = pattern.velocityRange?.[1] ?? 0.46;
      const baseVelocity = velocityMin + Math.random() * (velocityMax - velocityMin);
      const velocity = Math.min(1, baseVelocity * styleVelocityScale);
      const release = releaseOverride ?? pattern.release;
      // @ts-ignore Tone definitions don't expose triggerAttackRelease signature we use here
      pn.triggerAttackRelease(
        note,
        release,
        Math.max(0, time + Math.max(0, baseOffset + jitter)),
        velocity,
      );
    });
  }

  const PREVIEW_OFFSET_SECONDS = 0.45;

  function triggerCanonPad(chord: any, suggestedTime: number) {
    if (!canonPad || grooveStyle !== "canon") {
      return;
    }

    if (canonPadHoldCounter > 0) {
      canonPadHoldCounter -= 1;
      return;
    }

    const padRoot = Tone.Frequency(key + "2").transpose(chord.semitoneDist - 12);
    const padNotes = Tone.Frequency(padRoot)
      .harmonize([0, 7, 12, 19])
      .map((f: any) => Tone.Frequency(f).toNote());
    const padTime = Math.max(suggestedTime, Tone.now());
    const velocity = 0.15 + Math.random() * 0.05;
    canonPadFilter?.frequency.rampTo(1000 + Math.random() * 650, 1.2);
    canonPad.triggerAttackRelease(padNotes, "2m", padTime, velocity);
    canonPadHoldCounter = 1;
  }

  function scheduleCanonFollowers(params: {
    note: string;
    duration: string;
    velocity: number;
    baseTime: number;
  }) {
    if (!pn || !canonMeta) {
      return;
    }

    const settings = canonMeta.voice;
    const voices = Math.max(1, Math.min(3, settings.voices));
    if (voices <= 1) {
      return;
    }

    const intervalSeconds = Tone.Time(settings.entryInterval ?? "1m").toSeconds();
    const velocityProfile = settings.velocityProfile ?? [1, 0.78, 0.65];
    const transpose = settings.transpose ?? [0, -7, -12];

    for (let voiceIndex = 1; voiceIndex < voices; voiceIndex++) {
      const delaySeconds = intervalSeconds * voiceIndex;
      const jitter = (Math.random() - 0.5) * 0.06;
      const scheduledTime = params.baseTime + delaySeconds + jitter;
      const semitoneShift = transpose[voiceIndex] ?? 0;
      const followerNote = Tone.Frequency(params.note)
        .transpose(semitoneShift)
        .toNote();
      const followerVelocityScale = velocityProfile[voiceIndex] ?? 0.7;
      const humanizeVelocity = 0.85 + Math.random() * 0.2;
      const followerVelocity = Math.min(
        1,
        params.velocity * followerVelocityScale * humanizeVelocity,
      );
      pn.triggerAttackRelease(
        followerNote,
        params.duration,
        Math.max(scheduledTime, Tone.now()),
        followerVelocity,
      );
    }
  }

  function playCanonMelody(time?: number) {
    if (!pn || !canonMeta || !scale.length) {
      return;
    }

    if (!canonMeta.melodyPattern.length) {
      regenerateCanonMelodyPattern();
    }

    const pattern = canonMeta.melodyPattern;
    if (!pattern.length) {
      return;
    }

    const step = pattern[canonMelodyIndex] ?? pattern[0];
    const scaleLength = scale.length;
    const referenceLength = canonMeta.scaleLength || scaleLength;

    let targetIndex: number;
    if (typeof step.scaleIndex === "number" && referenceLength > 0) {
      const normalizedIndex = clamp(step.scaleIndex, 0, referenceLength - 1);
      if (referenceLength !== scaleLength && referenceLength > 1) {
        const ratio = (scaleLength - 1) / (referenceLength - 1);
        targetIndex = clamp(Math.round(normalizedIndex * ratio), 0, scaleLength - 1);
      } else {
        targetIndex = clamp(normalizedIndex, 0, scaleLength - 1);
      }
    } else {
      targetIndex = clamp(
        canonMeta.baseScaleIndex + (step.offset ?? 0),
        0,
        scaleLength - 1,
      );
    }

    canonMeta.scaleLength = scaleLength;
    scalePos = targetIndex;

    const config = grooveStyles[grooveStyle];
    const [velocityMin, velocityMax] = config.melodyVelocityRange;
    const humanize = 0.92 + Math.random() * 0.12;
    const baseVelocity = velocityMin + Math.random() * (velocityMax - velocityMin);
    const velocity = Math.min(1, baseVelocity * (step.accent ?? 1) * humanize);
    const duration = step.duration;
    const note = scale[targetIndex];
    const timeBase = typeof time === "number" ? time : Tone.now();
    const timingJitter = (Math.random() - 0.5) * 0.028;
    const triggerTime = Math.max(timeBase + timingJitter, Tone.now());

    pn.triggerAttackRelease(note, duration, triggerTime, velocity);
    scheduleCanonFollowers({
      note,
      duration,
      velocity,
      baseTime: triggerTime,
    });

    canonMelodyIndex = (canonMelodyIndex + 1) % pattern.length;
  }

  function playChord(time?: number) {
    if (!pianoLoaded || !progression[progress]) return;
    
    const chord = progression[progress];
    const baseTime = typeof time === "number" ? time : Tone.now();
    strumChord(chord, { time: baseTime });
    if (grooveStyle === "canon") {
      triggerCanonPad(chord, baseTime);
    }
    
    nextChord();
  }

  function nextChord() {
    const config = grooveStyles[grooveStyle];
    const nextProgress = progress === progression.length - 1 ? 0 : progress + 1;
    const wraps = nextProgress === 0;

    activeProgressionIndex = progress;
    progress = nextProgress;

    if (wraps) {
      const [densityMin, densityMax] = config.melodyDensityRange;
      melodyDensity = densityMin + Math.random() * (densityMax - densityMin);
      melodyOff = Math.random() < config.melodyOffChance;
      const directionChoices: Array<-1 | 0 | 1> =
        grooveStyle === "jazz" ? [-1, 0, 1, 1, 1, 1] : [-1, 0, 1, 1, 1];
      melodyDirectionPreference =
        directionChoices[Math.floor(Math.random() * directionChoices.length)];
      const leapBias = grooveStyle === "jazz" ? 0.55 : 0.4;
      melodyLeapPreference = Math.random() < leapBias ? 1 : 0;
      melodyUpStreak = 0;
      if (grooveStyle === "canon") {
        regenerateCanonMelodyPattern();
        canonMelodyIndex = 0;
      }
      handleProgressionLoopComplete();
    }
  }

  function playMelody(time?: number) {
    if (grooveStyle === "canon") {
      playCanonMelody(time);
      return;
    }

    if (!pianoLoaded || melodyOff || Math.random() >= melodyDensity) return;
    
    const note = scale[scalePos];
    if (note) {
      const config = grooveStyles[grooveStyle];
      const [velocityMin, velocityMax] = config.melodyVelocityRange;
      const melodyVelocityBase = velocityMin + Math.random() * (velocityMax - velocityMin);
      const totalWeight = config.melodyDurationOptions.reduce(
        (sum, option) => sum + option.weight,
        0,
      );
      let roll = Math.random() * totalWeight;
      let melodyDuration = config.melodyDurationOptions[config.melodyDurationOptions.length - 1].duration;
      for (const option of config.melodyDurationOptions) {
        roll -= option.weight;
        if (roll <= 0) {
          melodyDuration = option.duration;
          break;
        }
      }
      const melodyVelocity = Math.min(
        1,
        melodyVelocityBase * (melodyDirectionPreference === -1 ? 0.92 : 1.04),
      );
      // @ts-ignore
      pn.triggerAttackRelease(note, melodyDuration, time, melodyVelocity);
    }
    
    const upAvailable = scalePos < scale.length - 1;
    const downAvailable = scalePos > 0;

    let direction = 0;
    let ascendBias = grooveStyle === "jazz" ? 0.7 : 0.63;
    if (melodyDirectionPreference === 1) {
      ascendBias = 0.9;
    } else if (melodyDirectionPreference === -1) {
      ascendBias = grooveStyle === "jazz" ? 0.45 : 0.5;
    }
    if (melodyUpStreak >= 2) {
      ascendBias = 0.95;
    }

    if (upAvailable && downAvailable) {
      direction = Math.random() < ascendBias ? 1 : -1;
    } else if (upAvailable) {
      direction = 1;
    } else if (downAvailable) {
      direction = -1;
    }

    let step = 1;
    if (direction > 0 && melodyLeapPreference === 1 && Math.random() < 0.6) {
      step = 2 + Math.floor(Math.random() * 2);
    }

    if (direction < 0) {
      step = 1;
    }

    scalePos = clamp(scalePos + direction * step, 0, scale.length - 1);

    if (direction > 0) {
      melodyUpStreak += 1;
    } else if (direction < 0) {
      melodyUpStreak = Math.max(0, melodyUpStreak - 1);
    }
  }
  
  function adjustVolume(delta: number) {
    volume = Math.max(0, Math.min(1, volume + delta));
    if (contextStarted && volumeNode) {
      volumeNode.volume.value = linearToDb(volume) + MASTER_GAIN_DB;
    }
    
    // 發送音量變更事件
    window.dispatchEvent(new CustomEvent('volumeChange', { detail: Math.round(volume * 100) }));
  }
  
  // 鍵盤控制 (TV 遙控器)
  function handleKeydown(e: KeyboardEvent) {
    switch(e.code) {
      case 'Space':
      case 'Enter':
        e.preventDefault();
        togglePlay();
        break;
      case 'KeyR':
        e.preventDefault();
        generateProgression();
        break;
      case 'ArrowUp':
        e.preventDefault();
        adjustVolume(0.1);
        break;
      case 'ArrowDown':
        e.preventDefault();
        adjustVolume(-0.1);
        break;
    }
  }
  
  // 綁定鍵盤事件
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleKeydown);
    
    // BPM 變更監聽器
    const handleBPMChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      const newBPM = customEvent.detail;
      console.log(`🎵 TV版 BPM 變更事件收到: ${newBPM}`);
      
      // 更新顯示的 BPM 值
      currentBPM = newBPM;
      
      // 立即更新 Tone.js BPM，不管是否已初始化
      if (Tone.Transport) {
        updateTransportBpm(newBPM, true);
        console.log(`🎵 BPM 已設定為: ${Tone.Transport.bpm.value}`);
      }
    };
    window.addEventListener('bpmChange', handleBPMChange);
  }
</script>

<div class="tv-player">
  <!-- 主要控制按鈕區域 -->
  <div class="main-controls">
    <!-- 主播放按鈕 -->
    <button class="tv-play-button" class:initialized={contextStarted} on:click={togglePlay}>
      <div class="play-text">
        {#if !contextStarted}
          🎵 點擊開始音樂
        {:else if isPlaying}
          ⏸️ 暫停音樂
        {:else}
          ▶️ 繼續播放
        {/if}
      </div>
    </button>

    <!-- 重新生成按鈕 -->
    <button class="control-btn" on:click={generateProgression} disabled={!contextStarted}>
      🔄 重新生成
    </button>
    <button
      class="control-btn style-toggle"
      on:click={toggleGrooveStyle}
      disabled={!contextStarted}
      title={`切換風格（目前 ${grooveStyles[grooveStyle].displayName}）`}
    >
      {#if grooveStyle === 'cafe'}
        ☕ Cafe
      {:else if grooveStyle === 'relaxing'}
        🌙 Relax
      {:else if grooveStyle === 'jazz'}
        🎷 Jazz
      {:else}
        🎼 Canon
      {/if}
    </button>
  </div>
  
  <!-- 音樂資訊 -->
  <div class="music-info">
    {#if contextStarted && genChordsOnce}
      <h3>🎼 調性: {key}</h3>
      <div class="progression-display">
        {#each progression as chord, idx}
          <span class="chord" class:active={idx === activeProgressionIndex}>
            {chord.degree}
          </span>
        {/each}
      </div>
    {/if}
  </div>
  
  <!-- 音量控制 -->
  <div class="volume-control">
    <div class="volume-buttons">
      <button
        class="volume-btn"
        aria-label="降低音量"
        title="降低音量"
        on:click={() => adjustVolume(-0.1)}
      >
        ➖
      </button>
      <button
        class="volume-btn"
        aria-label="提高音量"
        title="提高音量"
        on:click={() => adjustVolume(0.1)}
      >
        ➕
      </button>
    </div>
  </div>
</div>

<style>
  .tv-player {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    color: white;
  }

  .main-controls {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  .tv-play-button {
    width: 250px;
    height: 120px;
    background: rgba(255, 255, 255, 0.15);
    color: white;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(10px);
  }
  
  .tv-play-button:hover {
    background: rgba(255, 255, 255, 0.25);
    border-color: rgba(255, 255, 255, 0.5);
    transform: scale(1.05);
  }
  
  .tv-play-button:active {
    transform: scale(0.98);
  }
  
  .play-text {
    font-size: 1.4rem;
    font-weight: 500;
  }

  .guide-hint {
    text-align: center;
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 15px;
    padding: 1.5rem 2rem;
    margin: 1rem 0;
    backdrop-filter: blur(10px);
    max-width: 600px;
  }

  .guide-hint.animated {
    animation: glow 2s ease-in-out infinite alternate;
  }

  .main-hint {
    margin: 0.5rem 0;
    font-size: 1.4rem;
    font-weight: 600;
    color: #f0f8ff;
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  }

  .sub-hint {
    margin: 0.8rem 0 0 0;
    font-size: 1.1rem !important;
    opacity: 0.9;
    font-weight: normal !important;
    color: #e0e8ff;
    line-height: 1.4;
  }

  @keyframes glow {
    0% { 
      border-color: rgba(255, 255, 255, 0.3);
      box-shadow: 0 0 15px rgba(255, 255, 255, 0.2);
    }
    100% { 
      border-color: rgba(102, 187, 106, 0.6);
      box-shadow: 0 0 25px rgba(102, 187, 106, 0.4);
    }
  }

  /* 讓按鈕在未初始化時更突出 */
  .tv-play-button:not(.initialized) {
    animation: buttonPulse 1.5s ease-in-out infinite;
    background: linear-gradient(135deg, rgba(102, 187, 106, 0.2), rgba(255, 255, 255, 0.15));
  }

  @keyframes buttonPulse {
    0%, 100% {
      transform: scale(1);
      box-shadow: 0 0 20px rgba(102, 187, 106, 0.3);
    }
    50% {
      transform: scale(1.05);
      box-shadow: 0 0 30px rgba(102, 187, 106, 0.5);
    }
  }

  /* Android TV 響應式設計 */
  
  /* 標準 TV (1920x1080) */
  @media screen and (max-width: 1920px) and (max-height: 1080px) {
    .tv-play-button {
      width: 280px;
      height: 130px;
    }
    
    .control-btn {
      width: 190px;
      height: 130px;
    }

    .control-btn.style-toggle {
      width: 150px;
      height: 100px;
    }
    
    .play-text {
      font-size: 1.3rem;
    }
    
    .main-hint {
      font-size: 1.3rem;
    }
    
    .sub-hint {
      font-size: 1rem !important;
    }
  }
  
  /* 小型 TV (1366x768) */
  @media screen and (max-width: 1366px) and (max-height: 768px) {
    .tv-player {
      gap: 1.5rem;
    }
    
    .main-controls {
      gap: 0.8rem;
    }
    
    .tv-play-button {
      width: 250px;
      height: 110px;
    }
    
    .control-btn {
      width: 170px;
      height: 110px;
      font-size: 1rem;
    }

    .control-btn.style-toggle {
      width: 130px;
      height: 90px;
    }
    
    .play-text {
      font-size: 1.2rem;
    }
    
    .guide-hint {
      padding: 1rem 1.5rem;
      max-width: 500px;
    }
    
    .main-hint {
      font-size: 1.2rem;
    }
    
    .sub-hint {
      font-size: 0.95rem !important;
    }
    
    .music-info h3 {
      font-size: 1.5rem;
    }
    
    .music-info p {
      font-size: 1.1rem;
    }
  }
  
  /* 超小型 TV (1280x720) */
  @media screen and (max-width: 1280px) and (max-height: 720px) {
    .tv-player {
      gap: 1rem;
    }
    
    .main-controls {
      gap: 0.8rem;
    }
    
    .tv-play-button {
      width: 220px;
      height: 100px;
    }
    
    .play-text {
      font-size: 1.1rem;
    }
    
    .guide-hint {
      padding: 0.8rem 1.2rem;
      max-width: 450px;
    }
    
    .main-hint {
      font-size: 1.1rem;
    }
    
    .sub-hint {
      font-size: 0.9rem !important;
    }
    
    .music-info h3 {
      font-size: 1.3rem;
    }
    
    .music-info p {
      font-size: 1rem;
    }
    
    .chord {
      padding: 0.2rem 0.6rem;
      font-size: 1rem;
    }
    
    .control-btn {
      width: 150px;
      height: 100px;
      font-size: 0.95rem;
    }

    .control-btn.style-toggle {
      width: 120px;
      height: 85px;
    }
    
    .volume-control {
      font-size: 1.1rem;
    }
    
    .volume-btn {
      width: 45px;
      height: 45px;
      font-size: 1.1rem;
    }
  }
  
  /* 極小 TV / Android TV 盒子 (1024x600 或更小) */
  @media screen and (max-width: 1024px) and (max-height: 600px) {
    .tv-player {
      gap: 0.8rem;
    }
    
    .main-controls {
      gap: 0.6rem;
    }
    
    .tv-play-button {
      width: 200px;
      height: 90px;
    }
    
    .play-text {
      font-size: 1rem;
    }
    
    .guide-hint {
      padding: 0.6rem 1rem;
      max-width: 400px;
    }
    
    .main-hint {
      font-size: 1rem;
    }
    
    .sub-hint {
      font-size: 0.8rem !important;
      line-height: 1.2;
    }
    
    .music-info h3 {
      font-size: 1.1rem;
      margin: 0 0 0.3rem 0;
    }
    
    .music-info p {
      font-size: 0.9rem;
    }
    
    .progression-display {
      gap: 0.3rem;
      margin: 0.5rem 0;
    }
    
    .chord {
      padding: 0.15rem 0.5rem;
      font-size: 0.9rem;
    }
    
    .control-btn {
      width: 130px;
      height: 90px;
      font-size: 0.85rem;
    }

    .control-btn.style-toggle {
      width: 110px;
      height: 75px;
    }
    
    .volume-control {
      font-size: 1rem;
      gap: 0.5rem;
    }
    
    .volume-btn {
      width: 40px;
      height: 40px;
      font-size: 1rem;
    }
  }
  
  /* 針對 Android TV 瀏覽器的特殊優化 */
  @media screen and (max-height: 500px) {
    .tv-player {
      gap: 0.5rem;
    }
    
    .guide-hint {
      display: none; /* 在極小螢幕隱藏引導文字節省空間 */
    }
    
    .music-info {
      margin: 0.5rem 0;
    }
    
    .control-buttons {
      margin-top: 0;
    }
    
    .volume-control {
      display: none; /* 在極小螢幕隱藏音量控制，改用遙控器 */
    }
  }
  
  .music-info {
    text-align: center;
    margin: 1rem 0;
  }
  
  .music-info h3 {
    font-size: 1.8rem;
    margin: 0 0 0.5rem 0;
    color: #f0f8ff;
  }
  
  .music-info p {
    font-size: 1.2rem;
    margin: 0;
    opacity: 0.8;
  }
  
  .progression-display {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    margin: 1rem 0;
    flex-wrap: wrap;
  }
  
  .chord {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 8px;
    padding: 0.3rem 0.8rem;
    font-size: 1.1rem;
    font-weight: bold;
    transition: all 0.3s ease;
  }
  
  .chord.active {
    background: rgba(102, 187, 106, 0.4);
    border-color: rgba(102, 187, 106, 0.7);
    color: #fff;
    transform: scale(1.1);
    box-shadow: 0 0 15px rgba(102, 187, 106, 0.5);
  }
  
  .control-buttons {
    display: flex;
    gap: 1.5rem;
  }
  
  .control-btn {
    width: 180px;
    height: 120px;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 20px;
    cursor: pointer;
    font-size: 1.2rem;
    font-weight: 500;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
  }
  
  .control-btn:hover {
    background: rgba(255, 255, 255, 0.25);
    border-color: rgba(255, 255, 255, 0.5);
    transform: scale(1.05);
  }

  .style-toggle {
    width: 140px;
    height: 80px;
    font-size: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
  }

  .control-btn:active {
    transform: scale(0.98);
  }

  .control-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  .control-btn:disabled:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.3);
    transform: none;
  }
  
  .volume-control {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    font-size: 1.2rem;
  }
  
  .volume-buttons {
    display: flex;
    gap: 1rem;
  }
  
  .volume-btn {
    width: 50px;
    height: 50px;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    cursor: pointer;
    font-size: 1.2rem;
    transition: all 0.3s ease;
  }
  
  .volume-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
  }
  
  /* 響應式設計 */
  @media (max-width: 768px) {
    .tv-play-button {
      width: 200px;
      height: 100px;
    }
    
    .control-buttons {
      flex-direction: column;
      gap: 1rem;
    }
    
    .control-btn {
      width: 140px;
    }

    .control-btn.style-toggle {
      width: 120px;
      height: 80px;
    }
  }
</style>

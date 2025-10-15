<script lang="ts">
  import {
      IconLoader,
      IconPlayerPauseFilled,
      IconPlayerPlayFilled,
      IconRefresh,
  } from "@tabler/icons-svelte";
  import { onDestroy, onMount } from "svelte";
// @ts-ignore
  import * as Tone from "tone";
  import Visualizer from "../lib/components/Visualizer/index.svelte";
  import ChordProgression from "../lib/engine/Chords/ChordProgression";
  import intervalWeights from "../lib/engine/Chords/IntervalWeights";
  import Keys from "../lib/engine/Chords/Keys";
  import { fiveToFive } from "../lib/engine/Chords/MajorScale";
  import Hat from "../lib/engine/Drums/Hat";
  import Kick from "../lib/engine/Drums/Kick";
  import Snare from "../lib/engine/Drums/Snare";
  import Piano from "../lib/engine/Piano/Piano";

  const STORAGE_KEY = "Volumes";
  const CURRENT_STATE_KEY = "LofiEngine_CurrentState";
  const DEFFAULT_VOLUMES = {
    rain: 1,
    thunder: 1,
    campfire: 1,
    jungle: 1,
    main_track: 1,
  };
  // Load previous vols or defualt
  let volumes =
    JSON.parse(localStorage.getItem(STORAGE_KEY)) || DEFFAULT_VOLUMES;
  // Convert linear volume (0 to 1) to dB
  const linearToDb = (value) =>
    value === 0 ? -Infinity : 20 * Math.log10(value);

  // Setup audio chain - 微妙音量提升，保持原始 LoFi 品質
  const cmp = new Tone.Compressor({
    threshold: -6,
    ratio: 3,
    attack: 0.5,
    release: 0.1,
  });
  const lpf = new Tone.Filter(2000, "lowpass");
  const reverb = new Tone.Reverb({
    decay: 3.5,
    preDelay: 0.02,
    wet: 0.28,
  });
  // 柔和殘響，非同步預先生成即可
  // @ts-ignore Tone 型別未必包含 generate
  reverb.generate?.().catch?.(() => {});
  const vol = new Tone.Volume(linearToDb(volumes.main_track) + 3); // 只提升 3dB
  Tone.Master.chain(cmp, lpf, reverb, vol);

  const GROOVE_STYLE_KEY = "LofiEngine_GrooveStyle";

  type GrooveStyle = "cafe" | "jazz" | "relaxing";

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
    muteChances: {
      kick: number;
      snare: number;
      hat: number;
    };
    kickProbabilities: {
      main: number;
      ghost: number;
    };
    snareHitProbability: number;
    hatHitProbability: number;
    rotation: {
      loopsRange?: [number, number];
      poolSize: number;
      reuseProbability: number;
      durationRangeSeconds: [number, number];
    };
  };

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
      muteChances: {
        kick: 0.08,
        snare: 0.15,
        hat: 0.18,
      },
      kickProbabilities: {
        main: 0.65,
        ghost: 0.05,
      },
      snareHitProbability: 0.5,
      hatHitProbability: 0.6,
      rotation: {
        loopsRange: [3, 5],
        poolSize: 3,
        reuseProbability: 0.55,
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
      muteChances: {
        kick: 0.05,
        snare: 0.1,
        hat: 0.12,
      },
      kickProbabilities: {
        main: 0.45,
        ghost: 0.18,
      },
      snareHitProbability: 0.4,
      hatHitProbability: 0.7,
      rotation: {
        loopsRange: [3, 4],
        poolSize: 4,
        reuseProbability: 0.45,
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
          velocityRange: [0.26, 0.34],
          invertChance: 0.2,
          tailSpacing: 0.4,
        },
        {
          offsets: [0, 0.5],
          release: "1n",
          velocityRange: [0.24, 0.32],
          invertChance: 0.1,
          tailSpacing: 0.35,
        },
        {
          offsets: [0, 0.65],
          release: "1n",
          velocityRange: [0.22, 0.3],
          invertChance: 0.05,
          tailSpacing: 0.4,
        },
      ],
      chordTriadChance: 0.85,
      melodyDensityRange: [0.1, 0.2],
      melodyOffChance: 0.45,
      melodyVelocityRange: [0.18, 0.32],
      melodyDurationOptions: [
        { duration: "2n", weight: 2.5 },
        { duration: "1n", weight: 1.2 },
        { duration: "4n", weight: 1.8 },
      ],
      muteChances: {
        kick: 0.95,
        snare: 0.98,
        hat: 0.92,
      },
      kickProbabilities: {
        main: 0.1,
        ghost: 0,
      },
      snareHitProbability: 0.05,
      hatHitProbability: 0.08,
      rotation: {
        durationRangeSeconds: [340, 420],
        poolSize: 2,
        reuseProbability: 0.6,
      },
    },
  };

  type ProgressionState = {
    key: string;
    progression: ReturnType<typeof ChordProgression.generate>;
    scale: string[];
    scalePos: number;
    style: GrooveStyle;
  };

  let grooveStyle: GrooveStyle = "relaxing";

  let progressionPool: ProgressionState[] = [];
  let progressionPoolIndex = -1;
  let loopsRemainingForProgression = 0;
  let loopsCompletedForProgression = 0;

  function randomIntInRange([min, max]: [number, number]) {
    if (max <= min) return min;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function randomInRange([min, max]: [number, number]) {
    if (max <= min) return min;
    return Math.random() * (max - min) + min;
  }

  function pickKeyForStyle(
    style: GrooveStyle,
    previous?: ProgressionState,
  ): string {
    const defaultKey = Keys[Math.floor(Math.random() * Keys.length)];

    if (!previous) {
      return defaultKey;
    }

    if (style === "jazz") {
      const keepSameProbability = 0.6;
      const neighborProbability = 0.8;

      if (Math.random() < keepSameProbability) {
        return previous.key;
      }

      const ringIndex = KEY_RING.indexOf(previous.key);
      if (ringIndex !== -1 && Math.random() < neighborProbability) {
        const left = KEY_RING[(ringIndex + KEY_RING.length - 1) % KEY_RING.length];
        const right = KEY_RING[(ringIndex + 1) % KEY_RING.length];
        return Math.random() < 0.5 ? left : right;
      }

      return defaultKey;
    }

    // Cafe: bias to staying close but allow more randomness
    const stayChance = 0.45;
    if (Math.random() < stayChance) {
      return previous.key;
    }

    const idx = Keys.indexOf(previous.key);
    if (idx !== -1 && Keys.length > 2) {
      const neighborOffsets = [-2, -1, 1, 2];
      const offset = neighborOffsets[Math.floor(Math.random() * neighborOffsets.length)];
      const nextIdx = (idx + Keys.length + offset) % Keys.length;
      return Keys[nextIdx];
    }

    return defaultKey;
  }

  function clamp(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value));
  }

  function createProgressionState(
    style: GrooveStyle = grooveStyle,
    previous?: ProgressionState,
  ): ProgressionState {
    const _scale = fiveToFive;
    const newKey = pickKeyForStyle(style, previous);
    const newScale = Tone.Frequency(newKey + "5")
      .harmonize(_scale)
      .map((f) => Tone.Frequency(f).toNote());
    const newProgression = ChordProgression.generate(8);

    let newScalePos = Math.floor(Math.random() * _scale.length);
    if (previous && previous.key === newKey) {
      const deltaOptions = [-2, -1, 0, 1, 2];
      const delta = deltaOptions[Math.floor(Math.random() * deltaOptions.length)];
      newScalePos = clamp(previous.scalePos + delta, 0, _scale.length - 1);
    }

    return {
      key: newKey,
      progression: newProgression,
      scale: newScale,
      scalePos: newScalePos,
      style,
    };
  }

  function applyProgressionState(
    state: ProgressionState,
    options: { persist?: boolean } = {},
  ) {
    key = state.key;
    progress = 0;
    progression = state.progression;
    scale = state.scale;
    scalePos = state.scalePos;
    genChordsOnce = true;

    if (options.persist) {
      saveCurrentState();
    }
  }

  function ensureLoopsTarget(style: GrooveStyle = grooveStyle) {
    const config = grooveStyles[style];
    loopsCompletedForProgression = 0;
    const { rotation } = config;

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

  function registerStateInPool(state: ProgressionState, style: GrooveStyle = grooveStyle) {
    const config = grooveStyles[style];
    progressionPool.push(state);
    while (progressionPool.length > config.rotation.poolSize) {
      progressionPool.shift();
      if (progressionPoolIndex >= 0) {
        progressionPoolIndex = Math.max(0, progressionPoolIndex - 1);
      }
    }
    progressionPoolIndex = progressionPool.length - 1;
  }

  function rotateProgression(
    options: { forceNew?: boolean; persist?: boolean; mode?: "auto" | "manual" } = {},
  ): ProgressionState {
    const { forceNew = false, persist = true } = options;
    const config = grooveStyles[grooveStyle];

    const hasCurrentProgression = progression.length > 0 && scale.length > 0;
    const previousSnapshot = hasCurrentProgression
      ? captureCurrentProgression()
      : undefined;

    let nextState: ProgressionState | undefined;

    const reusableIndices = progressionPool
      .map((state, index) => ({ state, index }))
      .filter(({ state, index }) => index !== progressionPoolIndex && state.style === grooveStyle);

    const shouldReuse =
      !forceNew &&
      reusableIndices.length > 0 &&
      Math.random() < config.rotation.reuseProbability;

    if (shouldReuse) {
      const choice = reusableIndices[Math.floor(Math.random() * reusableIndices.length)];
      nextState = choice.state;
      progressionPoolIndex = choice.index;
    }

    if (!nextState) {
      nextState = createProgressionState(grooveStyle, previousSnapshot);
      registerStateInPool(nextState);
    }

    applyProgressionState(nextState, { persist });
    ensureLoopsTarget(grooveStyle);

    return nextState;
  }

  function captureCurrentProgression(): ProgressionState {
    return {
      key,
      progression,
      scale,
      scalePos,
      style: grooveStyle,
    };
  }

  function handleProgressionLoopComplete() {
    loopsCompletedForProgression += 1;
    if (loopsRemainingForProgression > 0) {
      loopsRemainingForProgression -= 1;
    }

    if (loopsRemainingForProgression <= 0) {
      const nextState = rotateProgression({ persist: true });
      previewNextSegment(nextState);
    }
  }
  if (typeof window !== "undefined") {
    const savedStyle = localStorage.getItem(GROOVE_STYLE_KEY);
    if (savedStyle === "cafe" || savedStyle === "jazz") {
      grooveStyle = savedStyle;
    }
  }

  
  // 初始化 BPM (從 localStorage 讀取或使用默認值)
  let currentBPM = grooveStyles[grooveStyle].defaultBpm;
  if (typeof window !== 'undefined') {
    const savedBPM = localStorage.getItem('LofiEngine_BPM');
    if (savedBPM) {
      currentBPM = parseInt(savedBPM);
    }
  }

  type BpmUpdateOptions = {
    persist?: boolean;
  };

  function updateTransportBpm(newBpm: number, options: BpmUpdateOptions = {}) {
    if (typeof newBpm !== "number" || Number.isNaN(newBpm)) {
      return;
    }

    const { persist = false } = options;

    currentBPM = newBpm;
    // rampTo with a very short time ensures the transport clock reacts immediately
    Tone.Transport.bpm.rampTo(newBpm, 0.01);

    if (persist && typeof window !== "undefined") {
      localStorage.setItem('LofiEngine_BPM', newBpm.toString());
      saveCurrentState();
    }
  }

  updateTransportBpm(currentBPM);
  Tone.Transport.swing = grooveStyles[grooveStyle].swing;
  Tone.Transport.swingSubdivision = grooveStyles[grooveStyle].swingSubdivision as any;

  // State variables
  let key = "C";
  let progression = [];
  let scale = [];
  let progress = 0;
  let scalePos = 0;

  let pianoLoaded = false;
  let kickLoaded = false;
  let snareLoaded = false;
  let hatLoaded = false;

  let contextStarted = false;
  let genChordsOnce = false;

  // Load instrument volumes first
  const INSTRUMENTS_STORAGE_KEY = "LofiEngine_InstrumentVolumes";
  const loadInstrumentVolumes = () => {
    try {
      const saved = localStorage.getItem(INSTRUMENTS_STORAGE_KEY);
      // 預設純鋼琴模式 - 只有鋼琴有音量，其他樂器靜音
      return saved ? JSON.parse(saved) : { piano: 1, kick: 0, snare: 0, hat: 0 };
    } catch (e) {
      return { piano: 1, kick: 0, snare: 0, hat: 0 };
    }
  };
  let instrumentVolumes = loadInstrumentVolumes();

  const kickPatterns = [
    ["C4", "", "", "", "", "", "", "C4", "C4", "", ".", "", "", "", "", ""],
    ["C4", "", "", "C4", "", "", "", "", "C4", "", ".", "", "C4", "", "", ""],
    ["C4", "", "", "", "C4", "", "", "C4", "C4", "", ".", "", "", "C4", "", ""],
  ];

  const hatPatterns = [
    ["C4", "", "C4", "", "C4", "", "C4", ""],
    ["C4", "C4", "", "C4", "", "C4", "C4", ""],
    ["C4", "", "C4", "C4", "", "C4", "", "C4"],
  ];

  // Initialize instrument on/off states based on volumes
  let kickOff = instrumentVolumes.kick === 0;
  let snareOff = instrumentVolumes.snare === 0;  // ← 預設靜音時設為 true
  let hatOff = instrumentVolumes.hat === 0;
  let melodyDensity = grooveStyles[grooveStyle].melodyDensityRange[0];
  let melodyOff = false;
  let melodyDirectionPreference: -1 | 0 | 1 = 0;
  let melodyLeapPreference = 0;
  let melodyUpStreak = 0;

  setGrooveStyle(grooveStyle, { persist: false });

  let isPlaying = false;

  // Initialize instruments with callbacks that apply volumes after loading
  const pn = new Piano(() => {
    pianoLoaded = true;
    applyInstrumentVolume('piano');
  }).sampler;
  const kick = new Kick(() => {
    kickLoaded = true;
    applyInstrumentVolume('kick');
  }).sampler;
  const snare = new Snare(() => {
    snareLoaded = true;
    applyInstrumentVolume('snare');
  }).sampler;
  
  const hat = new Hat(() => {
    hatLoaded = true;
    applyInstrumentVolume('hat');
  }).sampler;
  // Sequences
  let chords, melody, kickLoop, snareLoop, hatLoop;
  let currentKickPatternIdx = 0;
  let currentHatPatternIdx = 0;

  onMount(() => {
    // Setup sequences
    chords = new Tone.Sequence(
      (time) => {
        playChord(time);
      },
      [""],
      "1n",
    );

    melody = new Tone.Sequence(
      (time, note) => {
        playMelody();
      },
      [""],
      "8n",
    );

    kickLoop = new Tone.Sequence(
      (time, note) => {
        if (!kickOff) {
          const config = grooveStyles[grooveStyle];
          if (note === "C4" && Math.random() < config.kickProbabilities.main) {
            // @ts-ignore
            kick.triggerAttack(note);
          } else if (note === "." && Math.random() < config.kickProbabilities.ghost) {
            // @ts-ignore
            kick.triggerAttack("C4");
          }
        }
      },
      kickPatterns[currentKickPatternIdx],
      "8n",
    );

    snareLoop = new Tone.Sequence(
      (time, note) => {
        if (!snareOff) {
          const config = grooveStyles[grooveStyle];
          if (note !== "" && Math.random() < config.snareHitProbability) {
            // @ts-ignore
            snare.triggerAttack(note);
          }
        }
      },
      ["", "C4"],
      "2n",
    );

    hatLoop = new Tone.Sequence(
      (time, note) => {
        if (!hatOff) {
          const config = grooveStyles[grooveStyle];
          // @ts-ignore
          if (note !== "" && Math.random() < config.hatHitProbability) {
            // @ts-ignore
            hat.triggerAttack(note);
          }
        }
      },
      hatPatterns[currentHatPatternIdx],
      "4n",
    );

    chords.humanize = true;
    melody.humanize = true;
    kickLoop.humanize = true;
    snareLoop.humanize = true;
    hatLoop.humanize = true;

    currentKickPatternIdx = Math.floor(Math.random() * kickPatterns.length);
    currentHatPatternIdx = Math.floor(Math.random() * hatPatterns.length);
    kickLoop.events = kickPatterns[currentKickPatternIdx];
    hatLoop.events = hatPatterns[currentHatPatternIdx];

    // Listen for spacebar press
    const handleKeydown = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        toggle();
      }
    };

    window.addEventListener("keydown", handleKeydown);

    // Listen for preset load event
    const handleLoadPreset = (e: CustomEvent) => {
      loadPresetState(e.detail);
    };
    window.addEventListener("loadPreset", handleLoadPreset as EventListener);

    // Listen for fade out music event (from timer)
    const handleFadeOut = () => {
      fadeOutAndStop();
    };
    window.addEventListener("fadeOutMusic", handleFadeOut);

    // Listen for instrument volume changes
    const handleInstrumentVolumes = (e: CustomEvent) => {
      instrumentVolumes = e.detail;
      
      // Sync on/off states with volumes
      kickOff = instrumentVolumes.kick === 0;
      snareOff = instrumentVolumes.snare === 0;
      hatOff = instrumentVolumes.hat === 0;
      
      updateInstrumentVolumes();
      console.log(`🎛️ 樂器狀態更新: kick=${!kickOff}, snare=${!snareOff}, hat=${!hatOff}`);
    };
    window.addEventListener("updateInstrumentVolumes", handleInstrumentVolumes as EventListener);

    // BPM 變更監聽器
    const handleBPMChange = (e: CustomEvent) => {
      const newBPM = e.detail;
      currentBPM = newBPM;
      updateTransportBpm(newBPM, { persist: true });
      console.log(`🎵 BPM 已變更: ${newBPM}`);
    };
    window.addEventListener("bpmChange", handleBPMChange as EventListener);

    // Apply initial instrument volumes
    updateInstrumentVolumes();

    return () => {
      window.removeEventListener("keydown", handleKeydown);
      window.removeEventListener("loadPreset", handleLoadPreset as EventListener);
      window.removeEventListener("fadeOutMusic", handleFadeOut);
      window.removeEventListener("updateInstrumentVolumes", handleInstrumentVolumes as EventListener);
      window.removeEventListener("bpmChange", handleBPMChange as EventListener);
    };
  });

  onDestroy(() => {
    if (Tone.Transport.state === "started") {
      Tone.Transport.stop();
    }
  });

  function nextChord() {
    const nextProgress = progress === progression.length - 1 ? 0 : progress + 1;
    const wrapsAround = nextProgress === 0;
    
    const config = grooveStyles[grooveStyle];
    const nextKickOff = Math.random() < config.muteChances.kick;
    const nextSnareOff = Math.random() < config.muteChances.snare;
    const nextHatOff = Math.random() < config.muteChances.hat;
    const [densityMin, densityMax] = config.melodyDensityRange;
    const nextMelodyDensity = densityMin + Math.random() * (densityMax - densityMin);
    const nextMelodyOff = Math.random() < config.melodyOffChance;

    if (progress === 4) {
      progress = nextProgress;
      kickOff = nextKickOff;
      snareOff = nextSnareOff;
      hatOff = nextHatOff;
    } else if (progress === 0) {
      progress = nextProgress;
      kickOff = nextKickOff;
      snareOff = nextSnareOff;
      hatOff = nextHatOff;
      melodyDensity = nextMelodyDensity;
      melodyOff = nextMelodyOff;
      currentKickPatternIdx = Math.floor(Math.random() * kickPatterns.length);
      currentHatPatternIdx = Math.floor(Math.random() * hatPatterns.length);
      if (kickLoop) {
        kickLoop.events = kickPatterns[currentKickPatternIdx];
      }
      if (hatLoop) {
        hatLoop.events = hatPatterns[currentHatPatternIdx];
      }

      const directionChoices: Array<-1 | 0 | 1> =
        grooveStyle === "jazz" ? [-1, 0, 1, 1, 1, 1] : [-1, 0, 1, 1, 1];
      melodyDirectionPreference =
        directionChoices[Math.floor(Math.random() * directionChoices.length)];
      const leapBias = grooveStyle === "jazz" ? 0.55 : 0.4;
      melodyLeapPreference = Math.random() < leapBias ? 1 : 0;
      melodyUpStreak = 0;
    } else {
      progress = nextProgress;
    }

    // 調試訊息
    console.log(`🎵 和弦進行: ${progress+1}/${progression.length}, 樂器狀態: kick=${!kickOff}, snare=${!snareOff}, hat=${!hatOff} (用戶音量: kick=${instrumentVolumes.kick}, snare=${instrumentVolumes.snare}, hat=${instrumentVolumes.hat})`);

    if (wrapsAround) {
      handleProgressionLoopComplete();
    }
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
    if (!pn || !chord) {
      return;
    }

    const {
      time = Tone.now(),
      velocityScale = 1,
      patternOverride,
      releaseOverride,
      jitterRange = 0.05,
    } = options;

    const config = grooveStyles[grooveStyle];
    const pattern = patternOverride ??
      config.strumPatterns[Math.floor(Math.random() * config.strumPatterns.length)];

    const root = Tone.Frequency(key + "3").transpose(chord.semitoneDist);
    const chordSize = Math.random() < config.chordTriadChance ? 3 : 4;
    const voicing = chord.generateVoicing(chordSize);
    const notes = Tone.Frequency(root)
      .harmonize(voicing)
      .map((f) => Tone.Frequency(f).toNote());

    const strumNotes = Math.random() < (pattern.invertChance ?? 0) ? [...notes].reverse() : [...notes];
    strumNotes.forEach((note, idx) => {
      const baseOffset =
        pattern.offsets[idx] !== undefined
          ? pattern.offsets[idx]
          : pattern.offsets[pattern.offsets.length - 1] +
            (idx - pattern.offsets.length + 1) * (pattern.tailSpacing ?? 0.22);
      const jitter = idx === 0 ? 0 : (Math.random() * jitterRange) - jitterRange / 2;
      const velocityMin = pattern.velocityRange?.[0] ?? 0.32;
      const velocityMax = pattern.velocityRange?.[1] ?? 0.46;
      const baseVelocity = velocityMin + Math.random() * (velocityMax - velocityMin);
      const velocity = Math.min(1, baseVelocity * velocityScale);
      const release = releaseOverride ?? pattern.release;
      // @ts-ignore Tone typings
      pn.triggerAttackRelease(
        note,
        release,
        Math.max(0, time + Math.max(0, baseOffset + jitter)),
        velocity,
      );
    });
  }

  const PREVIEW_OFFSET_SECONDS = 0.45;

  function playChord(time?: number) {
    const chord = progression[progress];
    const baseTime = typeof time === "number" ? time : Tone.now();

    strumChord(chord, { time: baseTime });

    nextChord();
  }

  function previewNextSegment(nextState: ProgressionState | undefined) {
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

  function playMelody() {
    if (melodyOff || !(Math.random() < melodyDensity)) {
      return;
    }

    const descendRange = Math.min(scalePos, 7) + 1;
    const ascendRange = Math.min(scale.length - scalePos, 7);

    let descend = descendRange > 1;
    let ascend = ascendRange > 1;

    if (descend && ascend) {
      let ascendBias = grooveStyle === "jazz" ? 0.72 : 0.65;
      if (melodyDirectionPreference === 1) {
        ascendBias = 0.9;
      } else if (melodyDirectionPreference === -1) {
        ascendBias = grooveStyle === "jazz" ? 0.4 : 0.45;
      }
      if (melodyUpStreak >= 2) {
        ascendBias = 0.95;
      }
      if (Math.random() < ascendBias) {
        descend = false;
      } else {
        ascend = false;
      }
    }

    if (!ascend && !descend) {
      if (ascendRange > 1) {
        ascend = true;
      } else if (descendRange > 1) {
        descend = true;
      } else {
        return;
      }
    }

    let weights = descend
      ? intervalWeights.slice(0, descendRange)
      : intervalWeights.slice(0, ascendRange);

    if (melodyLeapPreference === 1 && ascend) {
      weights = weights.map((w, idx) => (idx >= 2 ? w * 1.45 : w * 0.75));
    } else {
      weights = weights.map((w, idx) => (idx <= 1 ? w * 1.3 : w * 0.8));
    }

    const sum = weights.reduce((prev, curr) => prev + curr, 0);
    weights = weights.map((w) => w / sum);
    for (let i = 1; i < weights.length; i++) {
      weights[i] += weights[i - 1];
    }

    const randomWeight = Math.random();
    let scaleDist = 0;
    let found = false;
    while (!found) {
      if (randomWeight <= weights[scaleDist]) {
        found = true;
      } else {
        scaleDist++;
      }
    }

    if (scaleDist === 0 && weights.length > 1) {
      scaleDist = 1;
    }

    const scalePosChange = descend ? -scaleDist : scaleDist;
    const newScalePos = scalePos + scalePosChange;

    scalePos = clamp(newScalePos, 0, scale.length - 1);

    const config = grooveStyles[grooveStyle];
    const [velocityMin, velocityMax] = config.melodyVelocityRange;
    const melodyVelocityBase = velocityMin + Math.random() * (velocityMax - velocityMin);
    const melodyVelocity = Math.min(1, melodyVelocityBase * (descend ? 0.92 : 1.05));
    const durationTotal = config.melodyDurationOptions.reduce(
      (sum, option) => sum + option.weight,
      0,
    );
    let durationRoll = Math.random() * durationTotal;
    let melodyDuration = config.melodyDurationOptions[config.melodyDurationOptions.length - 1].duration;
    for (const option of config.melodyDurationOptions) {
      durationRoll -= option.weight;
      if (durationRoll <= 0) {
        melodyDuration = option.duration;
        break;
      }
    }
    
    // @ts-ignore
    pn.triggerAttackRelease(scale[newScalePos], melodyDuration, undefined, melodyVelocity);

    if (ascend) {
      melodyUpStreak += 1;
    } else {
      melodyUpStreak = Math.max(0, melodyUpStreak - 1);
    }
  }

  function generateProgression() {
    rotateProgression({ forceNew: true, persist: true, mode: "manual" });
  }

  function saveCurrentState() {
    const currentState = {
      key,
      bpm: Tone.Transport.bpm.value,
      volumes,
      kickOff,
      snareOff,
      hatOff,
      melodyDensity,
      melodyOff,
      grooveStyle,
      background: parseInt(localStorage.getItem("bg-id") || "1"),
    };
    localStorage.setItem(CURRENT_STATE_KEY, JSON.stringify(currentState));
  }

  function loadPresetState(state: any) {
    if (!state) return;

    // Load key and regenerate progression
    if (state.key) {
      key = state.key;
      const _scale = fiveToFive;
      const newScale = Tone.Frequency(key + "5")
        .harmonize(_scale)
        .map((f) => Tone.Frequency(f).toNote());
      const newProgression = ChordProgression.generate(8);
      const newScalePos = Math.floor(Math.random() * _scale.length);

      progress = 0;
      progression = newProgression;
      scale = newScale;
      scalePos = newScalePos;
      genChordsOnce = true;
    }

    // Load BPM
    if (state.bpm) {
      updateTransportBpm(state.bpm);
    }

    // Load drum states
    if (state.kickOff !== undefined) kickOff = state.kickOff;
    if (state.snareOff !== undefined) snareOff = state.snareOff;
    if (state.hatOff !== undefined) hatOff = state.hatOff;
    
    // Load melody states
    if (state.melodyDensity !== undefined) melodyDensity = state.melodyDensity;
    if (state.melodyOff !== undefined) melodyOff = state.melodyOff;

    if (state.grooveStyle === "cafe" || state.grooveStyle === "jazz") {
      setGrooveStyle(state.grooveStyle, { persist: false, preserveDynamics: true });
    }

    // Load volumes
    if (state.volumes) {
      volumes = state.volumes;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(volumes));
      vol.volume.value = linearToDb(volumes.main_track);
    }

    // Load background
    if (state.background) {
      localStorage.setItem("bg-id", state.background.toString());
      window.dispatchEvent(new CustomEvent("changeBg", { detail: state.background }));
    }

    const presetState = captureCurrentProgression();
    progressionPool = [presetState];
    progressionPoolIndex = 0;
    ensureLoopsTarget(grooveStyle);
  }

  function setGrooveStyle(
    style: GrooveStyle,
    options: { resetBpm?: boolean; persist?: boolean; preserveDynamics?: boolean } = {},
  ) {
    const { resetBpm = false, persist = true, preserveDynamics = false } = options;

    const previousStyle = grooveStyle;
    grooveStyle = style;
    const config = grooveStyles[style];

    Tone.Transport.swing = config.swing;
    Tone.Transport.swingSubdivision = config.swingSubdivision as any;

    if (resetBpm) {
      updateTransportBpm(config.defaultBpm, { persist: true });
    }

    if (!preserveDynamics) {
      const [densityMin, densityMax] = config.melodyDensityRange;
      melodyDensity = densityMin + (densityMax - densityMin) * 0.5;
      melodyOff = false;
    }

    melodyUpStreak = 0;

    const poolNeedsReset = previousStyle !== style || progressionPool.length === 0;

    if (poolNeedsReset) {
      progressionPool = [];
      progressionPoolIndex = -1;
      loopsRemainingForProgression = 0;
      loopsCompletedForProgression = 0;
      rotateProgression({ forceNew: true, persist: false, mode: "manual" });
    } else {
      ensureLoopsTarget(style);
    }

    if (typeof window !== "undefined" && persist) {
      localStorage.setItem(GROOVE_STYLE_KEY, style);
    }

    if (persist) {
      saveCurrentState();
    }

    console.log(`🎼 Groove style set to ${config.displayName}`);
  }

  function toggleGrooveStyle() {
    const order: GrooveStyle[] = ["cafe", "relaxing", "jazz"];
    const currentIdx = order.indexOf(grooveStyle);
    const nextStyle = order[(currentIdx + 1) % order.length];
    setGrooveStyle(nextStyle, { resetBpm: true });
  }

  function toggle() {
    progress = 0;
    if (Tone.Transport.state === "started") {
      Tone.Transport.stop();
      isPlaying = false;
    } else {
      Tone.start();
      Tone.Transport.start();
      chords.start(0);
      melody.start(0);
      kickLoop.start(0);
      snareLoop.start(0);
      hatLoop.start(0);
      isPlaying = true;
    }
  }

  function fadeOutAndStop() {
    if (Tone.Transport.state !== "started") return;

    // 淡出音量
    const fadeTime = 3; // 3 秒淡出
    vol.volume.rampTo(-Infinity, fadeTime);

    // 淡出後停止播放
    setTimeout(() => {
      Tone.Transport.stop();
      isPlaying = false;
      
      // 恢復音量
      vol.volume.value = linearToDb(volumes.main_track);
    }, fadeTime * 1000);
  }

  function updateInstrumentVolumes() {
    // 轉換線性音量 (0-1) 到 dB
    const linearToDbSimple = (value) => value === 0 ? -Infinity : 20 * Math.log10(value);

    // 更新各樂器音量
    if (pn && pn.volume) {
      pn.volume.value = linearToDbSimple(instrumentVolumes.piano);
    }
    if (kick && kick.volume) {
      kick.volume.value = linearToDbSimple(instrumentVolumes.kick);
    }
    if (snare && snare.volume) {
      snare.volume.value = linearToDbSimple(instrumentVolumes.snare);
    }
    if (hat && hat.volume) {
      hat.volume.value = linearToDbSimple(instrumentVolumes.hat);
    }
  }

  // Apply volume for a specific instrument (called after loading)
  function applyInstrumentVolume(instrument: 'piano' | 'kick' | 'snare' | 'hat') {
    const linearToDbSimple = (value) => value === 0 ? -Infinity : 20 * Math.log10(value);
    
    switch(instrument) {
      case 'piano':
        if (pn && pn.volume) {
          pn.volume.value = linearToDbSimple(instrumentVolumes.piano);
          console.log(`🎹 Piano volume set: ${instrumentVolumes.piano}`);
        }
        break;
      case 'kick':
        if (kick && kick.volume) {
          kick.volume.value = linearToDbSimple(instrumentVolumes.kick);
          console.log(`🥁 Kick volume set: ${instrumentVolumes.kick}`);
        }
        break;
      case 'snare':
        if (snare && snare.volume) {
          snare.volume.value = linearToDbSimple(instrumentVolumes.snare);
          console.log(`🥁 Snare volume set: ${instrumentVolumes.snare} (${snare.volume.value} dB)`);
        }
        break;
      case 'hat':
        if (hat && hat.volume) {
          hat.volume.value = linearToDbSimple(instrumentVolumes.hat);
          console.log(`🎩 Hi-Hat volume set: ${instrumentVolumes.hat}`);
        }
        break;
    }
  }

  function startAudioContext() {
    Tone.start();
    contextStarted = true;
  }

  $: allSamplesLoaded = pianoLoaded && kickLoaded && snareLoaded && hatLoaded;
  $: activeProgressionIndex = (progress + 7) % 8;
  // Update volume
  onMount(() => {
    setInterval(() => {
      let updatedVol =
        JSON.parse(localStorage.getItem(STORAGE_KEY)) || DEFFAULT_VOLUMES;
      vol.volume.value = linearToDb(updatedVol.main_track);
    }, 100);
  });
  // automically start audio context after samples are loaded
  $: if (allSamplesLoaded && !contextStarted) {
    startAudioContext();
    generateProgression();
  }

  function handleButtonAction() {
    if (!allSamplesLoaded) {
      // Do nothing, button is disabled
      return;
    } else if (!contextStarted) {
      // Initialize audio context
      startAudioContext();
    } else if (!genChordsOnce) {
      // Chords not generated yet, can't play
      return;
    } else {
      // Normal play/pause functionality
      toggle();
    }
  }
</script>

<div>
  <div class="controls">
    <button
      class="play-button"
      on:click={handleButtonAction}
      disabled={!allSamplesLoaded}
    >
      {#if !allSamplesLoaded}
        <IconLoader size={30} class="spinning" />
      {:else if !contextStarted}
        <span class="context-text">Initialize Audio</span>
      {:else if !genChordsOnce}
        <IconPlayerPlayFilled size={30} class="disabled" />
      {:else if isPlaying}
        <IconPlayerPauseFilled size={30} />
      {:else}
        <IconPlayerPlayFilled size={30} />
      {/if}
    </button>
    <button
      class="styleBtn"
      on:click={toggleGrooveStyle}
      disabled={!allSamplesLoaded}
      title={`切換風格（目前 ${grooveStyles[grooveStyle].displayName}）`}
      aria-label={`切換風格（目前 ${grooveStyles[grooveStyle].displayName}）`}
    >
      {#if grooveStyle === 'cafe'}
        ☕ Cafe
      {:else if grooveStyle === 'relaxing'}
        🌙 Relax
      {:else}
        🎷 Jazz
      {/if}
    </button>
    <button class="generateBtn" on:click={generateProgression}>
      <IconRefresh size={16} />
    </button>
  </div>

  {#if allSamplesLoaded && contextStarted}
    {#if genChordsOnce}
      <ol class="progressionList">
        <li class="key" id="blurred">{key}</li>
        {#each progression as chord, idx}
          <li id="blurred" class={idx === activeProgressionIndex ? "live" : ""}>
            {chord.degree}
          </li>
        {/each}
      </ol>
    {/if}
  {/if}
  {#if Tone.Transport.state === "started"}
    <div class="visualizer-container">
      <Visualizer audio={Tone.Master} />
    </div>
  {/if}
</div>

<style>
  .controls {
    position: fixed;
    bottom: 70px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column-reverse;
    justify-content: center;
    align-items: center;
    gap: 5px;
  }

  .play-button {
    width: 70px;
    height: 70px;
    border-radius: 50%;
    background-color: white;
    color: black;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10;
    border: none;
    cursor: pointer;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  .play-button:hover {
    box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.5);
  }

  .generateBtn {
    background-color: #00000010;
    backdrop-filter: blur(10px);
    color: white;
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 10px;
    outline: none;
  }

  .styleBtn {
    background-color: #00000018;
    backdrop-filter: blur(10px);
    color: white;
    border: none;
    border-radius: 9999px;
    padding: 6px 16px;
    font-size: 0.85rem;
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    transition: background-color 0.2s ease, transform 0.2s ease;
  }

  .styleBtn:hover:enabled {
    background-color: #00000033;
    transform: translateY(-1px);
  }

  .styleBtn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .progressionList {
    position: fixed;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 10px;
    list-style: none;
    padding: 0;
    justify-content: center;
    flex-wrap: wrap;
    gap: 20px;
    z-index: 1;
  }

  .progressionList li {
    padding: 5px 10px;
    border: 2px transparent;
    border-radius: 4px;
  }

  .progressionList li.live {
    border: 2px solid #ffffff66;
  }

  .visualizer-container {
    position: absolute;
    left: 30px;
    bottom: 30px;
    height: 180px;
    overflow: hidden;
    margin-top: 10px;
  }

  @media only screen and (max-width: 600px) {
    .play-button {
      margin-bottom: 40px;
    }
    .styleBtn {
      font-size: 0.75rem;
      padding: 5px 12px;
    }
    .progressionList {
      bottom: 0;
      left: 0;
      width: 100vw;
      transform: scale(0.8);
    }
    .visualizer-container {
      display: none;
    }
  }
</style>

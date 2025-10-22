import Chord from "../Chords/Chord";
import Chords from "../Chords/Chords";

export type CanonMelodyStep = {
  /** Relative offset from the base scale index (used for fallback patterns). */
  offset?: number;
  /** Absolute index into the expanded scale array. */
  scaleIndex?: number;
  /** Tone.js duration for the note. */
  duration: string;
  /** Multiplier applied to the computed velocity. */
  accent?: number;
};

export type CanonVoiceSettings = {
  /** Transport time string that defines the delay between canon entries. */
  entryInterval: string;
  /** Velocity multipliers per voice (index 0 is the lead voice). */
  velocityProfile: number[];
  /** Transposition in semitones applied per voice. */
  transpose: number[];
  /** Total active voices (1 – 3). */
  voices: number;
};

export type CanonState = {
  chords: Chord[];
  voiceSettings: CanonVoiceSettings;
  /** Offset counted from the top of the scale array. */
  baseScaleOffset: number;
  variationName: string;
  anchorTrend: number[];
  degrees: number[];
};

type CanonMotif = {
  steps: number[];
  durations: string[];
  accents?: number[];
  jitter?: number;
};

type CanonVariation = {
  name: string;
  pattern: number[];
  melodyPatterns?: CanonMelodyStep[][];
  voiceSettings?: Partial<CanonVoiceSettings>;
  baseScaleOffset?: [number, number];
  anchorTrends?: number[][];
  motifGroups?: Record<string, string[]>;
  presetLines?: CanonMelodyStep[][];
};

const BASE_PATTERN = [1, 5, 6, 3, 4, 1, 4, 5];

const DEFAULT_VOICE_SETTINGS: CanonVoiceSettings = {
  entryInterval: "1m",
  velocityProfile: [1, 0.8, 0.68],
  transpose: [0, -12, -5],
  voices: 3,
};

const MOTIF_LIBRARY: Record<string, CanonMotif> = {
  descent: {
    steps: [0, -1, -2, -3],
    durations: ["8n", "8n", "8n", "8n"],
    accents: [1, 0.92, 0.9, 0.95],
    jitter: 0.12,
  },
  wideDescent: {
    steps: [0, -2, -3, -5],
    durations: ["8n", "8n", "8n", "8n"],
    accents: [1, 0.9, 0.88, 0.94],
    jitter: 0.1,
  },
  turn: {
    steps: [0, -1, 1, 0, -2, -1],
    durations: ["8n", "16n", "16n", "8n", "8n", "8n"],
    accents: [1, 0.84, 0.8, 0.9, 0.92, 0.88],
    jitter: 0.2,
  },
  lift: {
    steps: [0, 2, 1, 0, -1],
    durations: ["8n", "8n", "8n", "8n", "4n"],
    accents: [1, 0.92, 0.9, 0.95, 0.88],
    jitter: 0.18,
  },
  ripple: {
    steps: [0, -2, 0, -1],
    durations: ["8n", "8n", "4n", "8n"],
    accents: [1, 0.85, 0.9, 0.88],
    jitter: 0.22,
  },
  cadenceFall: {
    steps: [0, -1, -3, -4],
    durations: ["8n", "8n", "8n", "4n"],
    accents: [1, 0.93, 0.9, 0.96],
    jitter: 0.1,
  },
  cadenceLift: {
    steps: [-2, 0, 1, 0],
    durations: ["8n", "8n", "8n", "4n"],
    accents: [0.92, 1, 0.95, 0.9],
    jitter: 0.14,
  },
  arpeggio: {
    steps: [0, -3, -1, -4],
    durations: ["8n", "8n", "8n", "8n"],
    accents: [1, 0.88, 0.92, 0.9],
    jitter: 0.16,
  },
  sustain: {
    steps: [0],
    durations: ["1n"],
    accents: [0.88],
    jitter: 0,
  },
};

const DEFAULT_ANCHOR_TRENDS: number[][] = [
  [0, 1, 2, 3, 4, 4, 3, 2],
  [0, 1, 2, 3, 4, 5, 4, 3],
];

const DEFAULT_MOTIF_GROUPS: Record<string, string[]> = {
  opening: ["descent", "arpeggio"],
  tonic: ["descent", "turn"],
  dominant: ["turn", "lift", "cadenceLift"],
  relative: ["ripple", "descent"],
  predominant: ["wideDescent", "arpeggio"],
  mediant: ["ripple", "turn"],
  cadence: ["cadenceFall", "cadenceLift", "sustain"],
  default: ["descent", "turn", "arpeggio"],
};

const CANON_MELODY_PATTERNS: CanonMelodyStep[][] = [
  [
    { offset: 0, duration: "8n", accent: 1 },
    { offset: -1, duration: "8n", accent: 0.92 },
    { offset: -2, duration: "8n", accent: 0.88 },
    { offset: -3, duration: "8n", accent: 0.92 },
    { offset: -4, duration: "8n", accent: 0.95 },
    { offset: -3, duration: "8n", accent: 0.9 },
    { offset: -2, duration: "8n", accent: 0.92 },
    { offset: -1, duration: "8n", accent: 0.94 },
  ],
  [
    { offset: 0, duration: "4n", accent: 1 },
    { offset: -2, duration: "8n", accent: 0.92 },
    { offset: -1, duration: "8n", accent: 0.88 },
    { offset: 1, duration: "4n", accent: 0.96 },
    { offset: 0, duration: "8n", accent: 0.9 },
    { offset: -2, duration: "8n", accent: 0.88 },
    { offset: -4, duration: "4n", accent: 0.94 },
    { offset: -2, duration: "4n", accent: 0.96 },
  ],
  [
    { offset: 0, duration: "8n", accent: 1 },
    { offset: -2, duration: "8n", accent: 0.9 },
    { offset: -4, duration: "8n", accent: 0.92 },
    { offset: -5, duration: "8n", accent: 0.95 },
    { offset: -3, duration: "8n", accent: 0.9 },
    { offset: -1, duration: "8n", accent: 0.88 },
    { offset: 1, duration: "8n", accent: 0.92 },
    { offset: 0, duration: "8n", accent: 0.96 },
  ],
];

function createPresetLine(offsets: number[], accents?: number[]): CanonMelodyStep[] {
  return offsets.map((offset, idx) => ({
    offset,
    duration: idx === offsets.length - 1 ? "4n" : "8n",
    accent: accents?.[idx] ?? (idx === 0 ? 1 : 0.9 - idx * 0.04),
  }));
}

const PRESET_CLASSIC_LINES: CanonMelodyStep[][] = [
  createPresetLine([0, -1, -2, -3, -4, -3, -2, -1], [1, 0.95, 0.92, 0.9, 0.88, 0.9, 0.93, 0.96]),
  createPresetLine([-1, -2, -3, -4, -3, -2, -1, 0]),
  createPresetLine([-2, -3, -4, -5, -4, -3, -2, -1]),
  createPresetLine([-3, -4, -5, -6, -5, -4, -3, -2]),
  createPresetLine([-2, -1, 0, 1, 0, -1, -2, -3]),
  createPresetLine([-1, 0, 1, 2, 1, 0, -1, -2]),
  createPresetLine([-2, -3, -4, -3, -2, -1, 0, 1]),
  createPresetLine([-1, -2, -3, -2, -1, 0, 1, 2]),
];

const PRESET_PASSING_LINES: CanonMelodyStep[][] = [
  createPresetLine([0, -2, -1, 1, 0, -1, -2, -3]),
  createPresetLine([-1, 1, 0, -1, -2, -1, 0, 1]),
  createPresetLine([-2, 0, 1, 2, 1, 0, -1, -2]),
  createPresetLine([-3, -1, 0, 1, 0, -1, -2, -3]),
  createPresetLine([-2, -3, -1, 0, -1, -2, -3, -4]),
  createPresetLine([-1, 0, 2, 3, 2, 1, 0, -1]),
  createPresetLine([-2, -1, 1, 2, 1, 0, -1, -2]),
  createPresetLine([-1, 0, 1, 2, 3, 2, 1, 0]),
];

const PRESET_RISE_LINES: CanonMelodyStep[][] = [
  createPresetLine([0, -1, 1, 2, 3, 2, 1, 0]),
  createPresetLine([1, 2, 3, 4, 3, 2, 1, 0]),
  createPresetLine([2, 3, 5, 4, 3, 2, 1, 0]),
  createPresetLine([1, 0, -1, -2, -1, 0, 1, 2]),
  createPresetLine([0, 1, 2, 3, 4, 3, 2, 1]),
  createPresetLine([1, 2, 3, 4, 5, 4, 3, 2]),
  createPresetLine([2, 1, 0, 1, 2, 3, 2, 1]),
  createPresetLine([1, 0, -1, 0, 1, 2, 3, 4]),
];

const CANON_VARIATIONS: CanonVariation[] = [
  {
    name: "classic",
    pattern: BASE_PATTERN,
    melodyPatterns: [CANON_MELODY_PATTERNS[0]],
    baseScaleOffset: [3, 4],
    anchorTrends: [
      [0, 1, 2, 3, 4, 4, 3, 2],
      [0, 1, 2, 3, 4, 5, 4, 3],
    ],
    motifGroups: {
      opening: ["descent", "arpeggio"],
      tonic: ["descent", "turn"],
      dominant: ["turn", "cadenceLift"],
      relative: ["ripple", "descent"],
      predominant: ["wideDescent", "arpeggio"],
      cadence: ["cadenceFall", "cadenceLift"],
      default: ["descent", "turn", "arpeggio"],
    },
    presetLines: PRESET_CLASSIC_LINES,
  },
  {
    name: "lofi-passing",
    pattern: [1, 5, 6, 3, 4, 1, 2, 5],
    melodyPatterns: [CANON_MELODY_PATTERNS[1]],
    voiceSettings: {
      velocityProfile: [1, 0.78, 0.65],
      transpose: [0, -7, 5],
    },
    baseScaleOffset: [4, 5],
    anchorTrends: [
      [0, 1, 2, 3, 3, 4, 3, 2],
      [0, 1, 2, 2, 3, 4, 3, 1],
    ],
    motifGroups: {
      opening: ["turn", "lift"],
      tonic: ["descent", "turn"],
      dominant: ["turn", "lift", "cadenceLift"],
      relative: ["ripple", "turn"],
      predominant: ["wideDescent", "ripple"],
      mediant: ["arpeggio", "turn"],
      cadence: ["cadenceFall", "sustain"],
      default: ["turn", "ripple", "descent"],
    },
    presetLines: PRESET_PASSING_LINES,
  },
  {
    name: "lofi-rise",
    pattern: [1, 5, 3, 6, 4, 1, 4, 5],
    melodyPatterns: [CANON_MELODY_PATTERNS[2]],
    voiceSettings: {
      entryInterval: "2n",
      velocityProfile: [1, 0.82, 0.72],
      transpose: [0, -12, 12],
    },
    baseScaleOffset: [2, 4],
    anchorTrends: [
      [0, 1, 1, 2, 3, 4, 3, 2],
      [0, 0, 1, 2, 3, 4, 2, 1],
    ],
    motifGroups: {
      opening: ["lift", "descent"],
      tonic: ["lift", "turn"],
      dominant: ["lift", "cadenceLift"],
      relative: ["ripple", "lift"],
      predominant: ["wideDescent", "turn"],
      cadence: ["cadenceLift", "cadenceFall"],
      default: ["lift", "turn", "descent"],
    },
    presetLines: PRESET_RISE_LINES,
  },
];

const VARIATION_MAP = new Map(CANON_VARIATIONS.map((variation) => [variation.name, variation]));

function cloneChordFromDegree(degree: number): Chord {
  const source = Chords[degree - 1];
  const intervals = [...(source as any).intervals];
  const nextChordIdxs = [...(source as any).nextChordIdxs];
  const chord = new Chord(degree, intervals, nextChordIdxs);
  (chord as any).canon = true;
  return chord;
}

function randomInRange(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function randomChoice<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function pickVariation(name?: string): CanonVariation {
  if (name) {
    const match = VARIATION_MAP.get(name);
    if (match) return match;
  }
  return randomChoice(CANON_VARIATIONS);
}

function pickAnchorTrend(variation: CanonVariation): number[] {
  const trends = variation.anchorTrends?.length ? variation.anchorTrends : DEFAULT_ANCHOR_TRENDS;
  return [...randomChoice(trends)];
}

function motifGroupFor(degree: number, index: number, total: number): string {
  if (index === 0) return "opening";
  if (index === total - 1) return "cadence";
  if (degree === 1) return "tonic";
  if (degree === 5) return "dominant";
  if (degree === 6) return "relative";
  if (degree === 4) return "predominant";
  if (degree === 3) return "mediant";
  return "default";
}

function pickMotifId(
  options: string[],
  lastMotif: string | null,
): string {
  if (!options.length) {
    return "descent";
  }
  const filtered = options.filter((motif) => motif !== lastMotif);
  const pool = filtered.length ? filtered : options;
  return randomChoice(pool);
}

export function generateCanonState(options: {
  variation?: string;
  requestedVoices?: number;
} = {}): CanonState {
  const variation = pickVariation(options.variation);
  const chords = variation.pattern.map((degree) => cloneChordFromDegree(degree));
  const voiceSettings = {
    ...DEFAULT_VOICE_SETTINGS,
    ...(variation.voiceSettings ?? {}),
  } as CanonVoiceSettings;

  if (options.requestedVoices) {
    voiceSettings.voices = Math.max(1, Math.min(3, options.requestedVoices));
  }

  const baseRange = variation.baseScaleOffset ?? [3, 5];
  const baseOffset = Math.round(randomInRange(baseRange[0], baseRange[1]));

  return {
    chords,
    voiceSettings,
    baseScaleOffset: baseOffset,
    variationName: variation.name,
    anchorTrend: pickAnchorTrend(variation),
    degrees: [...variation.pattern],
  };
}

export function createCanonMelodyPattern(params: {
  variationName: string;
  anchorTrend: number[];
  baseScaleIndex: number;
  scaleLength: number;
  degrees: number[];
}): CanonMelodyStep[] {
  const variation = VARIATION_MAP.get(params.variationName) ?? CANON_VARIATIONS[0];
  const motifGroups = variation.motifGroups ?? DEFAULT_MOTIF_GROUPS;
  const anchorTrend = params.anchorTrend.length
    ? params.anchorTrend
    : pickAnchorTrend(variation);

  const presetLines = variation.presetLines;
  if (presetLines?.length === params.degrees.length) {
    const presetPattern: CanonMelodyStep[] = [];
    params.degrees.forEach((degree, index) => {
      const trendValue = anchorTrend[index] ?? anchorTrend[anchorTrend.length - 1] ?? 0;
      const anchor = clamp(params.baseScaleIndex - trendValue, 1, params.scaleLength - 2);
      const steps = presetLines[index] ?? [];
      steps.forEach((step) => {
        const scaleIndex = clamp(
          typeof step.scaleIndex === "number"
            ? step.scaleIndex
            : anchor + (step.offset ?? 0),
          0,
          params.scaleLength - 1,
        );
        presetPattern.push({
          ...step,
          scaleIndex,
        });
      });
    });

    if (presetPattern.length) {
      return presetPattern;
    }
  }

  const melody: CanonMelodyStep[] = [];
  let lastMotif: string | null = null;

  params.degrees.forEach((degree, index) => {
    const trendValue = anchorTrend[index] ?? anchorTrend[anchorTrend.length - 1] ?? 0;
    const anchor = clamp(params.baseScaleIndex - trendValue, 1, params.scaleLength - 2);
    const groupName = motifGroupFor(degree, index, params.degrees.length);
    const motifOptions = motifGroups[groupName] ?? motifGroups.default ?? ["descent"];
    const motifId = pickMotifId(motifOptions, lastMotif);
    const motif = MOTIF_LIBRARY[motifId] ?? MOTIF_LIBRARY.descent;

    let motifNotes = 0;
    motif.steps.forEach((step, stepIndex) => {
      if (motif.steps.length > 2 && Math.random() < 0.08) {
        return;
      }

      const jitterChance = motif.jitter ?? 0.15;
      const jitterOffset = Math.random() < jitterChance ? (Math.random() < 0.5 ? -1 : 1) : 0;
      const rawIndex = anchor + step + jitterOffset;
      const scaleIndex = clamp(rawIndex, 0, params.scaleLength - 1);
      const duration = motif.durations[stepIndex] ?? motif.durations[motif.durations.length - 1];
      const accent = motif.accents?.[stepIndex] ?? 1 - stepIndex * 0.06;
      melody.push({ scaleIndex, duration, accent });
      motifNotes += 1;
    });

    if (motifNotes === 0) {
      melody.push({ scaleIndex: anchor, duration: "4n", accent: 0.82 });
    }

    lastMotif = motifId;

    if (index === params.degrees.length - 1 && Math.random() < 0.45) {
      const resolutionIndex = clamp(anchor - 1, 0, params.scaleLength - 1);
      melody.push({ scaleIndex: resolutionIndex, duration: "2n", accent: 0.85 });
    }
  });

  if (!melody.length) {
    const fallbackPattern = variation.melodyPatterns?.[0] ?? CANON_MELODY_PATTERNS[0];
    return fallbackPattern.map((step) => ({
      ...step,
      scaleIndex: clamp(
        params.baseScaleIndex + (step.offset ?? 0),
        0,
        params.scaleLength - 1,
      ),
    }));
  }

  return melody;
}

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
  import Noise from "../lib/engine/Drums/Noise";
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

  // Setup audio chain
  const cmp = new Tone.Compressor({
    threshold: -6,
    ratio: 3,
    attack: 0.5,
    release: 0.1,
  });
  const lpf = new Tone.Filter(2000, "lowpass");
  const vol = new Tone.Volume(linearToDb(volumes.main_track));
  Tone.Master.chain(cmp, lpf, vol);
  Tone.Transport.bpm.value = 156;
  Tone.Transport.swing = 1;

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
      return saved ? JSON.parse(saved) : { piano: 1, kick: 0.7, snare: 0, hat: 0.5 };
    } catch (e) {
      return { piano: 1, kick: 0.7, snare: 0, hat: 0.5 };
    }
  };
  let instrumentVolumes = loadInstrumentVolumes();

  // Initialize instrument on/off states based on volumes
  let kickOff = instrumentVolumes.kick === 0;
  let snareOff = instrumentVolumes.snare === 0;  // ← 預設靜音時設為 true
  let hatOff = instrumentVolumes.hat === 0;
  let melodyDensity = 0.33;
  let melodyOff = false;

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
  const noise = Noise;

  // Sequences
  let chords, melody, kickLoop, snareLoop, hatLoop;

  onMount(() => {
    // Setup sequences
    chords = new Tone.Sequence(
      (time, note) => {
        playChord();
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
          if (note === "C4" && Math.random() < 0.9) {
            // @ts-ignore
            kick.triggerAttack(note);
          } else if (note === "." && Math.random() < 0.1) {
            // @ts-ignore
            kick.triggerAttack("C4");
          }
        }
      },
      ["C4", "", "", "", "", "", "", "C4", "C4", "", ".", "", "", "", "", ""],
      "8n",
    );

    snareLoop = new Tone.Sequence(
      (time, note) => {
        if (!snareOff) {
          if (note !== "" && Math.random() < 0.8) {
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
          // @ts-ignore
          if (note !== "" && Math.random() < 0.8) {
            // @ts-ignore
            hat.triggerAttack(note);
          }
        }
      },
      ["C4", "C4", "C4", "C4", "C4", "C4", "C4", "C4"],
      "4n",
    );

    chords.humanize = true;
    melody.humanize = true;
    kickLoop.humanize = true;
    snareLoop.humanize = true;
    hatLoop.humanize = true;

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

    // Apply initial instrument volumes
    updateInstrumentVolumes();

    return () => {
      window.removeEventListener("keydown", handleKeydown);
      window.removeEventListener("loadPreset", handleLoadPreset as EventListener);
      window.removeEventListener("fadeOutMusic", handleFadeOut);
      window.removeEventListener("updateInstrumentVolumes", handleInstrumentVolumes as EventListener);
    };
  });

  onDestroy(() => {
    if (Tone.Transport.state === "started") {
      noise.stop();
      Tone.Transport.stop();
    }
  });

  function nextChord() {
    const nextProgress = progress === progression.length - 1 ? 0 : progress + 1;
    const nextKickOff = Math.random() < 0.15;
    const nextSnareOff = Math.random() < 0.2;
    const nextHatOff = Math.random() < 0.25;
    const nextMelodyDensity = Math.random() * 0.3 + 0.2;
    const nextMelodyOff = Math.random() < 0.25;

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
    } else {
      progress = nextProgress;
    }
  }

  function playChord() {
    const chord = progression[progress];
    const root = Tone.Frequency(key + "3").transpose(chord.semitoneDist);
    const size = 4;
    const voicing = chord.generateVoicing(size);
    const notes = Tone.Frequency(root)
      .harmonize(voicing)
      .map((f) => Tone.Frequency(f).toNote());
    // @ts-ignore
    pn.triggerAttackRelease(notes, "1n");
    nextChord();
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
      if (Math.random() > 0.5) {
        ascend = !descend;
      } else {
        descend = !ascend;
      }
    }

    let weights = descend
      ? intervalWeights.slice(0, descendRange)
      : intervalWeights.slice(0, ascendRange);

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

    const scalePosChange = descend ? -scaleDist : scaleDist;
    const newScalePos = scalePos + scalePosChange;

    scalePos = newScalePos;
    // @ts-ignore
    pn.triggerAttackRelease(scale[newScalePos], "2n");
  }

  function generateProgression() {
    const _scale = fiveToFive;
    const newKey = Keys[Math.floor(Math.random() * Keys.length)];
    const newScale = Tone.Frequency(newKey + "5")
      .harmonize(_scale)
      .map((f) => Tone.Frequency(f).toNote());
    const newProgression = ChordProgression.generate(8);
    const newScalePos = Math.floor(Math.random() * _scale.length);

    key = newKey;
    progress = 0;
    progression = newProgression;
    scale = newScale;
    genChordsOnce = true;
    scalePos = newScalePos;
    
    // Save current state
    saveCurrentState();
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
      Tone.Transport.bpm.value = state.bpm;
    }

    // Load drum states
    if (state.kickOff !== undefined) kickOff = state.kickOff;
    if (state.snareOff !== undefined) snareOff = state.snareOff;
    if (state.hatOff !== undefined) hatOff = state.hatOff;
    
    // Load melody states
    if (state.melodyDensity !== undefined) melodyDensity = state.melodyDensity;
    if (state.melodyOff !== undefined) melodyOff = state.melodyOff;

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
  }

  function toggle() {
    progress = 0;
    if (Tone.Transport.state === "started") {
      noise.stop();
      Tone.Transport.stop();
      isPlaying = false;
    } else {
      Tone.start();
      Tone.Transport.start();
      noise.start(0);
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
      noise.stop();
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

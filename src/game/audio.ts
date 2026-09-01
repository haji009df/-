/**
 * Procedural Web Audio API Synthesizer Engine
 * 100% Offline, Zero External MP3/WAV assets.
 * Implements 6/8 Persian Bandari/Rhythmic loops and procedural sound effects.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isMusicEnabled: boolean = true;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  
  // Engine Sound state
  private engineOsc: OscillatorNode | null = null;
  private engineSubOsc: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  private engineFilter: BiquadFilterNode | null = null;
  private isEngineRunning: boolean = false;

  // 6/8 Music sequencer state
  private musicIntervalId: number | null = null;
  private currentStep: number = 0;
  private melodyVariation: number = 0;
  private loopCount: number = 0;
  private tempoBpm: number = 132; // 6/8 rhythmic Persian groove

  // Persian Micro-Scale Frequencies (Shur / Chahargah inspired notes)
  // D4, Eb4, F#4 (Koron/Sori proxy), G4, A4, Bb4, C5, D5
  private melodyNotes1: number[] = [
    293.66, 329.63, 369.99, 392.00, 440.00, 392.00, 369.99, 329.63,
    293.66, 293.66, 369.99, 392.00, 440.00, 493.88, 440.00, 392.00,
    440.00, 493.88, 523.25, 493.88, 440.00, 392.00, 369.99, 329.63,
    293.66, 369.99, 293.66, 220.00, 293.66, 293.66, 293.66, 293.66
  ];

  private melodyNotes2: number[] = [
    440.00, 440.00, 493.88, 440.00, 392.00, 369.99, 392.00, 440.00,
    392.00, 369.99, 329.63, 293.66, 329.63, 369.99, 392.00, 369.99,
    440.00, 523.25, 493.88, 440.00, 392.00, 369.99, 329.63, 293.66,
    369.99, 329.63, 293.66, 246.94, 293.66, 293.66, 369.99, 293.66
  ];

  private melodyNotes3: number[] = [
    523.25, 493.88, 440.00, 392.00, 440.00, 493.88, 523.25, 587.33,
    523.25, 493.88, 440.00, 392.00, 369.99, 329.63, 293.66, 369.99,
    392.00, 440.00, 392.00, 369.99, 329.63, 293.66, 329.63, 369.99,
    293.66, 220.00, 293.66, 369.99, 293.66, 293.66, 293.66, 293.66
  ];

  private bassNotes: number[] = [
    146.83, 146.83, 146.83, 196.00, 220.00, 196.00,
    146.83, 146.83, 146.83, 196.00, 220.00, 146.83,
    110.00, 110.00, 146.83, 196.00, 220.00, 196.00,
    146.83, 196.00, 146.83, 110.00, 146.83, 146.83
  ];

  constructor() {
    // Lazy AudioContext init on user gesture
  }

  public init(): void {
    if (this.ctx) return;
    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();
      
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.startEngineAudio();
      this.startMusicSequencer();
    } catch (e) {
      console.warn('Web Audio API not supported or blocked:', e);
    }
  }

  public resumeIfSuspended(): void {
    if (!this.ctx) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMute(muted: boolean): void {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.7, this.ctx.currentTime);
    }
  }

  public setMusicEnabled(enabled: boolean): void {
    this.isMusicEnabled = enabled;
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(enabled ? 0.18 : 0, this.ctx.currentTime);
    }
  }

  // ==========================================
  // ENGINE HUM SYNTHESIZER
  // ==========================================
  private startEngineAudio(): void {
    if (!this.ctx || !this.sfxGain || this.isEngineRunning) return;
    try {
      this.engineOsc = this.ctx.createOscillator();
      this.engineSubOsc = this.ctx.createOscillator();
      this.engineFilter = this.ctx.createBiquadFilter();
      this.engineGain = this.ctx.createGain();

      this.engineOsc.type = 'sawtooth';
      this.engineSubOsc.type = 'triangle';

      this.engineFilter.type = 'lowpass';
      this.engineFilter.frequency.setValueAtTime(320, this.ctx.currentTime);

      this.engineGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

      this.engineOsc.connect(this.engineFilter);
      this.engineSubOsc.connect(this.engineFilter);
      this.engineFilter.connect(this.engineGain);
      this.engineGain.connect(this.sfxGain);

      this.engineOsc.frequency.setValueAtTime(55, this.ctx.currentTime);
      this.engineSubOsc.frequency.setValueAtTime(27.5, this.ctx.currentTime);

      this.engineOsc.start();
      this.engineSubOsc.start();
      this.isEngineRunning = true;
    } catch {
      // Ignore
    }
  }

  public updateEnginePitch(speedKmh: number, gear: number): void {
    if (!this.ctx || !this.engineOsc || !this.engineSubOsc || !this.engineFilter || !this.engineGain) return;
    
    // Calculate RPM proxy based on speed and gear
    const gearBase = gear === 1 ? 0.9 : gear === 2 ? 0.6 : 0.45;
    const speedRatio = Math.min(1.0, speedKmh / 220);
    const rpm = 50 + (speedRatio * 180 * gearBase) + (gear * 15);
    
    const now = this.ctx.currentTime;
    this.engineOsc.frequency.setTargetAtTime(rpm, now, 0.05);
    this.engineSubOsc.frequency.setTargetAtTime(rpm * 0.5, now, 0.05);
    this.engineFilter.frequency.setTargetAtTime(250 + rpm * 3.5, now, 0.05);
    this.engineGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.06 + (speedRatio * 0.06), now, 0.05);
  }

  // ==========================================
  // 6/8 PERSIAN RHYTHMIC MUSIC SEQUENCER
  // ==========================================
  private startMusicSequencer(): void {
    if (this.musicIntervalId !== null) return;
    
    // 6/8 meter calculation: 6 eighth-notes per measure
    const stepDurationMs = (60 / this.tempoBpm / 2) * 1000;

    this.musicIntervalId = window.setInterval(() => {
      if (!this.ctx || this.isMuted || !this.isMusicEnabled) return;
      this.playSequencerStep();
    }, stepDurationMs);
  }

  private playSequencerStep(): void {
    if (!this.ctx || !this.musicGain) return;
    const now = this.ctx.currentTime;
    const stepInMeasure = this.currentStep % 6; // 0, 1, 2, 3, 4, 5

    // 1. Percussion: Tombak / Bandari 6/8 syncopation
    // Accent on 0 (DUM), 2 (TAK), 3 (DUM), 5 (TAK)
    if (stepInMeasure === 0 || stepInMeasure === 3) {
      this.playTombakDum(now, stepInMeasure === 0 ? 1.0 : 0.7);
    } else if (stepInMeasure === 2 || stepInMeasure === 5) {
      this.playTombakTak(now, 0.6);
    } else {
      // Light swing ghost tap
      this.playTombakTak(now, 0.25);
    }

    // 2. Bass note on primary beats
    if (stepInMeasure === 0 || stepInMeasure === 3) {
      const bassIdx = (Math.floor(this.currentStep / 3)) % this.bassNotes.length;
      const bassFreq = this.bassNotes[bassIdx];
      this.playBassNote(now, bassFreq);
    }

    // 3. Lead Persian Melody Synthesizer
    const currentMelody = this.melodyVariation === 0 
      ? this.melodyNotes1 
      : this.melodyVariation === 1 
      ? this.melodyNotes2 
      : this.melodyNotes3;

    const noteIdx = this.currentStep % currentMelody.length;
    const freq = currentMelody[noteIdx];
    this.playMelodyNote(now, freq);

    // Advance step
    this.currentStep++;
    if (this.currentStep % 64 === 0) {
      this.loopCount++;
      // Rotate between 3 melodic variations every 2 bars of 32
      this.melodyVariation = (this.melodyVariation + 1) % 3;
    }
  }

  private playTombakDum(time: number, volumeScale: number): void {
    if (!this.ctx || !this.musicGain) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      // Pitch drop creates warm deep drum thud
      osc.frequency.setValueAtTime(130, time);
      osc.frequency.exponentialRampToValueAtTime(45, time + 0.12);

      gain.gain.setValueAtTime(0.35 * volumeScale, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

      osc.connect(gain);
      gain.connect(this.musicGain);

      osc.start(time);
      osc.stop(time + 0.16);
    } catch {}
  }

  private playTombakTak(time: number, volumeScale: number): void {
    if (!this.ctx || !this.musicGain) return;
    try {
      // Filtered noise snap
      const bufferSize = this.ctx.sampleRate * 0.05;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, time);
      filter.Q.setValueAtTime(3.0, time);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.25 * volumeScale, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.06);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);

      whiteNoise.start(time);
      whiteNoise.stop(time + 0.07);
    } catch {}
  }

  private playBassNote(time: number, freq: number): void {
    if (!this.ctx || !this.musicGain) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, time);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, time);

      gain.gain.setValueAtTime(0.2, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);

      osc.start(time);
      osc.stop(time + 0.28);
    } catch {}
  }

  private playMelodyNote(time: number, freq: number): void {
    if (!this.ctx || !this.musicGain) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, time);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, time);
      filter.frequency.exponentialRampToValueAtTime(500, time + 0.18);

      gain.gain.setValueAtTime(0.12, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);

      osc.start(time);
      osc.stop(time + 0.2);
    } catch {}
  }

  // ==========================================
  // PROCEDURAL SOUND EFFECTS (SFX)
  // ==========================================

  // 1. Car Horn (دکمه بوق) - Persian Dual Tone
  public playHorn(): void {
    this.resumeIfSuspended();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'triangle';

      osc1.frequency.setValueAtTime(440, now); // A4
      osc2.frequency.setValueAtTime(554.37, now); // C#5

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.sfxGain);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.36);
      osc2.stop(now + 0.36);
    } catch {}
  }

  // 2. Nitro Boost (نیترو)
  public playNitro(): void {
    this.resumeIfSuspended();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      
      // Noise burst for fire jet
      const bufferSize = this.ctx.sampleRate * 0.4;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(400, now);
      filter.frequency.exponentialRampToValueAtTime(1600, now + 0.4);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.4, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.sfxGain);

      // Pitch swept sine
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(480, now + 0.4);

      oscGain.gain.setValueAtTime(0.25, now);
      oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

      osc.connect(oscGain);
      oscGain.connect(this.sfxGain);

      noise.start(now);
      osc.start(now);
      noise.stop(now + 0.45);
      osc.stop(now + 0.45);
    } catch {}
  }

  // 3. Mounted Gunshot (شلیک گلوله)
  public playGunshot(): void {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.12);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.13);
    } catch {}
  }

  // 4. Coin Pickup (جمع‌آوری سکه)
  public playCoin(): void {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';

      osc1.frequency.setValueAtTime(987.77, now); // B5
      osc2.frequency.setValueAtTime(1318.51, now + 0.06); // E6

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.sfxGain);

      osc1.start(now);
      osc1.stop(now + 0.07);
      osc2.start(now + 0.06);
      osc2.stop(now + 0.22);
    } catch {}
  }

  // 5. Collision Crash (تصادف)
  public playCrash(): void {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 0.35;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.08));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.7, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

      noise.connect(gain);
      gain.connect(this.sfxGain);

      noise.start(now);
      noise.stop(now + 0.36);
    } catch {}
  }

  // 6. Stage Complete Fanfare (اتمام مرحله)
  public playStageComplete(): void {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const notes = [293.66, 369.99, 440.00, 587.33]; // D, F#, A, D
      notes.forEach((f, idx) => {
        if (!this.ctx || !this.sfxGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now + idx * 0.08);

        gain.gain.setValueAtTime(0.3, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.25);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.26);
      });
    } catch {}
  }

  // 7. Tire Screech / Drift Skid (صدای جیغ لاستیک و لغزش)
  public playScreech(): void {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.15);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.3);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, now);
      filter.Q.setValueAtTime(5, now);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.32);
    } catch {}
  }
}

export const audioManager = new SoundEngine();

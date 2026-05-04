export class MetronomeEngine {
  audioContext: AudioContext | null = null;
  isPlaying = false;
  bpm = 120;
  timeSignature = 4;
  currentBeat = 1;
  nextNoteTime = 0;
  timerID: number | null = null;
  lookahead = 25.0; // ms
  scheduleAheadTime = 0.1; // s
  soundType: 'classic' | 'woodblock' | 'digital' = 'classic';
  volume = 0.8;
  isMuted = false;
  
  onBeat: (beat: number) => void = () => {};

  constructor() {}

  init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  nextNote() {
    const secondsPerBeat = 60.0 / this.bpm;
    this.nextNoteTime += secondsPerBeat;
    this.currentBeat++;
    if (this.currentBeat > this.timeSignature) {
      this.currentBeat = 1;
    }
  }

  playOscillatorTone(time: number, freq: number, duration: number, type: OscillatorType = 'sine') {
    if (!this.audioContext || this.isMuted) return;
    
    const osc = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);
    
    // Smooth envelope to avoid clicking
    gainNode.gain.setValueAtTime(0.001, time);
    gainNode.gain.exponentialRampToValueAtTime(this.volume, time + 0.002);
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + duration);
    
    osc.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    osc.start(time);
    osc.stop(time + duration);
  }

  scheduleNote(beatNumber: number, time: number) {
    // Schedule Visuals
    const timeUntilNote = time - this.audioContext!.currentTime;
    setTimeout(() => {
      this.onBeat(beatNumber);
    }, Math.max(0, timeUntilNote * 1000));

    // Schedule Audio
    const isAccent = beatNumber === 1;
    
    switch (this.soundType) {
      case 'woodblock':
        this.playOscillatorTone(time, isAccent ? 800 : 600, 0.05, 'square');
        break;
      case 'digital':
        this.playOscillatorTone(time, isAccent ? 2000 : 1500, 0.02, 'sawtooth');
        break;
      case 'classic':
      default:
        // Sine with slight distortion click feel
        this.playOscillatorTone(time, isAccent ? 1200 : 900, 0.05, 'sine');
        break;
    }
  }

  scheduler() {
    while (this.nextNoteTime < this.audioContext!.currentTime + this.scheduleAheadTime) {
      this.scheduleNote(this.currentBeat, this.nextNoteTime);
      this.nextNote();
    }
    this.timerID = window.setTimeout(this.scheduler.bind(this), this.lookahead);
  }

  start() {
    this.init();
    if (this.isPlaying) return;
    
    if (this.audioContext!.state === 'suspended') {
      this.audioContext!.resume();
    }
    
    this.isPlaying = true;
    this.currentBeat = 1;
    this.nextNoteTime = this.audioContext!.currentTime + 0.05;
    this.scheduler();
  }

  stop() {
    this.isPlaying = false;
    if (this.timerID !== null) {
      window.clearTimeout(this.timerID);
      this.timerID = null;
    }
  }

  setBpm(newBpm: number) {
    this.bpm = newBpm;
  }

  setTimeSignature(newSig: number) {
    this.timeSignature = newSig;
    // Don't reset currentBeat immediately unless it's out of bounds
    if (this.currentBeat > newSig) {
      this.currentBeat = 1;
    }
  }
}

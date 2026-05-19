export class TunerEngine {
  audioContext: AudioContext | null = null;
  analyser: AnalyserNode | null = null;
  mediaStreamSource: MediaStreamAudioSourceNode | null = null;
  oscillator: OscillatorNode | null = null;
  gainNode: GainNode | null = null;

  isListening = false;
  isReferencePlaying = false;
  animationFrameId: number | null = null;

  bufferSize = 2048;
  buffer: Float32Array;

  // Configuration
  noiseThreshold = 0.02; // Ignore signals below this RMS

  // Callbacks
  onPitchDetected: (pitch: number | null, rms: number) => void = () => {};

  constructor() {
    this.buffer = new Float32Array(this.bufferSize);
  }

  async startListening() {
    if (this.isListening) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: false,
          autoGainControl: false,
          noiseSuppression: false,
        }
      });

      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = this.bufferSize;
      
      this.mediaStreamSource = this.audioContext.createMediaStreamSource(stream);
      this.mediaStreamSource.connect(this.analyser);
      
      this.isListening = true;
      this.detectPitch();
    } catch (err) {
      console.error('Error accessing microphone:', err);
    }
  }

  stopListening() {
    this.isListening = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.mediaStreamSource) {
      this.mediaStreamSource.disconnect();
      // Need to stop tracks to release mic
      this.mediaStreamSource.mediaStream.getTracks().forEach(track => track.stop());
    }
  }

  playReferenceTone(freq: number = 440) {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    if (this.oscillator) {
      this.stopReferenceTone();
    }

    this.oscillator = this.audioContext.createOscillator();
    this.gainNode = this.audioContext.createGain();
    
    this.oscillator.type = 'sine';
    this.oscillator.frequency.value = freq;
    
    // Smooth attack
    this.gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    this.gainNode.gain.linearRampToValueAtTime(0.5, this.audioContext.currentTime + 0.1);
    
    this.oscillator.connect(this.gainNode);
    this.gainNode.connect(this.audioContext.destination);
    
    this.oscillator.start();
    this.isReferencePlaying = true;
  }

  stopReferenceTone() {
    if (this.oscillator && this.gainNode && this.audioContext) {
      // Smooth release
      this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, this.audioContext.currentTime);
      this.gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1);
      this.oscillator.stop(this.audioContext.currentTime + 0.1);
      
      setTimeout(() => {
        this.oscillator?.disconnect();
        this.gainNode?.disconnect();
        this.oscillator = null;
        this.gainNode = null;
      }, 150);
    }
    this.isReferencePlaying = false;
  }

  // McLeod Pitch Method (MPM) or standard Autocorrelation
  // Here we use a standard fast autocorrelation
  autoCorrelate(buf: Float32Array, sampleRate: number): number {
    let rms = 0;
    for (let i = 0; i < buf.length; i++) {
      const val = buf[i];
      rms += val * val;
    }
    rms = Math.sqrt(rms / buf.length);
    
    if (rms < this.noiseThreshold) {
      return -1; // Not enough signal
    }

    // Trim beginning and end
    let r1 = 0, r2 = buf.length - 1, thres = 0.2;
    for (let i = 0; i < buf.length / 2; i++) {
      if (Math.abs(buf[i]) < thres) { r1 = i; break; }
    }
    for (let i = 1; i < buf.length / 2; i++) {
      if (Math.abs(buf[buf.length - i]) < thres) { r2 = buf.length - i; break; }
    }

    buf = buf.slice(r1, r2);
    const len = buf.length;
    const c = new Array(len).fill(0);
    for (let i = 0; i < len; i++) {
      for (let j = 0; j < len - i; j++) {
        c[i] = c[i] + buf[j] * buf[j + i];
      }
    }

    let d = 0;
    while (c[d] > c[d + 1]) d++;
    let maxval = -1, maxpos = -1;
    for (let i = d; i < len; i++) {
      if (c[i] > maxval) {
        maxval = c[i];
        maxpos = i;
      }
    }
    
    let T0 = maxpos;
    
    // Interpolation
    const x1 = c[T0 - 1], x2 = c[T0], x3 = c[T0 + 1];
    const a = (x1 + x3 - 2 * x2) / 2;
    const b = (x3 - x1) / 2;
    if (a) T0 = T0 - b / (2 * a);

    return sampleRate / T0;
  }

  detectPitch = () => {
    if (!this.isListening || !this.analyser) return;

    this.analyser.getFloatTimeDomainData(this.buffer as any);
    const pitch = this.autoCorrelate(this.buffer, this.audioContext!.sampleRate);

    // Calculate RMS for noise threshold feedback
    let rms = 0;
    for (let i = 0; i < this.buffer.length; i++) {
      rms += this.buffer[i] * this.buffer[i];
    }
    rms = Math.sqrt(rms / this.buffer.length);

    if (pitch !== -1) {
      this.onPitchDetected(pitch, rms);
    } else {
      this.onPitchDetected(null, rms);
    }

    this.animationFrameId = requestAnimationFrame(this.detectPitch);
  }
}

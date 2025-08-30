// Math Sound Effects Utility
export class MathSounds {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    // Initialize AudioContext
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.warn('Audio context not supported');
      this.enabled = false;
    }
  }

  private async playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3) {
    if (!this.audioContext || !this.enabled) return;

    // Resume audio context if suspended (required for modern browsers)
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  // Success sound - ascending major chord
  async playSuccess() {
    if (!this.enabled) return;
    
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    for (let i = 0; i < notes.length; i++) {
      setTimeout(() => {
        this.playTone(notes[i], 0.3, 'sine', 0.2);
      }, i * 100);
    }
  }

  // Error sound - descending minor chord
  async playError() {
    if (!this.enabled) return;
    
    const notes = [493.88, 369.99, 293.66]; // B4, F#4, D4
    for (let i = 0; i < notes.length; i++) {
      setTimeout(() => {
        this.playTone(notes[i], 0.2, 'square', 0.15);
      }, i * 80);
    }
  }

  // Step completion - pleasant ding
  async playStepComplete() {
    if (!this.enabled) return;
    
    this.playTone(880, 0.5, 'sine', 0.2); // A5
    setTimeout(() => {
      this.playTone(1174.66, 0.3, 'sine', 0.15); // D6
    }, 200);
  }

  // Hint sound - gentle notification
  async playHint() {
    if (!this.enabled) return;
    
    this.playTone(698.46, 0.3, 'triangle', 0.1); // F5
  }

  // Parameter change - subtle click
  async playParameterChange() {
    if (!this.enabled) return;
    
    this.playTone(1046.50, 0.1, 'sine', 0.08); // C6
  }

  // Animation start - ascending scale
  async playAnimationStart() {
    if (!this.enabled) return;
    
    const scale = [261.63, 293.66, 329.63, 349.23, 392.00]; // C4 to G4
    for (let i = 0; i < scale.length; i++) {
      setTimeout(() => {
        this.playTone(scale[i], 0.15, 'sine', 0.1);
      }, i * 50);
    }
  }

  // Reset sound - neutral tone
  async playReset() {
    if (!this.enabled) return;
    
    this.playTone(440, 0.4, 'triangle', 0.15); // A4
  }

  // All steps complete - victory fanfare
  async playVictory() {
    if (!this.enabled) return;
    
    const fanfare = [523.25, 523.25, 659.25, 523.25, 783.99, 659.25]; // Victory pattern
    const durations = [0.2, 0.2, 0.3, 0.2, 0.4, 0.6];
    
    for (let i = 0; i < fanfare.length; i++) {
      setTimeout(() => {
        this.playTone(fanfare[i], durations[i], 'sine', 0.25);
      }, i * 250);
    }
  }

  // Enable/disable sounds
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }
}

// Singleton instance
export const mathSounds = new MathSounds();
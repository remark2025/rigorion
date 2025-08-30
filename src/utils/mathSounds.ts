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

  // Enhanced success sound - beautiful ascending progression with rich harmonics
  async playSuccess() {
    if (!this.enabled) return;
    
    // Play a magnificent success melody with layered harmonics
    const melody = [
      { freq: 523.25, duration: 0.25, volume: 0.28 }, // C5
      { freq: 659.25, duration: 0.25, volume: 0.26 }, // E5
      { freq: 783.99, duration: 0.35, volume: 0.32 }, // G5
      { freq: 1046.50, duration: 0.5, volume: 0.35 }  // C6 - triumphant finish
    ];
    
    for (let i = 0; i < melody.length; i++) {
      setTimeout(() => {
        // Main melody note
        this.playTone(melody[i].freq, melody[i].duration, 'sine', melody[i].volume);
        
        // Add harmonic layers for richness
        setTimeout(() => {
          // Perfect fifth harmonic
          this.playTone(melody[i].freq * 1.5, melody[i].duration * 0.7, 'triangle', melody[i].volume * 0.4);
        }, 30);
        
        // Add octave harmonic for final note
        if (i === melody.length - 1) {
          setTimeout(() => {
            this.playTone(melody[i].freq * 0.5, melody[i].duration * 0.9, 'sawtooth', melody[i].volume * 0.5);
            // Add sparkle effect
            setTimeout(() => {
              this.playTone(melody[i].freq * 2, 0.3, 'square', melody[i].volume * 0.2);
            }, 100);
          }, 80);
        }
      }, i * 140);
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

  // Step completion - satisfying success chime with enhanced harmonics
  async playStepComplete() {
    if (!this.enabled) return;
    
    // Beautiful multi-layered chime with rich resonance
    this.playTone(880, 0.45, 'sine', 0.28); // A5 - main note
    
    setTimeout(() => {
      // Perfect fifth harmony
      this.playTone(1318.51, 0.4, 'triangle', 0.22); // E6
      // Main resolution
      this.playTone(1174.66, 0.55, 'sine', 0.24); // D6
      
      // Add rich harmonic layers
      setTimeout(() => {
        this.playTone(587.33, 0.35, 'triangle', 0.15); // D5 harmonic
        this.playTone(440, 0.3, 'sawtooth', 0.12); // A4 sub-harmonic
      }, 80);
      
      // Sparkle finish
      setTimeout(() => {
        this.playTone(2349.32, 0.2, 'square', 0.08); // D7 sparkle
      }, 200);
    }, 120);
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

  // All steps complete - magnificent victory celebration
  async playVictory() {
    if (!this.enabled) return;
    
    // Epic victory fanfare with crescendo
    const fanfare = [
      { freq: 523.25, duration: 0.3, volume: 0.2 },  // C5
      { freq: 659.25, duration: 0.3, volume: 0.22 }, // E5
      { freq: 783.99, duration: 0.4, volume: 0.25 }, // G5
      { freq: 1046.50, duration: 0.4, volume: 0.28 }, // C6
      { freq: 1318.51, duration: 0.5, volume: 0.3 },  // E6
      { freq: 1567.98, duration: 0.8, volume: 0.35 }  // G6 - grand finale
    ];
    
    for (let i = 0; i < fanfare.length; i++) {
      setTimeout(() => {
        this.playTone(fanfare[i].freq, fanfare[i].duration, 'sine', fanfare[i].volume);
        // Add harmonic layers for richness
        if (i >= 3) {
          setTimeout(() => {
            this.playTone(fanfare[i].freq * 0.5, fanfare[i].duration * 0.7, 'triangle', fanfare[i].volume * 0.4);
          }, 30);
        }
      }, i * 200);
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
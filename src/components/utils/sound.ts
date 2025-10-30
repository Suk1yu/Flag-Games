// Simple sound effects using Web Audio API
class SoundManager {
  private audioContext: AudioContext | null = null;
  private isMuted: boolean = false;

  private getAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  playCorrect() {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Success sound: ascending notes
      oscillator.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      oscillator.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
      oscillator.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5

      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.4);
    } catch (error) {
      console.error("Error playing correct sound:", error);
    }
  }

  playWrong() {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Error sound: descending tone
      oscillator.type = "sawtooth";
      oscillator.frequency.setValueAtTime(300, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3);

      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.3);
    } catch (error) {
      console.error("Error playing wrong sound:", error);
    }
  }

  playGameOver() {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Game over sound: dramatic descending
      oscillator.type = "square";
      oscillator.frequency.setValueAtTime(400, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.5);

      gainNode.gain.setValueAtTime(0.25, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.5);
    } catch (error) {
      console.error("Error playing game over sound:", error);
    }
  }
}

export const soundManager = new SoundManager();

let context: AudioContext;

export abstract class AudioManager {
  static get context() {
    if (!context) context = new AudioContext();
    return context;
  }
}

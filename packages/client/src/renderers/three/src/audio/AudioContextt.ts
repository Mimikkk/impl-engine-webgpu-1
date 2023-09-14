let _context: AudioContext;

export class AudioContextt {
  static getContext() {
    if (_context === undefined) {
      _context = new window.AudioContext();
    }

    return _context;
  }

  static setContext(value: AudioContext) {
    _context = value;
  }
}

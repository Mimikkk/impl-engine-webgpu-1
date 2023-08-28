export class Layers {
  mask: number;

  constructor() {
    this.mask = 1 | 0;
  }

  set(channel: number) {
    this.mask = ((1 << channel) | 0) >>> 0;
  }

  enable(channel: number) {
    this.mask |= (1 << channel) | 0;
  }

  enableAll() {
    this.mask = 0xffffffff | 0;
  }

  toggle(channel: number) {
    this.mask ^= (1 << channel) | 0;
  }

  disable(channel: number) {
    this.mask &= ~((1 << channel) | 0);
  }

  disableAll() {
    this.mask = 0;
  }

  test(layers: Layers) {
    return (this.mask & layers.mask) !== 0;
  }

  isEnabled(channel: number) {
    return (this.mask & ((1 << channel) | 0)) !== 0;
  }
}

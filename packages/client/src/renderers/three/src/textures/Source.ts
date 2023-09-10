import { ImageUtils } from '../extras/ImageUtils.js';
import { MathUtils } from '../math/MathUtils.js';

let sourceId = 0;

export class Source {
  constructor(data = null) {
    this.isSource = true;

    Object.defineProperty(this, 'id', { value: sourceId++ });

    this.uuid = MathUtils.generateUUID();

    this.data = data;

    this.version = 0;
  }

  set needsUpdate(value) {
    if (value === true) this.version++;
  }
}

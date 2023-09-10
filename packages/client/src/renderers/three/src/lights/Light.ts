import { Object3D } from '../core/Object3D.js';
import { Color } from '../math/Color.js';

export class Light extends Object3D {
  constructor(color, intensity = 1) {
    super();

    this.isLight = true;

    this.type = 'Light';

    this.color = new Color(color);
    this.intensity = intensity;
  }

  dispose() {
    // Empty here in base class; some subclasses override.
  }

  copy(source, recursive) {
    super.copy(source, recursive);

    this.color.copy(source.color);
    this.intensity = source.intensity;

    return this;
  }
}

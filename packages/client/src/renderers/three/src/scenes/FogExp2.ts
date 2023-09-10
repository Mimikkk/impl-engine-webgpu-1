import { Color } from '../math/Color.js';

export class FogExp2 {
  constructor(color, density = 0.00025) {
    this.isFogExp2 = true;

    this.name = '';

    this.color = new Color(color);
    this.density = density;
  }

  clone() {
    return new FogExp2(this.color, this.density);
  }
}

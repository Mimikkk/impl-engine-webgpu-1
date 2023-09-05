import { Color } from '../Color.js';

export class FogExp2 {
  isFogExp2: boolean;
  name: string;
  color: Color;
  density: number;
  constructor(color: Color, density: number = 0.00025) {
    this.isFogExp2 = true;

    this.name = '';

    this.color = new Color(color.r, color.g, color.b);
    this.density = density;
  }

  clone() {
    return new FogExp2(this.color, this.density);
  }
}

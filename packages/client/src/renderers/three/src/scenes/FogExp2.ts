import { Color, ColorRepresentation } from '../math/Color.js';

export class FogExp2 {
  declare isFogExp2: true;
  name: string;
  color: Color;
  density: number;

  constructor(color: ColorRepresentation, density: number = 0.00025) {
    this.name = '';
    this.color = new Color(color);
    this.density = density;
  }

  clone() {
    return new FogExp2(this.color, this.density);
  }
}
FogExp2.prototype.isFogExp2 = true;

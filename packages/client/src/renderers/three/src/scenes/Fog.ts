import { Color, ColorRepresentation } from '../math/Color.js';

export class Fog {
  declare isFog: true;
  name: string;
  color: Color;
  near: number;
  far: number;

  constructor(color: ColorRepresentation, near: number = 1, far: number = 1000) {
    this.isFog = true;
    this.name = '';
    this.color = new Color(color);
    this.near = near;
    this.far = far;
  }

  clone(): Fog {
    return new Fog(this.color, this.near, this.far);
  }
}
Fog.prototype.isFog = true;

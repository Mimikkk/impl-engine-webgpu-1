import { Color } from '../Color.js';

export class Fog {
  isFog: boolean;
  name: string;
  color: Color;
  near: number;
  far: number;

  constructor(color: Color, near = 1, far = 1000) {
    this.isFog = true;

    this.name = '';

    this.color = new Color(color.r, color.g, color.b);

    this.near = near;
    this.far = far;
  }

  clone() {
    return new Fog(this.color, this.near, this.far);
  }

  toJSON(meta: any) {
    return {
      type: 'Fog',
      color: this.color.getHex(),
      near: this.near,
      far: this.far,
    };
  }
}

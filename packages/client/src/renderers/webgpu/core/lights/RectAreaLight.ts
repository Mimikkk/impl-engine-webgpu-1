import { Light } from './Light.js';
import { Color } from '../Color.js';

export class RectAreaLight extends Light {
  isRectAreaLight: boolean = true;
  type: string = 'RectAreaLight';
  width: number;
  height: number;

  constructor(color: Color, intensity: number, width: number = 10, height: number = 10) {
    super(color, intensity);
    this.width = width;
    this.height = height;
  }

  get power() {
    return this.intensity * this.width * this.height * Math.PI;
  }

  set power(power) {
    // set the light's intensity (in nits) from the desired luminous power (in lumens)
    this.intensity = power / (this.width * this.height * Math.PI);
  }

  copy(source: RectAreaLight, recursive?: boolean): RectAreaLight {
    super.copy(source);

    this.width = source.width;
    this.height = source.height;

    return this;
  }
}

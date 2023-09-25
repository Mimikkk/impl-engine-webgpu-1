import { Light } from './Light.js';
import { ColorRepresentation } from '../math/Color.js';

export class RectAreaLight extends Light {
  declare isRectAreaLight: boolean;
  declare type: string | 'RectAreaLight';
  width: number;
  height: number;

  constructor(color?: ColorRepresentation, intensity?: number, width: number = 10, height: number = 10) {
    super(color, intensity);

    this.width = width;
    this.height = height;
  }

  get power() {
    // compute the light's luminous power (in lumens) from its intensity (in nits)
    return this.intensity * this.width * this.height * Math.PI;
  }

  set power(power) {
    // set the light's intensity (in nits) from the desired luminous power (in lumens)
    this.intensity = power / (this.width * this.height * Math.PI);
  }

  copy(source: RectAreaLight) {
    super.copy(source);

    this.width = source.width;
    this.height = source.height;

    return this;
  }
}
RectAreaLight.prototype.isRectAreaLight = true;
RectAreaLight.prototype.type = 'RectAreaLight';

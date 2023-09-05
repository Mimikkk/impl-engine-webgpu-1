import { Light } from './Light.js';
import { PointLightShadow } from './PointLightShadow.js';
import { Color } from '../Color.js';

export class PointLight extends Light {
  isPointLight: boolean = true;
  type: string = 'PointLight';
  distance: number;
  decay: number;
  shadow: PointLightShadow;

  constructor(color: Color, intensity: number, distance: number = 0, decay: number = 2) {
    super(color, intensity);

    this.distance = distance;
    this.decay = decay;
    this.shadow = new PointLightShadow();
  }

  /**
   * compute the light's luminous power (in lumens) from its intensity (in candela)
   * for an isotropic light source, luminous power (lm) = 4 π luminous intensity (cd)
   */
  get power() {
    return this.intensity * 4 * Math.PI;
  }

  set power(power: number) {
    this.intensity = power / (4 * Math.PI);
  }

  copy(source: PointLight, recursive?: boolean): PointLight {
    super.copy(source, recursive);

    this.distance = source.distance;
    this.decay = source.decay;
    this.shadow = source.shadow.clone();

    return this;
  }
}

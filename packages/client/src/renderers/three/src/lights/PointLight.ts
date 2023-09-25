import { Light } from './Light.js';
import { PointLightShadow } from './PointLightShadow.js';
import { ColorRepresentation } from '../math/Color.js';

export class PointLight extends Light {
  declare isPointLight: boolean;
  declare type: string | 'PointLight';
  distance: number;
  decay: number;
  shadow: PointLightShadow;

  constructor(color?: ColorRepresentation, intensity?: number, distance: number = 0, decay: number = 2) {
    super(color, intensity);

    this.distance = distance;
    this.decay = decay;
    this.shadow = new PointLightShadow();
  }

  get power() {
    return this.intensity * 4 * Math.PI;
  }

  set power(power) {
    this.intensity = power / (4 * Math.PI);
  }

  dispose() {
    this.shadow.dispose();
  }

  copy(source: PointLight, recursive?: boolean) {
    super.copy(source, recursive);

    this.distance = source.distance;
    this.decay = source.decay;

    this.shadow = source.shadow.clone();

    return this;
  }
}
PointLight.prototype.isPointLight = true;
PointLight.prototype.type = 'PointLight';

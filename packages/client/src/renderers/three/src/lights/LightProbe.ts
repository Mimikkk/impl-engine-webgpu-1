import { SphericalHarmonics3 } from '../math/SphericalHarmonics3.js';
import { Light } from './Light.js';

export class LightProbe extends Light {
  constructor(sh = new SphericalHarmonics3(), intensity = 1) {
    super(undefined, intensity);

    this.isLightProbe = true;

    this.sh = sh;
  }

  copy(source) {
    super.copy(source);

    this.sh.copy(source.sh);

    return this;
  }
}

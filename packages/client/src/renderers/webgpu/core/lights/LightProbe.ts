import { SphericalHarmonics3 } from '../SphericalHarmonics3.js';
import { Light } from './Light.js';

class LightProbe extends Light {
  isLightProbe: boolean = true;
  sphericalHarmonics3: SphericalHarmonics3;

  constructor(sphericalHarmonics3: SphericalHarmonics3 = new SphericalHarmonics3(), intensity: number = 1) {
    super(undefined, intensity);

    this.isLightProbe = true;

    this.sphericalHarmonics3 = sphericalHarmonics3;
  }

  copy(source: LightProbe): LightProbe {
    super.copy(source);
    this.sphericalHarmonics3.copy(source.sphericalHarmonics3);
    return this;
  }
}

export { LightProbe };

import { SphericalHarmonics3 } from '../SphericalHarmonics3.js';
import { Light } from './Light.js';
import { Color } from '../Color.js';

export class LightProbe extends Light {
  isLightProbe: boolean = true;
  sphericalHarmonics3: SphericalHarmonics3;

  constructor(sphericalHarmonics3: SphericalHarmonics3 = new SphericalHarmonics3(), intensity: number = 1) {
    super(new Color(0, 0, 0), intensity);

    this.sphericalHarmonics3 = sphericalHarmonics3;
  }

  copy(source: LightProbe): LightProbe {
    super.copy(source);
    this.sphericalHarmonics3.copy(source.sphericalHarmonics3);
    return this;
  }
}

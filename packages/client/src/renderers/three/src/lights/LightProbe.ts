import { SphericalHarmonics3 } from '../math/SphericalHarmonics3.js';
import { Light } from './Light.js';

export class LightProbe extends Light {
  declare isLightProbe: boolean;
  sh: SphericalHarmonics3;

  constructor(sh: SphericalHarmonics3 = new SphericalHarmonics3(), intensity?: number) {
    super(undefined, intensity);
    this.sh = sh;
  }

  copy(source: LightProbe) {
    super.copy(source);
    this.sh.copy(source.sh);
    return this;
  }
}
LightProbe.prototype.isLightProbe = true;

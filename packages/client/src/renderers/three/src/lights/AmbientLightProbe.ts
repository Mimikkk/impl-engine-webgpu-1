import { Color, ColorRepresentation } from '../math/Color.js';
import { LightProbe } from './LightProbe.js';

export class AmbientLightProbe extends LightProbe {
  declare isAmbientLightProbe: boolean;
  declare type: string | 'AmbientLightProbe';

  constructor(color?: ColorRepresentation, intensity: number = 1) {
    super(undefined, intensity);
    const color1 = new Color().set(color);
    this.sh.coefficients[0].set(color1.r, color1.g, color1.b).multiplyScalar(2 * Math.sqrt(Math.PI));
  }
}
AmbientLightProbe.prototype.isAmbientLightProbe = true;
AmbientLightProbe.prototype.type = 'AmbientLightProbe';

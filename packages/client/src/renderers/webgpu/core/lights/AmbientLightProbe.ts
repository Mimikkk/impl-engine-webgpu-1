import { Color } from '../Color.js';
import { LightProbe } from './LightProbe.js';

export class AmbientLightProbe extends LightProbe {
  isAmbientLightProbe: boolean = true;

  constructor({ r, g, b }: Color, intensity: number = 1) {
    super(undefined, intensity);
    // without extra factor of PI in the shader, would be 2 / Math.sqrt( Math.PI );
    this.sphericalHarmonics3.coefficients[0].set(r, g, b).multiplyScalar(2 * Math.sqrt(Math.PI));
  }
}

import { Color } from '../Color.js';
import { Vector3 } from '../Vector3.js';
import { LightProbe } from './LightProbe.js';

export class HemisphereLightProbe extends LightProbe {
  isHemisphereLightProbe: boolean = true;

  constructor(skyColor: Color, groundColor: Color, intensity: number = 1) {
    super(undefined, intensity);

    this.isHemisphereLightProbe = true;

    const sky = new Vector3(skyColor.r, skyColor.g, skyColor.b);
    const ground = new Vector3(groundColor.r, groundColor.g, groundColor.b);

    // without extra factor of PI in the shader, should = 1 / Math.sqrt( Math.PI );
    const c0 = Math.sqrt(Math.PI);
    const c1 = c0 * Math.sqrt(0.75);

    this.sphericalHarmonics3.coefficients[0].copy(sky).add(ground).multiplyScalar(c0);
    this.sphericalHarmonics3.coefficients[1].copy(sky).sub(ground).multiplyScalar(c1);
  }
}

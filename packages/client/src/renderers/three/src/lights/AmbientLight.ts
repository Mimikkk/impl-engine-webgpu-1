import { Light } from './Light.js';
import { ColorRepresentation } from '../math/Color.js';

export class AmbientLight extends Light {
  declare isAmbientLight: boolean;
  declare type: string | 'AmbientLight';

  constructor(color?: ColorRepresentation, intensity?: number) {
    super(color, intensity);
  }
}
AmbientLight.prototype.isAmbientLight = true;
AmbientLight.prototype.type = 'AmbientLight';

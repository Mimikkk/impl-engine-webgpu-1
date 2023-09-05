import { Light } from './Light.js';
import { Color } from '../Color.js';

export class AmbientLight extends Light {
  isAmbientLight: boolean = true;
  type = 'AmbientLight';

  constructor(color: Color, intensity: number) {
    super(color, intensity);
  }
}

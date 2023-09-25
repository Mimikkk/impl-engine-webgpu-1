import { Light } from './Light.js';
import { Color, ColorRepresentation } from '../math/Color.js';
import { Object3D } from '../core/Object3D.js';

export class HemisphereLight extends Light {
  declare isHemisphereLight: boolean;
  declare type: string | 'HemisphereLight';
  groundColor: Color;

  constructor(skyColor?: ColorRepresentation, groundColor?: ColorRepresentation, intensity?: number) {
    super(skyColor, intensity);

    this.position.copy(Object3D.DEFAULT_UP);
    this.updateMatrix();

    this.groundColor = new Color(groundColor);
  }

  copy(source: HemisphereLight, recursive?: boolean) {
    super.copy(source, recursive);

    this.groundColor.copy(source.groundColor);

    return this;
  }
}

HemisphereLight.prototype.isHemisphereLight = true;
HemisphereLight.prototype.type = 'HemisphereLight';

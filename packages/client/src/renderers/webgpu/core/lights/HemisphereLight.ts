import { Light } from './Light.js';
import { Color } from '../Color.js';
import { Object3D } from '../Object3D.js';

export class HemisphereLight extends Light {
  isHemisphereLight: boolean = true;
  type: string = 'HemisphereLight';

  groundColor: Color;

  constructor(skyColor: Color, groundColor: Color, intensity: number) {
    super(skyColor, intensity);

    this.position.copy(Object3D.DEFAULT_UP);
    this.updateMatrix();

    this.groundColor = new Color(groundColor);
  }

  copy(source: HemisphereLight, recursive?: boolean): HemisphereLight {
    super.copy(source, recursive);

    this.groundColor.copy(source.groundColor);

    return this;
  }
}

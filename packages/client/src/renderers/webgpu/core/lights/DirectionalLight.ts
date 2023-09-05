import { Light } from './Light.js';
import { DirectionalLightShadow } from './DirectionalLightShadow.js';
import { Object3D } from '../Object3D.js';
import { Color } from '../Color.js';
import { Vector3 } from '../Vector3.js';

export class DirectionalLight extends Light {
  isDirectionalLight: boolean = true;
  type: string = 'DirectionalLight';
  target: Object3D;
  position: Vector3 = Object3D.DEFAULT_UP;
  shadow: DirectionalLightShadow;

  constructor(color: Color, intensity: number) {
    super(color, intensity);

    this.position.copy(Object3D.DEFAULT_UP);
    this.updateMatrix();

    this.target = new Object3D();
    this.shadow = new DirectionalLightShadow();
  }

  copy(source: DirectionalLight, recursive?: boolean): DirectionalLight {
    super.copy(source, recursive);

    this.target = source.target.clone();
    this.shadow = source.shadow.clone();

    return this;
  }
}

import { Light } from './Light.js';
import { DirectionalLightShadow } from './DirectionalLightShadow.js';
import { Object3D } from '../core/Object3D.js';
import { ColorRepresentation } from '../math/Color.js';

export class DirectionalLight extends Light {
  declare isDirectionalLight: boolean;
  declare type: string | 'DirectionalLight';
  shadow: DirectionalLightShadow;

  constructor(color?: ColorRepresentation, intensity?: number) {
    super(color, intensity);

    this.isDirectionalLight = true;

    this.type = 'DirectionalLight';

    this.position.copy(Object3D.DEFAULT_UP);
    this.updateMatrix();

    this.target = new Object3D();

    this.shadow = new DirectionalLightShadow();
  }

  dispose() {
    this.shadow.dispose();
  }

  copy(source: DirectionalLight) {
    super.copy(source);

    this.target = source.target.clone();
    this.shadow = source.shadow.clone();

    return this;
  }
}
DirectionalLight.prototype.isDirectionalLight = true;
DirectionalLight.prototype.type = 'DirectionalLight';

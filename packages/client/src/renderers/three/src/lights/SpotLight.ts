import { Light } from './Light.js';
import { SpotLightShadow } from './SpotLightShadow.js';
import { Object3D } from '../core/Object3D.js';
import { ColorRepresentation } from '../math/Color.js';
import { Texture } from '../textures/Texture.js';

export class SpotLight extends Light {
  declare isSpotLight: boolean;
  declare type: string | 'SpotLight';
  distance: number;
  angle: number;
  penumbra: number;
  decay: number;
  shadow: SpotLightShadow;
  castShadow: boolean;
  map: Texture | null;

  constructor(
    color?: ColorRepresentation,
    intensity?: number,
    distance: number = 0,
    angle: number = Math.PI / 3,
    penumbra: number = 0,
    decay: number = 2,
  ) {
    super(color, intensity);

    this.isSpotLight = true;
    this.type = 'SpotLight';

    this.position.copy(Object3D.DEFAULT_UP);
    this.updateMatrix();

    this.target = new Object3D();

    this.distance = distance;
    this.angle = angle;
    this.penumbra = penumbra;
    this.decay = decay;

    this.map = null;

    this.shadow = new SpotLightShadow();
  }

  get power() {
    return this.intensity * Math.PI;
  }

  set power(power) {
    this.intensity = power / Math.PI;
  }

  dispose() {
    this.shadow.dispose();
  }

  copy(source: SpotLight, recursive?: boolean) {
    super.copy(source, recursive);

    this.distance = source.distance;
    this.angle = source.angle;
    this.penumbra = source.penumbra;
    this.decay = source.decay;

    this.target = source.target.clone();

    this.shadow = source.shadow.clone();

    return this;
  }
}
SpotLight.prototype.isSpotLight = true;
SpotLight.prototype.type = 'SpotLight';

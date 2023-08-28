import { CubeTexture, Object3D, Texture } from 'three';
import { Color } from '../Color.js';
import { Fog } from './Fog.js';
import { FogExp2 } from './FogExp2.js';
import { Material } from '../materials/Material.js';

export class Scene extends Object3D {
  isScene: boolean = true;
  type: string = 'Scene';
  background: Color | Texture | CubeTexture | null;
  environment: Texture | null;
  fog: Fog | FogExp2 | null;
  backgroundBlurriness: number;
  backgroundIntensity: number;
  overrideMaterial: Material | null;

  constructor() {
    super();

    this.background = null;
    this.environment = null;
    this.fog = null;

    this.backgroundBlurriness = 0;
    this.backgroundIntensity = 1;

    this.overrideMaterial = null;
  }

  copy(source: Scene, recursive?: boolean) {
    super.copy(source as this, recursive);

    if (source.background) this.background = source.background.clone();
    if (source.environment) this.environment = source.environment.clone();
    if (source.fog) this.fog = source.fog.clone();

    this.backgroundBlurriness = source.backgroundBlurriness;
    this.backgroundIntensity = source.backgroundIntensity;

    if (source.overrideMaterial) this.overrideMaterial = source.overrideMaterial.clone();

    this.matrixAutoUpdate = source.matrixAutoUpdate;

    return this;
  }

  toJSON(meta: any) {
    const data = super.toJSON(meta);

    if (this.fog !== null) data.object.fog = this.fog.toJSON();
    if (this.backgroundBlurriness > 0) data.object.backgroundBlurriness = this.backgroundBlurriness;
    if (this.backgroundIntensity !== 1) data.object.backgroundIntensity = this.backgroundIntensity;

    return data;
  }
}

import { Object3D } from '../core/Object3D.js';
import { FogExp2 } from './FogExp2.js';
import { Fog } from './Fog.js';
import { Material } from '../materials/Material.js';
import { Color } from '../math/Color.js';
import { Texture } from '../textures/Texture.js';
import { CubeTexture } from '../textures/CubeTexture.js';

export class Scene extends Object3D {
  declare isScene: true;
  declare type: 'Scene';
  fog: Fog | FogExp2 | null;
  background: Color | Texture | CubeTexture | null;
  environment: Texture | null;
  backgroundBlurriness: number;
  backgroundIntensity: number;
  overrideMaterial: Material | null;

  constructor() {
    super();

    this.type = 'Scene';

    this.background = null;
    this.environment = null;
    this.fog = null;

    this.backgroundBlurriness = 0;
    this.backgroundIntensity = 1;

    this.overrideMaterial = null;
  }

  copy(source: Scene, recursive?: boolean): this {
    super.copy(source, recursive);

    if (source.background !== null) this.background = source.background.clone();
    if (source.environment !== null) this.environment = source.environment.clone();
    if (source.fog !== null) this.fog = source.fog.clone();

    this.backgroundBlurriness = source.backgroundBlurriness;
    this.backgroundIntensity = source.backgroundIntensity;
    if (source.overrideMaterial !== null) this.overrideMaterial = source.overrideMaterial.clone();
    this.matrixAutoUpdate = source.matrixAutoUpdate;

    return this;
  }
}
Scene.prototype.isScene = true;
Scene.prototype.type = 'Scene';

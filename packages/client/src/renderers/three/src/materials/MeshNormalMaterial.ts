import { TangentSpaceNormalMap } from '../constants.js';
import { Material } from './Material.js';
import { Vector2 } from '../math/Vector2.js';
import { Texture } from '../textures/Texture.js';

export class MeshNormalMaterial extends Material {
  declare isMeshNormalMaterial: boolean;
  declare type: string | 'MeshNormalMaterial';
  bumpMap: Texture | null;
  bumpScale: number;
  normalMap: Texture | null;
  normalMapType: number;
  normalScale: Vector2;
  displacementMap: Texture | null;
  displacementScale: number;
  displacementBias: number;
  wireframe: boolean;
  wireframeLinewidth: number;
  flatShading: boolean;

  constructor(parameters?: Material.Parameters) {
    super();

    this.isMeshNormalMaterial = true;

    this.type = 'MeshNormalMaterial';

    this.bumpMap = null;
    this.bumpScale = 1;

    this.normalMap = null;
    this.normalMapType = TangentSpaceNormalMap;
    this.normalScale = new Vector2(1, 1);

    this.displacementMap = null;
    this.displacementScale = 1;
    this.displacementBias = 0;

    this.wireframe = false;
    this.wireframeLinewidth = 1;

    this.flatShading = false;

    this.setValues(parameters);
  }

  copy(source: MeshNormalMaterial) {
    super.copy(source);

    this.bumpMap = source.bumpMap;
    this.bumpScale = source.bumpScale;

    this.normalMap = source.normalMap;
    this.normalMapType = source.normalMapType;
    this.normalScale.copy(source.normalScale);

    this.displacementMap = source.displacementMap;
    this.displacementScale = source.displacementScale;
    this.displacementBias = source.displacementBias;

    this.wireframe = source.wireframe;
    this.wireframeLinewidth = source.wireframeLinewidth;

    this.flatShading = source.flatShading;

    return this;
  }
}

import { Material } from './Material.js';
import { BasicDepthPacking } from '../constants.js';
import { Texture } from '../textures/Texture.js';

export class MeshDepthMaterial extends Material {
  declare isMeshDepthMaterial: boolean;
  declare type: string | 'MeshDepthMaterial';
  depthPacking: number;
  map: Texture | null;
  alphaMap: Texture | null;
  displacementMap: Texture | null;
  displacementScale: number;
  displacementBias: number;
  wireframe: boolean;
  wireframeLinewidth: number;

  constructor(parameters?: Material.Parameters) {
    super();

    this.isMeshDepthMaterial = true;

    this.type = 'MeshDepthMaterial';

    this.depthPacking = BasicDepthPacking;
    this.map = null;
    this.alphaMap = null;
    this.displacementMap = null;
    this.displacementScale = 1;
    this.displacementBias = 0;

    this.wireframe = false;
    this.wireframeLinewidth = 1;

    this.setValues(parameters);
  }

  copy(source: MeshDepthMaterial) {
    super.copy(source);

    this.depthPacking = source.depthPacking;

    this.map = source.map;

    this.alphaMap = source.alphaMap;

    this.displacementMap = source.displacementMap;
    this.displacementScale = source.displacementScale;
    this.displacementBias = source.displacementBias;

    this.wireframe = source.wireframe;
    this.wireframeLinewidth = source.wireframeLinewidth;

    return this;
  }
}

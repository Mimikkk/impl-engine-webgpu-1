import { Material } from './Material.js';
import { BasicDepthPacking } from '../../common/Constants.js';

export class MeshDepthMaterial extends Material {
  isMeshDepthMaterial: boolean;
  depthPacking: number;
  map: null;
  alphaMap: null;
  displacementMap: null;
  displacementBias: number;
  displacementScale: number;
  wireframe: boolean;
  wireframeLinewidth: number;
  constructor(parameters?: any) {
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

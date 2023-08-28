import { TangentSpaceNormalMap } from '../../common/Constants.js';
import { Material } from './Material.js';
import { Vector2 } from '../Vector2.js';

export class MeshNormalMaterial extends Material {
  isMeshNormalMaterial: boolean;
  bumpMap: null;
  bumpScale: number;
  normalMap: null;
  normalMapType: number;
  normalScale: Vector2;
  displacementScale: number;
  displacementMap: null;
  displacementBias: number;
  wireframeLinewidth: number;
  wireframe: boolean;
  flatShading: boolean;
  constructor(parameters?: any) {
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

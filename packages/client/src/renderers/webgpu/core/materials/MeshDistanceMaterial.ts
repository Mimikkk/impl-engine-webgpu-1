import { Material } from './Material.js';

export class MeshDistanceMaterial extends Material {
  isMeshDistanceMaterial: boolean;
  map: null;
  alphaMap: null;
  displacementMap: null;
  displacementScale: number;
  displacementBias: number;
  constructor(parameters?: any) {
    super();

    this.isMeshDistanceMaterial = true;

    this.type = 'MeshDistanceMaterial';

    this.map = null;

    this.alphaMap = null;

    this.displacementMap = null;
    this.displacementScale = 1;
    this.displacementBias = 0;

    this.setValues(parameters);
  }

  copy(source: MeshDistanceMaterial) {
    super.copy(source);

    this.map = source.map;

    this.alphaMap = source.alphaMap;

    this.displacementMap = source.displacementMap;
    this.displacementScale = source.displacementScale;
    this.displacementBias = source.displacementBias;

    return this;
  }
}

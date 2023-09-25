import { Material } from './Material.js';
import { Texture } from '../textures/Texture.js';

export class MeshDistanceMaterial extends Material {
  declare isMeshDistanceMaterial: boolean;
  declare type: string | 'MeshDistanceMaterial';
  map: Texture | null;
  alphaMap: Texture | null;
  displacementMap: Texture | null;
  displacementScale: number;
  displacementBias: number;

  constructor(parameters?: Material.Parameters) {
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

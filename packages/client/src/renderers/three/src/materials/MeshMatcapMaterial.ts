import { TangentSpaceNormalMap } from '../constants.js';
import { Material } from './Material.js';
import { Vector2 } from '../math/Vector2.js';
import { Color } from '../math/Color.js';
import { Texture } from '../textures/Texture.js';

export class MeshMatcapMaterial extends Material {
  declare isMeshMatcapMaterial: boolean;
  declare type: string | 'MeshMatcapMaterial';
  color: Color;
  matcap: Texture | null;
  map: Texture | null;
  bumpMap: Texture | null;
  bumpScale: number;
  normalMap: Texture | null;
  normalMapType: number;
  normalScale: Vector2;
  displacementMap: Texture | null;
  displacementScale: number;
  displacementBias: number;
  alphaMap: Texture | null;
  flatShading: boolean;
  fog: boolean;

  constructor(parameters?: Material.Parameters) {
    super();

    this.isMeshMatcapMaterial = true;

    this.defines = { MATCAP: '' };

    this.type = 'MeshMatcapMaterial';

    this.color = new Color(0xffffff); // diffuse

    this.matcap = null;

    this.map = null;

    this.bumpMap = null;
    this.bumpScale = 1;

    this.normalMap = null;
    this.normalMapType = TangentSpaceNormalMap;
    this.normalScale = new Vector2(1, 1);

    this.displacementMap = null;
    this.displacementScale = 1;
    this.displacementBias = 0;

    this.alphaMap = null;

    this.flatShading = false;

    this.fog = true;

    this.setValues(parameters);
  }

  copy(source: MeshMatcapMaterial) {
    super.copy(source);

    this.defines = { MATCAP: '' };

    this.color.copy(source.color);

    this.matcap = source.matcap;

    this.map = source.map;

    this.bumpMap = source.bumpMap;
    this.bumpScale = source.bumpScale;

    this.normalMap = source.normalMap;
    this.normalMapType = source.normalMapType;
    this.normalScale.copy(source.normalScale);

    this.displacementMap = source.displacementMap;
    this.displacementScale = source.displacementScale;
    this.displacementBias = source.displacementBias;

    this.alphaMap = source.alphaMap;

    this.flatShading = source.flatShading;

    this.fog = source.fog;

    return this;
  }
}

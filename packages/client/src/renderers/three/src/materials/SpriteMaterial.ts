import { Material } from './Material.js';
import { Color } from '../math/Color.js';
import { Texture } from '../textures/Texture.js';

export class SpriteMaterial extends Material {
  declare isSpriteMaterial: boolean;
  declare type: string | 'SpriteMaterial';
  color: Color;
  map: Texture | null;
  alphaMap: Texture | null;
  rotation: number;
  sizeAttenuation: boolean;
  fog: boolean;

  constructor(parameters?: Material.Parameters) {
    super();

    this.isSpriteMaterial = true;

    this.type = 'SpriteMaterial';

    this.color = new Color(0xffffff);

    this.map = null;

    this.alphaMap = null;

    this.rotation = 0;

    this.sizeAttenuation = true;

    this.transparent = true;

    this.fog = true;

    this.setValues(parameters);
  }

  copy(source: SpriteMaterial) {
    super.copy(source);

    this.color.copy(source.color);

    this.map = source.map;

    this.alphaMap = source.alphaMap;

    this.rotation = source.rotation;

    this.sizeAttenuation = source.sizeAttenuation;

    this.fog = source.fog;

    return this;
  }
}

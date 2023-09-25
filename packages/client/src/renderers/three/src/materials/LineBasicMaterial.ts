import { Material } from './Material.js';
import { Color } from '../math/Color.js';
import { Texture } from '../textures/Texture.js';

export class LineBasicMaterial extends Material {
  declare isLineBasicMaterial: boolean;
  declare type: string | 'LineBasicMaterial';
  color: Color;
  map: Texture | null;
  linewidth: number;
  linecap: string;
  linejoin: string;
  fog: boolean;

  constructor(parameters?: Material.Parameters) {
    super();

    this.isLineBasicMaterial = true;

    this.type = 'LineBasicMaterial';

    this.color = new Color(0xffffff);

    this.map = null;

    this.linewidth = 1;
    this.linecap = 'round';
    this.linejoin = 'round';

    this.fog = true;

    this.setValues(parameters);
  }

  copy(source: LineBasicMaterial) {
    super.copy(source);
    this.color.copy(source.color);

    this.map = source.map;
    this.linewidth = source.linewidth;
    this.linecap = source.linecap;
    this.linejoin = source.linejoin;
    this.fog = source.fog;

    return this;
  }
}

import { Material } from './Material.js';
import { Color } from '../Color.js';

export class LineBasicMaterial extends Material {
  isLineBasicMaterial: boolean = true;
  color: Color;
  map: null;
  linewidth: number;
  linecap: string;
  linejoin: string;
  private fog: boolean;

  constructor(parameters?: any) {
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

import { Material } from './Material.js';
import { Color } from '../Color.js';

export class PointsMaterial extends Material {
  isPointsMaterial: boolean;
  color: Color;
  map: null;
  alphaMap: null;
  size: number;
  sizeAttenuation: boolean;
  fog: boolean;
  constructor(parameters?: any) {
    super();

    this.isPointsMaterial = true;

    this.type = 'PointsMaterial';

    this.color = new Color(0xffffff);

    this.map = null;

    this.alphaMap = null;

    this.size = 1;
    this.sizeAttenuation = true;

    this.fog = true;

    this.setValues(parameters);
  }

  copy(source: PointsMaterial) {
    super.copy(source);

    this.color.copy(source.color);

    this.map = source.map;

    this.alphaMap = source.alphaMap;

    this.size = source.size;
    this.sizeAttenuation = source.sizeAttenuation;

    this.fog = source.fog;

    return this;
  }
}

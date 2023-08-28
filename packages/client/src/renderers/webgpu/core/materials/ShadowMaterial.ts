import { Material } from './Material.js';
import { Color } from '../Color.js';

export class ShadowMaterial extends Material {
  fog: boolean;
  color: Color;
  isShadowMaterial: boolean;
  constructor(parameters?: any) {
    super();

    this.isShadowMaterial = true;

    this.type = 'ShadowMaterial';

    this.color = new Color(0x000000);
    this.transparent = true;

    this.fog = true;

    this.setValues(parameters);
  }

  copy(source: ShadowMaterial) {
    super.copy(source);

    this.color.copy(source.color);

    this.fog = source.fog;

    return this;
  }
}

import { Material } from './Material.js';
import { Color } from '../math/Color.js';

export class ShadowMaterial extends Material {
  declare isShadowMaterial: boolean;
  declare type: string | 'ShadowMaterial';
  color: Color;
  fog: boolean;

  constructor(parameters?: Material.Parameters) {
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

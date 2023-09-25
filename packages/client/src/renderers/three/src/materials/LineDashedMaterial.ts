import { LineBasicMaterial } from './LineBasicMaterial.js';
import { Material } from './Material.js';

export class LineDashedMaterial extends LineBasicMaterial {
  declare isLineDashedMaterial: boolean;
  declare type: string | 'LineDashedMaterial';
  scale: number;
  dashSize: number;
  gapSize: number;

  constructor(parameters?: Material.Parameters) {
    super();

    this.isLineDashedMaterial = true;

    this.type = 'LineDashedMaterial';

    this.scale = 1;
    this.dashSize = 3;
    this.gapSize = 1;

    this.setValues(parameters);
  }

  copy(source: LineDashedMaterial) {
    super.copy(source);

    this.scale = source.scale;
    this.dashSize = source.dashSize;
    this.gapSize = source.gapSize;

    return this;
  }
}

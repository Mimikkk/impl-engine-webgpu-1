import { LineBasicMaterial } from './LineBasicMaterial.js';

export class LineDashedMaterial extends LineBasicMaterial {
  isLineDashedMaterial: boolean = true;
  type: string = 'LineDashedMaterial';
  scale: number;
  dashSize: number;
  gapSize: number;

  constructor(parameters?: any) {
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

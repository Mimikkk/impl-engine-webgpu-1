import { Line } from './Line.js';
import { BufferGeometry } from '../core/BufferGeometry.js';
import { Material } from '../materials/Material.js';
import { LineBasicMaterial } from '../materials/LineBasicMaterial.js';

export class LineLoop extends Line {
  declare isLineLoop: true;
  declare type: string | 'LineLoop';

  constructor(geometry: BufferGeometry, material: LineBasicMaterial) {
    super(geometry, material);

    this.isLineLoop = true;

    this.type = 'LineLoop';
  }
}

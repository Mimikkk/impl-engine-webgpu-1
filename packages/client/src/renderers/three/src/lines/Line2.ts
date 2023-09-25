import { LineSegments2 } from './LineSegments2.js';
import { LineGeometry } from './LineGeometry.js';
import { LineMaterial } from './LineMaterial.js';

export class Line2 extends LineSegments2 {
  declare isLine2: boolean;
  declare type: string;

  constructor(geometry = new LineGeometry(), material = new LineMaterial({ color: Math.random() * 0xffffff })) {
    super(geometry, material);
  }
}
Line2.prototype.isLine2 = true;
Line2.prototype.type = 'Line2';

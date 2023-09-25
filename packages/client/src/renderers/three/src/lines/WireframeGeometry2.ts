import { LineSegmentsGeometry } from './LineSegmentsGeometry.js';
import { WireframeGeometry } from '../geometries/WireframeGeometry.js';
import { BufferGeometry } from '../core/BufferGeometry.js';

export class WireframeGeometry2 extends LineSegmentsGeometry {
  declare isWireframeGeometry2: boolean;
  declare type: string;

  constructor(geometry: BufferGeometry) {
    super();
    this.fromWireframeGeometry(new WireframeGeometry(geometry));
  }
}
WireframeGeometry2.prototype.isWireframeGeometry2 = true;
WireframeGeometry2.prototype.type = 'WireframeGeometry2';

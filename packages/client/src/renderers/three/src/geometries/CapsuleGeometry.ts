import { Path } from '../extras/core/Path.js';
import { LatheGeometry } from './LatheGeometry.js';
import { Vector2 } from '../math/Vector2.js';

export class CapsuleGeometry extends LatheGeometry {
  constructor(radius: number = 1, length: number = 1, capSegments: number = 4, radialSegments: number = 8) {
    const path = new Path();
    path.absarc(0, -length / 2, radius, Math.PI * 1.5, 0, false);
    path.absarc(0, length / 2, radius, 0, Math.PI * 0.5, false);

    super(path.getPoints(capSegments) as [Vector2, Vector2, Vector2], radialSegments);

    this.type = 'CapsuleGeometry';

    this.parameters = {
      radius: radius,
      length: length,
      capSegments: capSegments,
      radialSegments: radialSegments,
    };
  }
}

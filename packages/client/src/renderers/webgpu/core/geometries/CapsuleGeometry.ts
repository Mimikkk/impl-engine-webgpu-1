import { Path } from 'three';
import { LatheGeometry } from './LatheGeometry.js';

//@ts-expect-error
export class CapsuleGeometry extends LatheGeometry {
  constructor(radius: number = 1, length: number = 1, capSegments: number = 4, radialSegments: number = 8) {
    const path = new Path();
    path.absarc(0, -length / 2, radius, Math.PI * 1.5, 0, false);
    path.absarc(0, length / 2, radius, 0, Math.PI * 0.5, false);

    super(path.getPoints(capSegments), radialSegments);

    this.type = 'CapsuleGeometry';

    this.parameters = {
      radius: radius,
      length: length,
      capSegments: capSegments,
      radialSegments: radialSegments,
    };
  }

  static fromJSON(data: { radius: number; length: number; capSegments: number; radialSegments: number }) {
    return new CapsuleGeometry(data.radius, data.length, data.capSegments, data.radialSegments);
  }
}

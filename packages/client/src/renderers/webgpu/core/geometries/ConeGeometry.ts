import { CylinderGeometry } from './CylinderGeometry.js';

export class ConeGeometry extends CylinderGeometry {
  constructor(
    radius: number = 1,
    height: number = 1,
    radialSegments: number = 32,
    heightSegments: number = 1,
    openEnded: boolean = false,
    thetaStart: number = 0,
    thetaLength: number = Math.PI * 2,
  ) {
    super(0, radius, height, radialSegments, heightSegments, openEnded, thetaStart, thetaLength);

    this.type = 'ConeGeometry';

    this.parameters = {
      radius: radius,
      height: height,
      radialSegments: radialSegments,
      heightSegments: heightSegments,
      openEnded: openEnded,
      thetaStart: thetaStart,
      thetaLength: thetaLength,
    };
  }
}

import { EllipseCurve } from './EllipseCurve.js';

export class ArcCurve extends EllipseCurve {
  isArcCurve: boolean = true;
  type: string = 'ArcCurve';

  constructor(aX: number, aY: number, aRadius: number, aStartAngle: number, aEndAngle: number, aClockwise: boolean) {
    super(aX, aY, aRadius, aRadius, aStartAngle, aEndAngle, aClockwise);
  }
}

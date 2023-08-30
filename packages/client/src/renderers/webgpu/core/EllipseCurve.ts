import { Curve } from './Curve.js';
import { Vector2 } from './Vector2.js';

export class EllipseCurve extends Curve<Vector2> {
  isEllipseCurve: boolean;
  aX: number;
  aY: number;
  xRadius: number;
  yRadius: number;
  aStartAngle: number;
  aEndAngle: number;
  aClockwise: boolean;
  aRotation: number;
  constructor(
    aX: number = 0,
    aY: number = 0,
    xRadius: number = 1,
    yRadius: number = 1,
    aStartAngle: number = 0,
    aEndAngle: number = Math.PI * 2,
    aClockwise: boolean = false,
    aRotation: number = 0,
  ) {
    super();

    this.isEllipseCurve = true;

    this.type = 'EllipseCurve';

    this.aX = aX;
    this.aY = aY;

    this.xRadius = xRadius;
    this.yRadius = yRadius;

    this.aStartAngle = aStartAngle;
    this.aEndAngle = aEndAngle;

    this.aClockwise = aClockwise;

    this.aRotation = aRotation;
  }

  getPoint(t: number, optionalTarget?: Vector2): Vector2 {
    const point = optionalTarget || new Vector2();

    const twoPi = Math.PI * 2;
    let deltaAngle = this.aEndAngle - this.aStartAngle;
    const samePoints = Math.abs(deltaAngle) < Number.EPSILON;

    // ensures that deltaAngle is 0 … 2 PI
    while (deltaAngle < 0) deltaAngle += twoPi;
    while (deltaAngle > twoPi) deltaAngle -= twoPi;

    if (deltaAngle < Number.EPSILON) {
      if (samePoints) {
        deltaAngle = 0;
      } else {
        deltaAngle = twoPi;
      }
    }

    if (this.aClockwise && !samePoints) {
      if (deltaAngle === twoPi) {
        deltaAngle = -twoPi;
      } else {
        deltaAngle = deltaAngle - twoPi;
      }
    }

    const angle = this.aStartAngle + t * deltaAngle;
    let x = this.aX + this.xRadius * Math.cos(angle);
    let y = this.aY + this.yRadius * Math.sin(angle);

    if (this.aRotation !== 0) {
      const cos = Math.cos(this.aRotation);
      const sin = Math.sin(this.aRotation);

      const tx = x - this.aX;
      const ty = y - this.aY;

      // Rotate the point about the center of the ellipse.
      x = tx * cos - ty * sin + this.aX;
      y = tx * sin + ty * cos + this.aY;
    }

    return point.set(x, y);
  }

  copy(source: EllipseCurve): EllipseCurve {
    super.copy(source);

    this.aX = source.aX;
    this.aY = source.aY;

    this.xRadius = source.xRadius;
    this.yRadius = source.yRadius;

    this.aStartAngle = source.aStartAngle;
    this.aEndAngle = source.aEndAngle;

    this.aClockwise = source.aClockwise;

    this.aRotation = source.aRotation;

    return this;
  }

  toJSON() {
    const data = super.toJSON();

    data.aX = this.aX;
    data.aY = this.aY;

    data.xRadius = this.xRadius;
    data.yRadius = this.yRadius;

    data.aStartAngle = this.aStartAngle;
    data.aEndAngle = this.aEndAngle;

    data.aClockwise = this.aClockwise;

    data.aRotation = this.aRotation;

    return data;
  }

  fromJSON(json: {
    arcLengthDivisions: number;
    aX: number;
    aY: number;
    xRadius: number;
    yRadius: number;
    aStartAngle: number;
    aEndAngle: number;
    aClockwise: boolean;
    aRotation: number;
  }): EllipseCurve {
    super.fromJSON(json);

    this.aX = json.aX;
    this.aY = json.aY;
    this.xRadius = json.xRadius;
    this.yRadius = json.yRadius;
    this.aStartAngle = json.aStartAngle;
    this.aEndAngle = json.aEndAngle;
    this.aClockwise = json.aClockwise;
    this.aRotation = json.aRotation;

    return this;
  }
}

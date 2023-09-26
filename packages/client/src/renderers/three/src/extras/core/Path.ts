import { Vector2 } from '../../math/Vector2.js';
import { CurvePath } from './CurvePath.js';
import { EllipseCurve } from '../curves/EllipseCurve.js';
import { SplineCurve } from '../curves/SplineCurve.js';
import { CubicBezierCurve } from '../curves/CubicBezierCurve.js';
import { QuadraticBezierCurve } from '../curves/QuadraticBezierCurve.js';
import { LineCurve } from '../curves/LineCurve.js';

export class Path extends CurvePath {
  type: string;
  currentPoint: Vector2;
  constructor(points?: Vector2[]) {
    super();

    this.type = 'Path';

    this.currentPoint = new Vector2();

    if (points) {
      this.setFromPoints(points);
    }
  }

  setFromPoints(points: Vector2[]) {
    this.moveTo(points[0].x, points[0].y);

    for (let i = 1, l = points.length; i < l; i++) {
      this.lineTo(points[i].x, points[i].y);
    }

    return this;
  }

  moveTo(x: number, y: number) {
    this.currentPoint.set(x, y); // TODO consider referencing vectors instead of copying?

    return this;
  }

  lineTo(x: number, y: number) {
    const curve = new LineCurve(this.currentPoint.clone(), new Vector2(x, y));
    this.curves.push(curve);

    this.currentPoint.set(x, y);

    return this;
  }

  quadraticCurveTo(aCPx: number, aCPy: number, aX: number, aY: number) {
    const curve = new QuadraticBezierCurve(this.currentPoint.clone(), new Vector2(aCPx, aCPy), new Vector2(aX, aY));

    this.curves.push(curve);

    this.currentPoint.set(aX, aY);

    return this;
  }

  bezierCurveTo(aCP1x: number, aCP1y: number, aCP2x: number, aCP2y: number, aX: number, aY: number) {
    const curve = new CubicBezierCurve(
      this.currentPoint.clone(),
      new Vector2(aCP1x, aCP1y),
      new Vector2(aCP2x, aCP2y),
      new Vector2(aX, aY),
    );

    this.curves.push(curve);

    this.currentPoint.set(aX, aY);

    return this;
  }

  splineThru(pts: Vector2[]) {
    const npts = [this.currentPoint.clone()].concat(pts);

    const curve = new SplineCurve(npts);
    this.curves.push(curve);

    this.currentPoint.copy(pts[pts.length - 1]);

    return this;
  }

  arc(aX: number, aY: number, aRadius: number, aStartAngle: number, aEndAngle: number, aClockwise: boolean) {
    const x0 = this.currentPoint.x;
    const y0 = this.currentPoint.y;

    this.absarc(aX + x0, aY + y0, aRadius, aStartAngle, aEndAngle, aClockwise);

    return this;
  }

  absarc(aX: number, aY: number, aRadius: number, aStartAngle: number, aEndAngle: number, aClockwise: boolean) {
    this.absellipse(aX, aY, aRadius, aRadius, aStartAngle, aEndAngle, aClockwise, 0);

    return this;
  }

  ellipse(
    aX: number,
    aY: number,
    xRadius: number,
    yRadius: number,
    aStartAngle: number,
    aEndAngle: number,
    aClockwise: boolean,
    aRotation: number,
  ) {
    const x0 = this.currentPoint.x;
    const y0 = this.currentPoint.y;

    this.absellipse(aX + x0, aY + y0, xRadius, yRadius, aStartAngle, aEndAngle, aClockwise, aRotation);

    return this;
  }

  absellipse(
    aX: number,
    aY: number,
    xRadius: number,
    yRadius: number,
    aStartAngle: number,
    aEndAngle: number,
    aClockwise: boolean,
    aRotation: number,
  ) {
    const curve = new EllipseCurve(aX, aY, xRadius, yRadius, aStartAngle, aEndAngle, aClockwise, aRotation);

    if (this.curves.length > 0) {
      // if a previous curve is present, attempt to join
      const firstPoint = curve.getPoint(0);

      if (!firstPoint.equals(this.currentPoint)) {
        this.lineTo(firstPoint.x, firstPoint.y);
      }
    }

    this.curves.push(curve);

    const lastPoint = curve.getPoint(1);
    this.currentPoint.copy(lastPoint);

    return this;
  }

  copy(source: Path) {
    super.copy(source);

    this.currentPoint.copy(source.currentPoint);

    return this;
  }
}

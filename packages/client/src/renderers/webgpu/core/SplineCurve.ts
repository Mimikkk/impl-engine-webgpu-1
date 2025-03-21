import { Curve } from './Curve.js';
import { CatmullRom } from './Interpolations.js';
import { Vector2 } from './Vector2.js';

export class SplineCurve extends Curve<Vector2> {
  isSplineCurve: boolean;
  points: Vector2[];

  constructor(points: Vector2[] = []) {
    super();

    this.isSplineCurve = true;

    this.type = 'SplineCurve';

    this.points = points;
  }

  getPoint(t: number, optionalTarget: Vector2 = new Vector2()): Vector2 {
    const point = optionalTarget;

    const points = this.points;
    const p = (points.length - 1) * t;

    const intPoint = Math.floor(p);
    const weight = p - intPoint;

    const p0 = points[intPoint === 0 ? intPoint : intPoint - 1];
    const p1 = points[intPoint];
    const p2 = points[intPoint > points.length - 2 ? points.length - 1 : intPoint + 1];
    const p3 = points[intPoint > points.length - 3 ? points.length - 1 : intPoint + 2];

    point.set(CatmullRom(weight, p0.x, p1.x, p2.x, p3.x), CatmullRom(weight, p0.y, p1.y, p2.y, p3.y));

    return point;
  }

  copy(source: SplineCurve): SplineCurve {
    super.copy(source);

    this.points = [];

    for (let i = 0, l = source.points.length; i < l; i++) {
      const point = source.points[i];

      this.points.push(point.clone());
    }

    return this;
  }
}

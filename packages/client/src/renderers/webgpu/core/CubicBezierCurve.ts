import { Curve } from './Curve.js';
import { CubicBezier } from './Interpolations.js';
import { Vector2 } from './Vector2.js';

export class CubicBezierCurve extends Curve<Vector2> {
  isCubicBezierCurve: boolean;
  v0: Vector2;
  v1: Vector2;
  v2: Vector2;
  v3: Vector2;

  constructor(
    v0: Vector2 = new Vector2(),
    v1: Vector2 = new Vector2(),
    v2: Vector2 = new Vector2(),
    v3: Vector2 = new Vector2(),
  ) {
    super();

    this.isCubicBezierCurve = true;

    this.type = 'CubicBezierCurve';

    this.v0 = v0;
    this.v1 = v1;
    this.v2 = v2;
    this.v3 = v3;
  }

  getPoint(t: number, optionalTarget: Vector2 = new Vector2()): Vector2 {
    const point = optionalTarget;

    const v0 = this.v0,
      v1 = this.v1,
      v2 = this.v2,
      v3 = this.v3;

    point.set(CubicBezier(t, v0.x, v1.x, v2.x, v3.x), CubicBezier(t, v0.y, v1.y, v2.y, v3.y));

    return point;
  }

  copy(source: CubicBezierCurve): CubicBezierCurve {
    super.copy(source);

    this.v0.copy(source.v0);
    this.v1.copy(source.v1);
    this.v2.copy(source.v2);
    this.v3.copy(source.v3);

    return this;
  }
}

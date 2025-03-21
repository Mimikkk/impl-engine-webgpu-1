import { Curve } from '../core/Curve.js';
import { QuadraticBezier } from '../core/Interpolations.js';
import { Vector2 } from '../../math/Vector2.js';

export class QuadraticBezierCurve extends Curve<Vector2> {
  v0: Vector2;
  v1: Vector2;
  v2: Vector2;
  isQuadraticBezierCurve: boolean;
  constructor(v0 = new Vector2(), v1 = new Vector2(), v2 = new Vector2()) {
    super();

    this.isQuadraticBezierCurve = true;

    this.type = 'QuadraticBezierCurve';

    this.v0 = v0;
    this.v1 = v1;
    this.v2 = v2;
  }

  getPoint(t: number, optionalTarget: Vector2 = new Vector2()): Vector2 {
    const point = optionalTarget;

    const v0 = this.v0;
    const v1 = this.v1;
    const v2 = this.v2;

    point.set(QuadraticBezier(t, v0.x, v1.x, v2.x), QuadraticBezier(t, v0.y, v1.y, v2.y));

    return point;
  }

  copy(source: QuadraticBezierCurve): QuadraticBezierCurve {
    super.copy(source);

    this.v0.copy(source.v0);
    this.v1.copy(source.v1);
    this.v2.copy(source.v2);

    return this;
  }
}

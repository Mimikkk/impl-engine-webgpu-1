import { Curve } from '../core/Curve.js';
import { QuadraticBezier } from '../core/Interpolations.js';
import { Vector3 } from '../../math/Vector3.js';

export class QuadraticBezierCurve3 extends Curve<Vector3> {
  isQuadraticBezierCurve3: boolean;
  v0: Vector3;
  v1: Vector3;
  v2: Vector3;

  constructor(v0 = new Vector3(), v1 = new Vector3(), v2 = new Vector3()) {
    super();

    this.isQuadraticBezierCurve3 = true;

    this.type = 'QuadraticBezierCurve3';

    this.v0 = v0;
    this.v1 = v1;
    this.v2 = v2;
  }

  getPoint(t: number, optionalTarget: Vector3 = new Vector3()): Vector3 {
    const point = optionalTarget;
    const v0 = this.v0;
    const v1 = this.v1;
    const v2 = this.v2;

    point.set(
      QuadraticBezier(t, v0.x, v1.x, v2.x),
      QuadraticBezier(t, v0.y, v1.y, v2.y),
      QuadraticBezier(t, v0.z, v1.z, v2.z),
    );

    return point;
  }

  copy(source: QuadraticBezierCurve3): QuadraticBezierCurve3 {
    super.copy(source as any);

    this.v0.copy(source.v0);
    this.v1.copy(source.v1);
    this.v2.copy(source.v2);

    return this;
  }
}

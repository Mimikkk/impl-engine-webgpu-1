import { Vector2 } from './Vector2.js';
import { Curve } from './Curve.js';

export class LineCurve extends Curve<Vector2> {
  isLineCurve: boolean;
  v1: Vector2;
  v2: Vector2;

  constructor(v1: Vector2 = new Vector2(), v2: Vector2 = new Vector2()) {
    super();

    this.isLineCurve = true;

    this.type = 'LineCurve';

    this.v1 = v1;
    this.v2 = v2;
  }

  getPoint(t: number, optionalTarget: Vector2 = new Vector2()): Vector2 {
    const point = optionalTarget;

    if (t === 1) {
      point.copy(this.v2);
    } else {
      point.copy(this.v2).sub(this.v1);
      point.multiplyScalar(t).add(this.v1);
    }

    return point;
  }

  getPointAt(u: number, optionalTarget?: Vector2): Vector2 {
    return this.getPoint(u, optionalTarget);
  }

  getTangent(t: number, optionalTarget: Vector2 = new Vector2()): Vector2 {
    return optionalTarget.subVectors(this.v2, this.v1).normalize();
  }

  getTangentAt(u: number, optionalTarget: Vector2): Vector2 {
    return this.getTangent(u, optionalTarget);
  }

  copy(source: LineCurve): LineCurve {
    super.copy(source);

    this.v1.copy(source.v1);
    this.v2.copy(source.v2);

    return this;
  }
}

import { Vector3 } from './Vector3.js';
import { Curve } from './Curve.js';

export class LineCurve3 extends Curve<Vector3> {
  isLineCurve3: boolean;
  v1: Vector3;
  v2: Vector3;
  constructor(v1: Vector3 = new Vector3(), v2: Vector3 = new Vector3()) {
    super();

    this.isLineCurve3 = true;

    this.type = 'LineCurve3';

    this.v1 = v1;
    this.v2 = v2;
  }

  getPoint(t: number, optionalTarget = new Vector3()): Vector3 {
    const point = optionalTarget;

    if (t === 1) {
      point.copy(this.v2);
    } else {
      point.copy(this.v2).sub(this.v1);
      point.multiplyScalar(t).add(this.v1);
    }

    return point;
  }

  getPointAt(u: number, optionalTarget?: Vector3) {
    return this.getPoint(u, optionalTarget);
  }

  getTangent(t: number, optionalTarget: Vector3 = new Vector3()): Vector3 {
    return optionalTarget.subVectors(this.v2, this.v1).normalize();
  }

  getTangentAt(u: number, optionalTarget?: Vector3): Vector3 {
    return this.getTangent(u, optionalTarget);
  }

  copy(source: LineCurve3): LineCurve3 {
    super.copy(source);

    this.v1.copy(source.v1);
    this.v2.copy(source.v2);

    return this;
  }
}

import { Vector3 } from './Vector3.js';
import { Curve } from './Curve.js';

export class LineCurve3 extends Curve {
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

  //@ts-expect-error
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

  //@ts-expect-error
  getPointAt(u: number, optionalTarget?: Vector3) {
    return this.getPoint(u, optionalTarget);
  }

  getTangent(t: number, optionalTarget: Vector3 = new Vector3()): Vector3 {
    return optionalTarget.subVectors(this.v2, this.v1).normalize();
  }

  getTangentAt(u: number, optionalTarget?: Vector3): Vector3 {
    return this.getTangent(u, optionalTarget);
  }

  //@ts-expect-error
  copy(source: LineCurve3): LineCurve3 {
    super.copy(source as unknown as Curve);

    this.v1.copy(source.v1);
    this.v2.copy(source.v2);

    return this;
  }

  toJSON() {
    const data = super.toJSON();

    data.v1 = this.v1.toArray();
    data.v2 = this.v2.toArray();

    return data;
  }

  //@ts-expect-error
  fromJSON(json: { arcLengthDivisions: number; v1: number[]; v2: number[] }): LineCurve3 {
    super.fromJSON(json);

    this.v1.fromArray(json.v1);
    this.v2.fromArray(json.v2);

    return this;
  }
}

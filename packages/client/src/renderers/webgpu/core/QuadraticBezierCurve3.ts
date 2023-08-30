import { Curve } from './Curve.js';
import { QuadraticBezier } from './Interpolations.js';
import { Vector3 } from './Vector3.js';

export class QuadraticBezierCurve3 extends Curve {
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

  //@ts-expect-error
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

  //@ts-expect-error
  copy(source: QuadraticBezierCurve3): QuadraticBezierCurve3 {
    super.copy(source as any);

    this.v0.copy(source.v0);
    this.v1.copy(source.v1);
    this.v2.copy(source.v2);

    return this;
  }

  toJSON() {
    const data = super.toJSON();

    data.v0 = this.v0.toArray();
    data.v1 = this.v1.toArray();
    data.v2 = this.v2.toArray();

    return data;
  }

  //@ts-expect-error
  fromJSON(json: { arcLengthDivisions: number; v0: number[]; v1: number[]; v2: number[] }): QuadraticBezierCurve3 {
    super.fromJSON(json);

    this.v0.fromArray(json.v0);
    this.v1.fromArray(json.v1);
    this.v2.fromArray(json.v2);

    return this;
  }
}

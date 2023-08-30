import { Curve } from './Curve.js';
import { QuadraticBezier } from './Interpolations.js';
import { Vector2 } from './Vector2.js';

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

  toJSON() {
    const data = super.toJSON();

    data.v0 = this.v0.toArray();
    data.v1 = this.v1.toArray();
    data.v2 = this.v2.toArray();

    return data;
  }

  fromJSON(json: { arcLengthDivisions: number; v0: number[]; v1: number[]; v2: number[] }): QuadraticBezierCurve {
    super.fromJSON(json);

    this.v0.fromArray(json.v0);
    this.v1.fromArray(json.v1);
    this.v2.fromArray(json.v2);

    return this;
  }
}

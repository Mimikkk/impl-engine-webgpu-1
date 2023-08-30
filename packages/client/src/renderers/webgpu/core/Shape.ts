import { Path } from './Path.js';
import * as MathUtils from './MathUtils.js';
import { Vector2 } from './Vector2.js';
import { Curve } from './Curve.js';

export class Shape extends Path {
  uuid: string;
  type: string;
  holes: Path[];

  constructor(points?: Vector2[]) {
    super(points);

    this.uuid = MathUtils.generateUUID();
    this.type = 'Shape';
    this.holes = [];
  }

  getPointsHoles(divisions: number) {
    const holesPts = [];

    for (let i = 0, l = this.holes.length; i < l; i++) {
      holesPts[i] = this.holes[i].getPoints(divisions);
    }

    return holesPts;
  }

  // get points of shape and holes (keypoints based on segments parameter)

  extractPoints(divisions: number) {
    return {
      shape: this.getPoints(divisions),
      holes: this.getPointsHoles(divisions),
    };
  }

  copy(source: Shape) {
    super.copy(source);

    this.holes = [];

    for (let i = 0, l = source.holes.length; i < l; i++) {
      const hole = source.holes[i];

      this.holes.push(hole.clone() as Path);
    }

    return this;
  }

  toJSON() {
    const data = super.toJSON() as any;

    data.uuid = this.uuid;
    data.holes = [];

    for (let i = 0, l = this.holes.length; i < l; i++) {
      const hole = this.holes[i];
      data.holes.push(hole.toJSON());
    }

    return data;
  }

  fromJSON(json: {
    arcLengthDivisions: number;
    autoClose: boolean;
    curves: Curve<Vector2>[];
    currentPoint: number[];
    uuid: string;
    holes: { arcLengthDivisions: number; autoClose: boolean; curves: Curve<Vector2>[]; currentPoint: number[] }[];
  }): Shape {
    super.fromJSON(json);

    this.uuid = json.uuid;
    this.holes = [];

    for (let i = 0, l = json.holes.length; i < l; i++) {
      const hole = json.holes[i];
      this.holes.push(new Path().fromJSON(hole));
    }

    return this;
  }
}

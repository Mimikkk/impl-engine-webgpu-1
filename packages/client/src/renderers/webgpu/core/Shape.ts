import { Path } from './Path.js';
import { MathUtils } from './MathUtils.js';
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
}

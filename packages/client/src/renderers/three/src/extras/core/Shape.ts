import { Path } from './Path.js';
import * as MathUtils from '../../math/MathUtils.js';

export class Shape extends Path {
  constructor(points) {
    super(points);

    this.uuid = MathUtils.generateUUID();

    this.type = 'Shape';

    this.holes = [];
  }

  getPointsHoles(divisions) {
    const holesPts = [];

    for (let i = 0, l = this.holes.length; i < l; i++) {
      holesPts[i] = this.holes[i].getPoints(divisions);
    }

    return holesPts;
  }

  // get points of shape and holes (keypoints based on segments parameter)

  extractPoints(divisions) {
    return {
      shape: this.getPoints(divisions),
      holes: this.getPointsHoles(divisions),
    };
  }

  copy(source) {
    super.copy(source);

    this.holes = [];

    for (let i = 0, l = source.holes.length; i < l; i++) {
      const hole = source.holes[i];

      this.holes.push(hole.clone());
    }

    return this;
  }
}

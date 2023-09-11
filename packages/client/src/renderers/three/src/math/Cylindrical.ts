import { Vector3 } from './Vector3.js';
export class Cylindrical {
  declare ['constructor']: typeof Cylindrical;
  declare isCylindrical: boolean;
  radius: number;
  theta: number;
  y: number;

  constructor(radius: number = 1, theta: number = 0, y: number = 0) {
    this.radius = radius; // distance from the origin to a point in the x-z plane
    this.theta = theta; // counterclockwise angle in the x-z plane measured in radians from the positive z-axis
    this.y = y; // height above the x-z plane

    return this;
  }

  set(radius: number, theta: number, y: number): Cylindrical {
    this.radius = radius;
    this.theta = theta;
    this.y = y;

    return this;
  }

  copy(other: Cylindrical): Cylindrical {
    this.radius = other.radius;
    this.theta = other.theta;
    this.y = other.y;

    return this;
  }

  setFromVector3(v: Vector3): Cylindrical {
    return this.setFromCartesianCoords(v.x, v.y, v.z);
  }

  setFromCartesianCoords(x: number, y: number, z: number): Cylindrical {
    this.radius = Math.sqrt(x * x + z * z);
    this.theta = Math.atan2(x, z);
    this.y = y;

    return this;
  }

  clone() {
    return new this.constructor().copy(this);
  }
}
Cylindrical.prototype.isCylindrical = true;

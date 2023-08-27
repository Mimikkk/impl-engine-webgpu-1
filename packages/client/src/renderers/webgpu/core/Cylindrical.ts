import { Vector3 } from './Vector3.js';
export class Cylindrical {
  radius: number;
  theta: number;
  y: number;

  constructor(radius: number = 1, theta: number = 0, y: number = 0) {
    this.radius = radius; // distance from the origin to a point in the x-z plane
    this.theta = theta; // counterclockwise angle in the x-z plane measured in radians from the positive z-axis
    this.y = y; // height above the x-z plane

    return this;
  }

  set(radius: number, theta: number, y: number) {
    this.radius = radius;
    this.theta = theta;
    this.y = y;

    return this;
  }

  copy(other: Cylindrical) {
    this.radius = other.radius;
    this.theta = other.theta;
    this.y = other.y;

    return this;
  }

  setFromVector3(v: Vector3) {
    return this.setFromCartesianCoords(v.x, v.y, v.z);
  }

  setFromCartesianCoords(x: number, y: number, z: number) {
    this.radius = Math.sqrt(x * x + z * z);
    this.theta = Math.atan2(x, z);
    this.y = y;

    return this;
  }

  clone() {
    return new Cylindrical(this.radius, this.theta, this.y);
  }
}

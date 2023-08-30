import { MathUtils } from './MathUtils.js';
import { Vector3 } from './Vector3.js';

export class Spherical {
  radius: number;
  phi: number;
  theta: number;

  constructor(radius: number = 1, phi: number = 0, theta: number = 0) {
    this.radius = radius;
    this.phi = phi; // polar angle
    this.theta = theta; // azimuthal angle

    return this;
  }

  set(radius: number, phi: number, theta: number) {
    this.radius = radius;
    this.phi = phi;
    this.theta = theta;

    return this;
  }

  copy(other: Spherical) {
    this.radius = other.radius;
    this.phi = other.phi;
    this.theta = other.theta;

    return this;
  }

  // restrict phi to be between EPS and PI-EPS
  makeSafe() {
    const EPS = 0.000001;
    this.phi = Math.max(EPS, Math.min(Math.PI - EPS, this.phi));

    return this;
  }

  setFromVector3(v: Vector3) {
    return this.setFromCartesianCoords(v.x, v.y, v.z);
  }

  setFromCartesianCoords(x: number, y: number, z: number) {
    this.radius = Math.sqrt(x * x + y * y + z * z);

    if (this.radius === 0) {
      this.theta = 0;
      this.phi = 0;
    } else {
      this.theta = Math.atan2(x, z);
      this.phi = Math.acos(MathUtils.clamp(y / this.radius, -1, 1));
    }

    return this;
  }

  clone() {
    return new Spherical(this.radius, this.phi, this.theta);
  }
}

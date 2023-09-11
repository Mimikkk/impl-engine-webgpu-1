import { Box3 } from './Box3.js';
import { Vector3 } from './Vector3.js';
import { Plane } from './Plane.js';
import { Matrix4 } from './Matrix4.js';

const _box = new Box3();
const _v1 = new Vector3();
const _v2 = new Vector3();

class Sphere {
  center: Vector3;
  radius: number;

  constructor(center: Vector3 = new Vector3(), radius = -1) {
    this.center = center;
    this.radius = radius;
  }

  set(center: Vector3, radius: number) {
    this.center.copy(center);
    this.radius = radius;

    return this;
  }

  setFromPoints(points: Vector3[], optionalCenter?: Vector3) {
    const center = this.center;

    if (optionalCenter) {
      center.copy(optionalCenter);
    } else {
      _box.setFromPoints(points).getCenter(center);
    }

    let maxRadiusSq = 0;

    for (let i = 0, il = points.length; i < il; i++) {
      maxRadiusSq = Math.max(maxRadiusSq, center.distanceToSquared(points[i]));
    }

    this.radius = Math.sqrt(maxRadiusSq);

    return this;
  }

  copy(sphere: Sphere) {
    this.center.copy(sphere.center);
    this.radius = sphere.radius;

    return this;
  }

  isEmpty() {
    return this.radius < 0;
  }

  makeEmpty() {
    this.center.set(0, 0, 0);
    this.radius = -1;

    return this;
  }

  containsPoint(point: Vector3) {
    return point.distanceToSquared(this.center) <= this.radius * this.radius;
  }

  distanceToPoint(point: Vector3) {
    return point.distanceTo(this.center) - this.radius;
  }

  intersectsSphere(sphere: Sphere) {
    const radiusSum = this.radius + sphere.radius;

    return sphere.center.distanceToSquared(this.center) <= radiusSum * radiusSum;
  }

  intersectsBox(box: Box3) {
    return box.intersectsSphere(this);
  }

  intersectsPlane(plane: Plane) {
    return Math.abs(plane.distanceToPoint(this.center)) <= this.radius;
  }

  clampPoint(point: Vector3, target: Vector3) {
    const deltaLengthSq = this.center.distanceToSquared(point);

    target.copy(point);

    if (deltaLengthSq > this.radius * this.radius) {
      target.sub(this.center).normalize();
      target.multiplyScalar(this.radius).add(this.center);
    }

    return target;
  }

  getBoundingBox(target: Box3) {
    if (this.isEmpty()) {
      // Empty sphere produces empty bounding box
      target.makeEmpty();
      return target;
    }

    target.set(this.center, this.center);
    target.expandByScalar(this.radius);

    return target;
  }

  applyMatrix4(matrix: Matrix4) {
    this.center.applyMatrix4(matrix);
    this.radius = this.radius * matrix.getMaxScaleOnAxis();

    return this;
  }

  translate(offset: Vector3) {
    this.center.add(offset);

    return this;
  }

  expandByPoint(point: Vector3) {
    if (this.isEmpty()) {
      this.center.copy(point);

      this.radius = 0;

      return this;
    }

    _v1.subVectors(point, this.center);

    const lengthSq = _v1.lengthSq();

    if (lengthSq > this.radius * this.radius) {
      // calculate the minimal sphere

      const length = Math.sqrt(lengthSq);

      const delta = (length - this.radius) * 0.5;

      this.center.addScaledVector(_v1, delta / length);

      this.radius += delta;
    }

    return this;
  }

  union(sphere: Sphere) {
    if (sphere.isEmpty()) {
      return this;
    }

    if (this.isEmpty()) {
      this.copy(sphere);

      return this;
    }

    if (this.center.equals(sphere.center)) {
      this.radius = Math.max(this.radius, sphere.radius);
    } else {
      _v2.subVectors(sphere.center, this.center).setLength(sphere.radius);

      this.expandByPoint(_v1.copy(sphere.center).add(_v2));

      this.expandByPoint(_v1.copy(sphere.center).sub(_v2));
    }

    return this;
  }

  equals(sphere: Sphere) {
    return sphere.center.equals(this.center) && sphere.radius === this.radius;
  }

  clone() {
    return new Sphere().copy(this);
  }
}

export { Sphere };

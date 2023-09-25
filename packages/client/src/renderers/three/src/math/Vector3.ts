import { MathUtils } from './MathUtils.js';
import { Quaternion } from './Quaternion.js';
import { Matrix4 } from './Matrix4.js';
import { Matrix3 } from './Matrix3.js';
import { Cylindrical } from './Cylindrical.js';
import { Spherical } from './Spherical.js';
import { Euler } from './Euler.js';
import { Color } from './Color.js';
import { Camera } from '../cameras/Camera.js';
import { NumberArray } from '../types.js';

export class Vector3 {
  declare ['constructor']: new (x: number, y: number, z: number) => this;

  declare isVector3: boolean;
  x: number;
  y: number;
  z: number;
  needsUpdate: boolean;

  constructor(x: number = 0, y: number = 0, z: number = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  set(x?: number, y?: number, z?: number): Vector3 {
    if (x !== undefined) this.x = x;
    if (y !== undefined) this.y = y;
    if (z !== undefined) this.z = z;

    return this;
  }

  setScalar(scalar: number): Vector3 {
    this.x = scalar;
    this.y = scalar;
    this.z = scalar;

    return this;
  }

  setX(x: number): Vector3 {
    this.x = x;

    return this;
  }

  setY(y: number): Vector3 {
    this.y = y;

    return this;
  }

  setZ(z: number): Vector3 {
    this.z = z;

    return this;
  }

  setComponent(index: number, value: number): Vector3 {
    switch (index) {
      case 0:
        this.x = value;
        break;
      case 1:
        this.y = value;
        break;
      case 2:
        this.z = value;
        break;
      default:
        throw new Error('index is out of range: ' + index);
    }

    return this;
  }

  getComponent(index: number): number {
    switch (index) {
      case 0:
        return this.x;
      case 1:
        return this.y;
      case 2:
        return this.z;
      default:
        throw new Error('index is out of range: ' + index);
    }
  }

  clone(): Vector3 {
    return new this.constructor(this.x, this.y, this.z);
  }

  copy(v: Vector3): Vector3 {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;

    return this;
  }

  add(v: Vector3): Vector3 {
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;

    return this;
  }

  addScalar(s: number): Vector3 {
    this.x += s;
    this.y += s;
    this.z += s;

    return this;
  }

  addVectors(a: Vector3, b: Vector3): Vector3 {
    this.x = a.x + b.x;
    this.y = a.y + b.y;
    this.z = a.z + b.z;

    return this;
  }

  addScaledVector(v: Vector3, s: number): Vector3 {
    this.x += v.x * s;
    this.y += v.y * s;
    this.z += v.z * s;

    return this;
  }

  sub(v: Vector3): Vector3 {
    this.x -= v.x;
    this.y -= v.y;
    this.z -= v.z;

    return this;
  }

  subScalar(s: number): Vector3 {
    this.x -= s;
    this.y -= s;
    this.z -= s;

    return this;
  }

  subVectors(a: Vector3, b: Vector3): Vector3 {
    this.x = a.x - b.x;
    this.y = a.y - b.y;
    this.z = a.z - b.z;

    return this;
  }

  multiply(v: Vector3): Vector3 {
    this.x *= v.x;
    this.y *= v.y;
    this.z *= v.z;

    return this;
  }

  multiplyScalar(scalar: number): Vector3 {
    this.x *= scalar;
    this.y *= scalar;
    this.z *= scalar;

    return this;
  }

  multiplyVectors(a: Vector3, b: Vector3): Vector3 {
    this.x = a.x * b.x;
    this.y = a.y * b.y;
    this.z = a.z * b.z;

    return this;
  }

  applyEuler(euler: Euler): Vector3 {
    return this.applyQuaternion(_quaternion.setFromEuler(euler));
  }

  applyAxisAngle(axis: Vector3, angle: number): Vector3 {
    return this.applyQuaternion(_quaternion.setFromAxisAngle(axis, angle));
  }

  applyMatrix3(m: Matrix3): Vector3 {
    const x = this.x;
    const y = this.y;
    const z = this.z;
    const e = m.elements;

    this.x = e[0] * x + e[3] * y + e[6] * z;
    this.y = e[1] * x + e[4] * y + e[7] * z;
    this.z = e[2] * x + e[5] * y + e[8] * z;

    return this;
  }

  applyNormalMatrix(m: Matrix3): Vector3 {
    return this.applyMatrix3(m).normalize();
  }

  applyMatrix4(m: Matrix4): Vector3 {
    const x = this.x;
    const y = this.y;
    const z = this.z;
    const e = m.elements;

    const w = 1 / (e[3] * x + e[7] * y + e[11] * z + e[15]);

    this.x = (e[0] * x + e[4] * y + e[8] * z + e[12]) * w;
    this.y = (e[1] * x + e[5] * y + e[9] * z + e[13]) * w;
    this.z = (e[2] * x + e[6] * y + e[10] * z + e[14]) * w;

    return this;
  }

  applyQuaternion(q: Quaternion) {
    const x = this.x;
    const y = this.y;
    const z = this.z;
    const qx = q.x;
    const qy = q.y;
    const qz = q.z;
    const qw = q.w;

    // calculate quat * vector

    const ix = qw * x + qy * z - qz * y;
    const iy = qw * y + qz * x - qx * z;
    const iz = qw * z + qx * y - qy * x;
    const iw = -qx * x - qy * y - qz * z;

    // calculate result * inverse quat

    this.x = ix * qw + iw * -qx + iy * -qz - iz * -qy;
    this.y = iy * qw + iw * -qy + iz * -qx - ix * -qz;
    this.z = iz * qw + iw * -qz + ix * -qy - iy * -qx;

    return this;
  }

  project(camera: Camera): Vector3 {
    return this.applyMatrix4(camera.matrixWorldInverse).applyMatrix4(camera.projectionMatrix);
  }

  unproject(camera: Camera): Vector3 {
    return this.applyMatrix4(camera.projectionMatrixInverse).applyMatrix4(camera.matrixWorld);
  }

  transformDirection(m: Matrix4): Vector3 {
    // input: THREE.Matrix4 affine matrix
    // vector interpreted as a direction

    const x = this.x;
    const y = this.y;
    const z = this.z;
    const e = m.elements;

    this.x = e[0] * x + e[4] * y + e[8] * z;
    this.y = e[1] * x + e[5] * y + e[9] * z;
    this.z = e[2] * x + e[6] * y + e[10] * z;

    return this.normalize();
  }

  divide(v: Vector3): Vector3 {
    this.x /= v.x;
    this.y /= v.y;
    this.z /= v.z;

    return this;
  }

  divideScalar(scalar: number): Vector3 {
    return this.multiplyScalar(1 / scalar);
  }

  min(v: Vector3): Vector3 {
    this.x = Math.min(this.x, v.x);
    this.y = Math.min(this.y, v.y);
    this.z = Math.min(this.z, v.z);

    return this;
  }

  max(v: Vector3): Vector3 {
    this.x = Math.max(this.x, v.x);
    this.y = Math.max(this.y, v.y);
    this.z = Math.max(this.z, v.z);

    return this;
  }

  clamp(min: Vector3, max: Vector3): Vector3 {
    // assumes min < max, componentwise

    this.x = Math.max(min.x, Math.min(max.x, this.x));
    this.y = Math.max(min.y, Math.min(max.y, this.y));
    this.z = Math.max(min.z, Math.min(max.z, this.z));

    return this;
  }

  clampScalar(minVal: number, maxVal: number): Vector3 {
    this.x = Math.max(minVal, Math.min(maxVal, this.x));
    this.y = Math.max(minVal, Math.min(maxVal, this.y));
    this.z = Math.max(minVal, Math.min(maxVal, this.z));

    return this;
  }

  clampLength(min: number, max: number): Vector3 {
    const length = this.length();

    return this.divideScalar(length || 1).multiplyScalar(Math.max(min, Math.min(max, length)));
  }

  floor(): Vector3 {
    this.x = Math.floor(this.x);
    this.y = Math.floor(this.y);
    this.z = Math.floor(this.z);

    return this;
  }

  ceil(): Vector3 {
    this.x = Math.ceil(this.x);
    this.y = Math.ceil(this.y);
    this.z = Math.ceil(this.z);

    return this;
  }

  round(): Vector3 {
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);
    this.z = Math.round(this.z);

    return this;
  }

  roundToZero(): Vector3 {
    this.x = this.x < 0 ? Math.ceil(this.x) : Math.floor(this.x);
    this.y = this.y < 0 ? Math.ceil(this.y) : Math.floor(this.y);
    this.z = this.z < 0 ? Math.ceil(this.z) : Math.floor(this.z);

    return this;
  }

  negate(): Vector3 {
    this.x = -this.x;
    this.y = -this.y;
    this.z = -this.z;

    return this;
  }

  dot(v: Vector3): number {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }

  lengthSq(): number {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }

  length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }

  manhattanLength(): number {
    return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z);
  }

  normalize(): Vector3 {
    return this.divideScalar(this.length() || 1);
  }

  setLength(length: number): Vector3 {
    return this.normalize().multiplyScalar(length);
  }

  lerp(v: Vector3, alpha: number): Vector3 {
    this.x += (v.x - this.x) * alpha;
    this.y += (v.y - this.y) * alpha;
    this.z += (v.z - this.z) * alpha;

    return this;
  }

  lerpVectors(v1: Vector3, v2: Vector3, alpha: number): Vector3 {
    this.x = v1.x + (v2.x - v1.x) * alpha;
    this.y = v1.y + (v2.y - v1.y) * alpha;
    this.z = v1.z + (v2.z - v1.z) * alpha;

    return this;
  }

  cross(v: Vector3): Vector3 {
    return this.crossVectors(this, v);
  }

  crossVectors(a: Vector3, b: Vector3): Vector3 {
    const ax = a.x;
    const ay = a.y;
    const az = a.z;
    const bx = b.x;
    const by = b.y;
    const bz = b.z;

    this.x = ay * bz - az * by;
    this.y = az * bx - ax * bz;
    this.z = ax * by - ay * bx;

    return this;
  }

  projectOnVector(v: Vector3): Vector3 {
    const denominator = v.lengthSq();

    if (denominator === 0) return this.set(0, 0, 0);

    const scalar = v.dot(this) / denominator;

    return this.copy(v).multiplyScalar(scalar);
  }

  projectOnPlane(planeNormal: Vector3): Vector3 {
    _vector.copy(this).projectOnVector(planeNormal);

    return this.sub(_vector);
  }

  reflect(normal: Vector3): Vector3 {
    // reflect incident vector off plane orthogonal to normal
    // normal is assumed to have unit length

    return this.sub(_vector.copy(normal).multiplyScalar(2 * this.dot(normal)));
  }

  angleTo(v: Vector3): number {
    const denominator = Math.sqrt(this.lengthSq() * v.lengthSq());

    if (denominator === 0) return Math.PI / 2;

    const theta = this.dot(v) / denominator;

    // clamp, to handle numerical problems

    return Math.acos(MathUtils.clamp(theta, -1, 1));
  }

  distanceTo(v: Vector3): number {
    return Math.sqrt(this.distanceToSquared(v));
  }

  distanceToSquared(v: Vector3): number {
    const dx = this.x - v.x;
    const dy = this.y - v.y;
    const dz = this.z - v.z;

    return dx * dx + dy * dy + dz * dz;
  }

  manhattanDistanceTo(v: Vector3): number {
    return Math.abs(this.x - v.x) + Math.abs(this.y - v.y) + Math.abs(this.z - v.z);
  }

  setFromSpherical(s: Spherical): Vector3 {
    return this.setFromSphericalCoords(s.radius, s.phi, s.theta);
  }

  setFromSphericalCoords(radius: number, phi: number, theta: number): Vector3 {
    const sinPhiRadius = Math.sin(phi) * radius;

    this.x = sinPhiRadius * Math.sin(theta);
    this.y = Math.cos(phi) * radius;
    this.z = sinPhiRadius * Math.cos(theta);

    return this;
  }

  setFromCylindrical(c: Cylindrical): Vector3 {
    return this.setFromCylindricalCoords(c.radius, c.theta, c.y);
  }

  setFromCylindricalCoords(radius: number, theta: number, y: number): Vector3 {
    this.x = radius * Math.sin(theta);
    this.y = y;
    this.z = radius * Math.cos(theta);

    return this;
  }

  setFromMatrixPosition(m: Matrix4): Vector3 {
    const e = m.elements;

    this.x = e[12];
    this.y = e[13];
    this.z = e[14];

    return this;
  }

  setFromMatrixScale(m: Matrix4): Vector3 {
    const sx = this.setFromMatrixColumn(m, 0).length();
    const sy = this.setFromMatrixColumn(m, 1).length();
    const sz = this.setFromMatrixColumn(m, 2).length();

    this.x = sx;
    this.y = sy;
    this.z = sz;

    return this;
  }

  setFromMatrixColumn(m: Matrix4, index: number): Vector3 {
    return this.fromArray(m.elements, index * 4);
  }

  setFromMatrix3Column(m: Matrix3, index: number): Vector3 {
    return this.fromArray(m.elements, index * 3);
  }

  setFromEuler(e: Euler): Vector3 {
    this.x = e._x;
    this.y = e._y;
    this.z = e._z;

    return this;
  }

  setFromColor(c: Color): Vector3 {
    this.x = c.r;
    this.y = c.g;
    this.z = c.b;

    return this;
  }

  equals(v: Vector3): boolean {
    return v.x === this.x && v.y === this.y && v.z === this.z;
  }

  fromArray(array: NumberArray, offset: number = 0): Vector3 {
    this.x = array[offset];
    this.y = array[offset + 1];
    this.z = array[offset + 2];

    return this;
  }

  toArray(array: number[] = [], offset: number = 0) {
    array[offset] = this.x;
    array[offset + 1] = this.y;
    array[offset + 2] = this.z;

    return array;
  }

  fromBufferAttribute(attribute: any, index: number): Vector3 {
    this.x = attribute.getX(index);
    this.y = attribute.getY(index);
    this.z = attribute.getZ(index);

    return this;
  }

  random(): Vector3 {
    this.x = Math.random();
    this.y = Math.random();
    this.z = Math.random();

    return this;
  }

  randomDirection(): Vector3 {
    // Derived from https://mathworld.wolfram.com/SpherePointPicking.html

    const u = (Math.random() - 0.5) * 2;
    const t = Math.random() * Math.PI * 2;
    const f = Math.sqrt(1 - u ** 2);

    this.x = f * Math.cos(t);
    this.y = f * Math.sin(t);
    this.z = u;

    return this;
  }

  *[Symbol.iterator]() {
    yield this.x;
    yield this.y;
    yield this.z;
  }
}

Vector3.prototype.isVector3 = true;

const _vector = new Vector3();
const _quaternion = new Quaternion();

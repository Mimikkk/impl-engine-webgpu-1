import { Vector3 } from './Vector3.js';
import { Box3 } from './Box3.js';
import { BufferAttribute } from '../core/BufferAttribute.js';
import { Plane } from './Plane.js';
import { Vector2 } from './Vector2.js';

const _v0 = new Vector3();
const _v1 = new Vector3();
const _v2 = new Vector3();
const _v3 = new Vector3();

const _vab = new Vector3();
const _vac = new Vector3();
const _vbc = new Vector3();
const _vap = new Vector3();
const _vbp = new Vector3();
const _vcp = new Vector3();

let warnedGetUV = false;

export class Triangle {
  declare ['constructor']: new () => this;

  declare isTriangle: boolean;
  a: Vector3;
  b: Vector3;
  c: Vector3;

  constructor(a: Vector3 = new Vector3(), b: Vector3 = new Vector3(), c: Vector3 = new Vector3()) {
    this.a = a;
    this.b = b;
    this.c = c;
  }

  static getNormal(a: Vector3, b: Vector3, c: Vector3, target: Vector3): Vector3 {
    target.subVectors(c, b);
    _v0.subVectors(a, b);
    target.cross(_v0);

    const targetLengthSq = target.lengthSq();
    if (targetLengthSq > 0) {
      return target.multiplyScalar(1 / Math.sqrt(targetLengthSq));
    }

    return target.set(0, 0, 0);
  }

  // static/instance method to calculate barycentric coordinates
  // based on: http://www.blackpawn.com/texts/pointinpoly/default.html
  static getBarycoord(point: Vector3, a: Vector3, b: Vector3, c: Vector3, target: Vector3): Vector3 {
    _v0.subVectors(c, a);
    _v1.subVectors(b, a);
    _v2.subVectors(point, a);

    const dot00 = _v0.dot(_v0);
    const dot01 = _v0.dot(_v1);
    const dot02 = _v0.dot(_v2);
    const dot11 = _v1.dot(_v1);
    const dot12 = _v1.dot(_v2);

    const denom = dot00 * dot11 - dot01 * dot01;

    // collinear or singular triangle
    if (denom === 0) {
      // arbitrary location outside of triangle?
      // not sure if this is the best idea, maybe should be returning undefined
      return target.set(-2, -1, -1);
    }

    const invDenom = 1 / denom;
    const u = (dot11 * dot02 - dot01 * dot12) * invDenom;
    const v = (dot00 * dot12 - dot01 * dot02) * invDenom;

    // barycentric coordinates must always sum to 1
    return target.set(1 - u - v, v, u);
  }

  static containsPoint(point: Vector3, a: Vector3, b: Vector3, c: Vector3): boolean {
    this.getBarycoord(point, a, b, c, _v3);

    return _v3.x >= 0 && _v3.y >= 0 && _v3.x + _v3.y <= 1;
  }

  static getUV(
    point: Vector3,
    p1: Vector3,
    p2: Vector3,
    p3: Vector3,
    uv1: Vector2,
    uv2: Vector2,
    uv3: Vector2,
    target: Vector2,
  ): Vector2 {
    // @deprecated, r151

    if (warnedGetUV === false) {
      console.warn('THREE.Triangle.getUV() has been renamed to THREE.Triangle.getInterpolation().');

      warnedGetUV = true;
    }

    return this.getInterpolation(point, p1, p2, p3, uv1, uv2, uv3, target);
  }

  static getInterpolation(
    point: Vector3,
    p1: Vector3,
    p2: Vector3,
    p3: Vector3,
    v1: Vector2,
    v2: Vector2,
    v3: Vector2,
    target: Vector2,
  ): Vector2 {
    this.getBarycoord(point, p1, p2, p3, _v3);

    target.setScalar(0);
    target.addScaledVector(v1, _v3.x);
    target.addScaledVector(v2, _v3.y);
    target.addScaledVector(v3, _v3.z);

    return target;
  }

  static isFrontFacing(a: Vector3, b: Vector3, c: Vector3, direction: Vector3): boolean {
    _v0.subVectors(c, b);
    _v1.subVectors(a, b);

    return _v0.cross(_v1).dot(direction) < 0;
  }

  set(a: Vector3, b: Vector3, c: Vector3): Triangle {
    this.a.copy(a);
    this.b.copy(b);
    this.c.copy(c);

    return this;
  }

  setFromPointsAndIndices(points: Vector3[], i0: number, i1: number, i2: number): Triangle {
    this.a.copy(points[i0]);
    this.b.copy(points[i1]);
    this.c.copy(points[i2]);

    return this;
  }

  setFromAttributeAndIndices(attribute: BufferAttribute, i0: number, i1: number, i2: number): Triangle {
    this.a.fromBufferAttribute(attribute, i0);
    this.b.fromBufferAttribute(attribute, i1);
    this.c.fromBufferAttribute(attribute, i2);

    return this;
  }

  clone(): Triangle {
    return new this.constructor().copy(this);
  }

  copy(triangle: Triangle): Triangle {
    this.a.copy(triangle.a);
    this.b.copy(triangle.b);
    this.c.copy(triangle.c);

    return this;
  }

  getArea(): number {
    _v0.subVectors(this.c, this.b);
    _v1.subVectors(this.a, this.b);

    return _v0.cross(_v1).length() * 0.5;
  }

  getMidpoint(target: Vector3): Vector3 {
    return target
      .addVectors(this.a, this.b)
      .add(this.c)
      .multiplyScalar(1 / 3);
  }

  getNormal(target: Vector3): Vector3 {
    return Triangle.getNormal(this.a, this.b, this.c, target);
  }

  getPlane(target: Plane): Plane {
    return target.setFromCoplanarPoints(this.a, this.b, this.c);
  }

  getBarycoord(point: Vector3, target: Vector3): Vector3 {
    return Triangle.getBarycoord(point, this.a, this.b, this.c, target);
  }

  getUV(point: Vector3, uv1: Vector2, uv2: Vector2, uv3: Vector2, target: Vector2): Vector2 {
    // @deprecated, r151

    if (warnedGetUV === false) {
      console.warn('THREE.Triangle.getUV() has been renamed to THREE.Triangle.getInterpolation().');

      warnedGetUV = true;
    }

    return Triangle.getInterpolation(point, this.a, this.b, this.c, uv1, uv2, uv3, target);
  }

  getInterpolation(point: Vector3, v1: Vector2, v2: Vector2, v3: Vector2, target: Vector2): Vector2 {
    return Triangle.getInterpolation(point, this.a, this.b, this.c, v1, v2, v3, target);
  }

  containsPoint(point: Vector3): boolean {
    return Triangle.containsPoint(point, this.a, this.b, this.c);
  }

  isFrontFacing(direction: Vector3): boolean {
    return Triangle.isFrontFacing(this.a, this.b, this.c, direction);
  }

  intersectsBox(box: Box3): boolean {
    return box.intersectsTriangle(this);
  }

  closestPointToPoint(p: Vector3, target: Vector3): Vector3 {
    const a = this.a,
      b = this.b,
      c = this.c;
    let v, w;

    // algorithm thanks to Real-Time Collision Detection by Christer Ericson,
    // published by Morgan Kaufmann Publishers, (c) 2005 Elsevier Inc.,
    // under the accompanying license; see chapter 5.1.5 for detailed explanation.
    // basically, we're distinguishing which of the voronoi regions of the triangle
    // the point lies in with the minimum amount of redundant computation.

    _vab.subVectors(b, a);
    _vac.subVectors(c, a);
    _vap.subVectors(p, a);
    const d1 = _vab.dot(_vap);
    const d2 = _vac.dot(_vap);
    if (d1 <= 0 && d2 <= 0) {
      // vertex region of A; barycentric coords (1, 0, 0)
      return target.copy(a);
    }

    _vbp.subVectors(p, b);
    const d3 = _vab.dot(_vbp);
    const d4 = _vac.dot(_vbp);
    if (d3 >= 0 && d4 <= d3) {
      // vertex region of B; barycentric coords (0, 1, 0)
      return target.copy(b);
    }

    const vc = d1 * d4 - d3 * d2;
    if (vc <= 0 && d1 >= 0 && d3 <= 0) {
      v = d1 / (d1 - d3);
      // edge region of AB; barycentric coords (1-v, v, 0)
      return target.copy(a).addScaledVector(_vab, v);
    }

    _vcp.subVectors(p, c);
    const d5 = _vab.dot(_vcp);
    const d6 = _vac.dot(_vcp);
    if (d6 >= 0 && d5 <= d6) {
      // vertex region of C; barycentric coords (0, 0, 1)
      return target.copy(c);
    }

    const vb = d5 * d2 - d1 * d6;
    if (vb <= 0 && d2 >= 0 && d6 <= 0) {
      w = d2 / (d2 - d6);
      // edge region of AC; barycentric coords (1-w, 0, w)
      return target.copy(a).addScaledVector(_vac, w);
    }

    const va = d3 * d6 - d5 * d4;
    if (va <= 0 && d4 - d3 >= 0 && d5 - d6 >= 0) {
      _vbc.subVectors(c, b);
      w = (d4 - d3) / (d4 - d3 + (d5 - d6));
      // edge region of BC; barycentric coords (0, 1-w, w)
      return target.copy(b).addScaledVector(_vbc, w); // edge region of BC
    }

    // face region
    const denom = 1 / (va + vb + vc);
    // u = va * denom
    v = vb * denom;
    w = vc * denom;

    return target.copy(a).addScaledVector(_vab, v).addScaledVector(_vac, w);
  }

  equals(triangle: Triangle): boolean {
    return triangle.a.equals(this.a) && triangle.b.equals(this.b) && triangle.c.equals(this.c);
  }
}
Triangle.prototype.isTriangle = true;

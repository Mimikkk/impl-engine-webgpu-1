import { Capsule } from './Capsule.js';
import { Ray } from './Ray.js';
import { Object3D } from '../core/Object3D.js';
import { Vector3 } from './Vector3.js';
import { Line3 } from './Line3.js';
import { Plane } from './Plane.js';
import { Sphere } from './Sphere.js';
import { Triangle } from './Triangle.js';
import { Box3 } from './Box3.js';

const _v1 = new Vector3();
const _v2 = new Vector3();
const _plane = new Plane();
const _line1 = new Line3();
const _line2 = new Line3();
const _sphere = new Sphere();
const _capsule = new Capsule();

export class Octree {
  triangles: Triangle[];
  box: Box3;
  subTrees: Octree[];
  bounds: Box3;

  constructor(box: Box3) {
    this.triangles = [];
    this.box = box;
    this.subTrees = [];
  }

  addTriangle(triangle: Triangle) {
    if (!this.bounds) this.bounds = new Box3();

    this.bounds.min.x = Math.min(this.bounds.min.x, triangle.a.x, triangle.b.x, triangle.c.x);
    this.bounds.min.y = Math.min(this.bounds.min.y, triangle.a.y, triangle.b.y, triangle.c.y);
    this.bounds.min.z = Math.min(this.bounds.min.z, triangle.a.z, triangle.b.z, triangle.c.z);
    this.bounds.max.x = Math.max(this.bounds.max.x, triangle.a.x, triangle.b.x, triangle.c.x);
    this.bounds.max.y = Math.max(this.bounds.max.y, triangle.a.y, triangle.b.y, triangle.c.y);
    this.bounds.max.z = Math.max(this.bounds.max.z, triangle.a.z, triangle.b.z, triangle.c.z);

    this.triangles.push(triangle);

    return this;
  }

  calcBox() {
    this.box = this.bounds.clone();

    // offset small amount to account for regular grid
    this.box.min.x -= 0.01;
    this.box.min.y -= 0.01;
    this.box.min.z -= 0.01;

    return this;
  }

  split(level: number) {
    if (!this.box) return;

    const subTrees = [];
    const halfsize = _v2.copy(this.box.max).sub(this.box.min).multiplyScalar(0.5);

    for (let x = 0; x < 2; x++) {
      for (let y = 0; y < 2; y++) {
        for (let z = 0; z < 2; z++) {
          const box = new Box3();
          const v = _v1.set(x, y, z);

          box.min.copy(this.box.min).add(v.multiply(halfsize));
          box.max.copy(box.min).add(halfsize);

          subTrees.push(new Octree(box));
        }
      }
    }

    let triangle;

    while ((triangle = this.triangles.pop())) {
      for (let i = 0; i < subTrees.length; i++) {
        if (subTrees[i].box.intersectsTriangle(triangle)) {
          subTrees[i].triangles.push(triangle);
        }
      }
    }

    for (let i = 0; i < subTrees.length; i++) {
      const len = subTrees[i].triangles.length;

      if (len > 8 && level < 16) {
        subTrees[i].split(level + 1);
      }

      if (len !== 0) {
        this.subTrees.push(subTrees[i]);
      }
    }

    return this;
  }

  build() {
    this.calcBox();
    this.split(0);

    return this;
  }

  getRayTriangles(ray: Ray, triangles: Triangle[]) {
    for (let i = 0; i < this.subTrees.length; i++) {
      const subTree = this.subTrees[i];
      if (!ray.intersectsBox(subTree.box)) continue;

      if (subTree.triangles.length > 0) {
        for (let j = 0; j < subTree.triangles.length; j++) {
          if (triangles.indexOf(subTree.triangles[j]) === -1) triangles.push(subTree.triangles[j]);
        }
      } else {
        subTree.getRayTriangles(ray, triangles);
      }
    }

    return triangles;
  }

  triangleCapsuleIntersect(capsule: Capsule, triangle: Triangle) {
    triangle.getPlane(_plane);

    const d1 = _plane.distanceToPoint(capsule.start) - capsule.radius;
    const d2 = _plane.distanceToPoint(capsule.end) - capsule.radius;

    if ((d1 > 0 && d2 > 0) || (d1 < -capsule.radius && d2 < -capsule.radius)) {
      return false;
    }

    const delta = Math.abs(d1 / (Math.abs(d1) + Math.abs(d2)));
    const intersectPoint = _v1.copy(capsule.start).lerp(capsule.end, delta);

    if (triangle.containsPoint(intersectPoint)) {
      return { normal: _plane.normal.clone(), point: intersectPoint.clone(), depth: Math.abs(Math.min(d1, d2)) };
    }

    const r2 = capsule.radius * capsule.radius;

    const line1 = _line1.set(capsule.start, capsule.end);

    const lines = [
      [triangle.a, triangle.b],
      [triangle.b, triangle.c],
      [triangle.c, triangle.a],
    ];

    for (let i = 0; i < lines.length; i++) {
      const line2 = _line2.set(lines[i][0], lines[i][1]);

      const [point1, point2] = capsule.lineLineMinimumPoints(line1, line2);

      if (point1.distanceToSquared(point2) < r2) {
        return {
          normal: point1.clone().sub(point2).normalize(),
          point: point2.clone(),
          depth: capsule.radius - point1.distanceTo(point2),
        };
      }
    }

    return false;
  }

  triangleSphereIntersect(sphere: Sphere, triangle: Triangle) {
    triangle.getPlane(_plane);

    if (!sphere.intersectsPlane(_plane)) return false;

    const depth = Math.abs(_plane.distanceToSphere(sphere));
    const r2 = sphere.radius * sphere.radius - depth * depth;

    const plainPoint = _plane.projectPoint(sphere.center, _v1);

    if (triangle.containsPoint(sphere.center)) {
      return {
        normal: _plane.normal.clone(),
        point: plainPoint.clone(),
        depth: Math.abs(_plane.distanceToSphere(sphere)),
      };
    }

    const lines = [
      [triangle.a, triangle.b],
      [triangle.b, triangle.c],
      [triangle.c, triangle.a],
    ];

    for (let i = 0; i < lines.length; i++) {
      _line1.set(lines[i][0], lines[i][1]);
      _line1.closestPointToPoint(plainPoint, true, _v2);

      const d = _v2.distanceToSquared(sphere.center);

      if (d < r2) {
        return {
          normal: sphere.center.clone().sub(_v2).normalize(),
          point: _v2.clone(),
          depth: sphere.radius - Math.sqrt(d),
        };
      }
    }

    return false;
  }

  getSphereTriangles(sphere: Sphere, triangles: Triangle[]) {
    for (let i = 0; i < this.subTrees.length; i++) {
      const subTree = this.subTrees[i];

      if (!sphere.intersectsBox(subTree.box)) continue;

      if (subTree.triangles.length > 0) {
        for (let j = 0; j < subTree.triangles.length; j++) {
          if (triangles.indexOf(subTree.triangles[j]) === -1) triangles.push(subTree.triangles[j]);
        }
      } else {
        subTree.getSphereTriangles(sphere, triangles);
      }
    }
  }

  getCapsuleTriangles(capsule: Capsule, triangles: Triangle[]) {
    for (let i = 0; i < this.subTrees.length; i++) {
      const subTree = this.subTrees[i];

      if (!capsule.intersectsBox(subTree.box)) continue;

      if (subTree.triangles.length > 0) {
        for (let j = 0; j < subTree.triangles.length; j++) {
          if (triangles.indexOf(subTree.triangles[j]) === -1) triangles.push(subTree.triangles[j]);
        }
      } else {
        subTree.getCapsuleTriangles(capsule, triangles);
      }
    }
  }

  sphereIntersect(sphere: Sphere) {
    _sphere.copy(sphere);

    const triangles: Triangle[] = [];
    let hit = false;

    this.getSphereTriangles(sphere, triangles);

    for (let i = 0; i < triangles.length; i++) {
      const result = this.triangleSphereIntersect(_sphere, triangles[i]);
      if (result) {
        hit = true;

        _sphere.center.add(result.normal.multiplyScalar(result.depth));
      }
    }

    if (hit) {
      const collisionVector = _sphere.center.clone().sub(sphere.center);
      const depth = collisionVector.length();

      return { normal: collisionVector.normalize(), depth: depth };
    }

    return false;
  }

  capsuleIntersect(capsule: Capsule) {
    _capsule.copy(capsule);

    const triangles: Triangle[] = [];
    let result,
      hit = false;

    this.getCapsuleTriangles(_capsule, triangles);

    for (let i = 0; i < triangles.length; i++) {
      const result = this.triangleCapsuleIntersect(_capsule, triangles[i]);
      if (result) {
        hit = true;

        _capsule.translate(result.normal.multiplyScalar(result.depth));
      }
    }

    if (hit) {
      const collisionVector = _capsule.getCenter(new Vector3()).sub(capsule.getCenter(_v1));
      const depth = collisionVector.length();

      return { normal: collisionVector.normalize(), depth: depth };
    }

    return false;
  }

  rayIntersect(ray: Ray) {
    if (ray.direction.length() === 0) return;

    const triangles: Triangle[] = [];
    let triangle,
      position,
      distance = 1e100;

    this.getRayTriangles(ray, triangles);

    for (let i = 0; i < triangles.length; i++) {
      const result = ray.intersectTriangle(triangles[i].a, triangles[i].b, triangles[i].c, true, _v1);

      if (result) {
        const newdistance = result.sub(ray.origin).length();

        if (distance > newdistance) {
          position = result.clone().add(ray.origin);
          distance = newdistance;
          triangle = triangles[i];
        }
      }
    }

    return distance < 1e100 ? { distance: distance, triangle: triangle, position: position } : false;
  }

  fromGraphNode(group: Object3D) {
    group.updateWorldMatrix(true, true);

    group.traverse(obj => {
      //@ts-expect-error
      if (obj.isMesh === true) {
        let geometry,
          isTemp = false;

        if (obj.geometry!.index !== null) {
          isTemp = true;
          geometry = obj.geometry!.toNonIndexed();
        } else {
          geometry = obj.geometry;
        }

        const positionAttribute = geometry!.getAttribute('position');

        for (let i = 0; i < positionAttribute.count; i += 3) {
          const v1 = new Vector3().fromBufferAttribute(positionAttribute, i);
          const v2 = new Vector3().fromBufferAttribute(positionAttribute, i + 1);
          const v3 = new Vector3().fromBufferAttribute(positionAttribute, i + 2);

          v1.applyMatrix4(obj.matrixWorld);
          v2.applyMatrix4(obj.matrixWorld);
          v3.applyMatrix4(obj.matrixWorld);

          this.addTriangle(new Triangle(v1, v2, v3));
        }

        if (isTemp) {
          geometry!.dispose();
        }
      }
    });

    this.build();

    return this;
  }
}

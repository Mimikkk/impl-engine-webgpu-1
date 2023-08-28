import { Sphere } from '../Sphere.js';
import { Ray } from '../Ray.js';
import { Matrix4 } from '../Matrix4.js';
import { Vector3 } from '../Vector3.js';
import { PointsMaterial } from '../materials/PointsMaterial.js';
import { BufferGeometry, Intersection, Raycaster } from 'three';
import { Vector2 } from '../Vector2.js';
import { Object3D } from '../Object3D.js';

const _inverseMatrix = /*@__PURE__*/ new Matrix4();
const _ray = /*@__PURE__*/ new Ray();
const _sphere = /*@__PURE__*/ new Sphere();
const _position = /*@__PURE__*/ new Vector3();

class Points extends Object3D {
  isPoints: boolean;
  type: string;
  geometry: BufferGeometry;
  material: PointsMaterial;
  morphTargetInfluences: number[];
  morphTargetDictionary: Record<string, number>;

  constructor(geometry: BufferGeometry = new BufferGeometry(), material: PointsMaterial = new PointsMaterial()) {
    super();

    this.isPoints = true;

    this.type = 'Points';

    this.geometry = geometry;
    this.material = material;

    this.updateMorphTargets();
  }

  copy(source: Points, recursive?: boolean) {
    super.copy(source, recursive);

    this.material = source.material;
    this.geometry = source.geometry;

    return this;
  }

  raycast(raycaster: Raycaster, intersects: Intersection[]) {
    const geometry = this.geometry;
    const matrixWorld = this.matrixWorld;
    const threshold = raycaster.params.Points!.threshold;
    const drawRange = geometry.drawRange;

    // Checking boundingSphere distance to ray

    if (geometry.boundingSphere === null) geometry.computeBoundingSphere();

    _sphere.copy(geometry.boundingSphere);
    _sphere.applyMatrix4(matrixWorld);
    _sphere.radius += threshold;

    if (raycaster.ray.intersectsSphere(_sphere) === false) return;

    //

    _inverseMatrix.copy(matrixWorld).invert();
    _ray.copy(raycaster.ray).applyMatrix4(_inverseMatrix);

    const localThreshold = threshold / ((this.scale.x + this.scale.y + this.scale.z) / 3);
    const localThresholdSq = localThreshold * localThreshold;

    const index = geometry.index;
    const attributes = geometry.attributes;
    const positionAttribute = attributes.position;

    if (index !== null) {
      const start = Math.max(0, drawRange.start);
      const end = Math.min(index.count, drawRange.start + drawRange.count);

      for (let i = start, il = end; i < il; i++) {
        const a = index.getX(i);

        _position.fromBufferAttribute(positionAttribute, a);

        testPoint(_position, a, localThresholdSq, matrixWorld, raycaster, intersects, this);
      }
    } else {
      const start = Math.max(0, drawRange.start);
      const end = Math.min(positionAttribute.count, drawRange.start + drawRange.count);

      for (let i = start, l = end; i < l; i++) {
        _position.fromBufferAttribute(positionAttribute, i);

        testPoint(_position, i, localThresholdSq, matrixWorld, raycaster, intersects, this);
      }
    }
  }

  updateMorphTargets() {
    const geometry = this.geometry;

    const morphAttributes = geometry.morphAttributes;
    const keys = Object.keys(morphAttributes);

    if (keys.length > 0) {
      const morphAttribute = morphAttributes[keys[0]];

      if (morphAttribute !== undefined) {
        this.morphTargetInfluences = [];
        this.morphTargetDictionary = {};

        for (let m = 0, ml = morphAttribute.length; m < ml; m++) {
          const name = morphAttribute[m].name || String(m);

          this.morphTargetInfluences.push(0);
          this.morphTargetDictionary[name] = m;
        }
      }
    }
  }
}

function testPoint(
  point: Vector2,
  index: number,
  localThresholdSq: number,
  matrixWorld: Matrix4,
  raycaster: Raycaster,
  intersects: Intersection[],
  object: Object3D,
) {
  const rayPointDistanceSq = _ray.distanceSqToPoint(point);

  if (rayPointDistanceSq < localThresholdSq) {
    const intersectPoint = new Vector3();

    _ray.closestPointToPoint(point, intersectPoint);
    intersectPoint.applyMatrix4(matrixWorld);

    const distance = raycaster.ray.origin.distanceTo(intersectPoint);

    if (distance < raycaster.near || distance > raycaster.far) return;

    intersects.push({
      distance: distance,
      distanceToRay: Math.sqrt(rayPointDistanceSq),
      point: intersectPoint,
      index: index,
      face: null,
      object: object,
    });
  }
}

export { Points };

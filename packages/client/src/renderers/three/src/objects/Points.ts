import { Sphere } from '../math/Sphere.js';
import { Ray } from '../math/Ray.js';
import { Matrix4 } from '../math/Matrix4.js';
import { Object3D } from '../core/Object3D.js';
import { Vector3 } from '../math/Vector3.js';
import { PointsMaterial } from '../materials/PointsMaterial.js';
import { BufferGeometry } from '../core/BufferGeometry.js';
import { Material } from '../materials/Material.js';
import { Intersection, Raycaster } from '../core/Raycaster.js';

const _inverseMatrix = new Matrix4();
const _ray = new Ray();
const _sphere = new Sphere();
const _position = new Vector3();

export class Points extends Object3D {
  declare isPoints: true;
  geometry: BufferGeometry;
  material: Material;
  morphTargetInfluences: number[];
  morphTargetDictionary: Record<string, number>;

  constructor(geometry: BufferGeometry = new BufferGeometry(), material: Material = new PointsMaterial()) {
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
    const threshold = raycaster.params.Points.threshold;
    const drawRange = geometry.drawRange;

    // Checking boundingSphere distance to ray

    if (geometry.boundingSphere === null) geometry.computeBoundingSphere();

    _sphere.copy(geometry.boundingSphere!);
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
      const end = Math.min(positionAttribute!.count, drawRange.start + drawRange.count);

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
  point: Vector3,
  index: number,
  localThresholdSq: number,
  matrixWorld: Matrix4,
  raycaster: Raycaster,
  intersects: Intersection[],
  object: Points,
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

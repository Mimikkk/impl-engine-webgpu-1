import { InstancedBufferAttribute } from '../core/InstancedBufferAttribute.js';
import { Mesh } from './Mesh.js';
import { Box3 } from '../math/Box3.js';
import { Matrix4 } from '../math/Matrix4.js';
import { Sphere } from '../math/Sphere.js';
import { Color } from '../math/Color.js';
import { Intersection, Raycaster } from '../core/Raycaster.js';
import { BufferGeometry } from '../core/BufferGeometry.js';
import { Material } from '../materials/Material.js';

const _instanceLocalMatrix = new Matrix4();
const _instanceWorldMatrix = new Matrix4();

const _instanceIntersects: Intersection[] = [];

const _box3 = new Box3();
const _identity = new Matrix4();
const _mesh = new Mesh();
const _sphere = new Sphere();

export class InstancedMesh extends Mesh {
  declare isInstancedMesh: true;
  instanceMatrix: InstancedBufferAttribute;
  instanceColor: InstancedBufferAttribute | null;
  count: number;
  boundingBox: Box3 | null;
  boundingSphere: Sphere | null;

  constructor(geometry: BufferGeometry, material: Material, count: number) {
    super(geometry, material);

    this.isInstancedMesh = true;

    this.instanceMatrix = new InstancedBufferAttribute(new Float32Array(count * 16), 16);
    this.instanceColor = null;

    this.count = count;

    this.boundingBox = null;
    this.boundingSphere = null;

    for (let i = 0; i < count; i++) {
      this.setMatrixAt(i, _identity);
    }
  }

  computeBoundingBox() {
    const geometry = this.geometry;
    const count = this.count;

    if (this.boundingBox === null) {
      this.boundingBox = new Box3();
    }

    if (geometry.boundingBox === null) {
      geometry.computeBoundingBox();
    }

    this.boundingBox.makeEmpty();

    for (let i = 0; i < count; i++) {
      this.getMatrixAt(i, _instanceLocalMatrix);

      _box3.copy(geometry.boundingBox!).applyMatrix4(_instanceLocalMatrix);

      this.boundingBox.union(_box3);
    }
  }

  computeBoundingSphere() {
    const geometry = this.geometry;
    const count = this.count;

    if (this.boundingSphere === null) {
      this.boundingSphere = new Sphere();
    }

    if (geometry.boundingSphere === null) {
      geometry.computeBoundingSphere();
    }

    this.boundingSphere.makeEmpty();

    for (let i = 0; i < count; i++) {
      this.getMatrixAt(i, _instanceLocalMatrix);

      _sphere.copy(geometry.boundingSphere!).applyMatrix4(_instanceLocalMatrix);

      this.boundingSphere.union(_sphere);
    }
  }

  copy(source: InstancedMesh, recursive?: boolean) {
    super.copy(source, recursive);

    this.instanceMatrix.copy(source.instanceMatrix);

    if (source.instanceColor !== null) this.instanceColor = source.instanceColor.clone();

    this.count = source.count;

    if (source.boundingBox !== null) this.boundingBox = source.boundingBox.clone();
    if (source.boundingSphere !== null) this.boundingSphere = source.boundingSphere.clone();

    return this;
  }

  getColorAt(index: number, color: Color) {
    color.fromArray(this.instanceColor!.array, index * 3);
  }

  getMatrixAt(index: number, matrix: Matrix4) {
    matrix.fromArray(this.instanceMatrix.array, index * 16);
  }

  raycast(raycaster: Raycaster, intersects: Intersection[]) {
    const matrixWorld = this.matrixWorld;
    const raycastTimes = this.count;

    _mesh.geometry = this.geometry;
    _mesh.material = this.material;

    if (_mesh.material === undefined) return;

    // test with bounding sphere first

    if (this.boundingSphere === null) this.computeBoundingSphere();

    _sphere.copy(this.boundingSphere!);
    _sphere.applyMatrix4(matrixWorld);

    if (raycaster.ray.intersectsSphere(_sphere) === false) return;

    // now test each instance

    for (let instanceId = 0; instanceId < raycastTimes; instanceId++) {
      // calculate the world matrix for each instance

      this.getMatrixAt(instanceId, _instanceLocalMatrix);

      _instanceWorldMatrix.multiplyMatrices(matrixWorld, _instanceLocalMatrix);

      // the mesh represents this single instance

      _mesh.matrixWorld = _instanceWorldMatrix;

      _mesh.raycast(raycaster, _instanceIntersects);

      // process the result of raycast

      for (let i = 0, l = _instanceIntersects.length; i < l; i++) {
        const intersect = _instanceIntersects[i];
        intersect.instanceId = instanceId;
        intersect.object = this;
        intersects.push(intersect);
      }

      _instanceIntersects.length = 0;
    }
  }

  setColorAt(index: number, color: Color) {
    if (this.instanceColor === null) {
      this.instanceColor = new InstancedBufferAttribute(new Float32Array(this.instanceMatrix.count * 3), 3);
    }

    color.toArray(this.instanceColor.array, index * 3);
  }

  setMatrixAt(index: number, matrix: Matrix4) {
    matrix.toArray(this.instanceMatrix.array, index * 16);
  }

  updateMorphTargets() {}

  dispose() {
    this.dispatchEvent({ type: 'dispose' });
  }
}

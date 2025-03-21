import { Vector2 } from '../Vector2.js';
import { Vector3 } from '../Vector3.js';
import { Matrix4 } from '../Matrix4.js';
import { Triangle } from '../Triangle.js';
import { Object3D } from '../Object3D.js';
import { SpriteMaterial } from '../materials/SpriteMaterial.js';
import { InterleavedBufferAttribute } from '../InterleavedBufferAttribute.js';
import { InterleavedBuffer } from '../InterleavedBuffer.js';
import { BufferGeometry } from '../BufferGeometry.js';

let _geometry: BufferGeometry;

const _intersectPoint = new Vector3();
const _worldScale = new Vector3();
const _mvPosition = new Vector3();

const _alignedPosition = new Vector2();
const _rotatedPosition = new Vector2();
const _viewWorldMatrix = new Matrix4();

const _vA = new Vector3();
const _vB = new Vector3();
const _vC = new Vector3();

const _uvA = new Vector2();
const _uvB = new Vector2();
const _uvC = new Vector2();

class Sprite extends Object3D {
  constructor(material) {
    super();

    this.isSprite = true;

    this.type = 'Sprite';

    if (_geometry === undefined) {
      _geometry = new BufferGeometry();

      const float32Array = new Float32Array([
        -0.5, -0.5, 0, 0, 0, 0.5, -0.5, 0, 1, 0, 0.5, 0.5, 0, 1, 1, -0.5, 0.5, 0, 0, 1,
      ]);

      const interleavedBuffer = new InterleavedBuffer(float32Array, 5);

      _geometry.setIndex([0, 1, 2, 0, 2, 3]);
      _geometry.setAttribute('position', new InterleavedBufferAttribute(interleavedBuffer, 3, 0, false));
      _geometry.setAttribute('uv', new InterleavedBufferAttribute(interleavedBuffer, 2, 3, false));
    }

    this.geometry = _geometry;
    this.material = material !== undefined ? material : new SpriteMaterial();

    this.center = new Vector2(0.5, 0.5);
  }

  raycast(raycaster, intersects) {
    if (raycaster.camera === null) {
      console.error('THREE.Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.');
    }

    _worldScale.setFromMatrixScale(this.matrixWorld);

    _viewWorldMatrix.copy(raycaster.camera.matrixWorld);
    this.modelViewMatrix.multiplyMatrices(raycaster.camera.matrixWorldInverse, this.matrixWorld);

    _mvPosition.setFromMatrixPosition(this.modelViewMatrix);

    if (raycaster.camera.isPerspectiveCamera && this.material.sizeAttenuation === false) {
      _worldScale.multiplyScalar(-_mvPosition.z);
    }

    const rotation = this.material.rotation;
    let sin, cos;

    if (rotation !== 0) {
      cos = Math.cos(rotation);
      sin = Math.sin(rotation);
    }

    const center = this.center;

    transformVertex(_vA.set(-0.5, -0.5, 0), _mvPosition, center, _worldScale, sin, cos);
    transformVertex(_vB.set(0.5, -0.5, 0), _mvPosition, center, _worldScale, sin, cos);
    transformVertex(_vC.set(0.5, 0.5, 0), _mvPosition, center, _worldScale, sin, cos);

    _uvA.set(0, 0);
    _uvB.set(1, 0);
    _uvC.set(1, 1);

    // check first triangle
    let intersect = raycaster.ray.intersectTriangle(_vA, _vB, _vC, false, _intersectPoint);

    if (intersect === null) {
      // check second triangle
      transformVertex(_vB.set(-0.5, 0.5, 0), _mvPosition, center, _worldScale, sin, cos);
      _uvB.set(0, 1);

      intersect = raycaster.ray.intersectTriangle(_vA, _vC, _vB, false, _intersectPoint);
      if (intersect === null) {
        return;
      }
    }

    const distance = raycaster.ray.origin.distanceTo(_intersectPoint);

    if (distance < raycaster.near || distance > raycaster.far) return;

    intersects.push({
      distance: distance,
      point: _intersectPoint.clone(),
      uv: Triangle.getInterpolation(_intersectPoint, _vA, _vB, _vC, _uvA, _uvB, _uvC, new Vector2()),
      face: null,
      object: this,
    });
  }

  copy(source, recursive) {
    super.copy(source, recursive);

    if (source.center !== undefined) this.center.copy(source.center);

    this.material = source.material;

    return this;
  }
}

function transformVertex(
  vertexPosition: Vector2,
  mvPosition: Vector2,
  center: Vector2,
  scale: Vector2,
  sin: number,
  cos: number,
) {
  // compute position in camera space
  _alignedPosition.subVectors(vertexPosition, center).addScalar(0.5).multiply(scale);

  // to check if rotation is not zero
  if (sin !== undefined) {
    _rotatedPosition.x = cos * _alignedPosition.x - sin * _alignedPosition.y;
    _rotatedPosition.y = sin * _alignedPosition.x + cos * _alignedPosition.y;
  } else {
    _rotatedPosition.copy(_alignedPosition);
  }

  vertexPosition.copy(mvPosition);
  vertexPosition.x += _rotatedPosition.x;
  vertexPosition.y += _rotatedPosition.y;

  // transform to world space
  vertexPosition.applyMatrix4(_viewWorldMatrix);
}

export { Sprite };

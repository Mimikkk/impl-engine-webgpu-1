import { LightShadow } from './LightShadow.js';
import { Matrix4 } from '../Matrix4.js';
import { Vector2 } from '../Vector2.js';
import { Vector3 } from '../Vector3.js';
import { Vector4 } from '../Vector4.js';
import { PerspectiveCamera } from '../camera/PerspectiveCamera.js';
import { PointLight } from './PointLight.js';

const _projScreenMatrix = new Matrix4();
const _lightPositionWorld = new Vector3();
const _lookTarget = new Vector3();

export class PointLightShadow extends LightShadow {
  isPointLightShadow: boolean = true;
  _cubeDirections: Vector3[];
  _cubeUps: Vector3[];
  camera: PerspectiveCamera;

  constructor() {
    super(new PerspectiveCamera(90, 1, 0.5, 500));

    this._frameExtents = new Vector2(4, 2);

    this._viewportCount = 6;

    this._viewports = [
      // These viewports map a cube-map onto a 2D texture with the
      // following orientation:
      //
      //  xzXZ
      //   y Y
      //
      // X - Positive x direction
      // x - Negative x direction
      // Y - Positive y direction
      // y - Negative y direction
      // Z - Positive z direction
      // z - Negative z direction

      // positive X
      new Vector4(2, 1, 1, 1),
      // negative X
      new Vector4(0, 1, 1, 1),
      // positive Z
      new Vector4(3, 1, 1, 1),
      // negative Z
      new Vector4(1, 1, 1, 1),
      // positive Y
      new Vector4(3, 0, 1, 1),
      // negative Y
      new Vector4(1, 0, 1, 1),
    ];

    this._cubeDirections = [
      new Vector3(1, 0, 0),
      new Vector3(-1, 0, 0),
      new Vector3(0, 0, 1),
      new Vector3(0, 0, -1),
      new Vector3(0, 1, 0),
      new Vector3(0, -1, 0),
    ];

    this._cubeUps = [
      new Vector3(0, 1, 0),
      new Vector3(0, 1, 0),
      new Vector3(0, 1, 0),
      new Vector3(0, 1, 0),
      new Vector3(0, 0, 1),
      new Vector3(0, 0, -1),
    ];
  }

  updateMatrices(light: PointLight, viewportIndex: number = 0) {
    const camera = this.camera;
    const shadowMatrix = this.matrix;

    const far = light.distance || camera.far;

    if (far !== camera.far) {
      camera.far = far;
      camera.updateProjectionMatrix();
    }

    _lightPositionWorld.setFromMatrixPosition(light.matrixWorld);
    camera.position.copy(_lightPositionWorld);

    _lookTarget.copy(camera.position);
    _lookTarget.add(this._cubeDirections[viewportIndex]);
    camera.up.copy(this._cubeUps[viewportIndex]);
    camera.lookAt(_lookTarget);
    camera.updateMatrixWorld();

    shadowMatrix.makeTranslation(-_lightPositionWorld.x, -_lightPositionWorld.y, -_lightPositionWorld.z);

    _projScreenMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    this._frustum.setFromProjectionMatrix(_projScreenMatrix);
  }

  clone(): PointLightShadow {
    return new PointLightShadow();
  }
}

import { Matrix4 } from '../Matrix4.js';
import { Vector2 } from '../Vector2.js';
import { Vector3 } from '../Vector3.js';
import { Vector4 } from '../Vector4.js';
import { Frustum } from '../Frustum.js';
import { Camera } from '../camera/Camera.js';
import { Light } from './Light.js';

const _projScreenMatrix = new Matrix4();
const _lightPositionWorld = new Vector3();
const _lookTarget = new Vector3();

export class LightShadow {
  camera: Camera;
  bias: number;
  normalBias: number;
  radius: number;
  blurSamples: number;
  mapSize: Vector2;
  matrix: Matrix4;
  needsUpdate: boolean;
  autoUpdate: boolean;
  _frustum: Frustum;
  _frameExtents: Vector2;
  _viewportCount: number;
  _viewports: Vector4[];

  constructor(camera: Camera) {
    this.camera = camera;

    this.bias = 0;
    this.normalBias = 0;
    this.radius = 1;
    this.blurSamples = 8;

    this.mapSize = new Vector2(512, 512);

    this.matrix = new Matrix4();

    this.autoUpdate = true;
    this.needsUpdate = false;

    this._frustum = new Frustum();
    this._frameExtents = new Vector2(1, 1);

    this._viewportCount = 1;

    this._viewports = [new Vector4(0, 0, 1, 1)];
  }

  getViewportCount() {
    return this._viewportCount;
  }

  getFrustum() {
    return this._frustum;
  }

  updateMatrices(light: Light) {
    const shadowCamera = this.camera;
    const shadowMatrix = this.matrix;

    _lightPositionWorld.setFromMatrixPosition(light.matrixWorld);
    shadowCamera.position.copy(_lightPositionWorld);

    _lookTarget.setFromMatrixPosition(light.target.matrixWorld);
    shadowCamera.lookAt(_lookTarget);
    shadowCamera.updateMatrixWorld();

    _projScreenMatrix.multiplyMatrices(shadowCamera.projectionMatrix, shadowCamera.matrixWorldInverse);
    this._frustum.setFromProjectionMatrix(_projScreenMatrix);

    shadowMatrix.set(0.5, 0.0, 0.0, 0.5, 0.0, 0.5, 0.0, 0.5, 0.0, 0.0, 0.5, 0.5, 0.0, 0.0, 0.0, 1.0);

    shadowMatrix.multiply(_projScreenMatrix);
  }

  getViewport(viewportIndex: number) {
    return this._viewports[viewportIndex];
  }

  getFrameExtents() {
    return this._frameExtents;
  }

  copy(source: LightShadow): LightShadow {
    this.camera = source.camera.clone();

    this.bias = source.bias;
    this.radius = source.radius;

    this.mapSize.copy(source.mapSize);

    return this;
  }

  clone(): LightShadow {
    return new LightShadow(this.camera);
  }
}

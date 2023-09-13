import { Matrix4 } from '../math/Matrix4.js';
import { MathUtils } from '../math/MathUtils.js';
import { PerspectiveCamera } from './PerspectiveCamera.js';

const _eyeRight = new Matrix4();
const _eyeLeft = new Matrix4();
const _projectionMatrix = new Matrix4();

export class StereoCamera {
  declare isStereoCamera: true;
  declare type: 'StereoCamera';
  aspect: number;
  eyeSep: number;
  cameraL: PerspectiveCamera;
  cameraR: PerspectiveCamera;
  _cache: {
    focus: number | null;
    fov: number | null;
    aspect: number | null;
    near: number | null;
    far: number | null;
    zoom: number | null;
    eyeSep: number | null;
  };

  constructor() {
    this.aspect = 1;

    this.eyeSep = 0.064;

    this.cameraL = new PerspectiveCamera();
    this.cameraL.layers.enable(1);
    this.cameraL.matrixAutoUpdate = false;

    this.cameraR = new PerspectiveCamera();
    this.cameraR.layers.enable(2);
    this.cameraR.matrixAutoUpdate = false;

    this._cache = {
      focus: null,
      fov: null,
      aspect: null,
      near: null,
      far: null,
      zoom: null,
      eyeSep: null,
    };
  }

  update(camera: PerspectiveCamera): void {
    const cache = this._cache;

    const needsUpdate =
      cache.focus !== camera.focus ||
      cache.fov !== camera.fov ||
      cache.aspect !== camera.aspect * this.aspect ||
      cache.near !== camera.near ||
      cache.far !== camera.far ||
      cache.zoom !== camera.zoom ||
      cache.eyeSep !== this.eyeSep;

    if (needsUpdate) {
      cache.focus = camera.focus;
      cache.fov = camera.fov;
      cache.aspect = camera.aspect * this.aspect;
      cache.near = camera.near;
      cache.far = camera.far;
      cache.zoom = camera.zoom;
      cache.eyeSep = this.eyeSep;

      // Off-axis stereoscopic effect based on
      // http://paulbourke.net/stereographics/stereorender/

      _projectionMatrix.copy(camera.projectionMatrix);
      const eyeSepHalf = cache.eyeSep / 2;
      const eyeSepOnProjection = (eyeSepHalf * cache.near) / cache.focus;
      const ymax = (cache.near * Math.tan(MathUtils.DEG2RAD * cache.fov * 0.5)) / cache.zoom;
      let xmin, xmax;

      // translate xOffset

      _eyeLeft.elements[12] = -eyeSepHalf;
      _eyeRight.elements[12] = eyeSepHalf;

      // for left eye

      xmin = -ymax * cache.aspect + eyeSepOnProjection;
      xmax = ymax * cache.aspect + eyeSepOnProjection;

      _projectionMatrix.elements[0] = (2 * cache.near) / (xmax - xmin);
      _projectionMatrix.elements[8] = (xmax + xmin) / (xmax - xmin);

      this.cameraL.projectionMatrix.copy(_projectionMatrix);

      // for right eye

      xmin = -ymax * cache.aspect - eyeSepOnProjection;
      xmax = ymax * cache.aspect - eyeSepOnProjection;

      _projectionMatrix.elements[0] = (2 * cache.near) / (xmax - xmin);
      _projectionMatrix.elements[8] = (xmax + xmin) / (xmax - xmin);

      this.cameraR.projectionMatrix.copy(_projectionMatrix);
    }

    this.cameraL.matrixWorld.copy(camera.matrixWorld).multiply(_eyeLeft);
    this.cameraR.matrixWorld.copy(camera.matrixWorld).multiply(_eyeRight);
  }
}
StereoCamera.prototype.isStereoCamera = true;
StereoCamera.prototype.type = 'StereoCamera';

import { Camera } from './Camera.js';
import { MathUtils } from '../math/MathUtils.js';

export class PerspectiveCamera extends Camera {
  static is = (item: Camera): item is PerspectiveCamera => 'isPerspectiveCamera' in item;
  declare isPerspectiveCamera: true;
  declare type: string | 'PerspectiveCamera';

  fov: number;
  zoom: number;
  near: number;
  far: number;
  focus: number;
  aspect: number;
  view: {
    enabled: boolean;
    fullWidth: number;
    fullHeight: number;
    offsetX: number;
    offsetY: number;
    width: number;
    height: number;
  } | null;
  filmGaugeMM: number;
  filmOffsetMM: number;

  constructor(fov: number = 50, aspect: number = 1, near: number = 0.1, far: number = 2000) {
    super();

    this.isPerspectiveCamera = true;

    this.type = 'PerspectiveCamera';

    this.fov = fov;
    this.zoom = 1;

    this.near = near;
    this.far = far;
    this.focus = 10;

    this.aspect = aspect;
    this.view = null;

    this.filmGaugeMM = 35;
    this.filmOffsetMM = 0;

    this.updateProjectionMatrix();
  }

  copy(source: PerspectiveCamera, recursive?: boolean): this {
    super.copy(source, recursive);
    this.fov = source.fov;
    this.zoom = source.zoom;
    this.near = source.near;
    this.far = source.far;
    this.focus = source.focus;
    this.aspect = source.aspect;
    this.view = source.view === null ? null : Object.assign({}, source.view);
    this.filmGaugeMM = source.filmGaugeMM;
    this.filmOffsetMM = source.filmOffsetMM;
    return this;
  }
  setFocalLength(focalLength: number) {
    /** see {@link http://www.bobatkins.com/photography/technical/field_of_view.html} */
    const vExtentSlope = (0.5 * this.getFilmHeight()) / focalLength;

    this.fov = MathUtils.RAD2DEG * 2 * Math.atan(vExtentSlope);
    this.updateProjectionMatrix();
  }
  getFocalLength(): number {
    const vExtentSlope = Math.tan(MathUtils.DEG2RAD * 0.5 * this.fov);

    return (0.5 * this.getFilmHeight()) / vExtentSlope;
  }
  getEffectiveFOV(): number {
    return MathUtils.RAD2DEG * 2 * Math.atan(Math.tan(MathUtils.DEG2RAD * 0.5 * this.fov) / this.zoom);
  }
  getFilmWidth(): number {
    // film not completely covered in portrait format (aspect < 1)
    return this.filmGaugeMM * Math.min(this.aspect, 1);
  }
  getFilmHeight(): number {
    // film not completely covered in landscape format (aspect > 1)
    return this.filmGaugeMM / Math.max(this.aspect, 1);
  }
  setViewOffset(fullWidth: number, fullHeight: number, x: number, y: number, width: number, height: number): void {
    this.aspect = fullWidth / fullHeight;

    if (this.view === null) {
      this.view = {
        enabled: true,
        fullWidth: 1,
        fullHeight: 1,
        offsetX: 0,
        offsetY: 0,
        width: 1,
        height: 1,
      };
    }

    this.view.enabled = true;
    this.view.fullWidth = fullWidth;
    this.view.fullHeight = fullHeight;
    this.view.offsetX = x;
    this.view.offsetY = y;
    this.view.width = width;
    this.view.height = height;

    this.updateProjectionMatrix();
  }
  clearViewOffset(): void {
    if (this.view !== null) {
      this.view.enabled = false;
    }

    this.updateProjectionMatrix();
  }
  updateProjectionMatrix(): void {
    const near = this.near;
    let top = (near * Math.tan(MathUtils.DEG2RAD * 0.5 * this.fov)) / this.zoom;
    let height = 2 * top;
    let width = this.aspect * height;
    let left = -0.5 * width;

    if (this.view?.enabled) {
      const fullWidth = this.view.fullWidth;
      const fullHeight = this.view.fullHeight;

      left += (this.view.offsetX * width) / fullWidth;
      top -= (this.view.offsetY * height) / fullHeight;
      width *= this.view.width / fullWidth;
      height *= this.view.height / fullHeight;
    }

    const skew = this.filmOffsetMM;
    if (skew !== 0) left += (near * skew) / this.getFilmWidth();

    this.projectionMatrix.makePerspective(left, left + width, top, top - height, near, this.far, this.coordinateSystem);

    this.projectionMatrixInverse.copy(this.projectionMatrix).invert();
  }
}
PerspectiveCamera.prototype.isPerspectiveCamera = true;
PerspectiveCamera.prototype.type = 'PerspectiveCamera';

import { WebGLCoordinateSystem } from '../../common/Constants.js';
import { Matrix4 } from '../Matrix4.js';
import { Vector3 } from '../Vector3.js';
import { Object3D } from '../Object3D.js';

export class Camera extends Object3D {
  isCamera: boolean = true;
  type: string = 'Camera';
  matrixWorldInverse: Matrix4;
  projectionMatrix: Matrix4;
  coordinateSystem: number;
  projectionMatrixInverse: Matrix4;

  constructor() {
    super();
    this.matrixWorldInverse = new Matrix4();
    this.projectionMatrix = new Matrix4();
    this.projectionMatrixInverse = new Matrix4();
    this.coordinateSystem = WebGLCoordinateSystem;
  }

  copy(source: Camera, recursive?: boolean): Camera {
    super.copy(source, recursive);

    this.matrixWorldInverse.copy(source.matrixWorldInverse);
    this.projectionMatrix.copy(source.projectionMatrix);
    this.projectionMatrixInverse.copy(source.projectionMatrixInverse);
    this.coordinateSystem = source.coordinateSystem;

    return this;
  }

  getWorldDirection(target: Vector3) {
    this.updateWorldMatrix(true, false);

    const e = this.matrixWorld.elements;

    return target.set(-e[8], -e[9], -e[10]).normalize();
  }

  updateMatrixWorld(force?: boolean) {
    super.updateMatrixWorld(force);

    this.matrixWorldInverse.copy(this.matrixWorld).invert();
  }

  updateWorldMatrix(updateParents: boolean, updateChildren: boolean) {
    super.updateWorldMatrix(updateParents, updateChildren);

    this.matrixWorldInverse.copy(this.matrixWorld).invert();
  }

  clone(recursive?: boolean): Camera {
    return new Camera().copy(this, recursive);
  }
}

import { WebGLCoordinateSystem } from '../constants.js';
import { Matrix4 } from '../math/Matrix4.js';
import { Object3D } from '../core/Object3D.js';
import { CoordinateSystem } from '../math/types.js';
import { Vector3 } from '../math/Vector3.js';

export class Camera extends Object3D {
  declare ['constructor']: new () => this;
  declare isCamera: true;
  declare type: string | 'Camera';
  matrixWorldInverse: Matrix4;
  projectionMatrix: Matrix4;
  projectionMatrixInverse: Matrix4;
  coordinateSystem: CoordinateSystem;

  constructor() {
    super();

    this.matrixWorldInverse = new Matrix4();

    this.projectionMatrix = new Matrix4();
    this.projectionMatrixInverse = new Matrix4();

    this.coordinateSystem = WebGLCoordinateSystem;
  }

  copy(source: Camera, recursive?: boolean): this {
    super.copy(source, recursive);

    this.projectionMatrixInverse.copy(source.projectionMatrixInverse);
    this.matrixWorldInverse.copy(source.matrixWorldInverse);
    this.projectionMatrix.copy(source.projectionMatrix);
    this.coordinateSystem = source.coordinateSystem;

    return this;
  }

  getWorldDirection(target: Vector3): Vector3 {
    this.updateWorldMatrix(true, false);
    const e = this.matrixWorld.elements;
    return target.set(-e[8], -e[9], -e[10]).normalize();
  }

  updateMatrixWorld(force?: boolean): this {
    super.updateMatrixWorld(force);
    this.matrixWorldInverse.copy(this.matrixWorld).invert();
    return this;
  }

  updateWorldMatrix(updateParents: boolean, updateChildren: boolean): this {
    super.updateWorldMatrix(updateParents, updateChildren);
    this.matrixWorldInverse.copy(this.matrixWorld).invert();
    return this;
  }

  clone(): this {
    return new this.constructor().copy(this);
  }
}
Camera.prototype.isCamera = true;
Camera.prototype.type = 'Camera';

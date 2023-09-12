import { PerspectiveCamera } from './PerspectiveCamera.js';

export class ArrayCamera extends PerspectiveCamera {
  declare ['constructor']: new () => this;

  declare isArrayCamera: true;
  declare type: string | 'ArrayCamera';
  cameras: PerspectiveCamera[];

  constructor(array: PerspectiveCamera[] = []) {
    super();
    this.cameras = array;
  }
}
ArrayCamera.prototype.isArrayCamera = true;
ArrayCamera.prototype.type = 'ArrayCamera';

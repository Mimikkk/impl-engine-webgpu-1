import { PerspectiveCamera } from './PerspectiveCamera.js';

export class ArrayCamera extends PerspectiveCamera {
  //@ts-expect-error
  declare ['constructor']: typeof ArrayCamera;
  declare isArrayCamera: true;
  //@ts-expect-error
  declare type: 'ArrayCamera';
  cameras: PerspectiveCamera[];

  constructor(array: PerspectiveCamera[] = []) {
    super();
    this.cameras = array;
  }
}
ArrayCamera.prototype.isArrayCamera = true;
ArrayCamera.prototype.type = 'ArrayCamera';

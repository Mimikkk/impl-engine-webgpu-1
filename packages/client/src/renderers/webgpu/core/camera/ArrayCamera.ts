import { PerspectiveCamera } from './PerspectiveCamera.js';
import { Camera } from './Camera.js';

export class ArrayCamera extends PerspectiveCamera {
  static isArrayCamera: boolean = true;
  cameras: Camera[];

  constructor(array: Camera[] = []) {
    super();
    this.cameras = array;
  }
}

import { Object3D } from '../Object3D.js';

export class Bone extends Object3D {
  isBone: boolean = true;
  type: string = 'Bone';

  constructor() {
    super();
  }
}

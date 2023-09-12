import { Object3D } from '../core/Object3D.js';

export class Bone extends Object3D {
  declare ['constructor']: typeof Bone;
  declare isBone: true;
  declare type: 'Bone';

  constructor() {
    super();
  }
}
Bone.prototype.isBone = true;
Bone.prototype.type = 'Bone';

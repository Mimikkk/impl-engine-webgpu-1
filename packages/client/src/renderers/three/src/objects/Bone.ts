import { Object3D } from '../core/Object3D.js';

export class Bone extends Object3D {
  static is = (item?: any): item is Bone => !!item && 'isBone' in item;
  declare ['constructor']: new () => this;

  declare isBone: true;
  declare type: string | 'Bone';

  constructor() {
    super();
  }
}
Bone.prototype.isBone = true;
Bone.prototype.type = 'Bone';

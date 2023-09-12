import { Object3D } from '../core/Object3D.js';

export class Group extends Object3D {
  declare ['constructor']: typeof Group;
  declare isGroup: true;
  declare type: 'Group';
}
Group.prototype.isGroup = true;
Group.prototype.type = 'Group';

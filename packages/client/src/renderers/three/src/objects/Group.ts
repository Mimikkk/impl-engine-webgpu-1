import { Object3D } from '../core/Object3D.js';

export class Group extends Object3D {
  declare ['constructor']: new () => this;

  declare isGroup: true;
  declare type: string | 'Group';
}
Group.prototype.isGroup = true;
Group.prototype.type = 'Group';

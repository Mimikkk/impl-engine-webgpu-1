import { Object3D } from '../Object3D.js';

export class Group extends Object3D {
  isGroup: boolean = true;
  type: string = 'Group';

  constructor() {
    super();
  }
}

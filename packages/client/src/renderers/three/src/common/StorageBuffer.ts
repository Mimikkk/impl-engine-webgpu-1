import Buffer from './Buffer.js';

export class StorageBuffer extends Buffer {
  constructor(name, attribute) {
    super(name, attribute.array);

    this.attribute = attribute;

    this.isStorageBuffer = true;
  }
}

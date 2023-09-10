import { BufferAttribute } from './BufferAttribute.js';

export class InstancedBufferAttribute extends BufferAttribute {
  constructor(array, itemSize, normalized, meshPerAttribute = 1) {
    super(array, itemSize, normalized);

    this.isInstancedBufferAttribute = true;

    this.meshPerAttribute = meshPerAttribute;
  }

  copy(source) {
    super.copy(source);

    this.meshPerAttribute = source.meshPerAttribute;

    return this;
  }
}

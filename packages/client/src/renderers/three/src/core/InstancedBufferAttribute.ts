import { BufferAttribute } from './BufferAttribute.js';
import { TypedArray } from '../types.js';

export class InstancedBufferAttribute extends BufferAttribute {
  declare isInstancedBufferAttribute: true;
  meshPerAttribute: number;

  constructor(array: TypedArray, itemSize: number, normalized?: boolean, meshPerAttribute: number = 1) {
    super(array, itemSize, normalized);

    this.meshPerAttribute = meshPerAttribute;
  }

  copy(source: InstancedBufferAttribute): this {
    super.copy(source);

    this.meshPerAttribute = source.meshPerAttribute;

    return this;
  }
}
InstancedBufferAttribute.prototype.isInstancedBufferAttribute = true;

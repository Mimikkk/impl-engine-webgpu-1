import { BufferAttribute } from './BufferAttribute.js';
import { TypedArray } from 'three';

export class InstancedBufferAttribute extends BufferAttribute {
  isInstancedBufferAttribute: boolean;
  meshPerAttribute: number;

  constructor(array: TypedArray, itemSize: number, normalized: boolean, meshPerAttribute: number = 1) {
    super(array, itemSize, normalized);

    this.isInstancedBufferAttribute = true;

    this.meshPerAttribute = meshPerAttribute;
  }

  copy(source: InstancedBufferAttribute) {
    super.copy(source);

    this.meshPerAttribute = source.meshPerAttribute;

    return this;
  }

  toJSON() {
    const data = super.toJSON() as any;

    data.meshPerAttribute = this.meshPerAttribute;
    data.isInstancedBufferAttribute = true;

    return data;
  }
}

import { InterleavedBuffer } from './InterleavedBuffer.js';
import { TypedArray } from '../types.js';

export class InstancedInterleavedBuffer extends InterleavedBuffer {
  declare isInstancedInterleavedBuffer: true;
  meshPerAttribute: number;

  constructor(array: TypedArray, stride: number, meshPerAttribute: number = 1) {
    super(array, stride);

    this.meshPerAttribute = meshPerAttribute;
  }

  copy(source: InstancedInterleavedBuffer): this {
    super.copy(source);

    this.meshPerAttribute = source.meshPerAttribute;

    return this;
  }

  clone(data: TypedArray): this {
    const ib = super.clone(data);

    ib.meshPerAttribute = this.meshPerAttribute;

    return ib;
  }
}
InstancedInterleavedBuffer.prototype.isInstancedInterleavedBuffer = true;

import { InterleavedBuffer } from './InterleavedBuffer.js';
import { TypedArray } from './types.js';

export class InstancedInterleavedBuffer extends InterleavedBuffer {
  isInstancedInterleavedBuffer: boolean;
  meshPerAttribute: number;

  constructor(array: TypedArray, stride: number, meshPerAttribute: number = 1) {
    super(array, stride);

    this.isInstancedInterleavedBuffer = true;
    this.meshPerAttribute = meshPerAttribute;
  }

  copy(source: InstancedInterleavedBuffer) {
    super.copy(source);

    this.meshPerAttribute = source.meshPerAttribute;

    return this;
  }

  clone(item: InstancedInterleavedBuffer) {
    const buffer = super.clone(item) as any;

    buffer.meshPerAttribute = this.meshPerAttribute;

    return buffer;
  }
}

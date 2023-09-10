import { InterleavedBuffer } from './InterleavedBuffer.js';

export class InstancedInterleavedBuffer extends InterleavedBuffer {
  constructor(array, stride, meshPerAttribute = 1) {
    super(array, stride);

    this.isInstancedInterleavedBuffer = true;

    this.meshPerAttribute = meshPerAttribute;
  }

  copy(source) {
    super.copy(source);

    this.meshPerAttribute = source.meshPerAttribute;

    return this;
  }

  clone(data) {
    const ib = super.clone(data);

    ib.meshPerAttribute = this.meshPerAttribute;

    return ib;
  }
}

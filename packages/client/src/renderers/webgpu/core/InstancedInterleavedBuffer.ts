import { InterleavedBuffer } from './InterleavedBuffer.js';
import { TypedArray } from 'three';

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

  toJSON(data: InstancedInterleavedBuffer) {
    const json = super.toJSON(data) as any;

    json.isInstancedInterleavedBuffer = true;
    json.meshPerAttribute = this.meshPerAttribute;

    return json;
  }
}

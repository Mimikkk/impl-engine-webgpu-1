import { MathUtils } from '../math/MathUtils.js';
import { StaticDrawUsage } from '../constants.js';
import { TypedArray, Usage } from '../types.js';
import { InterleavedBufferAttribute } from './InterleavedBufferAttribute.js';

export class InterleavedBuffer {
  declare ['constructor']: new (array: TypedArray, stride: number) => this;
  declare isInterleavedBuffer: true;
  declare array: TypedArray;
  stride: number;
  count: number;
  usage: Usage;
  updateRange: { offset: number; count: number };
  version: number;
  uuid: string;

  constructor(array: TypedArray, stride: number) {
    this.array = array;
    this.stride = stride;
    this.count = array !== undefined ? array.length / stride : 0;

    this.usage = StaticDrawUsage;
    this.updateRange = { offset: 0, count: -1 };

    this.version = 0;

    this.uuid = MathUtils.generateUUID();
  }

  set needsUpdate(value: boolean) {
    if (value) this.version++;
  }

  onUploadCallback() {}

  setUsage(value: Usage): this {
    this.usage = value;

    return this;
  }

  copy(source: InterleavedBuffer): this {
    //@ts-expect-error
    this.array = new source.array.constructor(source.array);
    this.count = source.count;
    this.stride = source.stride;
    this.usage = source.usage;

    return this;
  }

  copyAt(index1: number, attribute: InterleavedBufferAttribute, index2: number): this {
    index1 *= this.stride;
    index2 *= attribute.stride;

    for (let i = 0, l = this.stride; i < l; i++) {
      this.array[index1 + i] = attribute.array[index2 + i];
    }

    return this;
  }

  set(value: ArrayLike<number>, offset: number = 0) {
    this.array.set(value, offset);

    return this;
  }

  clone(data: { arrayBuffers?: { [key: string]: ArrayBuffer } }) {
    if (data.arrayBuffers === undefined) {
      data.arrayBuffers = {};
    }

    //@ts-expect-error
    if (this.array.buffer._uuid === undefined) {
      //@ts-expect-error
      this.array.buffer._uuid = MathUtils.generateUUID();
    }

    //@ts-expect-error
    if (data.arrayBuffers[this.array.buffer._uuid] === undefined) {
      //@ts-expect-error
      data.arrayBuffers[this.array.buffer._uuid] = this.array.slice(0).buffer;
    }

    //@ts-expect-error
    const array = new this.array.constructor(data.arrayBuffers[this.array.buffer._uuid]);

    const ib = new this.constructor(array, this.stride);
    ib.setUsage(this.usage);

    return ib;
  }

  onUpload(callback: () => void) {
    this.onUploadCallback = callback;

    return this;
  }
}

InterleavedBuffer.prototype.isInterleavedBuffer = true;

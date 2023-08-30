import { MathUtils } from './MathUtils.js';
import { StaticDrawUsage } from '../common/Constants.js';
import { TypedArray } from './types.js';

export class InterleavedBuffer {
  isInterleavedBuffer: boolean;
  array: TypedArray & { buffer: { _uuid?: string } };
  stride: number;
  count: number;
  usage: number;
  updateRange: { offset: number; count: number };
  version: number;
  uuid: string;
  arrayBuffers: Record<string, ArrayBufferLike>;

  constructor(array: TypedArray, stride: number) {
    this.isInterleavedBuffer = true;

    this.array = array;
    this.stride = stride;
    this.count = (array?.length ?? 0) / stride;

    this.usage = StaticDrawUsage;
    this.updateRange = { offset: 0, count: -1 };

    this.version = 0;

    this.uuid = MathUtils.generateUUID();
  }

  onUploadCallback() {}

  set needsUpdate(value: boolean) {
    if (value) this.version++;
  }

  setUsage(value: number) {
    this.usage = value;

    return this;
  }

  copy(source: InterleavedBuffer) {
    //@ts-expect-error - contains a constructor
    this.array = new source.array.constructor(source.array);
    this.count = source.count;
    this.stride = source.stride;
    this.usage = source.usage;

    return this;
  }

  copyAt(index1: number, attribute: InterleavedBuffer, index2: number) {
    index1 *= this.stride;
    index2 *= attribute.stride;

    for (let i = 0, l = this.stride; i < l; i++) {
      this.array[index1 + i] = attribute.array[index2 + i];
    }

    return this;
  }

  set(value: number[], offset: number = 0) {
    this.array.set(value, offset);

    return this;
  }

  clone(data: InterleavedBuffer) {
    if (data.arrayBuffers === undefined) {
      data.arrayBuffers = {};
    }

    if (this.array.buffer._uuid === undefined) {
      this.array.buffer._uuid = MathUtils.generateUUID();
    }

    if (data.arrayBuffers[this.array.buffer._uuid] === undefined) {
      data.arrayBuffers[this.array.buffer._uuid] = this.array.slice(0).buffer;
    }

    //@ts-expect-error - contains a constructor
    const array = new this.array.constructor(data.arrayBuffers[this.array.buffer._uuid]);

    const ib = new InterleavedBuffer(array, this.stride);
    ib.setUsage(this.usage);

    return ib;
  }

  onUpload(callback: () => void) {
    this.onUploadCallback = callback;

    return this;
  }

  toJSON(data: any) {
    if (data.arrayBuffers === undefined) {
      data.arrayBuffers = {};
    }

    // generate UUID for array buffer if necessary

    if (this.array.buffer._uuid === undefined) {
      this.array.buffer._uuid = MathUtils.generateUUID();
    }

    if (data.arrayBuffers[this.array.buffer._uuid] === undefined) {
      data.arrayBuffers[this.array.buffer._uuid] = Array.from(new Uint32Array(this.array.buffer));
    }

    //

    return {
      uuid: this.uuid,
      buffer: this.array.buffer._uuid,
      type: this.array.constructor.name,
      stride: this.stride,
    };
  }
}

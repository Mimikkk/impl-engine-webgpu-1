import { Vector3 } from '../math/Vector3.js';
import { BufferAttribute } from './BufferAttribute.js';
import { denormalize, normalize } from '../math/MathUtils.js';
import { InterleavedBuffer } from './InterleavedBuffer.js';
import { Matrix4 } from '../math/Matrix4.js';
import { Matrix3 } from '../math/Matrix3.js';
import { InstancedInterleavedBuffer } from './InstancedInterleavedBuffer.js';

const _vector = new Vector3();

export class InterleavedBufferAttribute {
  static is(item: any): item is InterleavedBufferAttribute {
    return item?.isInterleavedBufferAttribute;
  }
  name: string;
  data: InterleavedBuffer | InstancedInterleavedBuffer;
  itemSize: number;
  offset: number;
  stride: number;
  normalized: boolean;
  declare isInterleavedBufferAttribute: boolean;

  constructor(
    interleavedBuffer: InterleavedBuffer | InstancedInterleavedBuffer,
    itemSize: number,
    offset: number,
    normalized: boolean = false,
  ) {
    this.isInterleavedBufferAttribute = true;

    this.name = '';

    this.data = interleavedBuffer;
    this.itemSize = itemSize;
    this.offset = offset;

    this.normalized = normalized;
  }

  get count() {
    return this.data.count;
  }

  get array() {
    return this.data.array;
  }

  set needsUpdate(value: boolean) {
    this.data.needsUpdate = value;
  }

  applyMatrix4(m: Matrix4): this {
    for (let i = 0, l = this.data.count; i < l; i++) {
      _vector.fromBufferAttribute(this, i);

      _vector.applyMatrix4(m);

      this.setXYZ(i, _vector.x, _vector.y, _vector.z);
    }

    return this;
  }

  applyNormalMatrix(m: Matrix3): this {
    for (let i = 0, l = this.count; i < l; i++) {
      _vector.fromBufferAttribute(this, i);

      _vector.applyNormalMatrix(m);

      this.setXYZ(i, _vector.x, _vector.y, _vector.z);
    }

    return this;
  }

  transformDirection(m: Matrix4): this {
    for (let i = 0, l = this.count; i < l; i++) {
      _vector.fromBufferAttribute(this, i);

      _vector.transformDirection(m);

      this.setXYZ(i, _vector.x, _vector.y, _vector.z);
    }

    return this;
  }

  setX(index: number, x: number): this {
    if (this.normalized) x = normalize(x, this.array);

    this.data.array[index * this.data.stride + this.offset] = x;

    return this;
  }

  setY(index: number, y: number): this {
    if (this.normalized) y = normalize(y, this.array);

    this.data.array[index * this.data.stride + this.offset + 1] = y;

    return this;
  }

  setZ(index: number, z: number): this {
    if (this.normalized) z = normalize(z, this.array);

    this.data.array[index * this.data.stride + this.offset + 2] = z;

    return this;
  }

  setW(index: number, w: number): this {
    if (this.normalized) w = normalize(w, this.array);

    this.data.array[index * this.data.stride + this.offset + 3] = w;

    return this;
  }

  getX(index: number): number {
    let x = this.data.array[index * this.data.stride + this.offset];

    if (this.normalized) x = denormalize(x, this.array);

    return x;
  }

  getY(index: number): number {
    let y = this.data.array[index * this.data.stride + this.offset + 1];

    if (this.normalized) y = denormalize(y, this.array);

    return y;
  }

  getZ(index: number): number {
    let z = this.data.array[index * this.data.stride + this.offset + 2];

    if (this.normalized) z = denormalize(z, this.array);

    return z;
  }

  getW(index: number): number {
    let w = this.data.array[index * this.data.stride + this.offset + 3];

    if (this.normalized) w = denormalize(w, this.array);

    return w;
  }

  setXY(index: number, x: number, y: number): this {
    index = index * this.data.stride + this.offset;

    if (this.normalized) {
      x = normalize(x, this.array);
      y = normalize(y, this.array);
    }

    this.data.array[index + 0] = x;
    this.data.array[index + 1] = y;

    return this;
  }

  setXYZ(index: number, x: number, y: number, z: number): this {
    index = index * this.data.stride + this.offset;

    if (this.normalized) {
      x = normalize(x, this.array);
      y = normalize(y, this.array);
      z = normalize(z, this.array);
    }

    this.data.array[index + 0] = x;
    this.data.array[index + 1] = y;
    this.data.array[index + 2] = z;

    return this;
  }

  setXYZW(index: number, x: number, y: number, z: number, w: number): this {
    index = index * this.data.stride + this.offset;

    if (this.normalized) {
      x = normalize(x, this.array);
      y = normalize(y, this.array);
      z = normalize(z, this.array);
      w = normalize(w, this.array);
    }

    this.data.array[index + 0] = x;
    this.data.array[index + 1] = y;
    this.data.array[index + 2] = z;
    this.data.array[index + 3] = w;

    return this;
  }

  clone(data: {
    interleavedBuffers: {
      [key: string]: InterleavedBuffer;
    };
  }) {
    if (data === undefined) {
      console.log(
        'THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.',
      );

      const array = [];

      for (let i = 0; i < this.count; i++) {
        const index = i * this.data.stride + this.offset;

        for (let j = 0; j < this.itemSize; j++) {
          array.push(this.data.array[index + j]);
        }
      }

      //@ts-expect-error
      return new BufferAttribute(new this.array.constructor(array), this.itemSize, this.normalized);
    } else {
      if (data.interleavedBuffers === undefined) {
        data.interleavedBuffers = {};
      }

      if (data.interleavedBuffers[this.data.uuid] === undefined) {
        //@ts-expect-error
        data.interleavedBuffers[this.data.uuid] = this.data.clone(data);
      }

      return new InterleavedBufferAttribute(
        data.interleavedBuffers[this.data.uuid],
        this.itemSize,
        this.offset,
        this.normalized,
      );
    }
  }
}
InterleavedBufferAttribute.prototype.isInterleavedBufferAttribute = true;

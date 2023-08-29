import { Vector3 } from './Vector3.js';
import { Vector2 } from './Vector2.js';
import { denormalize, normalize } from './MathUtils.js';
import { FloatType, StaticDrawUsage } from '../common/Constants.js';
import { fromHalfFloat, toHalfFloat } from './DataUtils.js';
import { TypedArray } from 'three';
import { Matrix3 } from './Matrix3.js';
import { Matrix4 } from './Matrix4.js';

const _vector = /*@__PURE__*/ new Vector3();
const _vector2 = /*@__PURE__*/ new Vector2();

export class BufferAttribute {
  isBufferAttribute: boolean;
  name: string;
  array: TypedArray;
  itemSize: number;
  count: number;
  normalized: boolean;
  usage: number;
  updateRange: { offset: number; count: number };
  gpuType: number;
  version: number;

  constructor(array: TypedArray, itemSize: number, normalized: boolean = false) {
    if (Array.isArray(array)) {
      throw new TypeError('THREE.BufferAttribute: array should be a Typed Array.');
    }

    this.isBufferAttribute = true;

    this.name = '';

    this.array = array;
    this.itemSize = itemSize;
    this.count = (array?.length ?? 0) / itemSize;
    this.normalized = normalized;

    this.usage = StaticDrawUsage;
    this.updateRange = { offset: 0, count: -1 };
    this.gpuType = FloatType;

    this.version = 0;
  }

  onUploadCallback() {}

  set needsUpdate(value: boolean) {
    if (value) this.version++;
  }

  setUsage(value: number) {
    this.usage = value;

    return this;
  }

  copy(source: BufferAttribute) {
    this.name = source.name;
    //@ts-expect-error - contains a constructor
    this.array = new source.array.constructor(source.array);
    this.itemSize = source.itemSize;
    this.count = source.count;
    this.normalized = source.normalized;

    this.usage = source.usage;
    this.gpuType = source.gpuType;

    return this;
  }

  copyAt(index1: number, attribute: BufferAttribute, index2: number) {
    index1 *= this.itemSize;
    index2 *= attribute.itemSize;

    for (let i = 0, l = this.itemSize; i < l; i++) {
      this.array[index1 + i] = attribute.array[index2 + i];
    }

    return this;
  }

  copyArray(array: TypedArray) {
    this.array.set(array);

    return this;
  }

  applyMatrix3(m: Matrix3) {
    if (this.itemSize === 2) {
      for (let i = 0, l = this.count; i < l; i++) {
        _vector2.fromBufferAttribute(this, i);
        _vector2.applyMatrix3(m);

        this.setXY(i, _vector2.x, _vector2.y);
      }
    } else if (this.itemSize === 3) {
      for (let i = 0, l = this.count; i < l; i++) {
        _vector.fromBufferAttribute(this, i);
        _vector.applyMatrix3(m);

        this.setXYZ(i, _vector.x, _vector.y, _vector.z);
      }
    }

    return this;
  }

  applyMatrix4(m: Matrix4) {
    for (let i = 0, l = this.count; i < l; i++) {
      _vector.fromBufferAttribute(this, i);

      _vector.applyMatrix4(m);

      this.setXYZ(i, _vector.x, _vector.y, _vector.z);
    }

    return this;
  }

  applyNormalMatrix(m: Matrix3) {
    for (let i = 0, l = this.count; i < l; i++) {
      _vector.fromBufferAttribute(this, i);

      _vector.applyNormalMatrix(m);

      this.setXYZ(i, _vector.x, _vector.y, _vector.z);
    }

    return this;
  }

  transformDirection(m: Matrix4) {
    for (let i = 0, l = this.count; i < l; i++) {
      _vector.fromBufferAttribute(this, i);

      _vector.transformDirection(m);

      this.setXYZ(i, _vector.x, _vector.y, _vector.z);
    }

    return this;
  }

  set(value: number[], offset: number = 0) {
    // Matching BufferAttribute constructor, do not normalize the array.
    this.array.set(value, offset);

    return this;
  }

  getComponent(index: number, component: number) {
    let value = this.array[index * this.itemSize + component];

    if (this.normalized) value = denormalize(value, this.array);

    return value;
  }

  setComponent(index: number, component: number, value: number) {
    if (this.normalized) value = normalize(value, this.array);

    this.array[index * this.itemSize + component] = value;

    return this;
  }

  getX(index: number) {
    let x = this.array[index * this.itemSize];

    if (this.normalized) x = denormalize(x, this.array);

    return x;
  }

  setX(index: number, x: number) {
    if (this.normalized) x = normalize(x, this.array);

    this.array[index * this.itemSize] = x;

    return this;
  }

  getY(index: number) {
    let y = this.array[index * this.itemSize + 1];

    if (this.normalized) y = denormalize(y, this.array);

    return y;
  }

  setY(index: number, y: number) {
    if (this.normalized) y = normalize(y, this.array);

    this.array[index * this.itemSize + 1] = y;

    return this;
  }

  getZ(index: number) {
    let z = this.array[index * this.itemSize + 2];

    if (this.normalized) z = denormalize(z, this.array);

    return z;
  }

  setZ(index: number, z: number) {
    if (this.normalized) z = normalize(z, this.array);

    this.array[index * this.itemSize + 2] = z;

    return this;
  }

  getW(index: number) {
    let w = this.array[index * this.itemSize + 3];

    if (this.normalized) w = denormalize(w, this.array);

    return w;
  }

  setW(index: number, w: number) {
    if (this.normalized) w = normalize(w, this.array);

    this.array[index * this.itemSize + 3] = w;

    return this;
  }

  setXY(index: number, x: number, y: number) {
    index *= this.itemSize;

    if (this.normalized) {
      x = normalize(x, this.array);
      y = normalize(y, this.array);
    }

    this.array[index + 0] = x;
    this.array[index + 1] = y;

    return this;
  }

  setXYZ(index: number, x: number, y: number, z: number) {
    index *= this.itemSize;

    if (this.normalized) {
      x = normalize(x, this.array);
      y = normalize(y, this.array);
      z = normalize(z, this.array);
    }

    this.array[index + 0] = x;
    this.array[index + 1] = y;
    this.array[index + 2] = z;

    return this;
  }

  setXYZW(index: number, x: number, y: number, z: number, w: number) {
    index *= this.itemSize;

    if (this.normalized) {
      x = normalize(x, this.array);
      y = normalize(y, this.array);
      z = normalize(z, this.array);
      w = normalize(w, this.array);
    }

    this.array[index + 0] = x;
    this.array[index + 1] = y;
    this.array[index + 2] = z;
    this.array[index + 3] = w;

    return this;
  }

  onUpload(callback: () => void) {
    this.onUploadCallback = callback;

    return this;
  }

  clone() {
    return new BufferAttribute(this.array, this.itemSize).copy(this);
  }

  toJSON() {
    const data: any = {
      itemSize: this.itemSize,
      type: this.array.constructor.name,
      array: Array.from(this.array),
      normalized: this.normalized,
    };

    if (this.name !== '') data.name = this.name;
    if (this.usage !== StaticDrawUsage) data.usage = this.usage;
    if (this.updateRange.offset !== 0 || this.updateRange.count !== -1) data.updateRange = this.updateRange;

    return data;
  }
}

export class Int8BufferAttribute extends BufferAttribute {
  constructor(array: TypedArray, itemSize: number, normalized?: boolean) {
    super(new Int8Array(array), itemSize, normalized);
  }
}

export class Uint8BufferAttribute extends BufferAttribute {
  constructor(array: TypedArray, itemSize: number, normalized?: boolean) {
    super(new Uint8Array(array), itemSize, normalized);
  }
}

export class Uint8ClampedBufferAttribute extends BufferAttribute {
  constructor(array: TypedArray, itemSize: number, normalized?: boolean) {
    super(new Uint8ClampedArray(array), itemSize, normalized);
  }
}

export class Int16BufferAttribute extends BufferAttribute {
  constructor(array: TypedArray, itemSize: number, normalized?: boolean) {
    super(new Int16Array(array), itemSize, normalized);
  }
}

export class Uint16BufferAttribute extends BufferAttribute {
  constructor(array: TypedArray, itemSize: number, normalized?: boolean) {
    super(new Uint16Array(array), itemSize, normalized);
  }
}

export class Int32BufferAttribute extends BufferAttribute {
  constructor(array: TypedArray, itemSize: number, normalized?: boolean) {
    super(new Int32Array(array), itemSize, normalized);
  }
}

export class Uint32BufferAttribute extends BufferAttribute {
  constructor(array: TypedArray, itemSize: number, normalized?: boolean) {
    super(new Uint32Array(array), itemSize, normalized);
  }
}

export class Float16BufferAttribute extends BufferAttribute {
  isFloat16BufferAttribute: boolean;
  constructor(array: TypedArray, itemSize: number, normalized?: boolean) {
    super(new Uint16Array(array), itemSize, normalized);

    this.isFloat16BufferAttribute = true;
  }

  getX(index: number) {
    let x = fromHalfFloat(this.array[index * this.itemSize]);

    if (this.normalized) x = denormalize(x, this.array);

    return x;
  }

  setX(index: number, x: number) {
    if (this.normalized) x = normalize(x, this.array);

    this.array[index * this.itemSize] = toHalfFloat(x);

    return this;
  }

  getY(index: number) {
    let y = fromHalfFloat(this.array[index * this.itemSize + 1]);

    if (this.normalized) y = denormalize(y, this.array);

    return y;
  }

  setY(index: number, y: number) {
    if (this.normalized) y = normalize(y, this.array);

    this.array[index * this.itemSize + 1] = toHalfFloat(y);

    return this;
  }

  getZ(index: number) {
    let z = fromHalfFloat(this.array[index * this.itemSize + 2]);

    if (this.normalized) z = denormalize(z, this.array);

    return z;
  }

  setZ(index: number, z: number) {
    if (this.normalized) z = normalize(z, this.array);

    this.array[index * this.itemSize + 2] = toHalfFloat(z);

    return this;
  }

  getW(index: number) {
    let w = fromHalfFloat(this.array[index * this.itemSize + 3]);

    if (this.normalized) w = denormalize(w, this.array);

    return w;
  }

  setW(index: number, w: number) {
    if (this.normalized) w = normalize(w, this.array);

    this.array[index * this.itemSize + 3] = toHalfFloat(w);

    return this;
  }

  setXY(index: number, x: number, y: number) {
    index *= this.itemSize;

    if (this.normalized) {
      x = normalize(x, this.array);
      y = normalize(y, this.array);
    }

    this.array[index + 0] = toHalfFloat(x);
    this.array[index + 1] = toHalfFloat(y);

    return this;
  }

  setXYZ(index: number, x: number, y: number, z: number) {
    index *= this.itemSize;

    if (this.normalized) {
      x = normalize(x, this.array);
      y = normalize(y, this.array);
      z = normalize(z, this.array);
    }

    this.array[index + 0] = toHalfFloat(x);
    this.array[index + 1] = toHalfFloat(y);
    this.array[index + 2] = toHalfFloat(z);

    return this;
  }

  setXYZW(index: number, x: number, y: number, z: number, w: number) {
    index *= this.itemSize;

    if (this.normalized) {
      x = normalize(x, this.array);
      y = normalize(y, this.array);
      z = normalize(z, this.array);
      w = normalize(w, this.array);
    }

    this.array[index + 0] = toHalfFloat(x);
    this.array[index + 1] = toHalfFloat(y);
    this.array[index + 2] = toHalfFloat(z);
    this.array[index + 3] = toHalfFloat(w);

    return this;
  }
}

export class Float32BufferAttribute extends BufferAttribute {
  constructor(array: TypedArray, itemSize: number, normalized?: boolean) {
    super(new Float32Array(array), itemSize, normalized);
  }
}

export class Float64BufferAttribute extends BufferAttribute {
  constructor(array: TypedArray, itemSize: number, normalized?: boolean) {
    super(new Float64Array(array), itemSize, normalized);
  }
}

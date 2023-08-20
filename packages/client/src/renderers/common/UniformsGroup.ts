//@ts-nocheck
import { Std140ChunkBytes } from './Constants.js';
import { BindingState, createBinding, ShaderStage } from './Binding.js';

class UniformsGroup {
  name: string;
  bytesPerElement: number;
  _buffer: ArrayBuffer;
  binding: BindingState;
  isUniformBuffer: boolean;
  isUniformsGroup: boolean;
  uniforms: any[];

  constructor(name: string) {
    this.isUniformsGroup = true;
    this.uniforms = [];
    this.bytesPerElement = Float32Array.BYTES_PER_ELEMENT;
    this._buffer = null as unknown as ArrayBuffer;
    this.name = name;
    this.binding = createBinding(name);
    this.isUniformBuffer = true;
  }

  setVisibility = (visibility: ShaderStage) => this.binding.actions.visibility.toggle(visibility);
  get visibility() {
    return this.binding.state.visibility;
  }

  addUniform(uniform) {
    this.uniforms.push(uniform);
    return this;
  }

  get buffer() {
    let buffer = this._buffer;

    if (buffer === null) {
      const byteLength = this.byteLength;

      buffer = new Float32Array(new ArrayBuffer(byteLength));

      this._buffer = buffer;
    }

    return buffer;
  }

  get byteLength() {
    let offset = 0; // global buffer offset in bytes

    for (let i = 0, l = this.uniforms.length; i < l; i++) {
      const uniform = this.uniforms[i];

      // offset within a single chunk in bytes

      const chunkOffset = offset % Std140ChunkBytes;
      const remainingSizeInChunk = Std140ChunkBytes - chunkOffset;

      // conformance tests

      if (chunkOffset !== 0 && remainingSizeInChunk - uniform.boundary < 0) {
        // check for chunk overflow

        offset += Std140ChunkBytes - chunkOffset;
      } else if (chunkOffset % uniform.boundary !== 0) {
        // check for correct alignment

        offset += chunkOffset % uniform.boundary;
      }

      uniform.offset = offset / this.bytesPerElement;

      offset += uniform.itemSize * this.bytesPerElement;
    }

    return Math.ceil(offset / Std140ChunkBytes) * Std140ChunkBytes;
  }

  update() {
    let updated = false;

    for (const uniform of this.uniforms) {
      if (this.updateByType(uniform) === true) {
        updated = true;
      }
    }

    return updated;
  }

  updateByType(uniform) {
    if (uniform.isFloatUniform) return this.updateNumber(uniform);
    if (uniform.isVector2Uniform) return this.updateVector2(uniform);
    if (uniform.isVector3Uniform) return this.updateVector3(uniform);
    if (uniform.isVector4Uniform) return this.updateVector4(uniform);
    if (uniform.isColorUniform) return this.updateColor(uniform);
    if (uniform.isMatrix3Uniform) return this.updateMatrix3(uniform);
    if (uniform.isMatrix4Uniform) return this.updateMatrix4(uniform);

    console.error('THREE.WebGPUUniformsGroup: Unsupported uniform type.', uniform);
  }

  updateNumber(uniform) {
    let updated = false;

    const a = this.buffer;
    const v = uniform.getValue();
    const offset = uniform.offset;

    if (a[offset] !== v) {
      a[offset] = v;
      updated = true;
    }

    return updated;
  }

  updateVector2(uniform) {
    let updated = false;

    const a = this.buffer;
    const v = uniform.getValue();
    const offset = uniform.offset;

    if (a[offset + 0] !== v.x || a[offset + 1] !== v.y) {
      a[offset + 0] = v.x;
      a[offset + 1] = v.y;

      updated = true;
    }

    return updated;
  }

  updateVector3(uniform) {
    let updated = false;

    const a = this.buffer;
    const v = uniform.getValue();
    const offset = uniform.offset;

    if (a[offset + 0] !== v.x || a[offset + 1] !== v.y || a[offset + 2] !== v.z) {
      a[offset + 0] = v.x;
      a[offset + 1] = v.y;
      a[offset + 2] = v.z;

      updated = true;
    }

    return updated;
  }

  updateVector4(uniform) {
    let updated = false;

    const a = this.buffer;
    const v = uniform.getValue();
    const offset = uniform.offset;

    if (a[offset + 0] !== v.x || a[offset + 1] !== v.y || a[offset + 2] !== v.z || a[offset + 4] !== v.w) {
      a[offset + 0] = v.x;
      a[offset + 1] = v.y;
      a[offset + 2] = v.z;
      a[offset + 3] = v.w;

      updated = true;
    }

    return updated;
  }

  updateColor(uniform) {
    let updated = false;

    const a = this.buffer;
    const c = uniform.getValue();
    const offset = uniform.offset;

    if (a[offset + 0] !== c.r || a[offset + 1] !== c.g || a[offset + 2] !== c.b) {
      a[offset + 0] = c.r;
      a[offset + 1] = c.g;
      a[offset + 2] = c.b;

      updated = true;
    }

    return updated;
  }

  updateMatrix3(uniform) {
    let updated = false;

    const a = this.buffer;
    const e = uniform.getValue().elements;
    const offset = uniform.offset;

    if (
      a[offset + 0] !== e[0] ||
      a[offset + 1] !== e[1] ||
      a[offset + 2] !== e[2] ||
      a[offset + 4] !== e[3] ||
      a[offset + 5] !== e[4] ||
      a[offset + 6] !== e[5] ||
      a[offset + 8] !== e[6] ||
      a[offset + 9] !== e[7] ||
      a[offset + 10] !== e[8]
    ) {
      a[offset + 0] = e[0];
      a[offset + 1] = e[1];
      a[offset + 2] = e[2];
      a[offset + 4] = e[3];
      a[offset + 5] = e[4];
      a[offset + 6] = e[5];
      a[offset + 8] = e[6];
      a[offset + 9] = e[7];
      a[offset + 10] = e[8];

      updated = true;
    }

    return updated;
  }

  updateMatrix4(uniform) {
    let updated = false;

    const a = this.buffer;
    const e = uniform.getValue().elements;
    const offset = uniform.offset;

    if (arraysEqual(a, e, offset) === false) {
      a.set(e, offset);
      updated = true;
    }

    return updated;
  }
}

const arraysEqual = (a: any[], b: any[], offset: number) => {
  for (let i = 0, l = b.length; i < l; i++) if (a[offset + i] !== b[i]) return false;
  return true;
};

export default UniformsGroup;

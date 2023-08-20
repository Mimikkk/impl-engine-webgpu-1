import { BindingState, createBinding, ShaderStage } from './Binding.js';
import { getFloatLength } from './BufferUtils.js';

class UniformBuffer {
  name: string;
  bytesPerElement: number;
  _buffer: ArrayBuffer;
  binding: BindingState;
  isUniformBuffer: boolean;

  constructor(name: string, buffer = null) {
    this.bytesPerElement = Float32Array.BYTES_PER_ELEMENT;
    this._buffer = buffer as unknown as ArrayBuffer;
    this.name = name;
    this.binding = createBinding(name);
    this.isUniformBuffer = true;
  }

  get byteLength() {
    return getFloatLength(this._buffer.byteLength);
  }

  get buffer() {
    return this._buffer;
  }

  update() {
    return true;
  }

  setVisibility = (visibility: ShaderStage) => this.binding.actions.visibility.toggle(visibility);
  get visibility() {
    return this.binding.state.visibility;
  }
}

export default UniformBuffer;

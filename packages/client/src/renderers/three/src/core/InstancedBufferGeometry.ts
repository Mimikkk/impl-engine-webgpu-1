import { BufferGeometry } from './BufferGeometry.js';

export class InstancedBufferGeometry extends BufferGeometry {
  constructor() {
    super();

    this.isInstancedBufferGeometry = true;

    this.type = 'InstancedBufferGeometry';
    this.instanceCount = Infinity;
  }

  copy(source) {
    super.copy(source);

    this.instanceCount = source.instanceCount;

    return this;
  }
}

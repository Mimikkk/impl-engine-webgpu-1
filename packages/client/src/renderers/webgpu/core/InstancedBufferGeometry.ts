import { BufferGeometry } from './BufferGeometry.js';

export class InstancedBufferGeometry extends BufferGeometry {
  isInstancedBufferGeometry: boolean = true;
  type: string = 'InstancedBufferGeometry';
  instanceCount: number = Infinity;

  constructor() {
    super();
  }

  copy(source: InstancedBufferGeometry) {
    super.copy(source);
    this.instanceCount = source.instanceCount;
    return this;
  }
}
